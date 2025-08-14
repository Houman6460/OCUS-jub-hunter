// Complete UI state fix for OCUS extension v2.3.3

// 1. Fix updateActivationStatus to immediately update all UI elements
function updateActivationStatus(config) {
  console.log('🔄 FIXED: Updating activation status UI...');
  
  const activationStatus = document.getElementById('activationStatus');
  const extensionStatus = document.getElementById('extensionStatus');
  const demoUsesRemaining = document.getElementById('demoUsesRemaining');
  const demoInfo = document.getElementById('demoInfo');
  const activatedContent = document.getElementById('activatedContent');
  const trialModeActive = document.getElementById('trialModeActive');
  const trialMode = document.getElementById('trialMode');
  const activationForm = document.getElementById('activationForm');
  
  if (config.activation?.isActivated) {
    console.log('✅ PREMIUM MODE - Updating all UI elements');
    
    // CRITICAL FIX: Force immediate update of activation badge
    if (activationStatus) {
      activationStatus.textContent = 'PREMIUM';
      activationStatus.className = 'status-badge premium';
      activationStatus.style.cssText = 'background: linear-gradient(45deg, #4CAF50, #45a049) !important; color: white !important; font-weight: bold !important;';
    }
    
    // Hide ALL trial elements immediately
    const hideElements = [trialModeActive, demoInfo, trialMode, activationForm];
    hideElements.forEach(el => {
      if (el) el.style.display = 'none';
    });
    
    // Show premium content
    if (activatedContent) activatedContent.style.display = 'block';
    
    // Update extension status
    if (extensionStatus) {
      extensionStatus.textContent = 'Premium Mode - Unlimited Access';
      extensionStatus.style.cssText = 'color: #4CAF50 !important; font-weight: bold !important;';
    }
    
    // Transform activation section completely
    const activationSection = document.getElementById('activationSection');
    if (activationSection) {
      const sectionContent = activationSection.querySelector('.section-content');
      if (sectionContent) {
        sectionContent.innerHTML = `
          <div style="background: linear-gradient(135deg, #4CAF50, #45a049); padding: 20px; border-radius: 12px; text-align: center; color: white;">
            <div style="font-size: 24px; margin-bottom: 10px;">🏆</div>
            <h3 style="margin: 0 0 5px 0; font-size: 18px; font-weight: bold;">PREMIUM ACTIVATED!</h3>
            <p style="margin: 0; font-size: 14px; opacity: 0.9;">Unlimited mission acceptance enabled</p>
          </div>
        `;
      }
    }
    
  } else {
    console.log('❌ TRIAL MODE - Showing demo UI');
    
    if (activationStatus) {
      activationStatus.textContent = 'DEMO MODE';
      activationStatus.className = 'status-badge warning';
      activationStatus.style.cssText = '';
    }
    
    // Show trial elements
    if (trialModeActive) trialModeActive.style.display = 'block';
    if (demoInfo) demoInfo.style.display = 'block';
    if (trialMode) trialMode.style.display = 'block';
    if (activationForm) activationForm.style.display = 'block';
    if (activatedContent) activatedContent.style.display = 'none';
    
    const remaining = config.demo?.usesRemaining || 3;
    if (demoUsesRemaining) demoUsesRemaining.textContent = remaining;
    
    if (extensionStatus) {
      extensionStatus.textContent = 'Demo Mode - Limited to 3 jobs';
      extensionStatus.style.cssText = 'color: #666;';
    }
  }
}

// 2. Fix loadAndDisplayConfig to enable premium toggles by default
function loadAndDisplayConfig() {
  console.log('📖 FIXED: Loading and displaying configuration...');
  
  chrome.storage.local.get(['config'], function(result) {
    const config = result.config || defaultConfig;
    console.log('📄 Loaded config:', config);
    
    // Update all UI elements
    updateActivationStatus(config);
    updateDemoUsesCounter(config);
    updateMainStatus(config);
    
    if (config.activation?.isActivated) {
      console.log('✅ Premium user - enabling all toggles by default');
      
      // CRITICAL FIX: Force all toggles to ON for premium users
      const premiumToggles = {
        'autoLoginEnabled': true,
        'missionMonitorEnabled': true,
        'missionAcceptEnabled': true,
        'pageRefreshEnabled': true,
        'showNotifications': true,
        'soundEnabled': true,
        'showRefreshCountdown': true
      };
      
      Object.entries(premiumToggles).forEach(([toggleId, defaultValue]) => {
        const toggle = document.getElementById(toggleId);
        if (toggle) {
          toggle.checked = defaultValue;
          console.log(`✅ Enabled ${toggleId}`);
        }
      });
      
      // Transform UI to premium
      transformToPremiumUI(config);
      
      // Send message to show floating panel
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        if (tabs[0]) {
          chrome.tabs.sendMessage(tabs[0].id, {
            type: 'SHOW_PREMIUM_PANEL',
            config: config
          }).catch(() => {});
        }
      });
    } else {
      // Load saved settings for trial users
      loadSavedSettings(config);
    }
  });
}

// 3. Fix processMasterKeyActivation to prevent stuck "Activating..." state
async function processMasterKeyActivation(masterKey) {
  console.log('🎯 FIXED: Processing master key activation:', masterKey);
  
  return new Promise((resolve) => {
    chrome.storage.local.get(['config'], function(result) {
      let config = result.config || JSON.parse(JSON.stringify(defaultConfig));
      
      // Update activation status
      config.activation.isActivated = true;
      config.activation.activationKey = masterKey;
      config.activation.activatedAt = new Date().toISOString();
      config.activation.customerId = 'master-' + Date.now();
      
      // Remove ALL trial limitations
      config.demo.usesRemaining = -1;
      config.demo.isTrialMode = false;
      config.demo.showTrialWarnings = false;
      
      // Save configuration
      chrome.storage.local.set({ config: config }, function() {
        console.log('✅ Master key activation successful!');
        
        // Clear input
        const keyInput = document.getElementById('activationKey');
        if (keyInput) keyInput.value = '';
        
        // CRITICAL FIX: Reset button immediately
        const activateButton = document.getElementById('activateButton');
        if (activateButton) {
          activateButton.disabled = false;
          activateButton.textContent = '✅ Activated';
          activateButton.style.background = '#4CAF50';
        }
        
        // Update UI immediately without reload
        updateActivationStatus(config);
        updateMainStatus(config);
        transformToPremiumUI(config);
        
        // Enable all toggles
        loadAndDisplayConfig();
        
        // Show success notification
        showNotification('🎉 Premium License Activated! Unlimited access enabled.', 'success');
        
        // Notify background and content scripts
        chrome.runtime.sendMessage({
          type: 'ACTIVATION_SUCCESS',
          config: config
        });
        
        resolve();
      });
    });
  });
}

// Export fixes
const UI_STATE_FIXES = {
  updateActivationStatus,
  loadAndDisplayConfig,
  processMasterKeyActivation
};