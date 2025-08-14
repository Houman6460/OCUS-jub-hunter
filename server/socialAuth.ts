import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { Strategy as FacebookStrategy } from 'passport-facebook';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { storage } from './storage';
import { v4 as uuidv4 } from 'uuid';

// Dynamic OAuth strategy initialization
let strategiesInitialized = false;

async function initializeStrategies() {
  if (strategiesInitialized) return;

  try {
    const authSettings = await storage.getAuthSettings();
    console.log('Initializing OAuth strategies with settings:', {
      googleEnabled: authSettings?.googleEnabled,
      googleClientId: authSettings?.googleClientId ? authSettings.googleClientId.substring(0, 20) + '...' : 'not set',
      googleClientSecret: authSettings?.googleClientSecret ? 'set' : 'not set',
      envGoogleClientId: process.env.GOOGLE_CLIENT_ID ? process.env.GOOGLE_CLIENT_ID.substring(0, 20) + '...' : 'not set',
      envGoogleClientSecret: process.env.GOOGLE_CLIENT_SECRET ? 'set' : 'not set'
    });
    
    // Google OAuth Strategy - Use environment variables as secure fallback
    const googleClientId = authSettings?.googleClientId || process.env.GOOGLE_CLIENT_ID;
    const googleClientSecret = authSettings?.googleClientSecret || process.env.GOOGLE_CLIENT_SECRET;
    const googleEnabled = authSettings?.googleEnabled ?? (!!googleClientId && !!googleClientSecret);
    
    if (googleEnabled && googleClientId && googleClientSecret) {
      console.log('Registering Google OAuth strategy');
      passport.use(new GoogleStrategy({
        clientID: googleClientId,
        clientSecret: googleClientSecret,
        callbackURL: "/api/auth/google/callback"
      }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
        try {
          console.log('Google OAuth profile received:', {
            id: profile.id,
            email: profile.emails?.[0]?.value,
            name: profile.displayName
          });
          
          // Check if user exists
          let customer = await storage.getCustomerBySocialId('google', profile.id);
          console.log('Existing customer by Google ID:', customer ? { id: customer.id, email: customer.email } : 'not found');
          
          if (!customer) {
            // Check if email already exists
            const existingCustomer = await storage.getCustomerByEmail(profile.emails?.[0]?.value || '');
            console.log('Existing customer by email:', existingCustomer ? { id: existingCustomer.id, email: existingCustomer.email } : 'not found');
            
            if (existingCustomer) {
              // Link Google account to existing customer
              console.log('Linking Google account to existing customer:', existingCustomer.id);
              customer = await storage.updateCustomer(existingCustomer.id, {
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value
              });
            } else {
              // Create new customer
              console.log('Creating new customer with Google profile');
              const newCustomerData = {
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}`.trim(),
                googleId: profile.id,
                avatar: profile.photos?.[0]?.value,
                referralCode: uuidv4().slice(0, 8).toUpperCase(),
                isActivated: false,
                isAdmin: false
              };
              console.log('Creating customer with data:', newCustomerData);
              customer = await storage.createCustomer(newCustomerData);
              console.log('Created customer:', { id: customer.id, email: customer.email });
            }
          }
          
          console.log('Google OAuth success, returning customer:', { id: customer.id, email: customer.email });
          return done(null, customer);
        } catch (error) {
          console.error('Google OAuth strategy error:', error);
          return done(error, null);
        }
      }));
    }

    // Facebook OAuth Strategy
    if (authSettings?.facebookEnabled && authSettings.facebookAppId && authSettings.facebookAppSecret) {
      passport.use(new FacebookStrategy({
        clientID: authSettings.facebookAppId,
        clientSecret: authSettings.facebookAppSecret,
        callbackURL: "/api/auth/facebook/callback",
        profileFields: ['id', 'displayName', 'photos', 'email']
      }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
        try {
          let customer = await storage.getCustomerBySocialId('facebook', profile.id);
          
          if (!customer) {
            const existingCustomer = await storage.getCustomerByEmail(profile.emails?.[0]?.value || '');
            
            if (existingCustomer) {
              customer = await storage.updateCustomer(existingCustomer.id, {
                facebookId: profile.id,
                avatar: profile.photos?.[0]?.value
              });
            } else {
              customer = await storage.createCustomer({
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || '',
                facebookId: profile.id,
                avatar: profile.photos?.[0]?.value,
                referralCode: uuidv4().slice(0, 8).toUpperCase(),
                isActivated: false,
                isAdmin: false
              });
            }
          }
          
          return done(null, customer);
        } catch (error) {
          return done(error, null);
        }
      }));
    }

    // GitHub OAuth Strategy
    if (authSettings?.githubEnabled && authSettings.githubClientId && authSettings.githubClientSecret) {
      passport.use(new GitHubStrategy({
        clientID: authSettings.githubClientId,
        clientSecret: authSettings.githubClientSecret,
        callbackURL: "/api/auth/github/callback"
      }, async (accessToken: any, refreshToken: any, profile: any, done: any) => {
        try {
          let customer = await storage.getCustomerBySocialId('github', profile.id);
          
          if (!customer) {
            const existingCustomer = await storage.getCustomerByEmail(profile.emails?.[0]?.value || '');
            
            if (existingCustomer) {
              customer = await storage.updateCustomer(existingCustomer.id, {
                githubId: profile.id,
                avatar: profile.photos?.[0]?.value
              });
            } else {
              customer = await storage.createCustomer({
                email: profile.emails?.[0]?.value || '',
                name: profile.displayName || profile.username || '',
                githubId: profile.id,
                avatar: profile.photos?.[0]?.value,
                referralCode: uuidv4().slice(0, 8).toUpperCase(),
                isActivated: false,
                isAdmin: false
              });
            }
          }
          
          return done(null, customer);
        } catch (error) {
          return done(error, null);
        }
      }));
    }

    strategiesInitialized = true;
    console.log('OAuth strategies initialized with database settings');
  } catch (error) {
    console.error('Failed to initialize OAuth strategies:', error);
  }
}

// Initialize strategies when the module loads
initializeStrategies();

// Function to reinitialize strategies when settings change
export async function reinitializeStrategies() {
  strategiesInitialized = false;
  await initializeStrategies();
}

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string | number, done) => {
  try {
    console.log('Deserializing user with ID:', id, 'Type:', typeof id);
    const customer = await storage.getCustomer(id);
    console.log('Deserialized customer:', customer ? { id: customer.id, email: customer.email } : 'not found');
    done(null, customer);
  } catch (error) {
    console.error('Error deserializing user:', error);
    done(error, null);
  }
});

export { passport };