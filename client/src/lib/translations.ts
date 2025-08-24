export interface Translations {
  // General
  announcement: string;
  buyNow: string;
  watchDemo: string;
  heroTitle1: string;
  heroTitle2: string;
  heroTitle3: string;
  heroSubtitle: string;
  oneTimePayment: string;
  lifetimeAccess: string;
  noMonthlyFees: string;
  price: string;
  currency: string;
  guaranteedUpdates: string;
  limitedTimeOffer: string;
  discountCode: string;
  discountApplied: string;
  originalPrice: string;
  discountPrice: string;
  getStarted: string;
  learnMore: string;
  viewDemo: string;
  downloadNow: string;
  freeDemo: string;
  premiumVersion: string;
  
  // Features
  features: string;
  faqQuestions: string[];
  faqAnswers: string[];
  installationSteps: string[];
  featuresList: Array<{
    title: string;
    description: string;
  }>;

  // Extension Preview Panel Translations
  howItWorksTitle?: string;
  autoLoginTitle?: string;
  autoLoginDescription?: string;
  monitoringTitle?: string;
  monitoringDescription?: string;
  timerTitle?: string;
  timerDescription?: string;
  mainExtensionTitle?: string;
  mainExtensionDescription?: string;
  timerPanelTitle?: string;
  timerPanelDescription?: string;
  analyticsTitle?: string;
  analyticsDescription?: string;

  // Extension Showcase Section
  extensionShowcaseTitle: string;
  extensionShowcaseSubtitle: string;
  extensionHowItWorksTitle: string;
  extensionAutoLoginTitle: string;
  extensionAutoLoginDescription: string;
  extension24MonitoringTitle: string;
  extension24MonitoringDescription: string;
  extensionSmartTimerTitle: string;
  extensionSmartTimerDescription: string;
  floatingPanelTitle: string;
  floatingPanelDescription: string;
  extensionPopupTitle: string;
  extensionPopupDescription: string;

  // Free Demo Section
  freeDemoBadge: string;
  freeDemoTitle: string;
  freeDemoSubtitle: string;
  freeDemoTestText: string;
  freeDemoFeature1: string;
  freeDemoFeature2: string;
  freeDemoFeature3: string;
  freeDemoFeature4: string;
  freeDemoUpgradeText: string;
  freeDemoDownloadButton: string;

  // Purchase Card
  chromeExtensionFile: string;
  autoLoginOcus: string;
  jobMonitoringSystem: string;
  desktopNotifications: string;
  performanceAnalytics: string;
  installationManual: string;
  lifetimeUpdatesSupport: string;
  securePayment: string;
  instantDigitalDelivery: string;
  
  // Additional content for home page
  manualJobHuntingProblems?: string[];
  automatedBenefits?: string[];
  howItWorksSteps?: string[];
  testimonials?: Array<{
    name: string;
    role: string;
    content: string;
  }>;
  stats?: {
    jobsFound: string;
    timesSaved: string;
    activeUsers: string;
  };

  // Privacy Policy
  privacy: {
    title: string;
    lastUpdated: string;
    backToHome: string;
    introduction: {
      title: string;
      content: string;
    };
    dataCollection: {
      title: string;
      personalInfo: {
        title: string;
        content: string;
        email: string;
        name: string;
        phone: string;
        country: string;
      };
      usageData: {
        title: string;
        content: string;
        extensionUsage: string;
        featureInteraction: string;
        performanceMetrics: string;
      };
      paymentData: {
        title: string;
        content: string;
      };
    };
    dataUsage: {
      title: string;
      content: string;
      provideService: string;
      processPayments: string;
      customerSupport: string;
      improveService: string;
      sendUpdates: string;
      preventFraud: string;
    };
    dataSharing: {
      title: string;
      content: string;
      serviceProviders: {
        title: string;
        content: string;
        stripe: string;
        paypal: string;
        emailService: string;
        analytics: string;
      };
      legalRequirements: {
        title: string;
        content: string;
      };
    };
    dataSecurity: {
      title: string;
      content: string;
      encryption: string;
      accessControls: string;
      regularAudits: string;
      secureServers: string;
    };
    userRights: {
      title: string;
      content: string;
      access: string;
      correction: string;
      deletion: string;
      portability: string;
      objection: string;
      restriction: string;
    };
    cookies: {
      title: string;
      content: string;
      essential: {
        title: string;
        content: string;
      };
      analytics: {
        title: string;
        content: string;
      };
      marketing: {
        title: string;
        content: string;
      };
    };
    internationalTransfers: {
      title: string;
      content: string;
    };
    dataRetention: {
      title: string;
      content: string;
      accountData: string;
      transactionData: string;
      supportData: string;
      marketingData: string;
    };
    childrenPrivacy: {
      title: string;
      content: string;
    };
    changes: {
      title: string;
      content: string;
    };
    contact: {
      title: string;
      content: string;
      address: string;
    };
  };
  
  // Additional missing properties for home page
  installation: string;
  pricing: string;
  jobsFound: string;
  potentialEarnings: string;
  activeMonitoring: string;
  sslSecured: string;
  rating: string;
  instantDownload: string;
  problemTitle: string;
  problemSubtitle: string;
  manualJobHunting: string;
  automatedSolution: string;
  automatedSolutionBenefits: string[];
  featuresTitle: string;
  featuresSubtitle: string;
  faqSubtitle: string;
  stillHaveQuestions: string;
  supportDescription: string;
  emailSupport: string;
  liveChat: string;
  mainControlPanel: string;
  pageRefreshTimer: string;
  liveStatistics: string;
  installationTitle: string;
  faqTitle: string;
  pricingTitle: string;
  pricingSubtitle: string;
  getExtension: string;
  
  // How JobHunter Works Section
  howJobHunterWorksTitle: string;
  howJobHunterWorksCards: Array<{
    title: string;
    description: string;
  }>;
  
  // Authentication
  welcome_back: string;
  sign_in_account: string;
  user_login: string;
  admin_login: string;
  your_email: string;
  your_password: string;
  login_btn: string;
  admin_login_btn: string;
  remember_me: string;
  forgot_password: string;
  no_account: string;
  sign_up: string;
  create_account: string;
  full_name: string;
  password_min_length: string;
  confirm_password: string;
  accept_terms: string;
  terms_conditions: string;
  create_account_btn: string;
  have_account: string;
  sign_in: string;
  or_login_with: string;
  login_with_google: string;
  login_with_facebook: string;
  login_with_github: string;
  
  // Navigation
  home: string;
  about: string;
  contact: string;
  login: string;
  dashboard: string;
  profile: string;
  orders: string;
  downloads: string;

  
  // Support & Tickets
  support: string;
  submitTicket: string;
  viewTickets: string;
  ticketSubject: string;
  ticketCategory: string;
  ticketPriority: string;
  ticketDescription: string;
  ticketStatus: string;
  createTicket: string;
  technical: string;
  billing: string;
  featureRequest: string;
  bugReport: string;
  general: string;
  low: string;
  medium: string;
  high: string;
  urgent: string;
  open: string;
  inProgress: string;
  resolved: string;
  closed: string;
  ticketCreated: string;
  ticketUpdated: string;
  replyToTicket: string;
  addReply: string;
  noTicketsYet: string;
  ticketDetails: string;
  assignedTo: string;
  unassigned: string;
  createdOn: string;
  lastUpdated: string;
  replies: string;
  markAsResolved: string;
  reopenTicket: string;
  deleteTicket: string;
  

  downloadLatestExtension: string;
  downloadActivationKeyFile: string;
  startFreeExtension: string;
  noInstallationRequired: string;
  automaticUpdates: string;
  activationKey: string;
  affiliateProgram: string;
  totalEarnings: string;
  totalReferrals: string;
  pendingCommissions: string;
  referralCode: string;
  copyReferralCode: string;
  shareReferralLink: string;
  currentVersion: string;
  fileSize: string;
  
  // Customer Dashboard
  customerLogin: string;
  customerDashboard: string;
  createAccount: string;
  accountInformation: string;
  logout: string;
  password: string;
  name: string;
  loginSuccessful: string;
  welcomeBack: string;
  loginFailed: string;
  accountCreated: string;
  welcome: string;
  registrationFailed: string;
  generateKey: string;
  activationKeyGenerated: string;
  generationFailed: string;
  memberSince: string;
  activated: string;
  demoMode: string;
  useKeyInExtension: string;
  noKeyGenerated: string;
  purchaseToGetKey: string;
  generating: string;
  noOrdersYet: string;
  startFreeThenPurchase: string;
  accessKeysAndDownloads: string;
  yourFullName: string;
  processing: string;
  needAccount: string;
  alreadyHaveAccount: string;
  chatPlaceholder: string;
  send: string;
  minimizeChat: string;
  
  // Admin Dashboard
  adminDashboard: string;
  totalRevenue: string;
  totalOrders: string;
  totalUsers: string;
  recentOrders: string;
  recentUsers: string;
  settings: string;
  paymentSettings: string;
  emailSettings: string;
  chatSettings: string;
  fileManagement: string;
  userManagement: string;
  orderManagement: string;
  downloadHistory: string;
  systemLogs: string;
  analytics: string;
  reports: string;
  backups: string;
  maintenance: string;
  notifications: string;
  
  // File Management
  uploadFile: string;
  deleteFile: string;
  downloadFile: string;
  fileUploaded: string;
  fileDeleted: string;
  fileName: string;
  fileType: string;
  uploadDate: string;
  actions: string;
  confirmDelete: string;
  cancel: string;
  delete: string;
  upload: string;
  selectFile: string;
  dragDropFiles: string;
  supportedFormats: string;
  maxFileSize: string;
  
  // General Actions
  edit: string;
  save: string;
  update: string;
  submit: string;
  close: string;
  back: string;
  next: string;
  previous: string;
  confirm: string;
  loading: string;
  error: string;
  success: string;
  warning: string;
  info: string;
  yes: string;
  no: string;
  active: string;
  inactive: string;

  // Manual Page
  checkout?: {
    backToHome: string;
    pageTitle: string;
    loadingMessage: string;
    orderSummaryTitle: string;
    productName: string;
    productDescription: string;
    lifetimeAccess: string;
    whatsIncluded: string;
    includedFeatures: string[];
    originalPrice: string;
    discount: string;
    total: string;
    totalUSD: string;
    oneTimePayment: string;
    securePayment: string;
    sslSecure: string;
    pciCompliant: string;
    moneyBackGuarantee: string;
    completePurchase: string;
    yourInformation: string;
    fullNameLabel: string;
    fullNamePlaceholder: string;
    emailLabel: string;
    emailPlaceholder: string;
    emailHint: string;
    couponTitle: string;
    couponPlaceholder: string;
    applyButton: string;
    couponApplied: string;
    couponSaved: string;
    invalidCoupon: string;
    invalidCouponMessage: string;
    couponValidationError: string;
    paymentMethod: string;
    creditCard: string;
    payPal: string;
    fillInfoToContinue: string;
    preparingPayment: string;
    processingPayment: string;
    payWithCard: string;
    payPalRedirect: string;
    paymentFailed: string;
    paymentSuccessTitle: string;
    paymentSuccessDescription: string;
    paymentErrorTitle: string;
    paymentInitializationError: string;
    successTitle: string;
    successMessage: string;
    activationCode: string;
    activationCodeHint: string;
    processingActivationCode: string;
    processingActivationCodeMessage: string;
    returnHome: string;
    testModeTitle: string;
    testModeSuccess: string;
    testModeDecline: string;
    testModeInstructions: string;
    testModeWarning: string;
    unknownError: string;
    customerNameRequired: string;
    customerEmailInvalid: string;
  };
  manual?: {
    title: string;
    subtitle: string;
    backToHome: string;
    
    // Installation Section
    installationTitle: string;
    installationSubtitle: string;
    installationSteps: Array<{
      step: string;
      title: string;
      description: string;
      details: string;
    }>;
    
    // Features Section  
    featuresTitle: string;
    featuresSubtitle: string;
    features: Array<{
      title: string;
      description: string;
      details: string[];
    }>;
    
    // Usage Section
    usageTitle: string;
    usageSubtitle: string;
    usageSteps: Array<{
      title: string;
      description: string;
      tip: string;
    }>;
    
    // Important Notes
    importantNotesTitle: string;
    importantNotes: string[];
  };
  enabled: string;
  disabled: string;
  configuration: string;
  statistics: string;
  reset: string;
  pause: string;
  refreshNow: string;
  emergencyStop: string;
  
  // Refund Policy
  refund: {
    title: string;
    subtitle: string;
    introduction: {
      title: string;
      content: string;
    };
    eligibility: {
      title: string;
      content: string;
      within30Days: string;
      originalPurchaser: string;
      validReason: string;
      noAbuse: string;
    };
    process: {
      title: string;
      content: string;
      step1: string;
      step2: string;
      step3: string;
      step4: string;
      step5: string;
    };
    timeframe?: {
      title: string;
      content: string;
      carteCredit: string;
      paypal: string;
      virement: string;
    };
    exceptions?: {
      title: string;
      content: string;
      digitalDownloads: string;
      customWork: string;
      thirdPartyFees: string;
    };
  };

  // Terms of Service
  terms: {
    title: string;
    subtitle: string;
    acceptance: {
      title: string;
      content: string;
    };
    serviceDescription: {
      title: string;
      content: string;
      feature1: string;
      feature2: string;
      feature3: string;
      feature4?: string;
    };
    userResponsibilities: {
      title: string;
      content: string;
      responsible1: string;
      responsible2: string;
      responsible3: string;
      responsible4: string;
    };
    prohibited: {
      title: string;
      content: string;
      prohibited1: string;
      prohibited2: string;
      prohibited3: string;
      prohibited4: string;
    };
    intellectualProperty?: {
      title: string;
      content: string;
    };
    limitation?: {
      title: string;
      content: string;
    };
    termination?: {
      title: string;
      content: string;
    };
    changes?: {
      title: string;
      content: string;
    };
    governing?: {
      title: string;
      content: string;
    };
  };

  // Legal page navigation
  legal: {
    title: string;
    privacyPolicy: string;
    refundPolicy: string;
    termsOfService: string;
    backToHome: string;
    lastUpdated: string;
    changeLanguage: string;
    gdprNotice: string;
  };

  // Affiliate Page
  affiliate?: {
    title: string;
    subtitle: string;
    dashboard: string;
    totalEarnings: string;
    totalReferrals: string;
    pendingCommission: string;
    referralInfo: string;
    yourReferralLink: string;
    copyLink: string;
    linkCopied: string;
    copyFailed: string;
    shareOnSocialMedia: string;
    shareOnFacebook: string;
    shareOnTwitter: string;
    shareOnLinkedIn: string;
    shareByEmail: string;
    payoutRequests: string;
    requestPayout: string;
    amount: string;
    paymentMethod: string;
    paypalEmail: string;
    submitRequest: string;
    requesting: string;
    requestSent: string;
    requestFailed: string;
    unknownError: string;
    referrals: string;
    date: string;
    referredUser: string;
    status: string;
    commission: string;
    noReferrals: string;
    payoutHistory: string;
    payoutDate: string;
    payoutAmount: string;
    payoutStatusHeader: string;
    noPayouts: string;
    marketingMaterials: string;
    emailSwipe: string;
    copyEmail: string;
    emailCopied: string;
    socialMediaPost: string;
    copyPost: string;
    postCopied: string;
    tabs: {
      dashboard: string;
      referrals: string;
      payouts: string;
      marketing: string;
    };
    referralStatus: {
      pending: string;
      approved: string;
      rejected: string;
    };
    payoutStatus: {
      pending: string;
      processing: string;
      completed: string;
      failed: string;
    };
    emailSubject: string;
    emailBody: string;
    socialPost: string;
  };

  customerManagement?: {
    title: string;
    failedToFetchCustomers: string;
    activationKeyGenerated: string;
    newActivationKey: string;
    failedToGenerateKey: string;
    never: string;
    totalCustomers: string;
    activeExtensions: string;
    todaysActivity: string;
    activeUsers: string;
    jobsSuccess: string;
    ofJobsApplied: string;
    supportTickets: string;
    ofTotal: string;
    customersTab: string;
    analyticsTab: string;
    usageTab: string;
    searchPlaceholder: string;
    customerListTitle: string;
    customerListDescription: string;
    customerColumn: string;
    statusColumn: string;
    extensionColumn: string;
    usageStatsColumn: string;
    totalSpentColumn: string;
    actionsColumn: string;
    activeStatus: string;
    inactiveStatus: string;
    timesUsed: string;
    successfulJobs: string;
    lastUsed: string;
    orders: string;
    viewDetails: string;
    customerDetailsTitle: string;
    accountInfo: string;
    email: string;
    created: string;
    subscription: string;
    activationKey: string;
    none: string;
    extensionUsage: string;
    totalUsage: string;
    recentUsageActivity: string;
    dateColumn: string;
    platformColumn: string;
    jobsFoundColumn: string;
    appliedColumn: string;
    successfulColumn: string;
    durationColumn: string;
    paymentHistory: string;
    amountColumn: string;
    methodColumn: string;
    generateKey: string;
    revenueAnalytics: string;
    totalRevenueFromSales: string;
    extensionPerformance: string;
    todaysSessions: string;
    jobsFound: string;
    applications: string;
    successRate: string;
    globalUsageStats: string;
    activeUsersColumn: string;
    sessionsColumn: string;
    avgDurationColumn: string;
    noUsageStats: string;
    error: string;
  };
}

export const translations: Record<string, Translations> = {
  en: {
    // General
    announcement: "🎯 Limited Time: Get OCUS Job Hunter for 70% OFF!",
    buyNow: "Buy Now",
    watchDemo: "Watch Demo",
    heroTitle1: "Find Photography Jobs",
    heroTitle2: "10x Faster",
    heroTitle3: "with OCUS Job Hunter",
    heroSubtitle: "The ultimate Chrome extension for photographers on delivery platforms. Automatically finds and filters the best photography jobs on OCUS.",
    oneTimePayment: "One-time payment",
    lifetimeAccess: "Lifetime access",
    noMonthlyFees: "No monthly fees",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Guaranteed updates",
    limitedTimeOffer: "Limited time offer",
    discountCode: "EARLYBIRD70",
    discountApplied: "Discount applied!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Get Started",
    learnMore: "Learn More",
    viewDemo: "View Demo",
    downloadNow: "Download Now",
    freeDemo: "Free Demo",
    premiumVersion: "Premium Version",
    
    // Features
    features: "Features",
    faqQuestions: [
      "How does OCUS Job Hunter work?",
      "Is it compatible with my browser?",
      "How do I install the extension?",
      "Do I need a subscription?",
      "Can I try the extension before purchasing?",
      "How often do you update the extension?"
    ],
    faqAnswers: [
      "OCUS Job Hunter automatically scans delivery platforms and identifies photography jobs with auto login and auto back to home page to monitor new opportunities.",
      "Yes, our extension works with Chrome, Firefox, Safari, and Edge browsers. Simply download the version for your browser.",
      "After purchase, you'll receive a download link and installation guide. The process takes less than 2 minutes.",
      "No! This is a one-time purchase with lifetime access. No monthly or yearly fees.",
      "Yes, we offer a free trial so you can test it before purchasing. Experience the full functionality and see the results for yourself.",
      "We release updates regularly to ensure compatibility with platform changes and add new features based on user feedback."
    ],
    installationSteps: [
      "Download the extension file",
      "Open your browser's extension settings",
      "Enable Developer Mode",
      "Click 'Load unpacked' and select the downloaded folder",
      "Pin the extension to your toolbar",
      "Start finding photography jobs!"
    ],
    featuresList: [
      {
        title: "Smart Job Detection",
        description: "Automatically identifies photography opportunities"
      },
      {
        title: "One-click Apply",
        description: "Apply to jobs with a single click"
      }
    ],

    // Extension Preview Panel Translations
    howItWorksTitle: "How the Premium Extension Works",
    autoLoginTitle: "Auto-Login System",
    autoLoginDescription: "Automatically logs you back in with your OCUS credentials when sessions expire. Never miss photography jobs due to unexpected logouts - the extension handles authentication seamlessly.",
    monitoringTitle: "24/7 Smart Monitoring",
    monitoringDescription: "After accepting a mission, automatically returns to home page to continue monitoring. Customizable refresh intervals (5-30 seconds) ensure you never miss new Ubereats and Foodora photography opportunities.",
    timerTitle: "Smart Timer Settings",
    timerDescription: "Configurable refresh timer with floating panel display. Set your preferred monitoring intervals and track performance with real-time statistics. Pause, resume, or refresh immediately as needed.",
    mainExtensionTitle: "Premium Extension Control Center",
    mainExtensionDescription: "Complete control center for OCUS job hunting. Auto-login with your credentials, continuous 24/7 monitoring with customizable refresh intervals, and intelligent mission acceptance. After accepting jobs, automatically returns to home page for continued monitoring.",
    timerPanelTitle: "Smart Refresh Timer",
    timerPanelDescription: "Always-visible floating timer with customizable refresh intervals (5-30 seconds). Shows countdown to next refresh, with instant controls to pause, refresh now, or view performance statistics. Never miss opportunities while staying in control.",
    analyticsTitle: "Live Performance Analytics",
    analyticsDescription: "Real-time tracking of missions found, opened, accepted, and total refreshes. Monitor login attempts, successful authentications, and overall job hunting performance. Data-driven insights to optimize your photography job success rate.",
    
    // Extension Showcase Section
    extensionShowcaseTitle: "Premium OCUS Job Hunter Extension",
    extensionShowcaseSubtitle: "Complete automation for OCUS photography jobs with intelligent monitoring and seamless workflow management",
    extensionHowItWorksTitle: "🎯 How the Premium Extension Works",
    extensionAutoLoginTitle: "🔐 Auto-Login",
    extensionAutoLoginDescription: "Uses your OCUS credentials to automatically log you back in when sessions expire",
    extension24MonitoringTitle: "🕐 24/7 Monitoring",
    extension24MonitoringDescription: "After accepting missions, returns to home page to continue monitoring for new opportunities",
    extensionSmartTimerTitle: "⚡ Smart Timer",
    extensionSmartTimerDescription: "Customizable refresh intervals (5-30 seconds) with floating panel controls and performance tracking",
    floatingPanelTitle: "Floating OCUS Hunter Panel",
    floatingPanelDescription: "This dark-themed floating panel stays visible while browsing OCUS. Shows real-time countdown timer with customizable refresh intervals. Premium users get unlimited access with detailed tracking metrics for missions found, opened, accepted, and login attempts.",
    extensionPopupTitle: "Extension Popup Interface",
    extensionPopupDescription: "Click the browser extension icon to access this full control panel. Configure auto-login with your OCUS credentials, manage all extension settings, and monitor premium status. Dark-themed interface with comprehensive configuration options.",

    // Free Demo Section
    freeDemoBadge: "FREE DEMO",
    freeDemoTitle: "Try OCUS Job Hunter Free",
    freeDemoSubtitle: "Experience the power of automated job hunting",
    freeDemoTestText: "Test all features for 7 days",
    freeDemoFeature1: "Chrome Extension File",
    freeDemoFeature2: "Auto Login to OCUS",
    freeDemoFeature3: "Job Monitoring System",
    freeDemoFeature4: "Desktop Notifications",
    freeDemoUpgradeText: "Upgrade to unlock unlimited access",
    freeDemoDownloadButton: "Download Free Demo",

    // Purchase Card Features
    chromeExtensionFile: "Chrome Extension (.crx file)",
    autoLoginOcus: "Auto Login to OCUS",
    jobMonitoringSystem: "Job Monitoring System",
    desktopNotifications: "Desktop Notifications",
    performanceAnalytics: "Performance Analytics",
    installationManual: "Installation Manual",
    lifetimeUpdatesSupport: "Lifetime Updates & Support",
    securePayment: "Secure Payment Processing",
    instantDigitalDelivery: "Instant Digital Delivery",
    
    // Additional content for home page
    manualJobHuntingProblems: [
      "Spending hours manually searching for photography jobs",
      "Missing high-paying opportunities while scrolling",
      "Dealing with tedious and repetitive tasks",
      "Wasting time on low-value delivery requests"
    ],
    automatedBenefits: [
      "Instant notifications for photography jobs",
      "Automated job filtering and application",
      "24/7 monitoring so you never miss a job",
      "Focus on high-value opportunities"
    ],
    howItWorksSteps: [
      "Install the Chrome extension in 2 minutes",
      "Set your preferences for location and pay rate",
      "Let the extension automatically find photography jobs",
      "Apply to high-value opportunities with one click"
    ],
    testimonials: [
      {
        name: "Sarah M.",
        role: "Professional Photographer",
        content: "This extension has completely transformed how I find photography work. I'm earning 40% more while working less hours!"
      },
      {
        name: "Mike R.",
        role: "Food Photographer",
        content: "Amazing tool! I used to spend 2 hours daily searching for jobs. Now it takes me 10 minutes to find the best opportunities."
      },
      {
        name: "Emma L.",
        role: "Freelance Photographer",
        content: "The profit calculator feature is a game-changer. I can see exactly which jobs are worth my time before applying."
      }
    ],
    stats: {
      jobsFound: "50,000+",
      timesSaved: "10x faster",
      activeUsers: "2,500+"
    },
    
    // Additional missing properties for home page (English)
    installation: "Installation",
    pricing: "Pricing",
    jobsFound: "50,000+ Jobs Found",
    potentialEarnings: "€125k+ Potential Earnings",
    activeMonitoring: "24/7 Active Monitoring",
    sslSecured: "SSL Secured",
    rating: "4.9/5 Rating",
    instantDownload: "Instant Download",
    problemTitle: "Stop Wasting Time on Manual Job Hunting",
    problemSubtitle: "See the difference between manual searching and our automated solution",
    manualJobHunting: "Manual Job Hunting",
    automatedSolution: "Automated Solution",
    automatedSolutionBenefits: [
      "Instant notifications for photography jobs",
      "Auto back to home page to monitor",
      "24/7 Monitoring",
      "One-click job applications"
    ],
    featuresTitle: "Why Choose OCUS Photography Job Hunter?",
    featuresSubtitle: "This Google Chrome Extension is specifically designed for photographers working with Ubereats and Foodora through OCUS",
    faqSubtitle: "Everything you need to know about the OCUS Job Hunter Chrome Extension",
    stillHaveQuestions: "Still have questions?",
    supportDescription: "Our support team is here to help you get the most out of your OCUS Job Hunter extension.",
    emailSupport: "Email Support",
    liveChat: "Live Chat",
    mainControlPanel: "Main Control Panel",
    pageRefreshTimer: "Page Refresh Timer",
    liveStatistics: "Live Statistics",
    installationTitle: "Easy Installation in 3 Steps",
    faqTitle: "Frequently Asked Questions",
    pricingTitle: "Simple, Transparent Pricing",
    pricingSubtitle: "One-time payment, lifetime access. No subscriptions, no hidden fees.",
    getExtension: "Get Extension",
    
    // How JobHunter Works Section (English)
    howJobHunterWorksTitle: "How JobHunter Works",
    howJobHunterWorksCards: [
      {
        title: "Sign Up for Free",
        description: "Create your free JobHunter account to get started. No commitment required."
      },
      {
        title: "Install the Chrome Extension",
        description: "Download our Chrome automation tool from your dashboard to start catching jobs automatically."
      },
      {
        title: "Try Free Automation",
        description: "Catch your first 3 local jobs automatically—free during trial mode."
      },
      {
        title: "Activate Full Access",
        description: "Unlock unlimited job catching forever with a one-time license—just the cost of 2 jobs."
      }
    ],

    // Privacy Policy (English)
    privacy: {
      title: "Privacy Policy",
      lastUpdated: "Last Updated",
      backToHome: "Back to Home",
      introduction: {
        title: "Introduction",
        content: "At OCUS Job Hunter, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our Chrome extension service."
      },
      dataCollection: {
        title: "Information We Collect",
        personalInfo: {
          title: "Personal Information",
          content: "We may collect personal information that you voluntarily provide to us when you:",
          email: "Email address",
          name: "Full name",
          phone: "Phone number (optional)",
          country: "Country/region"
        },
        usageData: {
          title: "Usage Data",
          content: "We automatically collect certain information when you use our extension:",
          extensionUsage: "Extension usage statistics and performance metrics",
          featureInteraction: "Feature interaction data to improve user experience",
          performanceMetrics: "Technical performance data for optimization"
        },
        paymentData: {
          title: "Payment Information",
          content: "Payment processing is handled by trusted third-party providers (Stripe and PayPal). We do not store your complete payment card details on our servers."
        }
      },
      dataUsage: {
        title: "How We Use Your Information",
        content: "We use the information we collect for various purposes:",
        provideService: "To provide, operate, and maintain our extension service",
        processPayments: "To process transactions and send purchase confirmations",
        customerSupport: "To provide customer support and respond to your inquiries",
        improveService: "To understand usage patterns and improve our service",
        sendUpdates: "To send you technical updates and important notices",
        preventFraud: "To detect, prevent, and address fraud or security issues"
      },
      dataSharing: {
        title: "Data Sharing and Disclosure",
        content: "We do not sell, trade, or rent your personal information to third parties. We may share your information only in these circumstances:",
        serviceProviders: {
          title: "Service Providers",
          content: "We work with trusted third-party service providers:",
          stripe: "Stripe for payment processing",
          paypal: "PayPal for alternative payment processing",
          emailService: "Email service providers for transactional emails",
          analytics: "Analytics services for service improvement"
        },
        legalRequirements: {
          title: "Legal Requirements",
          content: "We may disclose your information if required to do so by law or in response to valid requests by public authorities."
        }
      },
      dataSecurity: {
        title: "Data Security",
        content: "We implement appropriate technical and organizational security measures to protect your personal information:",
        encryption: "Data encryption in transit and at rest",
        accessControls: "Strict access controls and authentication",
        regularAudits: "Regular security audits and monitoring",
        secureServers: "Secure server infrastructure and hosting"
      },
      userRights: {
        title: "Your Rights",
        content: "Depending on your location, you may have the following rights regarding your personal data:",
        access: "Right to access your personal data",
        correction: "Right to correct inaccurate information",
        deletion: "Right to request deletion of your data",
        portability: "Right to data portability",
        objection: "Right to object to processing",
        restriction: "Right to restrict processing"
      },
      cookies: {
        title: "Cookies and Tracking Technologies",
        content: "We use cookies and similar tracking technologies to enhance your experience:",
        essential: {
          title: "Essential Cookies",
          content: "Required for basic website functionality and security"
        },
        analytics: {
          title: "Analytics Cookies",
          content: "Help us understand how visitors interact with our website"
        },
        marketing: {
          title: "Marketing Cookies",
          content: "Used to provide relevant advertisements and track campaign effectiveness"
        }
      },
      internationalTransfers: {
        title: "International Data Transfers",
        content: "Your information may be transferred to and processed in countries other than your country of residence. We ensure appropriate safeguards are in place for such transfers."
      },
      dataRetention: {
        title: "Data Retention",
        content: "We retain your personal information for as long as necessary to fulfill the purposes outlined in this policy:",
        accountData: "Account information: Until account deletion",
        transactionData: "Transaction records: 7 years for legal compliance",
        supportData: "Support communications: 3 years",
        marketingData: "Marketing preferences: Until you opt out"
      },
      childrenPrivacy: {
        title: "Children's Privacy",
        content: "Our service is not intended for children under the age of 18. We do not knowingly collect personal information from children under 18."
      },
      changes: {
        title: "Changes to This Privacy Policy",
        content: "We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the 'Last Updated' date."
      },
      contact: {
        title: "Contact Us",
        content: "If you have any questions about this Privacy Policy or our data practices, please contact us:",
        address: "Address: Stockholm, Sweden"
      }
    },
    
    // Authentication
    welcome_back: "Welcome back!",
    sign_in_account: "Sign in to your account",
    user_login: "User Login",
    admin_login: "Admin Login",
    your_email: "Your Email",
    your_password: "Your Password",
    login_btn: "Login",
    admin_login_btn: "Admin Login",
    remember_me: "Remember me",
    forgot_password: "Forgot password?",
    no_account: "Don't have an account?",
    sign_up: "Sign up",
    create_account: "Create Account",
    full_name: "Full Name",
    password_min_length: "Minimum 6 characters",
    confirm_password: "Confirm Password",
    accept_terms: "I accept the",
    terms_conditions: "Terms & Conditions",
    create_account_btn: "Create Account",
    have_account: "Already have an account?",
    sign_in: "Sign in",
    or_login_with: "Or continue with",

    // Affiliate Page
    affiliate: {
      title: "Affiliate Program",
      subtitle: "Earn commissions by referring new users to OCUS Job Hunter.",
      dashboard: "Affiliate Dashboard",
      totalEarnings: "Total Earnings",
      totalReferrals: "Total Referrals",
      pendingCommission: "Pending Commission",
      referralInfo: "Referral Information",
      yourReferralLink: "Your Referral Link",
      copyLink: "Copy Link",
      linkCopied: "Referral link copied to clipboard!",
      copyFailed: "Failed to copy link.",
      shareOnSocialMedia: "Share on Social Media",
      shareOnFacebook: "Share on Facebook",
      shareOnTwitter: "Share on Twitter",
      shareOnLinkedIn: "Share on LinkedIn",
      shareByEmail: "Share by Email",
      payoutRequests: "Payout Requests",
      requestPayout: "Request Payout",
      amount: "Amount",
      paymentMethod: "Payment Method",
      paypalEmail: "PayPal Email",
      submitRequest: "Submit Request",
      requesting: "Requesting...",
      requestSent: "Payout request sent successfully!",
      requestFailed: "Failed to send payout request.",
      unknownError: "An unknown error occurred.",
      referrals: "Referrals",
      date: "Date",
      referredUser: "Referred User",
      status: "Status",
      commission: "Commission",
      noReferrals: "You have no referrals yet.",
      payoutHistory: "Payout History",
      payoutDate: "Date",
      payoutAmount: "Amount",
      payoutStatusHeader: "Status",
      noPayouts: "You have no payout history.",
      marketingMaterials: "Marketing Materials",
      emailSwipe: "Email Swipe",
      copyEmail: "Copy Email",
      emailCopied: "Email content copied to clipboard!",
      socialMediaPost: "Social Media Post",
      copyPost: "Copy Post",
      postCopied: "Post content copied to clipboard!",
      tabs: {
        dashboard: "Dashboard",
        referrals: "Referrals",
        payouts: "Payouts",
        marketing: "Marketing",
      },
      referralStatus: {
        pending: "Pending",
        approved: "Approved",
        rejected: "Rejected",
      },
      payoutStatus: {
        pending: "Pending",
        processing: "Processing",
        completed: "Completed",
        failed: "Failed",
      },
      emailSubject: "Check out OCUS Job Hunter!",
      emailBody: `Hey,\n\nI've been using OCUS Job Hunter to find photography jobs automatically, and it's been a game-changer. It saves me hours of manual searching and helps me find the best opportunities.\n\nIf you're a photographer, I highly recommend you check it out. You can use my referral link to sign up: {referralLink}\n\nBest,\n{userName}`,
      socialPost: `Looking for an edge in finding photography jobs? I've been using OCUS Job Hunter to automate my job search, and it's amazing! #photography #freelance #automation. Sign up with my link: {referralLink}`,
    },
    customerManagement: {
      title: "Customer Management",
      failedToFetchCustomers: "Failed to fetch customers",
      activationKeyGenerated: "Activation Key Generated",
      newActivationKey: "New activation key: {key}",
      failedToGenerateKey: "Failed to generate activation key",
      never: "Never",
      totalCustomers: "Total Customers",
      activeExtensions: "{count} active extensions",
      todaysActivity: "Today's Activity",
      activeUsers: "{count} active users",
      jobsSuccess: "Jobs Success",
      ofJobsApplied: "of {count} applied",
      supportTickets: "Support Tickets",
      ofTotal: "of {count} total",
      customersTab: "Customers",
      analyticsTab: "Analytics",
      usageTab: "Usage Statistics",
      searchPlaceholder: "Search customers...",
      customerListTitle: "Customer List",
      customerListDescription: "Manage customer accounts and extension access",
      customerColumn: "Customer",
      statusColumn: "Status",
      extensionColumn: "Extension",
      usageStatsColumn: "Usage Stats",
      totalSpentColumn: "Total Spent",
      actionsColumn: "Actions",
      activeStatus: "Active",
      inactiveStatus: "Inactive",
      timesUsed: "{count} times",
      successfulJobs: "{count} successful jobs",
      lastUsed: "Last used: {date}",
      orders: "{count} orders",
      viewDetails: "View Details",
      customerDetailsTitle: "Customer Details: {name}",
      accountInfo: "Account Information",
      email: "Email:",
      created: "Created:",
      subscription: "Subscription:",
      activationKey: "Activation Key:",
      none: "None",
      extensionUsage: "Extension Usage",
      totalUsage: "Total Usage:",
      recentUsageActivity: "Recent Usage Activity",
      dateColumn: "Date",
      platformColumn: "Platform",
      jobsFoundColumn: "Jobs Found",
      appliedColumn: "Applied",
      successfulColumn: "Successful",
      durationColumn: "Duration",
      paymentHistory: "Payment History",
      amountColumn: "Amount",
      methodColumn: "Method",
      generateKey: "Generate Key",
      revenueAnalytics: "Revenue Analytics",
      totalRevenueFromSales: "Total Revenue from {count} sales",
      extensionPerformance: "Extension Performance",
      todaysSessions: "Today's Sessions:",
      jobsFound: "Jobs Found:",
      applications: "Applications:",
      successRate: "Success Rate:",
      globalUsageStats: "Global Usage Statistics (Last 30 Days)",
      activeUsersColumn: "Active Users",
      sessionsColumn: "Sessions",
      avgDurationColumn: "Avg Duration",
      noUsageStats: "No usage statistics available yet. Statistics will appear once customers start using the extension.",
      error: "Error",
    },
    login_with_google: "Login with Google",
    login_with_facebook: "Login with Facebook",
    login_with_github: "Login with GitHub",

    // Navigation
    home: "Home",
    about: "About",
    contact: "Contact",
    login: "Login",
    dashboard: "Dashboard", 
    profile: "Profile",
    orders: "Orders",
    downloads: "Downloads", 
    logout: "Logout",
    welcomeBack: "Welcome back",
    
    // Support & Tickets
    support: "Support",
    submitTicket: "Submit Ticket",
    viewTickets: "View Tickets",
    ticketSubject: "Subject",
    ticketCategory: "Category",
    ticketPriority: "Priority",
    ticketDescription: "Description",
    ticketStatus: "Status",
    createTicket: "Create Ticket",
    technical: "Technical",
    billing: "Billing",
    featureRequest: "Feature Request",
    bugReport: "Bug Report",
    general: "General",
    low: "Low",
    medium: "Medium",
    high: "High",
    urgent: "Urgent",
    open: "Open",
    inProgress: "In Progress",
    resolved: "Resolved",
    closed: "Closed",
    ticketCreated: "Ticket created successfully",
    ticketUpdated: "Ticket updated successfully",
    replyToTicket: "Reply to Ticket",
    addReply: "Add Reply",
    noTicketsYet: "No tickets submitted yet",
    ticketDetails: "Ticket Details",
    assignedTo: "Assigned to",
    unassigned: "Unassigned",
    createdOn: "Created on",
    lastUpdated: "Last updated",
    replies: "Replies",
    markAsResolved: "Mark as Resolved",
    reopenTicket: "Reopen Ticket",
    deleteTicket: "Delete Ticket",
    
    // Dashboard (English)
    downloadLatestExtension: "Download Latest Extension",
    downloadActivationKeyFile: "Download Activation Key File",
    startFreeExtension: "Start Free Extension",
    noInstallationRequired: "No installation required",
    automaticUpdates: "Automatic updates",
    activationKey: "Activation Key",
    affiliateProgram: "Affiliate Program",
    totalEarnings: "Total Earnings",
    totalReferrals: "Total Referrals",
    pendingCommissions: "Pending Commissions",
    referralCode: "Referral Code",
    copyReferralCode: "Copy Referral Code",
    shareReferralLink: "Share Referral Link",
    currentVersion: "Current Version",
    fileSize: "File Size",
    
    // Customer Dashboard
    customerLogin: "Customer Login",
    customerDashboard: "Customer Dashboard",
    createAccount: "Create Account",
    accountInformation: "Account Information",
    password: "Password",
    name: "Name",
    loginSuccessful: "Login successful",
    loginFailed: "Login failed",
    accountCreated: "Account created successfully",
    welcome: "Welcome",
    registrationFailed: "Registration failed",
    generateKey: "Generate Key",
    activationKeyGenerated: "Activation key generated",
    generationFailed: "Generation failed",
    memberSince: "Member since",
    activated: "Activated",
    demoMode: "Demo Mode",
    useKeyInExtension: "Use this key in the extension",
    noKeyGenerated: "No key generated yet",
    purchaseToGetKey: "Purchase to get your activation key",
    generating: "Generating...",
    noOrdersYet: "No orders yet",
    startFreeThenPurchase: "Start with free version, then purchase for full features",
    accessKeysAndDownloads: "Access your keys and downloads",
    yourFullName: "Your Full Name",
    processing: "Processing...",
    needAccount: "Need an account?",
    alreadyHaveAccount: "Already have an account?",
    chatPlaceholder: "Type your message...",
    send: "Send",
    minimizeChat: "Minimize Chat",
    
    // Admin Dashboard
    adminDashboard: "Admin Dashboard",
    totalRevenue: "Total Revenue",
    totalOrders: "Total Orders",
    totalUsers: "Total Users",
    recentOrders: "Recent Orders",
    recentUsers: "Recent Users",
    settings: "Settings",
    paymentSettings: "Payment Settings",
    emailSettings: "Email Settings",
    chatSettings: "Chat Settings",
    fileManagement: "File Management",
    userManagement: "User Management",
    orderManagement: "Order Management",
    downloadHistory: "Download History",
    systemLogs: "System Logs",
    analytics: "Analytics",
    reports: "Reports",
    backups: "Backups",
    maintenance: "Maintenance",
    notifications: "Notifications",
    
    // File Management
    uploadFile: "Upload File",
    deleteFile: "Delete File",
    downloadFile: "Download File",
    fileUploaded: "File uploaded successfully",
    fileDeleted: "File deleted successfully",
    fileName: "File Name",
    fileType: "File Type",
    uploadDate: "Upload Date",
    actions: "Actions",
    confirmDelete: "Are you sure you want to delete this file?",
    cancel: "Cancel",
    delete: "Delete",
    upload: "Upload",
    selectFile: "Select File",
    dragDropFiles: "Drag and drop files here",
    supportedFormats: "Supported formats",
    maxFileSize: "Max file size",
    
    // General Actions
    edit: "Edit",
    save: "Save",
    update: "Update",
    submit: "Submit",
    close: "Close",
    back: "Back",
    next: "Next",
    previous: "Previous",
    confirm: "Confirm",
    loading: "Loading...",
    error: "Error",
    success: "Success",
    warning: "Warning",
    info: "Info",
    yes: "Yes",
    no: "No",
    active: "Active",
    inactive: "Inactive",
    enabled: "Enabled",
    disabled: "Disabled",
    configuration: "Configuration",
    statistics: "Statistics",
    reset: "Reset",
    pause: "Pause",
    refreshNow: "Refresh Now",
    emergencyStop: "Emergency Stop",
    
    // Refund Policy (English)
    refund: {
      title: "Refund Policy",
      subtitle: "Free Trial Available",
      introduction: {
        title: "Our Commitment to You",
        content: "We offer a free trial so you can test before purchasing. Experience the full functionality and see the results for yourself."
      },
      eligibility: {
        title: "Eligibility Conditions",
        content: "To be eligible for a full refund:",
        within30Days: "Request made within 30 days of purchase",
        originalPurchaser: "You must be the original purchaser",
        validReason: "Valid reason for refund",
        noAbuse: "No abuse of the product"
      },
      process: {
        title: "Refund Process",
        content: "How to request your refund:",
        step1: "Contact our support team",
        step2: "Provide your order number",
        step3: "Explain the reason for your request",
        step4: "Receive confirmation within 24 hours",
        step5: "Refund processed within 3-5 business days"
      },
      timeframe: {
        title: "Processing Timeframes",
        content: "Typical refund timeframes:",
        carteCredit: "Credit card: 3-5 business days",
        paypal: "PayPal: 1-2 business days",
        virement: "Bank transfer: 5-7 business days"
      },
      exceptions: {
        title: "Exceptions",
        content: "Refunds not available for:",
        digitalDownloads: "Digital downloads after 30 days",
        customWork: "Custom work",
        thirdPartyFees: "Third-party fees (processing fees)"
      }
    },

    // Terms of Service (English)
    terms: {
      title: "Terms of Service",
      subtitle: "Legally Binding Agreement",
      acceptance: {
        title: "Acceptance of Terms",
        content: "By using our service, you agree to these terms in their entirety."
      },
      serviceDescription: {
        title: "Service Description",
        content: "OCUS Job Hunter is a Chrome extension for photography job hunting:",
        feature1: "Automated photography job search",
        feature2: "Real-time notifications",
        feature3: "Smart location-based filtering",
        feature4: "Automatic profit calculator"
      },
      userResponsibilities: {
        title: "User Responsibilities",
        content: "As a user, you agree to:",
        responsible1: "Use the service legally and ethically",
        responsible2: "Maintain the confidentiality of your account",
        responsible3: "Not share your access keys",
        responsible4: "Respect third-party platforms"
      },
      prohibited: {
        title: "Prohibited Activities",
        content: "It is strictly forbidden to:",
        prohibited1: "Use the service for illegal purposes",
        prohibited2: "Attempt to hack or compromise the system",
        prohibited3: "Share or resell your access",
        prohibited4: "Use the service for spam or harassment"
      },
      intellectualProperty: {
        title: "Intellectual Property",
        content: "All copyrights and intellectual property belong to us."
      },
      limitation: {
        title: "Limitation of Liability",
        content: "Our liability is limited to the amount paid for the service."
      },
      termination: {
        title: "Termination",
        content: "We reserve the right to terminate access in case of violation."
      },
      changes: {
        title: "Changes to Terms",
        content: "We may modify these terms at any time with prior notice."
      },
      governing: {
        title: "Governing Law",
        content: "These terms are governed by Swedish law."
      }
    },

    // Manual Page (English)
    manual: {
      title: "Installation & Usage Guide",
      subtitle: "Complete guide to install and use the OCUS Job Hunter Chrome extension",
      backToHome: "← Back to Home",
      
      // Installation Section
      installationTitle: "How to Install the Extension",
      installationSubtitle: "Follow these simple steps to get started",
      installationSteps: [
        {
          step: "1",
          title: "Download Extension File",
          description: "After purchasing, download the .crx file from your email confirmation link.",
          details: "Look for an email from OCUS Job Hunter with the subject 'Your Extension is Ready!' and click the download button."
        },
        {
          step: "2",
          title: "Open Chrome Extensions Page",
          description: "Navigate to Chrome Extensions management page.",
          details: "Type 'chrome://extensions/' in your address bar or go to Chrome menu → More tools → Extensions"
        },
        {
          step: "3",
          title: "Enable Developer Mode",
          description: "Toggle 'Developer mode' switch in the top right corner.",
          details: "This is required to install extensions from .crx files. The toggle should turn blue when enabled."
        },
        {
          step: "4",
          title: "Install Extension",
          description: "Drag and drop the .crx file onto the extensions page.",
          details: "You can also click 'Load unpacked' if the drag-and-drop doesn't work. Chrome will show a confirmation dialog."
        }
      ],
      
      // Features Section  
      featuresTitle: "Feature Overview",
      featuresSubtitle: "Discover what makes OCUS Job Hunter so powerful",
      features: [
        {
          title: "Smart Job Detection & Auto-Accept",
          description: "Automatically detects and accepts available jobs on the OCUS platform.",
          details: ["Auto-login even after logout", "Securely stores username and password", "Automatically clicks and accepts new jobs", "Returns to the main page after accepting a job", "Runs continuously until manually stopped"]
        },
        {
          title: "Advanced Settings",
          description: "Customize how the extension behaves to fit your workflow.",
          details: ["Configure refresh intervals", "Enable or disable auto-login", "Limit the number of consecutive jobs accepted"]
        },
        {
          title: "Real-time Notifications",
          description: "Get instant alerts when new photography jobs become available.",
          details: ["Sound notifications for new jobs", "Visual alerts in the browser", "Desktop notifications (optional)", "Custom notification settings"]
        },
        {
          title: "OCUS-Only Operation",
          description: "Designed specifically for the OCUS platform with optimized performance.",
          details: ["Works exclusively on OCUS job pages", "Optimized for OCUS interface", "Regular updates for platform compatibility", "Seamless integration with OCUS workflow"]
        },
        {
          title: "Free & Premium Versions",
          description: "Choose the version that fits your needs.",
          details: ["Free version: 3 job limit for testing", "Premium version: Unlimited job acceptance", "Premium-only advanced features", "Lifetime access with one-time payment"]
        }
      ],
      
      // Usage Section
      usageTitle: "How to Use",
      usageSubtitle: "Start finding your dream job automatically with these easy steps",
      usageSteps: [
        {
          title: "Go to OCUS",
          description: "Open Google Chrome and navigate to the OCUS job listings page.",
          tip: "The extension only activates on OCUS job pages."
        },
        {
          title: "Automatic Activation",
          description: "On OCUS, the extension starts refreshing and scanning for new jobs.",
          tip: "If you get logged out, it automatically logs you back in."
        },
        {
          title: "Automatic Job Acceptance",
          description: "When a matching job appears, the extension opens the job link and accepts it automatically.",
          tip: "No need manual monitoring."
        },
        {
          title: "Continuous Monitoring",
          description: "After accepting a job, it returns to the main page and repeats the cycle until you disable it.",
          tip: "Runs continuously until you turn it off."
        }
      ],
      
      // Important Notes
      importantNotesTitle: "Important Notes",
      importantNotes: [
        "Keep your Chrome browser open while the extension is running",
        "Make sure you have a stable internet connection", 
        "The extension will automatically handle login if you get logged out",
        "You can pause or stop the extension at any time using the popup interface",
        "For best results, close other tabs that might interfere with OCUS"
      ]
    },

    // Legal page navigation (English)
    legal: {
      title: "Legal Information",
      privacyPolicy: "Privacy Policy",
      refundPolicy: "Refund Policy",
      termsOfService: "Terms of Service",
      backToHome: "Back to Home",
      lastUpdated: "Last updated",
      changeLanguage: "Change language",
      gdprNotice: "We respect your privacy and comply with GDPR regulations"
    }
  },
  
  pt: {
    // General (Portuguese)
    announcement: "🎯 Por Tempo Limitado: OCUS Job Hunter com 70% de Desconto!",
    buyNow: "Comprar Agora",
    watchDemo: "Ver Demo",
    heroTitle1: "Encontre Trabalhos de Fotografia",
    heroTitle2: "10x Mais Rápido",
    heroTitle3: "com OCUS Job Hunter",
    heroSubtitle: "A extensão Chrome definitiva para fotógrafos em plataformas de entrega. Encontra e filtra automaticamente os melhores trabalhos de fotografia no OCUS.",
    oneTimePayment: "Pagamento único",
    lifetimeAccess: "Acesso vitalício",
    noMonthlyFees: "Sem taxas mensais",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Atualizações garantidas",
    limitedTimeOffer: "Oferta por tempo limitado",
    discountCode: "EARLYBIRD70",
    discountApplied: "Desconto aplicado!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Começar",
    learnMore: "Saber Mais",
    viewDemo: "Ver Demo",
    downloadNow: "Baixar Agora",
    freeDemo: "Demo Grátis",
    premiumVersion: "Versão Premium",
    
    // Features (Portuguese)
    features: "Funcionalidades",
    faqQuestions: [
      "Como funciona o OCUS Job Hunter?",
      "É compatível com meu navegador?",
      "Como instalo a extensão?",
      "Preciso de uma assinatura?",
      "Posso obter reembolso?",
      "Com que frequência vocês atualizam a extensão?"
    ],
    faqAnswers: [
      "O OCUS Job Hunter escaneia automaticamente as plataformas de entrega e identifica trabalhos de fotografia, filtrando-os com base nas suas preferências e destacando as oportunidades mais lucrativas.",
      "Sim, nossa extensão funciona com navegadores Chrome, Firefox, Safari e Edge. Simplesmente baixe a versão para seu navegador.",
      "Após a compra, você receberá um link de download e guia de instalação. O processo leva menos de 2 minutos.",
      "Não! Esta é uma compra única com acesso vitalício. Sem taxas mensais ou anuais.",
      "Sim, oferecemos uma versão de teste gratuita para que você possa experimentar antes da compra. Experimente todas as funcionalidades e veja os resultados por si mesmo.",
      "Lançamos atualizações regularmente para garantir compatibilidade com mudanças da plataforma e adicionar novos recursos baseados no feedback dos usuários."
    ],
    installationSteps: [
      "Baixe o arquivo da extensão",
      "Abra as configurações de extensão do seu navegador",
      "Ative o Modo Desenvolvedor",
      "Clique em 'Carregar sem compactação' e selecione a pasta baixada",
      "Fixe a extensão na sua barra de ferramentas",
      "Comece a encontrar trabalhos de fotografia!"
    ],
    featuresList: [
      {
        title: "Detecção Inteligente de Trabalhos",
        description: "Identifica automaticamente oportunidades de fotografia"
      },
      {
        title: "Candidatura com Um Clique",
        description: "Candidate-se a trabalhos com um único clique"
      }
    ],
    
    // Additional content for home page (Portuguese)
    manualJobHuntingProblems: [
      "Gastar horas procurando manualmente por trabalhos de fotografia",
      "Perder oportunidades bem pagas enquanto navega",
      "Login automático",
      "Perder tempo com solicitações de entrega de baixo valor"
    ],
    automatedBenefits: [
      "Notificações instantâneas para trabalhos de fotografia",
      "Retornar automaticamente à página inicial para monitorar",
      "Monitoramento 24/7",
      "Candidaturas com um clique"
    ],
    howItWorksSteps: [
      "Instale a extensão Chrome em 2 minutos",
      "Configure suas preferências de localização e taxa",
      "Deixe a extensão encontrar trabalhos automaticamente",
      "Candidate-se a oportunidades valiosas com um clique"
    ],
    testimonials: [
      {
        name: "Sarah M.",
        role: "Fotógrafa Profissional",
        content: "Esta extensão transformou completamente como encontro trabalhos de fotografia. Estou ganhando 40% mais trabalhando menos horas!"
      },
      {
        name: "Mike R.",
        role: "Fotógrafo de Comida",
        content: "Ferramenta incrível! Eu costumava gastar 2 horas diárias procurando trabalhos. Agora levo 10 minutos para encontrar as melhores oportunidades."
      },
      {
        name: "Emma L.",
        role: "Fotógrafa Freelancer",
        content: "O recurso de calculadora de lucro é revolucionário. Posso ver exatamente quais trabalhos valem meu tempo antes de me candidatar."
      }
    ],
    stats: {
      jobsFound: "50.000+",
      timesSaved: "10x mais rápido",
      activeUsers: "2.500+"
    },
    
    // Additional missing properties for home page (Portuguese)
    installation: "Instalação",
    pricing: "Preços",
    jobsFound: "50.000+ Trabalhos Encontrados",
    potentialEarnings: "€125k+ Ganhos Potenciais",
    activeMonitoring: "Monitoramento 24/7",
    sslSecured: "SSL Seguro",
    rating: "Avaliação 4.9/5",
    instantDownload: "Download Instantâneo",
    problemTitle: "Pare de Perder Tempo Procurando Trabalhos Manualmente",
    problemSubtitle: "Veja a diferença entre busca manual e nossa solução automatizada",
    manualJobHunting: "Busca Manual de Trabalhos",
    automatedSolution: "Solução Automatizada",
    automatedSolutionBenefits: [
      "Notificações instantâneas para trabalhos de fotografia",
      "Retornar automaticamente à página inicial para monitorar",
      "Monitoramento 24/7",
      "Candidaturas com um clique"
    ],
    featuresTitle: "Por que Escolher o OCUS Photography Job Hunter?",
    featuresSubtitle: "Esta Extensão Google Chrome é especificamente projetada para fotógrafos que trabalham com Ubereats e Foodora através do OCUS",
    faqSubtitle: "Tudo que você precisa saber sobre a Extensão Chrome OCUS Job Hunter",
    stillHaveQuestions: "Ainda tem dúvidas?",
    supportDescription: "Nossa equipe de suporte está aqui para ajudá-lo a aproveitar ao máximo sua extensão OCUS Job Hunter.",
    emailSupport: "Suporte por Email",
    liveChat: "Chat ao Vivo",
    mainControlPanel: "Painel de Controle Principal",
    pageRefreshTimer: "Timer de Atualização da Página",
    liveStatistics: "Estatísticas em Tempo Real",
    installationTitle: "Instalação Fácil em 3 Passos",
    faqTitle: "Perguntas Frequentes",
    pricingTitle: "Preços Simples e Transparentes",
    pricingSubtitle: "Pagamento único, acesso vitalício. Sem assinaturas, sem taxas ocultas.",
    getExtension: "Obter Extensão",
    
    // Extension Showcase Section (Portuguese)
    extensionShowcaseTitle: "Extensão Premium OCUS Job Hunter",
    extensionShowcaseSubtitle: "Automação completa para trabalhos de fotografia OCUS com monitoramento inteligente e gerenciamento de fluxo fluido",
    extensionHowItWorksTitle: "🎯 Como funciona a Extensão Premium",
    extensionAutoLoginTitle: "🔐 Login Automático",
    extensionAutoLoginDescription: "Usa suas credenciais OCUS para reconectá-lo automaticamente quando as sessões expiram",
    extension24MonitoringTitle: "🕐 Monitoramento 24/7",
    extension24MonitoringDescription: "Após aceitar missões, retorna à página inicial para continuar monitorando novas oportunidades",
    extensionSmartTimerTitle: "⚡ Timer Inteligente",
    extensionSmartTimerDescription: "Intervalos de atualização personalizáveis (5-30 segundos) com controles do painel flutuante e rastreamento de desempenho",
    floatingPanelTitle: "Painel Flutuante OCUS Hunter",
    floatingPanelDescription: "Este painel flutuante de tema escuro permanece visível enquanto navega no OCUS. Mostra timer de contagem regressiva em tempo real com intervalos de atualização personalizáveis. Usuários Premium têm acesso ilimitado com métricas detalhadas para missões encontradas, abertas, aceitas e tentativas de login.",
    extensionPopupTitle: "Interface Popup da Extensão",
    extensionPopupDescription: "Clique no ícone da extensão do navegador para acessar este painel de controle completo. Configure login automático com suas credenciais OCUS, gerencie todas as configurações da extensão e monitore o status premium. Interface de tema escuro com opções abrangentes de configuração.",
    
    // Free Demo Section (Portuguese)
    freeDemoTitle: "Experimente a Versão Demo Grátis",
    freeDemoSubtitle: "Teste nossa extensão com 3 missões gratuitas antes de fazer upgrade para acesso ilimitado",
    freeDemoBadge: "Teste 100% Gratuito",
    freeDemoFeature1: "3 Testes de Missão Grátis",
    freeDemoFeature2: "Todos os Recursos da Extensão",
    freeDemoFeature3: "Sem Cartão de Crédito",
    freeDemoFeature4: "Download Instantâneo",
    freeDemoDownloadButton: "Baixar Demo Grátis",
    freeDemoUpgradeText: "Gostou? Faça upgrade para acesso ilimitado a qualquer momento",
    freeDemoTestText: "Perfeito para testar antes da compra",
    
    // Purchase Card Features (Portuguese)
    chromeExtensionFile: "Extensão Chrome (arquivo .crx)",
    autoLoginOcus: "Login automático para conta OCUS",
    jobMonitoringSystem: "Sistema de monitoramento de trabalhos 24/7",
    desktopNotifications: "Notificações instantâneas na área de trabalho",
    performanceAnalytics: "Análises de desempenho e estatísticas",
    installationManual: "Manual de instalação incluso",
    lifetimeUpdatesSupport: "Acesso vitalício",
    securePayment: "Pagamento seguro via Stripe e PayPal",
    instantDigitalDelivery: "Entrega digital instantânea",
    
    // How JobHunter Works Section (Portuguese)
    howJobHunterWorksTitle: "Como o JobHunter Funciona",
    howJobHunterWorksCards: [
      {
        title: "Cadastre-se Gratuitamente",
        description: "Crie sua conta gratuita no JobHunter para começar. Nenhum compromisso necessário."
      },
      {
        title: "Instale a Extensão Chrome",
        description: "Baixe nossa ferramenta de automação Chrome do seu painel para começar a encontrar trabalhos automaticamente."
      },
      {
        title: "Experimente a Automação Gratuita",
        description: "Encontre seus primeiros 3 trabalhos locais automaticamente—grátis durante o modo de teste."
      },
      {
        title: "Ative o Acesso Completo",
        description: "Desbloqueie captura ilimitada de trabalhos para sempre com uma licença única—apenas o custo de 2 trabalhos."
      }
    ],
    
    // Privacy Policy (Portuguese)
    privacy: {
      title: "Política de Privacidade",
      lastUpdated: "Última Atualização",
      backToHome: "Voltar ao Início",
      introduction: {
        title: "Introdução",
        content: "Na OCUS Job Hunter, levamos a sua privacidade a sério. Esta Política de Privacidade explica como coletamos, usamos, divulgamos e protegemos suas informações quando você visita nosso site e usa nosso serviço de extensão Chrome."
      },
      dataCollection: {
        title: "Informações que Coletamos",
        personalInfo: {
          title: "Informações Pessoais",
          content: "Podemos coletar informações pessoais que você nos fornece voluntariamente quando:",
          email: "Endereço de e-mail",
          name: "Nome completo",
          phone: "Número de telefone (opcional)",
          country: "País/região"
        },
        usageData: {
          title: "Dados de Uso",
          content: "Coletamos automaticamente certas informações quando você usa nossa extensão:",
          extensionUsage: "Estatísticas de uso da extensão e métricas de desempenho",
          featureInteraction: "Dados de interação com recursos para melhorar a experiência do usuário",
          performanceMetrics: "Dados técnicos de desempenho para otimização"
        },
        paymentData: {
          title: "Informações de Pagamento",
          content: "O processamento de pagamentos é realizado por provedores terceirizados confiáveis (Stripe e PayPal). Não armazenamos seus dados completos de cartão de pagamento em nossos servidores."
        }
      },
      dataUsage: {
        title: "Como Usamos Suas Informações",
        content: "Usamos as informações que coletamos para vários propósitos:",
        provideService: "Para fornecer, operar e manter nosso serviço de extensão",
        processPayments: "Para processar transações e enviar confirmações de compra",
        customerSupport: "Para fornecer suporte ao cliente e responder às suas consultas",
        improveService: "Para entender padrões de uso e melhorar nosso serviço",
        sendUpdates: "Para enviar atualizações técnicas e avisos importantes",
        preventFraud: "Para detectar, prevenir e lidar com fraudes ou problemas de segurança"
      },
      dataSharing: {
        title: "Compartilhamento e Divulgação de Dados",
        content: "Não vendemos, trocamos ou alugamos suas informações pessoais para terceiros. Podemos compartilhar suas informações apenas nestas circunstâncias:",
        serviceProviders: {
          title: "Provedores de Serviços",
          content: "Trabalhamos com provedores de serviços terceirizados confiáveis:",
          stripe: "Stripe para processamento de pagamentos",
          paypal: "PayPal para processamento alternativo de pagamentos",
          emailService: "Provedores de serviços de e-mail para e-mails transacionais",
          analytics: "Serviços de análise para melhoria do serviço"
        },
        legalRequirements: {
          title: "Requisitos Legais",
          content: "Podemos divulgar suas informações se exigido por lei ou em resposta a solicitações válidas de autoridades públicas."
        }
      },
      dataSecurity: {
        title: "Segurança de Dados",
        content: "Implementamos medidas de segurança técnicas e organizacionais apropriadas para proteger suas informações pessoais:",
        encryption: "Criptografia de dados em trânsito e em repouso",
        accessControls: "Controles rigorosos de acesso e autenticação",
        regularAudits: "Auditorias de segurança regulares e monitoramento",
        secureServers: "Infraestrutura de servidor segura e hospedagem"
      },
      userRights: {
        title: "Seus Direitos",
        content: "Dependendo da sua localização, você pode ter os seguintes direitos em relação aos seus dados pessoais:",
        access: "Direito de acessar seus dados pessoais",
        correction: "Direito de corrigir informações imprecisas",
        deletion: "Direito de solicitar exclusão de seus dados",
        portability: "Direito à portabilidade de dados",
        objection: "Direito de se opor ao processamento",
        restriction: "Direito de restringir o processamento"
      },
      cookies: {
        title: "Cookies e Tecnologias de Rastreamento",
        content: "Usamos cookies e tecnologias de rastreamento similares para melhorar sua experiência:",
        essential: {
          title: "Cookies Essenciais",
          content: "Necessários para funcionalidade básica do site e segurança"
        },
        analytics: {
          title: "Cookies de Análise",
          content: "Nos ajudam a entender como os visitantes interagem com nosso site"
        },
        marketing: {
          title: "Cookies de Marketing",
          content: "Usados para fornecer anúncios relevantes e rastrear eficácia de campanhas"
        }
      },
      internationalTransfers: {
        title: "Transferências Internacionais de Dados",
        content: "Suas informações podem ser transferidas e processadas em países diferentes do seu país de residência. Garantimos que salvaguardas apropriadas estejam em vigor para tais transferências."
      },
      dataRetention: {
        title: "Retenção de Dados",
        content: "Retemos suas informações pessoais pelo tempo necessário para cumprir os propósitos descritos nesta política:",
        accountData: "Informações da conta: Até exclusão da conta",
        transactionData: "Registros de transações: 7 anos para conformidade legal",
        supportData: "Comunicações de suporte: 3 anos",
        marketingData: "Preferências de marketing: Até você optar por sair"
      },
      childrenPrivacy: {
        title: "Privacidade de Crianças",
        content: "Nosso serviço não se destina a crianças menores de 18 anos. Não coletamos conscientemente informações pessoais de crianças menores de 18 anos."
      },
      changes: {
        title: "Alterações nesta Política de Privacidade",
        content: "Podemos atualizar esta Política de Privacidade de tempos em tempos. Notificaremos você sobre quaisquer alterações publicando a nova política nesta página e atualizando a data de 'Última Atualização'."
      },
      contact: {
        title: "Entre em Contato",
        content: "Se você tiver alguma dúvida sobre esta Política de Privacidade ou nossas práticas de dados, entre em contato conosco:",
        address: "Endereço: Estocolmo, Suécia"
      }
    },
    
    // Authentication (Portuguese)
    welcome_back: "Olá, seja bem vindo(a)!",
    sign_in_account: "Faça login em sua conta OCUS Job Hunter",
    user_login: "Login de Usuário",
    admin_login: "Login de Admin",
    your_email: "Seu E-mail",
    your_password: "Sua Senha",
    login_btn: "Login",
    admin_login_btn: "Login Admin",
    remember_me: "Lembrar",
    forgot_password: "Esqueceu a senha?",
    no_account: "Não tem uma conta?",
    sign_up: "Inscreva-se",
    create_account: "Criar Conta",
    full_name: "Nome Completo",
    password_min_length: "Mínimo 6 caracteres",
    confirm_password: "Confirmar Senha",
    accept_terms: "Eu aceito os",
    terms_conditions: "Termos e Condições",
    create_account_btn: "Quero me Inscrever",
    have_account: "Já tem uma conta?",
    sign_in: "Fazer login",
    or_login_with: "Ou continue com",
    login_with_google: "Login com Google",
    login_with_facebook: "Login com Facebook",
    login_with_github: "Login com GitHub",
    
    // Navigation (Portuguese)
    home: "Início",
    about: "Sobre",
    contact: "Contato", 
    login: "Entrar",
    dashboard: "Painel",
    profile: "Perfil",
    orders: "Pedidos",
    downloads: "Downloads", 
    logout: "Sair",
    welcomeBack: "Bem-vindo de volta",
    
    // Support & Tickets (Portuguese)
    support: "Suporte",
    submitTicket: "Enviar Ticket",
    viewTickets: "Ver Tickets",
    ticketSubject: "Assunto",
    ticketCategory: "Categoria",
    ticketPriority: "Prioridade",
    ticketDescription: "Descrição",
    ticketStatus: "Status",
    createTicket: "Criar Ticket",
    technical: "Técnico",
    billing: "Faturamento",
    featureRequest: "Solicitação de Recurso",
    bugReport: "Relatório de Bug",
    general: "Geral",
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    urgent: "Urgente",
    open: "Aberto",
    inProgress: "Em Progresso",
    resolved: "Resolvido",
    closed: "Fechado",
    ticketCreated: "Ticket criado com sucesso",
    ticketUpdated: "Ticket atualizado com sucesso",
    replyToTicket: "Responder ao Ticket",
    addReply: "Adicionar Resposta",
    noTicketsYet: "Nenhum ticket enviado ainda",
    ticketDetails: "Detalhes do Ticket",
    assignedTo: "Atribuído a",
    unassigned: "Não atribuído",
    createdOn: "Criado em",
    lastUpdated: "Última atualização",
    replies: "Respostas",
    markAsResolved: "Marcar como Resolvido",
    reopenTicket: "Reabrir Ticket",
    deleteTicket: "Excluir Ticket",
    
    // Dashboard (Portuguese)
    downloadLatestExtension: "Baixar Última Extensão",
    downloadActivationKeyFile: "Baixar Arquivo de Chave de Ativação",
    startFreeExtension: "Iniciar Extensão Gratuita",
    noInstallationRequired: "Nenhuma instalação necessária",
    automaticUpdates: "Atualizações automáticas",
    activationKey: "Chave de Ativação",
    affiliateProgram: "Programa de Afiliados",
    totalEarnings: "Ganhos Totais",
    totalReferrals: "Indicações Totais",
    pendingCommissions: "Comissões Pendentes",
    referralCode: "Código de Indicação",
    copyReferralCode: "Copiar Código de Indicação",
    shareReferralLink: "Compartilhar Link de Indicação",
    currentVersion: "Versão Atual",
    fileSize: "Tamanho do Arquivo",
    
    // Customer Dashboard (Portuguese)
    customerLogin: "Login do Cliente",
    customerDashboard: "Painel do Cliente",
    createAccount: "Criar Conta",
    accountInformation: "Informações da Conta", 
    password: "Senha",
    name: "Nome",
    loginSuccessful: "Login realizado com sucesso",
    loginFailed: "Falha no login",
    accountCreated: "Conta criada com sucesso",
    welcome: "Bem-vindo",
    registrationFailed: "Falha no registro",
    generateKey: "Gerar Chave",
    activationKeyGenerated: "Chave de ativação gerada",
    generationFailed: "Falha na geração",
    memberSince: "Membro desde",
    activated: "Ativado",
    demoMode: "Modo Demo",
    useKeyInExtension: "Use esta chave na extensão",
    noKeyGenerated: "Nenhuma chave gerada ainda",
    purchaseToGetKey: "Compre para obter sua chave de ativação",
    generating: "Gerando...",
    noOrdersYet: "Nenhum pedido ainda",
    startFreeThenPurchase: "Comece com a versão gratuita, depois compre para recursos completos",
    accessKeysAndDownloads: "Acesse suas chaves e downloads",
    yourFullName: "Seu Nome Completo",
    processing: "Processando...",
    needAccount: "Precisa de uma conta?",
    alreadyHaveAccount: "Já tem uma conta?",
    chatPlaceholder: "Digite sua mensagem...",
    send: "Enviar",
    minimizeChat: "Minimizar Chat",
    
    // Admin Dashboard (Portuguese)
    adminDashboard: "Painel Administrativo",
    totalRevenue: "Receita Total",
    totalOrders: "Pedidos Totais",
    totalUsers: "Usuários Totais",
    recentOrders: "Pedidos Recentes",
    recentUsers: "Usuários Recentes",
    settings: "Configurações",
    paymentSettings: "Configurações de Pagamento",
    emailSettings: "Configurações de Email",
    chatSettings: "Configurações de Chat",
    fileManagement: "Gerenciamento de Arquivos",
    userManagement: "Gerenciamento de Usuários",
    orderManagement: "Gerenciamento de Pedidos",
    downloadHistory: "Histórico de Downloads",
    systemLogs: "Logs do Sistema",
    analytics: "Análises",
    reports: "Relatórios",
    backups: "Backups",
    maintenance: "Manutenção",
    notifications: "Notificações",
    
    // File Management (Portuguese)
    uploadFile: "Enviar Arquivo",
    deleteFile: "Excluir Arquivo",
    downloadFile: "Baixar Arquivo",
    fileUploaded: "Arquivo enviado com sucesso",
    fileDeleted: "Arquivo excluído com sucesso",
    fileName: "Nome do Arquivo",
    fileType: "Tipo de Arquivo",
    uploadDate: "Data de Upload",
    actions: "Ações",
    confirmDelete: "Tem certeza de que deseja excluir este arquivo?",
    cancel: "Cancelar",
    delete: "Excluir",
    upload: "Enviar",
    selectFile: "Selecionar Arquivo",
    dragDropFiles: "Arraste e solte arquivos aqui",
    supportedFormats: "Formatos suportados",
    maxFileSize: "Tamanho máximo do arquivo",
    
    // General Actions (Portuguese)
    edit: "Editar",
    save: "Salvar",
    update: "Atualizar",
    submit: "Enviar",
    close: "Fechar",
    back: "Voltar",
    next: "Próximo",
    previous: "Anterior",
    confirm: "Confirmar",
    loading: "Carregando...",
    error: "Erro",
    success: "Sucesso",
    warning: "Aviso",
    info: "Info",
    yes: "Sim",
    no: "Não",
    active: "Ativo",
    inactive: "Inativo",
    enabled: "Habilitado",
    disabled: "Desabilitado",
    configuration: "Configuração",
    statistics: "Estatísticas",
    reset: "Redefinir",
    pause: "Pausar",
    refreshNow: "Atualizar Agora",
    emergencyStop: "Parada de Emergência",
    
    // Refund Policy (Portuguese) 
    refund: {
      title: "Política de Reembolso",
      subtitle: "Teste Gratuito Disponível",
      introduction: {
        title: "Nosso Compromisso",
        content: "Oferecemos uma versão de teste gratuita para que você possa experimentar antes da compra. Experimente todas as funcionalidades e veja os resultados por si mesmo."
      },
      eligibility: {
        title: "Condições de Elegibilidade",
        content: "Para ser elegível ao reembolso completo:",
        within30Days: "Solicitação em até 30 dias da compra",
        originalPurchaser: "Você deve ser o comprador original",
        validReason: "Razão válida para reembolso",
        noAbuse: "Não uso abusivo do produto"
      },
      process: {
        title: "Processo de Reembolso",
        content: "Como solicitar seu reembolso:",
        step1: "Contate nossa equipe de suporte",
        step2: "Forneça seu número do pedido",
        step3: "Explique a razão da solicitação",
        step4: "Confirmação em 24 horas",
        step5: "Reembolso processado em 3-5 dias úteis"
      }
    },

    // Terms of Service (Portuguese)
    terms: {
      title: "Termos de Serviço",
      subtitle: "Acordo Juridicamente Vinculativo",
      acceptance: {
        title: "Aceitação dos Termos",
        content: "Ao usar nosso serviço, você aceita estes termos integralmente."
      },
      serviceDescription: {
        title: "Descrição do Serviço",
        content: "OCUS Job Hunter é uma extensão Chrome para busca de trabalhos de fotografia:",
        feature1: "Busca automatizada de trabalhos fotográficos",
        feature2: "Notificações em tempo real",
        feature3: "Filtragem inteligente por localização",
        feature4: "Calculadora automática de lucros"
      },
      userResponsibilities: {
        title: "Responsabilidades do Usuário",
        content: "Como usuário, você concorda em:",
        responsible1: "Usar o serviço legal e eticamente",
        responsible2: "Manter confidencialidade da sua conta",
        responsible3: "Não compartilhar suas chaves de acesso",
        responsible4: "Respeitar plataformas de terceiros"
      },
      prohibited: {
        title: "Atividades Proibidas",
        content: "É estritamente proibido:",
        prohibited1: "Usar o serviço para fins ilegais",
        prohibited2: "Tentar hackear ou comprometer o sistema",
        prohibited3: "Compartilhar ou revender seu acesso",
        prohibited4: "Usar o serviço para spam ou assédio"
      }
    },

    // Manual Page (Portuguese)
    manual: {
      title: "Guia de Instalação e Uso",
      subtitle: "Guia completo para instalar e usar a extensão Chrome OCUS Job Hunter",
      backToHome: "← Voltar ao Início",
      
      // Installation Section
      installationTitle: "Como Instalar a Extensão",
      installationSubtitle: "Siga estes passos simples para começar",
      installationSteps: [
        {
          step: "1",
          title: "Baixar Arquivo da Extensão",
          description: "Após a compra, baixe o arquivo .crx do link de confirmação em seu e-mail.",
          details: "Procure por um e-mail do OCUS Job Hunter com o assunto 'Sua Extensão Está Pronta!' e clique no botão de download."
        },
        {
          step: "2",
          title: "Abrir Página de Extensões do Chrome",
          description: "Navegue até a página de gerenciamento de extensões do Chrome.",
          details: "Digite 'chrome://extensions/' na sua barra de endereços ou vá ao menu Chrome → Mais ferramentas → Extensões"
        },
        {
          step: "3",
          title: "Ativar Modo Desenvolvedor",
          description: "Ative o botão 'Modo desenvolvedor' no canto superior direito.",
          details: "Isso é necessário para instalar extensões de arquivos .crx. O botão deve ficar azul quando ativado."
        },
        {
          step: "4",
          title: "Instalar Extensão",
          description: "Arraste e solte o arquivo .crx na página de extensões.",
          details: "Você também pode clicar em 'Carregar sem compactação' se arrastar e soltar não funcionar. O Chrome mostrará uma caixa de confirmação."
        }
      ],
      
      // Features Section  
      featuresTitle: "Visão Geral dos Recursos",
      featuresSubtitle: "Descubra o que torna o OCUS Job Hunter tão poderoso",
      features: [
        {
          title: "Detecção Inteligente e Auto-Aceitação de Trabalhos",
          description: "Detecta e aceita automaticamente trabalhos disponíveis na plataforma OCUS.",
          details: ["Auto-login mesmo após logout", "Armazena com segurança usuário e senha", "Clica e aceita automaticamente novos trabalhos", "Retorna à página principal após aceitar um trabalho", "Executa continuamente até ser parado manualmente"]
        },
        {
          title: "Configurações Avançadas",
          description: "Personalize como a extensão se comporta para se adequar ao seu fluxo de trabalho.",
          details: ["Configure intervalos de atualização", "Ative ou desative auto-login", "Limite o número de trabalhos consecutivos aceitos"]
        },
        {
          title: "Notificações em Tempo Real",
          description: "Receba alertas instantâneos quando novos trabalhos de fotografia ficarem disponíveis.",
          details: ["Notificações sonoras para novos trabalhos", "Alertas visuais no navegador", "Notificações da área de trabalho (opcional)", "Configurações personalizadas de notificação"]
        },
        {
          title: "Operação Exclusiva OCUS",
          description: "Projetado especificamente para a plataforma OCUS com desempenho otimizado.",
          details: ["Funciona exclusivamente em páginas de trabalho OCUS", "Otimizado para interface OCUS", "Atualizações regulares para compatibilidade da plataforma", "Integração perfeita com fluxo de trabalho OCUS"]
        },
        {
          title: "Versões Gratuita e Premium",
          description: "Escolha a versão que atende às suas necessidades.",
          details: ["Versão gratuita: limite de 3 trabalhos para teste", "Versão premium: aceitação ilimitada de trabalhos", "Recursos avançados exclusivos premium", "Acesso vitalício com pagamento único"]
        }
      ],
      
      // Usage Section
      usageTitle: "Como Usar",
      usageSubtitle: "Comece a encontrar seu trabalho dos sonhos automaticamente com estes passos fáceis",
      usageSteps: [
        {
          title: "Ir para OCUS",
          description: "Abra o Google Chrome e navegue até a página de listagem de trabalhos OCUS.",
          tip: "A extensão só ativa em páginas de trabalho OCUS."
        },
        {
          title: "Ativação Automática",
          description: "No OCUS, a extensão começa a atualizar e escanear por novos trabalhos.",
          tip: "Se você for desconectado, ela automaticamente faz login novamente."
        },
        {
          title: "Aceitação Automática de Trabalhos",
          description: "Quando um trabalho correspondente aparece, a extensão abre o link do trabalho e o aceita automaticamente.",
          tip: "Não precisa de monitoramento manual."
        },
        {
          title: "Monitoramento Contínuo",
          description: "Após aceitar um trabalho, retorna à página principal e repete o ciclo até você desativá-la.",
          tip: "Executa continuamente até você desligar."
        }
      ],
      
      // Important Notes
      importantNotesTitle: "Notas Importantes",
      importantNotes: [
        "Mantenha seu navegador Chrome aberto enquanto a extensão estiver funcionando",
        "Certifique-se de ter uma conexão estável à internet",
        "A extensão lidará automaticamente com o login se você for desconectado",
        "Você pode pausar ou parar a extensão a qualquer momento usando a interface popup",
        "Para melhores resultados, feche outras abas que possam interferir com OCUS"
      ]
    },

    // Legal page navigation (Portuguese)
    legal: {
      title: "Informações Legais",
      privacyPolicy: "Política de Privacidade",
      refundPolicy: "Política de Reembolso",
      termsOfService: "Termos de Serviço",
      backToHome: "Voltar ao Início",
      lastUpdated: "Última atualização",
      changeLanguage: "Alterar idioma",
      gdprNotice: "Respeitamos sua privacidade e cumprimos as regulamentações GDPR"
    }
  },
  
  // French translations
  fr: {
    // General
    announcement: "🎯 Offre limitée : Obtenez OCUS Job Hunter avec 70% de réduction !",
    buyNow: "Acheter maintenant",
    watchDemo: "Voir la démo",
    heroTitle1: "Trouvez des emplois photo",
    heroTitle2: "10x plus rapide",
    heroTitle3: "avec OCUS Job Hunter",
    heroSubtitle: "L'extension Chrome ultime pour les photographes sur les plateformes de livraison. Trouve et filtre automatiquement les meilleurs emplois photo sur OCUS.",
    oneTimePayment: "Paiement unique",
    lifetimeAccess: "Accès à vie",
    noMonthlyFees: "Pas de frais mensuels",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Mises à jour garanties",
    limitedTimeOffer: "Offre à durée limitée",
    discountCode: "EARLYBIRD70",
    discountApplied: "Réduction appliquée !",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Commencer",
    learnMore: "En savoir plus",
    viewDemo: "Voir la démo",
    downloadNow: "Télécharger maintenant",
    freeDemo: "Démo gratuite",
    premiumVersion: "Version premium",
    
    // Features
    features: "Fonctionnalités",
    faqQuestions: [
      "Comment fonctionne OCUS Job Hunter ?",
      "Est-ce compatible avec mon navigateur ?",
      "Comment installer l'extension ?",
      "Ai-je besoin d'un abonnement ?",
      "Puis-je obtenir un remboursement ?",
      "À quelle fréquence mettez-vous à jour l'extension ?"
    ],
    faqAnswers: [
      "OCUS Job Hunter scanne automatiquement les plateformes de livraison et identifie les emplois photo, les filtrant selon vos préférences et mettant en évidence les opportunités les plus rentables.",
      "Oui, notre extension fonctionne avec les navigateurs Chrome, Firefox, Safari et Edge. Téléchargez simplement la version pour votre navigateur.",
      "Après l'achat, vous recevrez un lien de téléchargement et un guide d'installation. Le processus prend moins de 2 minutes.",
      "Non ! Il s'agit d'un achat unique avec accès à vie. Pas de frais mensuels ou annuels.",
      "Oui, nous offrons un essai gratuit pour que vous puissiez tester avant d'acheter. Découvrez toutes les fonctionnalités et voyez les résultats par vous-même.",
      "Nous publions régulièrement des mises à jour pour assurer la compatibilité avec les changements de plateforme et ajouter de nouvelles fonctionnalités basées sur les commentaires des utilisateurs."
    ],
    installationSteps: [
      "Téléchargez le fichier d'extension",
      "Ouvrez les paramètres d'extension de votre navigateur",
      "Activez le mode développeur",
      "Cliquez sur 'Charger non empaqueté' et sélectionnez le dossier téléchargé",
      "Épinglez l'extension à votre barre d'outils",
      "Commencez à trouver des emplois photo !"
    ],
    featuresList: [
      {
        title: "Détection automatique des emplois",
        description: "Trouve instantanément tous les emplois photo disponibles sur OCUS"
      },
      {
        title: "Filtrage intelligent",
        description: "Filtre les emplois par emplacement, tarif et type de photographie"
      },
      {
        title: "Notifications en temps réel",
        description: "Soyez alerté instantanément des nouveaux emplois correspondant à vos critères"
      },
      {
        title: "Interface intuitive",
        description: "Design propre et facile à utiliser qui ne ralentit pas votre workflow"
      },
      {
        title: "Mises à jour automatiques",
        description: "Restez toujours à jour avec les dernières fonctionnalités et corrections"
      }
    ],
    
    manualJobHuntingProblems: [
      "Passer des heures à chercher manuellement des emplois photo",
      "Manquer des opportunités bien rémunérées en naviguant",
      "Connexion automatique",
      "Perdre du temps sur des demandes de livraison de faible valeur"
    ],
    automatedBenefits: [
      "Notifications instantanées pour les emplois photo",
      "Retour automatique à la page d'accueil pour surveiller",
      "Surveillance 24/7",
      "Candidatures en un clic"
    ],
    howItWorksSteps: [
      "Installez l'extension Chrome en 2 minutes",
      "Définissez vos préférences d'emplacement et de tarif",
      "Laissez l'extension trouver automatiquement les emplois photo",
      "Candidatez aux opportunités de grande valeur en un clic"
    ],
    testimonials: [
      {
        name: "Sarah M.",
        role: "Photographe professionnelle",
        content: "Cette extension a complètement transformé ma façon de trouver du travail photo. Je gagne 40% de plus en travaillant moins d'heures !"
      },
      {
        name: "Mike R.",
        role: "Photographe culinaire",
        content: "Outil formidable ! J'avais l'habitude de passer 2 heures par jour à chercher des emplois. Maintenant il me faut 10 minutes pour trouver les meilleures opportunités."
      },
      {
        name: "Emma L.",
        role: "Photographe indépendante",
        content: "La fonctionnalité calculateur de profit change la donne. Je peux voir exactement quels emplois valent mon temps avant de postuler."
      }
    ],
    stats: {
      jobsFound: "50 000+",
      timesSaved: "10x plus rapide",
      activeUsers: "2 500+"
    },
    
    installation: "Installation",
    pricing: "Tarifs",
    jobsFound: "50 000+ emplois trouvés",
    potentialEarnings: "€125k+ gains potentiels",
    activeMonitoring: "Surveillance 24/7",
    sslSecured: "Sécurisé SSL",
    rating: "Note 4.9/5",
    instantDownload: "Téléchargement instantané",
    problemTitle: "Arrêtez de perdre du temps à chercher des emplois manuellement",
    problemSubtitle: "Voyez la différence entre la recherche manuelle et notre solution automatisée",
    manualJobHunting: "Recherche manuelle d'emplois",
    automatedSolution: "Solution automatisée",
    automatedSolutionBenefits: [
      "Notifications instantanées pour les emplois photo",
      "Retour automatique à la page d'accueil pour surveiller",
      "Surveillance 24/7",
      "Candidatures en un clic"
    ],
    featuresTitle: "Pourquoi choisir OCUS Photography Job Hunter ?",
    featuresSubtitle: "Cette Extension Google Chrome est spécialement conçue pour les photographes travaillant avec Ubereats et Foodora via OCUS",
    faqSubtitle: "Tout ce que vous devez savoir sur l'Extension Chrome OCUS Job Hunter",
    stillHaveQuestions: "Vous avez encore des questions ?",
    supportDescription: "Notre équipe de support est là pour vous aider à tirer le meilleur parti de votre extension OCUS Job Hunter.",
    emailSupport: "Support par Email",
    liveChat: "Chat en Direct",
    mainControlPanel: "Panneau de contrôle principal",
    pageRefreshTimer: "Minuteur d'actualisation de page",
    liveStatistics: "Statistiques en direct",
    installationTitle: "Installation facile en 3 étapes",
    faqTitle: "Questions fréquemment posées",
    pricingTitle: "Tarifs simples et transparents",
    pricingSubtitle: "Paiement unique, accès à vie. Pas d'abonnements, pas de frais cachés.",
    getExtension: "Obtenir l'extension",
    
    // Extension Showcase Section (French)
    extensionShowcaseTitle: "Extension Premium OCUS Job Hunter",
    extensionShowcaseSubtitle: "Automatisation complète pour les emplois photo OCUS avec surveillance intelligente et gestion de workflow fluide",
    extensionHowItWorksTitle: "🎯 Comment fonctionne l'Extension Premium",
    extensionAutoLoginTitle: "🔐 Connexion Automatique",
    extensionAutoLoginDescription: "Utilise vos identifiants OCUS pour vous reconnecter automatiquement quand les sessions expirent",
    extension24MonitoringTitle: "🕐 Surveillance 24/7",
    extension24MonitoringDescription: "Après avoir accepté des missions, retourne à l'accueil pour continuer la surveillance de nouvelles opportunités",
    extensionSmartTimerTitle: "⚡ Minuteur Intelligent",
    extensionSmartTimerDescription: "Intervalles d'actualisation personnalisables (5-30 secondes) avec contrôles du panneau flottant et suivi des performances",
    floatingPanelTitle: "Panneau Flottant OCUS Hunter",
    floatingPanelDescription: "Ce panneau flottant à thème sombre reste visible en naviguant sur OCUS. Affiche un minuteur de compte à rebours en temps réel avec des intervalles d'actualisation personnalisables. Les utilisateurs Premium ont un accès illimité avec des métriques de suivi détaillées pour les missions trouvées, ouvertes, acceptées et les tentatives de connexion.",
    extensionPopupTitle: "Interface Popup de l'Extension",
    extensionPopupDescription: "Cliquez sur l'icône de l'extension du navigateur pour accéder à ce panneau de contrôle complet. Configurez la connexion automatique avec vos identifiants OCUS, gérez tous les paramètres de l'extension et surveillez le statut premium. Interface à thème sombre avec des options de configuration complètes.",
    
    // Free Demo Section (French)
    freeDemoTitle: "Essayez la Version Démo Gratuite",
    freeDemoSubtitle: "Testez notre extension avec 3 missions gratuites avant de passer à l'accès illimité",
    freeDemoBadge: "Essai 100% Gratuit",
    freeDemoFeature1: "3 Tests de Mission Gratuits",
    freeDemoFeature2: "Toutes les Fonctionnalités",
    freeDemoFeature3: "Aucune Carte de Crédit Requise",
    freeDemoFeature4: "Téléchargement Instantané",
    freeDemoDownloadButton: "Télécharger la Démo Gratuite",
    freeDemoUpgradeText: "Vous adorez ? Passez à l'accès illimité quand vous voulez",
    freeDemoTestText: "Parfait pour tester avant l'achat",
    
    // Purchase Card Features (French)
    chromeExtensionFile: "Extension Chrome (fichier .crx)",
    autoLoginOcus: "Connexion automatique pour compte OCUS",
    jobMonitoringSystem: "Système de surveillance d'emplois 24/7",
    desktopNotifications: "Notifications instantanées sur le bureau",
    performanceAnalytics: "Analyses de performance et statistiques",
    installationManual: "Manuel d'installation inclus",
    lifetimeUpdatesSupport: "Accès à vie",
    securePayment: "Paiement sécurisé via Stripe et PayPal",
    instantDigitalDelivery: "Livraison numérique instantanée",
    
    // How JobHunter Works Section (French)
    howJobHunterWorksTitle: "Comment fonctionne JobHunter",
    howJobHunterWorksCards: [
      {
        title: "Inscrivez-vous gratuitement",
        description: "Créez votre compte JobHunter gratuit pour commencer. Aucun engagement requis."
      },
      {
        title: "Installez l'extension Chrome",
        description: "Téléchargez notre outil d'automatisation Chrome depuis votre tableau de bord pour commencer à capturer des emplois automatiquement."
      },
      {
        title: "Essayez l'automatisation gratuite",
        description: "Capturez vos 3 premiers emplois locaux automatiquement—gratuit en mode d'essai."
      },
      {
        title: "Activez l'accès complet",
        description: "Débloquez la capture d'emplois illimitée pour toujours avec une licence unique—juste le coût de 2 emplois."
      }
    ],
    
    // Privacy Policy (French)
    privacy: {
      title: "Politique de confidentialité",
      lastUpdated: "Dernière mise à jour",
      backToHome: "Retour à l'accueil",
      introduction: {
        title: "Introduction",
        content: "Chez OCUS Job Hunter, nous prenons votre confidentialité au sérieux. Cette politique de confidentialité explique comment nous collectons, utilisons, divulguons et protégeons vos informations."
      },
      dataCollection: {
        title: "Informations que nous collectons",
        personalInfo: {
          title: "Informations personnelles",
          content: "Nous pouvons collecter des informations personnelles que vous nous fournissez volontairement :",
          email: "Adresse e-mail",
          name: "Nom complet",
          phone: "Numéro de téléphone (facultatif)",
          country: "Pays/région"
        },
        usageData: {
          title: "Données d'utilisation",
          content: "Nous collectons automatiquement certaines informations lorsque vous utilisez notre extension :",
          extensionUsage: "Statistiques d'utilisation de l'extension et métriques de performance",
          featureInteraction: "Données d'interaction avec les fonctionnalités",
          performanceMetrics: "Données techniques de performance"
        },
        paymentData: {
          title: "Informations de paiement",
          content: "Le traitement des paiements est géré par des fournisseurs tiers de confiance (Stripe et PayPal)."
        }
      },
      dataUsage: {
        title: "Comment nous utilisons vos informations",
        content: "Nous utilisons les informations collectées à diverses fins :",
        provideService: "Pour fournir et maintenir notre service",
        processPayments: "Pour traiter les transactions",
        customerSupport: "Pour fournir un support client",
        improveService: "Pour améliorer notre service",
        sendUpdates: "Pour envoyer des mises à jour",
        preventFraud: "Pour prévenir la fraude"
      },
      dataSharing: {
        title: "Partage de données",
        content: "Nous ne vendons pas vos informations personnelles à des tiers.",
        serviceProviders: {
          title: "Fournisseurs de services",
          content: "Nous travaillons avec des fournisseurs de services tiers :",
          stripe: "Stripe pour le traitement des paiements",
          paypal: "PayPal pour le traitement des paiements",
          emailService: "Services d'e-mail pour les e-mails transactionnels",
          analytics: "Services d'analyse"
        },
        legalRequirements: {
          title: "Exigences légales",
          content: "Nous pouvons divulguer vos informations si requis par la loi."
        }
      },
      dataSecurity: {
        title: "Sécurité des données",
        content: "Nous mettons en place des mesures de sécurité appropriées :",
        encryption: "Chiffrement des données",
        accessControls: "Contrôles d'accès stricts",
        regularAudits: "Audits de sécurité réguliers",
        secureServers: "Serveurs sécurisés"
      },
      userRights: {
        title: "Vos droits",
        content: "Vous avez les droits suivants concernant vos données personnelles :",
        access: "Droit d'accès à vos données",
        correction: "Droit de corriger les informations",
        deletion: "Droit de suppression",
        portability: "Droit à la portabilité",
        objection: "Droit d'opposition",
        restriction: "Droit de restriction"
      },
      cookies: {
        title: "Cookies",
        content: "Nous utilisons des cookies pour améliorer votre expérience :",
        essential: {
          title: "Cookies essentiels",
          content: "Requis pour les fonctionnalités de base"
        },
        analytics: {
          title: "Cookies d'analyse",
          content: "Pour comprendre l'interaction des visiteurs"
        },
        marketing: {
          title: "Cookies marketing",
          content: "Pour fournir des publicités pertinentes"
        }
      },
      internationalTransfers: {
        title: "Transferts internationaux",
        content: "Vos informations peuvent être transférées dans d'autres pays."
      },
      dataRetention: {
        title: "Conservation des données",
        content: "Nous conservons vos informations selon nos politiques :",
        accountData: "Données de compte : Jusqu'à suppression",
        transactionData: "Données de transaction : 7 ans",
        supportData: "Communications de support : 3 ans",
        marketingData: "Données marketing : Jusqu'à désabonnement"
      },
      childrenPrivacy: {
        title: "Confidentialité des enfants",
        content: "Notre service n'est pas destiné aux enfants de moins de 18 ans."
      },
      changes: {
        title: "Modifications de cette politique",
        content: "Nous pouvons mettre à jour cette politique de temps en temps."
      },
      contact: {
        title: "Nous contacter",
        content: "Si vous avez des questions sur cette politique, contactez-nous :",
        address: "Adresse : Stockholm, Suède"
      }
    },

    // Refund Policy (French)
    refund: {
      title: "Politique de remboursement",
      subtitle: "Essai gratuit disponible",
      introduction: {
        title: "Notre engagement envers vous",
        content: "Nous offrons un essai gratuit pour que vous puissiez tester avant d'acheter. Découvrez toutes les fonctionnalités et voyez les résultats par vous-même."
      },
      eligibility: {
        title: "Conditions d'éligibilité",
        content: "Pour être éligible à un remboursement complet :",
        within30Days: "Demande effectuée dans les 30 jours suivant l'achat",
        originalPurchaser: "Vous devez être l'acheteur original",
        validReason: "Raison valable pour le remboursement",
        noAbuse: "Pas d'utilisation abusive du produit"
      },
      process: {
        title: "Processus de remboursement",
        content: "Comment demander votre remboursement :",
        step1: "Contactez notre équipe de support",
        step2: "Fournissez votre numéro de commande",
        step3: "Expliquez la raison de votre demande",
        step4: "Recevez une confirmation dans les 24h",
        step5: "Remboursement traité sous 3-5 jours ouvrables"
      },
      timeframe: {
        title: "Délais de traitement",
        content: "Délais typiques pour les remboursements :",
        carteCredit: "Carte de crédit : 3-5 jours ouvrables",
        paypal: "PayPal : 1-2 jours ouvrables",
        virement: "Virement bancaire : 5-7 jours ouvrables"
      },
      exceptions: {
        title: "Exceptions",
        content: "Remboursements non disponibles pour :",
        digitalDownloads: "Téléchargements numériques après 30 jours",
        customWork: "Travaux personnalisés",
        thirdPartyFees: "Frais de tiers (frais de traitement)"
      }
    },

    // Terms of Service (French)
    terms: {
      title: "Conditions d'utilisation",
      subtitle: "Accord juridiquement contraignant",
      acceptance: {
        title: "Acceptation des conditions",
        content: "En utilisant notre service, vous acceptez ces conditions dans leur intégralité."
      },
      serviceDescription: {
        title: "Description du service",
        content: "OCUS Job Hunter est une extension Chrome pour la recherche d'emplois photographiques :",
        feature1: "Recherche automatisée d'emplois photographiques",
        feature2: "Notifications en temps réel",
        feature3: "Surveillance 24/7 pour ne jamais manquer une mission",
        feature4: "Concentrez-vous sur les opportunités à haute valeur ajoutée"
      },
      userResponsibilities: {
        title: "Responsabilités de l'utilisateur",
        content: "En tant qu'utilisateur, vous acceptez de :",
        responsible1: "Utiliser le service légalement et éthiquement",
        responsible2: "Maintenir la confidentialité de votre compte",
        responsible3: "Ne pas partager vos clés d'accès",
        responsible4: "Respecter les plateformes tierces"
      },
      prohibited: {
        title: "Activités interdites",
        content: "Il est strictement interdit de :",
        prohibited1: "Utiliser le service à des fins illégales",
        prohibited2: "Tenter de pirater ou compromettre le système",
        prohibited3: "Partager ou revendre vos accès",
        prohibited4: "Utiliser le service pour du spam ou harcèlement"
      },
      intellectualProperty: {
        title: "Propriété intellectuelle",
        content: "Tous les droits d'auteur et propriété intellectuelle nous appartiennent."
      },
      limitation: {
        title: "Limitation de responsabilité",
        content: "Notre responsabilité est limitée au montant payé pour le service."
      },
      termination: {
        title: "Résiliation",
        content: "Nous nous réservons le droit de résilier l'accès en cas de violation."
      },
      changes: {
        title: "Modifications des conditions",
        content: "Nous pouvons modifier ces conditions à tout moment avec préavis."
      },
      governing: {
        title: "Droit applicable",
        content: "Ces conditions sont régies par le droit suédois."
      }
    },

    // Manual Page (French)
    manual: {
      title: "Guide d'Installation et d'Utilisation",
      subtitle: "Guide complet pour installer et utiliser l'extension Chrome OCUS Job Hunter",
      backToHome: "← Retour à l'accueil",
      
      // Installation Section
      installationTitle: "Comment Installer l'Extension",
      installationSubtitle: "Suivez ces étapes simples pour commencer",
      installationSteps: [
        {
          step: "1",
          title: "Télécharger le Fichier d'Extension",
          description: "Après l'achat, téléchargez le fichier .crx à partir du lien de confirmation dans votre email.",
          details: "Recherchez un email de OCUS Job Hunter avec le sujet 'Votre Extension est Prête !' et cliquez sur le bouton de téléchargement."
        },
        {
          step: "2",
          title: "Ouvrir la Page Extensions de Chrome",
          description: "Naviguez vers la page de gestion des extensions de Chrome.",
          details: "Tapez 'chrome://extensions/' dans votre barre d'adresse ou allez au menu Chrome → Plus d'outils → Extensions"
        },
        {
          step: "3",
          title: "Activer le Mode Développeur",
          description: "Activez le bouton 'Mode développeur' dans le coin supérieur droit.",
          details: "Ceci est requis pour installer des extensions à partir de fichiers .crx. Le bouton devrait devenir bleu quand activé."
        },
        {
          step: "4",
          title: "Installer l'Extension",
          description: "Glissez et déposez le fichier .crx sur la page des extensions.",
          details: "Vous pouvez aussi cliquer sur 'Charger l'extension non empaquetée' si le glisser-déposer ne fonctionne pas. Chrome affichera une boîte de confirmation."
        }
      ],
      
      // Features Section  
      featuresTitle: "Aperçu des Fonctionnalités",
      featuresSubtitle: "Découvrez ce qui rend OCUS Job Hunter si puissant",
      features: [
        {
          title: "Détection Intelligente et Auto-Acceptation d'Emplois",
          description: "Détecte et accepte automatiquement les emplois disponibles sur la plateforme OCUS.",
          details: ["Auto-connexion même après déconnexion", "Stocke en toute sécurité nom d'utilisateur et mot de passe", "Clique et accepte automatiquement les nouveaux emplois", "Retourne à la page principale après avoir accepté un emploi", "Fonctionne en continu jusqu'à l'arrêt manuel"]
        },
        {
          title: "Paramètres Avancés",
          description: "Personnalisez le comportement de l'extension pour s'adapter à votre flux de travail.",
          details: ["Configurez les intervalles de rafraîchissement", "Activez ou désactivez l'auto-connexion", "Limitez le nombre d'emplois consécutifs acceptés"]
        },
        {
          title: "Notifications en Temps Réel",
          description: "Recevez des alertes instantanées quand de nouveaux emplois photo deviennent disponibles.",
          details: ["Notifications sonores pour nouveaux emplois", "Alertes visuelles dans le navigateur", "Notifications de bureau (optionnel)", "Paramètres de notification personnalisés"]
        },
        {
          title: "Fonctionnement Exclusif OCUS",
          description: "Conçu spécifiquement pour la plateforme OCUS avec des performances optimisées.",
          details: ["Fonctionne exclusivement sur les pages d'emploi OCUS", "Optimisé pour l'interface OCUS", "Mises à jour régulières pour la compatibilité de plateforme", "Intégration transparente avec le flux de travail OCUS"]
        },
        {
          title: "Versions Gratuite et Premium",
          description: "Choisissez la version qui correspond à vos besoins.",
          details: ["Version gratuite : limite de 3 emplois pour test", "Version premium : acceptation illimitée d'emplois", "Fonctionnalités avancées exclusives premium", "Accès à vie avec paiement unique"]
        }
      ],
      
      // Usage Section
      usageTitle: "Comment Utiliser",
      usageSubtitle: "Commencez à trouver votre emploi de rêve automatiquement avec ces étapes faciles",
      usageSteps: [
        {
          title: "Aller sur OCUS",
          description: "Ouvrez Google Chrome et naviguez vers la page de liste d'emplois OCUS.",
          tip: "L'extension ne s'active que sur les pages d'emploi OCUS."
        },
        {
          title: "Activation Automatique",
          description: "Sur OCUS, l'extension commence à rafraîchir et scanner pour de nouveaux emplois.",
          tip: "Si vous êtes déconnecté, elle vous reconnecte automatiquement."
        },
        {
          title: "Acceptation Automatique d'Emplois",
          description: "Quand un emploi correspondant apparaît, l'extension ouvre le lien de l'emploi et l'accepte automatiquement.",
          tip: "Pas besoin de surveillance manuelle."
        },
        {
          title: "Surveillance Continue",
          description: "Après avoir accepté un emploi, retourne à la page principale et répète le cycle jusqu'à ce que vous la désactiviez.",
          tip: "Fonctionne en continu jusqu'à ce que vous l'éteigniez."
        }
      ],
      
      // Important Notes
      importantNotesTitle: "Notes Importantes",
      importantNotes: [
        "Gardez votre navigateur Chrome ouvert pendant que l'extension fonctionne",
        "Assurez-vous d'avoir une connexion internet stable",
        "L'extension gérera automatiquement la connexion si vous êtes déconnecté",
        "Vous pouvez mettre en pause ou arrêter l'extension à tout moment en utilisant l'interface popup",
        "Pour de meilleurs résultats, fermez les autres onglets qui pourraient interférer avec OCUS"
      ]
    },

    // Legal page navigation
    legal: {
      title: "Mentions légales",
      privacyPolicy: "Politique de confidentialité",
      refundPolicy: "Politique de remboursement",
      termsOfService: "Conditions d'utilisation",
      backToHome: "Retour à l'accueil",
      lastUpdated: "Dernière mise à jour",
      changeLanguage: "Changer de langue",
      gdprNotice: "Nous respectons votre vie privée et nous nous conformons au RGPD"
    },
    
    // Auth & Dashboard (missing translations)
    login: "Connexion",
    register: "S'inscrire", 
    email: "Email",
    password: "Mot de passe",
    name: "Nom",
    dashboard: "Tableau de bord",
    profile: "Profil", 
    orders: "Commandes",
    downloads: "Téléchargements",
    logout: "Déconnexion",
    customerLogin: "Connexion client",
    adminLogin: "Connexion admin",
    userLogin: "Connexion utilisateur",
    
    // Customer Dashboard
    customerDashboard: "Tableau de bord client",
    createAccount: "Créer un compte",
    accountInformation: "Informations du compte",
    loginSuccessful: "Connexion réussie",
    welcomeBack: "Bon retour",
    loginFailed: "Échec de la connexion",
    accountCreated: "Compte créé",
    welcome: "Bienvenue",
    registrationFailed: "Échec de l'inscription",
    generateKey: "Générer la clé",
    activationKeyGenerated: "Clé d'activation générée",
    generationFailed: "Échec de la génération",
    memberSince: "Membre depuis",
    activated: "Activé",
    demoMode: "Mode démo",
    useKeyInExtension: "Utiliser la clé dans l'extension",
    noKeyGenerated: "Aucune clé générée",
    purchaseToGetKey: "Acheter pour obtenir la clé",
    generating: "Génération en cours",
    noOrdersYet: "Aucune commande pour le moment",
    startFreeThenPurchase: "Commencer gratuitement puis acheter",
    accessKeysAndDownloads: "Accès aux clés et téléchargements",
    yourFullName: "Votre nom complet",
    processing: "Traitement en cours",
    needAccount: "Besoin d'un compte",
    alreadyHaveAccount: "Vous avez déjà un compte",
    
    // Support & Tickets
    support: "Support",
    contactSupport: "Contacter le support",
    openTicket: "Ouvrir un ticket",
    ticketSubject: "Sujet du ticket",
    ticketMessage: "Message",
    submitTicket: "Soumettre le ticket",
    ticketSubmitted: "Ticket soumis",
    submissionFailed: "Échec de la soumission",
    myTickets: "Mes tickets",
    ticketStatus: "Statut du ticket",
    open: "Ouvert",
    closed: "Fermé",
    pending: "En attente",
    resolved: "Résolu",
    viewTicket: "Voir le ticket",
    addReply: "Ajouter une réponse",
    noTicketsYet: "Aucun ticket pour le moment",
    ticketDetails: "Détails du ticket",
    assignedTo: "Assigné à",
    unassigned: "Non assigné",
    createdOn: "Créé le",
    lastUpdated: "Dernière mise à jour",
    replies: "Réponses",
    markAsResolved: "Marquer comme résolu",
    reopenTicket: "Rouvrir le ticket",
    deleteTicket: "Supprimer le ticket",
    
    // Chat
    needHelp: "Besoin d'aide",
    startChat: "Démarrer le chat",
    chatWithUs: "Chattez avec nous",
    chatPlaceholder: "Tapez votre message...",
    send: "Envoyer",
    minimizeChat: "Réduire le chat",
    
    // Admin Dashboard
    adminDashboard: "Tableau de bord admin",
    totalRevenue: "Chiffre d'affaires total",
    totalOrders: "Commandes totales",
    totalUsers: "Utilisateurs totaux",
    recentOrders: "Commandes récentes",
    recentUsers: "Utilisateurs récents",
    settings: "Paramètres",
    paymentSettings: "Paramètres de paiement",
    emailSettings: "Paramètres email",
    chatSettings: "Paramètres de chat",
    fileManagement: "Gestion des fichiers",
    userManagement: "Gestion des utilisateurs",
    orderManagement: "Gestion des commandes",
    downloadHistory: "Historique des téléchargements",
    systemLogs: "Journaux système",
    analytics: "Analyses",
    reports: "Rapports",
    backups: "Sauvegardes",
    maintenance: "Maintenance",
    notifications: "Notifications",
    
    // File Management
    uploadFile: "Télécharger un fichier",
    deleteFile: "Supprimer le fichier",
    downloadFile: "Télécharger le fichier",
    fileUploaded: "Fichier téléchargé",
    fileDeleted: "Fichier supprimé",
    fileName: "Nom du fichier",
    fileType: "Type de fichier",
    uploadDate: "Date de téléchargement",
    actions: "Actions",
    confirmDelete: "Confirmer la suppression",
    cancel: "Annuler",
    delete: "Supprimer",
    upload: "Télécharger",
    selectFile: "Sélectionner un fichier",
    dragDropFiles: "Glisser-déposer les fichiers",
    supportedFormats: "Formats supportés",
    maxFileSize: "Taille max du fichier",
    
    // Additional Dashboard
    downloadLatestExtension: "Télécharger la dernière extension",
    downloadActivationKeyFile: "Télécharger le fichier de clé d'activation",
    startFreeExtension: "Démarrer l'extension gratuite",
    noInstallationRequired: "Aucune installation requise",
    automaticUpdates: "Mises à jour automatiques",
    activationKey: "Clé d'activation",
    affiliateProgram: "Programme d'affiliation",
    totalEarnings: "Gains totaux",
    totalReferrals: "Parrainages totaux",
    pendingCommissions: "Commissions en attente",
    referralCode: "Code de parrainage",
    copyReferralCode: "Copier le code de parrainage",
    shareReferralLink: "Partager le lien de parrainage",
    currentVersion: "Version actuelle",
    fileSize: "Taille du fichier",
    
    // General Actions
    edit: "Modifier",
    save: "Sauvegarder",
    update: "Mettre à jour",
    submit: "Soumettre",
    close: "Fermer",
    back: "Retour",
    next: "Suivant",
    previous: "Précédent",
    confirm: "Confirmer",
    loading: "Chargement",
    error: "Erreur",
    success: "Succès",
    warning: "Avertissement",
    info: "Info",
    yes: "Oui",
    no: "Non",
    active: "Actif",
    inactive: "Inactif",
    enabled: "Activé",
    disabled: "Désactivé",
    configuration: "Configuration",
    statistics: "Statistiques",
    reset: "Réinitialiser",
    pause: "Pause",
    refreshNow: "Actualiser maintenant",
    emergencyStop: "Arrêt d'urgence"
  },

  // Spanish translations
  es: {
    announcement: "🎯 Oferta limitada: ¡Obtén OCUS Job Hunter con 70% de descuento!",
    buyNow: "Comprar ahora",
    watchDemo: "Ver demo",
    heroTitle1: "Encuentra trabajos de fotografía",
    heroTitle2: "10x más rápido",
    heroTitle3: "con OCUS Job Hunter",
    heroSubtitle: "La extensión Chrome definitiva para fotógrafos en plataformas de delivery.",
    oneTimePayment: "Pago único",
    lifetimeAccess: "Acceso de por vida",
    noMonthlyFees: "Sin tarifas mensuales",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Actualizaciones garantizadas",
    limitedTimeOffer: "Oferta por tiempo limitado",
    discountCode: "EARLYBIRD70",
    discountApplied: "¡Descuento aplicado!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Comenzar",
    learnMore: "Saber más",
    viewDemo: "Ver demo",
    downloadNow: "Descargar ahora",
    freeDemo: "Demo gratuita",
    premiumVersion: "Versión premium",
    features: "Características",
    
    // How JobHunter Works Section (Spanish)
    howJobHunterWorksTitle: "Cómo funciona JobHunter",
    howJobHunterWorksCards: [
      {
        title: "Regístrate gratis",
        description: "Crea tu cuenta gratuita de JobHunter para empezar. No se requiere compromiso."
      },
      {
        title: "Instala la extensión Chrome",
        description: "Descarga nuestra herramienta de automatización Chrome desde tu panel para empezar a capturar trabajos automáticamente."
      },
      {
        title: "Prueba la automatización gratuita",
        description: "Captura tus primeros 3 trabajos locales automáticamente—gratis durante el modo de prueba."
      },
      {
        title: "Activa el acceso completo",
        description: "Desbloquea la captura ilimitada de trabajos para siempre con una licencia única—solo el costo de 2 trabajos."
      }
    ],
    featuresTitle: "¿Por qué elegir OCUS Photography Job Hunter?",
    featuresSubtitle: "Esta Extensión Google Chrome está específicamente diseñada para fotógrafos que trabajan con Ubereats y Foodora a través de OCUS",
    faqTitle: "Preguntas Frecuentes",
    faqSubtitle: "Todo lo que necesitas saber sobre la Extensión Chrome OCUS Job Hunter",
    stillHaveQuestions: "¿Aún tienes preguntas?",
    supportDescription: "Nuestro equipo de soporte está aquí para ayudarte a aprovechar al máximo tu extensión OCUS Job Hunter.",
    emailSupport: "Soporte por Email",
    liveChat: "Chat en Vivo",
    pricingTitle: "Elige tu Plan",
    pricingSubtitle: "Comienza a maximizar tus ingresos de fotografía hoy con nuestras herramientas de automatización",
    getExtension: "Obtener Extensión",
    
    // Extension Showcase Section (Spanish)
    extensionShowcaseTitle: "Extensión Premium OCUS Job Hunter",
    extensionShowcaseSubtitle: "Automatización completa para trabajos de fotografía OCUS con monitoreo inteligente y gestión fluida del flujo de trabajo",
    extensionHowItWorksTitle: "🎯 Cómo funciona la Extensión Premium",
    extensionAutoLoginTitle: "🔐 Inicio de Sesión Automático",
    extensionAutoLoginDescription: "Usa tus credenciales OCUS para reconectarte automáticamente cuando las sesiones expiren",
    extension24MonitoringTitle: "🕐 Monitoreo 24/7",
    extension24MonitoringDescription: "Después de aceptar misiones, regresa a la página principal para continuar monitoreando nuevas oportunidades",
    extensionSmartTimerTitle: "⚡ Temporizador Inteligente",
    extensionSmartTimerDescription: "Intervalos de actualización personalizables (5-30 segundos) con controles del panel flotante y seguimiento de rendimiento",
    floatingPanelTitle: "Panel Flotante OCUS Hunter",
    floatingPanelDescription: "Este panel flotante de tema oscuro permanece visible mientras navegas en OCUS. Muestra temporizador de cuenta regresiva en tiempo real con intervalos de actualización personalizables. Los usuarios Premium tienen acceso ilimitado con métricas detalladas para misiones encontradas, abiertas, aceptadas e intentos de inicio de sesión.",
    extensionPopupTitle: "Interfaz Popup de la Extensión",
    extensionPopupDescription: "Haz clic en el ícono de la extensión del navegador para acceder a este panel de control completo. Configura el inicio de sesión automático con tus credenciales OCUS, gestiona todas las configuraciones de la extensión y monitorea el estado premium. Interfaz de tema oscuro con opciones de configuración integrales.",
    
    // Free Demo Section (Spanish)
    freeDemoTitle: "Prueba la Versión Demo Gratis",
    freeDemoSubtitle: "Prueba nuestra extensión con 3 misiones gratuitas antes de actualizar a acceso ilimitado",
    freeDemoBadge: "Prueba 100% Gratuita",
    freeDemoFeature1: "3 Pruebas de Misión Gratis",
    freeDemoFeature2: "Todas las Características",
    freeDemoFeature3: "Sin Tarjeta de Crédito",
    freeDemoFeature4: "Descarga Instantánea",
    freeDemoDownloadButton: "Descargar Demo Gratis",
    freeDemoUpgradeText: "¿Te encanta? Actualiza a acceso ilimitado cuando quieras",
    freeDemoTestText: "Perfecto para probar antes de comprar",
    
    // Purchase Card Features (Spanish)
    chromeExtensionFile: "Extensión Chrome (archivo .crx)",
    autoLoginOcus: "Login automático para cuenta OCUS",
    jobMonitoringSystem: "Sistema de monitoreo de trabajos 24/7",
    desktopNotifications: "Notificaciones instantáneas en escritorio",
    performanceAnalytics: "Análisis de rendimiento y estadísticas",
    installationManual: "Manual de instalación incluido",
    lifetimeUpdatesSupport: "Acceso de por vida",
    securePayment: "Pago seguro vía Stripe y PayPal",
    instantDigitalDelivery: "Entrega digital instantánea",
    
    installationSteps: [
      "Descarga el archivo de extensión",
      "Abre la configuración de extensiones de tu navegador",
      "Activa el Modo Desarrollador",
      "Haz clic en 'Cargar extensión sin empaquetar' y selecciona la carpeta descargada",
      "Ancla la extensión a tu barra de herramientas",
      "¡Comienza a encontrar trabajos de fotografía!"
    ],
    
    home: "Inicio",
    about: "Acerca de",
    contact: "Contacto",
    login: "Iniciar sesión",
    dashboard: "Panel",
    profile: "Perfil",
    orders: "Pedidos",
    downloads: "Descargas",
    logout: "Cerrar sesión",
    welcomeBack: "Bienvenido de vuelta",
    welcome_back: "¡Bienvenido de vuelta!",
    sign_in_account: "Inicia sesión en tu cuenta",
    user_login: "Inicio de sesión de usuario",
    admin_login: "Inicio de sesión de admin",
    your_email: "Tu email",
    your_password: "Tu contraseña",
    login_btn: "Iniciar sesión",
    admin_login_btn: "Inicio de sesión de admin",
    remember_me: "Recordarme",
    forgot_password: "¿Olvidaste tu contraseña?",
    no_account: "¿No tienes cuenta?",
    sign_up: "Registrarse",
    create_account: "Crear cuenta",
    full_name: "Nombre completo",
    password_min_length: "Mínimo 6 caracteres",
    confirm_password: "Confirmar contraseña",
    accept_terms: "Acepto los",
    terms_conditions: "Términos y condiciones",
    support: "Soporte",
    submitTicket: "Enviar ticket",
    viewTickets: "Ver tickets",
    ticketSubject: "Asunto",
    ticketCategory: "Categoría",
    ticketPriority: "Prioridad",
    ticketDescription: "Descripción",
    ticketStatus: "Estado",
    createTicket: "Crear ticket",
    technical: "Técnico",
    billing: "Facturación",
    featureRequest: "Solicitud de característica",
    bugReport: "Reporte de error",
    general: "General",
    low: "Bajo",
    medium: "Medio",
    high: "Alto",
    urgent: "Urgente",
    open: "Abierto",
    inProgress: "En progreso",
    resolved: "Resuelto",
    closed: "Cerrado"
  },

  // German translations
  de: {
    announcement: "🎯 Begrenzte Zeit: Erhalten Sie OCUS Job Hunter für 70% Rabatt!",
    buyNow: "Jetzt kaufen",
    watchDemo: "Demo ansehen",
    heroTitle1: "Finde Fotografie-Jobs",
    heroTitle2: "10x schneller",
    heroTitle3: "mit OCUS Job Hunter",
    heroSubtitle: "Die ultimative Chrome-Erweiterung für Fotografen auf Lieferplattformen.",
    oneTimePayment: "Einmalige Zahlung",
    lifetimeAccess: "Lebenslanger Zugang",
    noMonthlyFees: "Keine monatlichen Gebühren",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Garantierte Updates",
    limitedTimeOffer: "Begrenztes Angebot",
    discountCode: "EARLYBIRD70",
    discountApplied: "Rabatt angewendet!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Loslegen",
    learnMore: "Mehr erfahren",
    viewDemo: "Demo ansehen",
    downloadNow: "Jetzt herunterladen",
    freeDemo: "Kostenlose Demo",
    premiumVersion: "Premium-Version",
    features: "Funktionen",
    getExtension: "Erweiterung erhalten",
    
    // Extension Showcase Section (German)
    extensionShowcaseTitle: "Premium OCUS Job Hunter Erweiterung",
    extensionShowcaseSubtitle: "Vollständige Automatisierung für OCUS Fotografie-Jobs mit intelligenter Überwachung und nahtlosem Workflow-Management",
    extensionHowItWorksTitle: "🎯 So funktioniert die Premium-Erweiterung",
    extensionAutoLoginTitle: "🔐 Automatische Anmeldung",
    extensionAutoLoginDescription: "Verwendet Ihre OCUS-Anmeldedaten, um Sie automatisch wieder anzumelden, wenn Sitzungen ablaufen",
    extension24MonitoringTitle: "🕐 24/7 Überwachung",
    extension24MonitoringDescription: "Nach dem Akzeptieren von Missionen kehrt zur Startseite zurück, um weiterhin neue Gelegenheiten zu überwachen",
    extensionSmartTimerTitle: "⚡ Intelligenter Timer",
    extensionSmartTimerDescription: "Anpassbare Aktualisierungsintervalle (5-30 Sekunden) mit schwebenden Panel-Kontrollen und Leistungsverfolgung",
    floatingPanelTitle: "Schwebendes OCUS Hunter Panel",
    floatingPanelDescription: "Dieses dunkle Themen-schwebendes Panel bleibt beim Durchsuchen von OCUS sichtbar. Zeigt Echtzeit-Countdown-Timer mit anpassbaren Aktualisierungsintervallen. Premium-Benutzer erhalten unbegrenzten Zugang mit detaillierten Tracking-Metriken für gefundene, geöffnete, akzeptierte Missionen und Anmeldeversuche.",
    extensionPopupTitle: "Erweiterungs-Popup-Oberfläche",
    extensionPopupDescription: "Klicken Sie auf das Browser-Erweiterungssymbol, um auf dieses vollständige Kontrollpanel zuzugreifen. Konfigurieren Sie die automatische Anmeldung mit Ihren OCUS-Anmeldedaten, verwalten Sie alle Erweiterungseinstellungen und überwachen Sie den Premium-Status. Dunkle Themen-Oberfläche mit umfassenden Konfigurationsoptionen.",
    
    // Free Demo Section (German)
    freeDemoTitle: "Testen Sie die Demo-Version kostenlos",
    freeDemoSubtitle: "Testen Sie unsere Erweiterung mit 3 kostenlosen Missionen, bevor Sie auf unbegrenzten Zugang upgraden",
    freeDemoBadge: "100% Kostenlose Testversion",
    freeDemoFeature1: "3 Kostenlose Missions-Tests",
    freeDemoFeature2: "Alle Erweiterungs-Features",
    freeDemoFeature3: "Keine Kreditkarte erforderlich",
    freeDemoFeature4: "Sofortiger Download",
    freeDemoDownloadButton: "Kostenlose Demo herunterladen",
    freeDemoUpgradeText: "Gefällt es Ihnen? Jederzeit auf unbegrenzten Zugang upgraden",
    freeDemoTestText: "Perfekt zum Testen vor dem Kauf",
    
    // Purchase Card Features (German)
    chromeExtensionFile: "Chrome-Erweiterung (.crx-Datei)",
    autoLoginOcus: "Automatische Anmeldung für OCUS-Konto",
    jobMonitoringSystem: "24/7 Job-Überwachungssystem",
    desktopNotifications: "Sofortige Desktop-Benachrichtigungen",
    performanceAnalytics: "Leistungsanalysen und Statistiken",
    installationManual: "Installationshandbuch enthalten",
    lifetimeUpdatesSupport: "Lebenslanger Zugang",
    securePayment: "Sichere Zahlung über Stripe und PayPal",
    instantDigitalDelivery: "Sofortige digitale Lieferung",
    
    // How JobHunter Works Section (German)
    howJobHunterWorksTitle: "Wie JobHunter funktioniert",
    howJobHunterWorksCards: [
      {
        title: "Kostenlos anmelden",
        description: "Erstellen Sie Ihr kostenloses JobHunter-Konto, um zu beginnen. Keine Verpflichtung erforderlich."
      },
      {
        title: "Chrome-Erweiterung installieren",
        description: "Laden Sie unser Chrome-Automatisierungstool von Ihrem Dashboard herunter, um automatisch Jobs zu erfassen."
      },
      {
        title: "Kostenlose Automatisierung testen",
        description: "Erfassen Sie Ihre ersten 3 lokalen Jobs automatisch—kostenlos im Testmodus."
      },
      {
        title: "Vollzugang aktivieren",
        description: "Schalten Sie unbegrenzte Job-Erfassung für immer frei mit einer einmaligen Lizenz—nur die Kosten von 2 Jobs."
      }
    ],
    
    installationSteps: [
      "Erweiterungsdatei herunterladen",
      "Erweiterungseinstellungen des Browsers öffnen",
      "Entwicklermodus aktivieren",
      "Auf 'Entpackte Erweiterung laden' klicken und den heruntergeladenen Ordner auswählen",
      "Erweiterung an Symbolleiste anheften",
      "Beginnen Sie mit der Suche nach Fotojobs!"
    ],
    
    home: "Startseite",
    about: "Über uns",
    contact: "Kontakt",
    login: "Anmelden",
    dashboard: "Dashboard",
    profile: "Profil",
    orders: "Bestellungen",
    downloads: "Downloads",
    logout: "Abmelden",
    welcomeBack: "Willkommen zurück",
    welcome_back: "Willkommen zurück!",
    sign_in_account: "Melden Sie sich in Ihr Konto an",
    user_login: "Benutzer-Anmeldung",
    admin_login: "Admin-Anmeldung",
    your_email: "Ihre E-Mail",
    your_password: "Ihr Passwort",
    login_btn: "Anmelden",
    admin_login_btn: "Admin-Anmeldung",
    remember_me: "An mich erinnern",
    forgot_password: "Passwort vergessen?",
    no_account: "Kein Konto?",
    sign_up: "Registrieren",
    create_account: "Konto erstellen",
    full_name: "Vollständiger Name",
    password_min_length: "Mindestens 6 Zeichen",
    confirm_password: "Passwort bestätigen",
    accept_terms: "Ich akzeptiere die",
    terms_conditions: "Allgemeinen Geschäftsbedingungen",
    support: "Support",
    submitTicket: "Ticket einreichen",
    viewTickets: "Tickets anzeigen",
    ticketSubject: "Betreff",
    ticketCategory: "Kategorie",
    ticketPriority: "Priorität",
    ticketDescription: "Beschreibung",
    ticketStatus: "Status",
    createTicket: "Ticket erstellen",
    technical: "Technisch",
    billing: "Abrechnung",
    featureRequest: "Feature-Anfrage",
    bugReport: "Fehlerbericht",
    general: "Allgemein",
    low: "Niedrig",
    medium: "Mittel",
    high: "Hoch",
    urgent: "Dringend",
    open: "Offen",
    inProgress: "In Bearbeitung",
    resolved: "Gelöst",
    closed: "Geschlossen"
  },

  // Italian translations
  it: {
    announcement: "🎯 Offerta limitata: Ottieni OCUS Job Hunter con il 70% di sconto!",
    buyNow: "Acquista ora",
    watchDemo: "Guarda la demo",
    heroTitle1: "Trova lavori di fotografia",
    heroTitle2: "10x più veloce",
    heroTitle3: "con OCUS Job Hunter",
    heroSubtitle: "L'estensione Chrome definitiva per fotografi su piattaforme di consegna.",
    oneTimePayment: "Pagamento unico",
    lifetimeAccess: "Accesso a vita",
    noMonthlyFees: "Nessuna tariffa mensile",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Aggiornamenti garantiti",
    limitedTimeOffer: "Offerta a tempo limitato",
    discountCode: "EARLYBIRD70",
    discountApplied: "Sconto applicato!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Inizia",
    learnMore: "Scopri di più",
    viewDemo: "Guarda la demo",
    downloadNow: "Scarica ora",
    freeDemo: "Demo gratuita",
    premiumVersion: "Versione premium",
    features: "Caratteristiche",
    getExtension: "Ottieni l'estensione",
    home: "Home",
    about: "Chi siamo",
    contact: "Contatti",
    login: "Accedi",
    dashboard: "Dashboard",
    profile: "Profilo",
    orders: "Ordini",
    downloads: "Download",
    logout: "Disconnetti",
    welcomeBack: "Bentornato",
    welcome_back: "Bentornato!",
    sign_in_account: "Accedi al tuo account",
    user_login: "Login utente",
    admin_login: "Login admin",
    your_email: "La tua email",
    your_password: "La tua password",
    login_btn: "Accedi",
    admin_login_btn: "Login admin",
    remember_me: "Ricordami",
    forgot_password: "Password dimenticata?",
    no_account: "Non hai un account?",
    sign_up: "Registrati",
    create_account: "Crea account",
    full_name: "Nome completo",
    password_min_length: "Minimo 6 caratteri",
    confirm_password: "Conferma password",
    accept_terms: "Accetto i",
    terms_conditions: "Termini e condizioni",
    support: "Supporto",
    submitTicket: "Invia ticket",
    viewTickets: "Visualizza ticket",
    ticketSubject: "Oggetto",
    ticketCategory: "Categoria",
    ticketPriority: "Priorità",
    ticketDescription: "Descrizione",
    ticketStatus: "Stato",
    createTicket: "Crea ticket",
    technical: "Tecnico",
    billing: "Fatturazione",
    featureRequest: "Richiesta funzionalità",
    bugReport: "Segnalazione bug",
    general: "Generale",
    low: "Basso",
    medium: "Medio",
    high: "Alto",
    urgent: "Urgente",
    open: "Aperto",
    inProgress: "In corso",
    resolved: "Risolto",
    closed: "Chiuso"
  },

  // Dutch translations
  nl: {
    announcement: "🎯 Beperkte tijd: Krijg OCUS Job Hunter met 70% korting!",
    buyNow: "Nu kopen",
    watchDemo: "Demo bekijken",
    heroTitle1: "Vind fotografie banen",
    heroTitle2: "10x sneller",
    heroTitle3: "met OCUS Job Hunter",
    heroSubtitle: "De ultieme Chrome extensie voor fotografen op bezorgplatforms.",
    oneTimePayment: "Eenmalige betaling",
    lifetimeAccess: "Levenslange toegang",
    noMonthlyFees: "Geen maandelijkse kosten",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Gegarandeerde updates",
    limitedTimeOffer: "Beperkte tijd aanbieding",
    discountCode: "EARLYBIRD70",
    discountApplied: "Korting toegepast!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Beginnen",
    learnMore: "Meer weten",
    viewDemo: "Demo bekijken",
    downloadNow: "Nu downloaden",
    freeDemo: "Gratis demo",
    premiumVersion: "Premium versie",
    features: "Kenmerken",
    getExtension: "Extensie verkrijgen",
    home: "Home",
    about: "Over ons",
    contact: "Contact",
    login: "Inloggen",
    dashboard: "Dashboard",
    profile: "Profiel",
    orders: "Bestellingen",
    downloads: "Downloads",
    logout: "Uitloggen",
    welcomeBack: "Welkom terug",
    welcome_back: "Welkom terug!",
    sign_in_account: "Log in op je account",
    user_login: "Gebruiker login",
    admin_login: "Admin login",
    your_email: "Je email",
    your_password: "Je wachtwoord",
    login_btn: "Inloggen",
    admin_login_btn: "Admin login",
    remember_me: "Onthoud mij",
    forgot_password: "Wachtwoord vergeten?",
    no_account: "Geen account?",
    sign_up: "Registreren",
    create_account: "Account aanmaken",
    full_name: "Volledige naam",
    password_min_length: "Minimaal 6 tekens",
    confirm_password: "Bevestig wachtwoord",
    accept_terms: "Ik accepteer de",
    terms_conditions: "Algemene voorwaarden",
    support: "Ondersteuning",
    submitTicket: "Ticket indienen",
    viewTickets: "Tickets bekijken",
    ticketSubject: "Onderwerp",
    ticketCategory: "Categorie",
    ticketPriority: "Prioriteit",
    ticketDescription: "Beschrijving",
    ticketStatus: "Status",
    createTicket: "Ticket aanmaken",
    technical: "Technisch",
    billing: "Facturering",
    featureRequest: "Functie verzoek",
    bugReport: "Bug rapport",
    general: "Algemeen",
    low: "Laag",
    medium: "Gemiddeld",
    high: "Hoog",
    urgent: "Urgent",
    open: "Open",
    inProgress: "In behandeling",
    resolved: "Opgelost",
    closed: "Gesloten"
  },

  // Polish translations
  pl: {
    announcement: "🎯 Ograniczony czas: Zdobądź OCUS Job Hunter za 70% taniej!",
    buyNow: "Kup teraz",
    watchDemo: "Zobacz demo",
    heroTitle1: "Znajdź prace fotograficzne",
    heroTitle2: "10x szybciej",
    heroTitle3: "z OCUS Job Hunter",
    heroSubtitle: "Najlepsze rozszerzenie Chrome dla fotografów na platformach dostawczych.",
    oneTimePayment: "Jednorazowa płatność",
    lifetimeAccess: "Dostęp na całe życie",
    noMonthlyFees: "Bez miesięcznych opłat",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Gwarantowane aktualizacje",
    limitedTimeOffer: "Oferta na czas ograniczony",
    discountCode: "EARLYBIRD70",
    discountApplied: "Zniżka zastosowana!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Rozpocznij",
    learnMore: "Dowiedz się więcej",
    viewDemo: "Zobacz demo",
    downloadNow: "Pobierz teraz",
    freeDemo: "Darmowe demo",
    premiumVersion: "Wersja premium",
    features: "Funkcje",
    getExtension: "Pobierz rozszerzenie",
    home: "Strona główna",
    about: "O nas",
    contact: "Kontakt",
    login: "Zaloguj",
    dashboard: "Panel",
    profile: "Profil",
    orders: "Zamówienia",
    downloads: "Pobieranie",
    logout: "Wyloguj",
    welcomeBack: "Witaj ponownie",
    welcome_back: "Witaj ponownie!",
    sign_in_account: "Zaloguj się do swojego konta",
    user_login: "Logowanie użytkownika",
    admin_login: "Logowanie admina",
    your_email: "Twój email",
    your_password: "Twoje hasło",
    login_btn: "Zaloguj",
    admin_login_btn: "Logowanie admina",
    remember_me: "Zapamiętaj mnie",
    forgot_password: "Zapomniałeś hasła?",
    no_account: "Nie masz konta?",
    sign_up: "Zarejestruj się",
    create_account: "Utwórz konto",
    full_name: "Pełne imię",
    password_min_length: "Minimum 6 znaków",
    confirm_password: "Potwierdź hasło",
    accept_terms: "Akceptuję",
    terms_conditions: "Warunki użytkowania",
    support: "Wsparcie",
    submitTicket: "Wyślij zgłoszenie",
    viewTickets: "Zobacz zgłoszenia",
    ticketSubject: "Temat",
    ticketCategory: "Kategoria",
    ticketPriority: "Priorytet",
    ticketDescription: "Opis",
    ticketStatus: "Status",
    createTicket: "Utwórz zgłoszenie",
    technical: "Techniczne",
    billing: "Rozliczenia",
    featureRequest: "Prośba o funkcję",
    bugReport: "Zgłoszenie błędu",
    general: "Ogólne",
    low: "Niski",
    medium: "Średni",
    high: "Wysoki",
    urgent: "Pilne",
    open: "Otwarte",
    inProgress: "W trakcie",
    resolved: "Rozwiązane",
    closed: "Zamknięte"
  },

  // Russian translations
  ru: {
    announcement: "🎯 Ограниченное время: Получите OCUS Job Hunter со скидкой 70%!",
    buyNow: "Купить сейчас",
    watchDemo: "Посмотреть демо",
    heroTitle1: "Найдите работу фотографа",
    heroTitle2: "В 10 раз быстрее",
    heroTitle3: "с OCUS Job Hunter",
    heroSubtitle: "Лучшее расширение Chrome для фотографов на платформах доставки.",
    oneTimePayment: "Разовый платеж",
    lifetimeAccess: "Пожизненный доступ",
    noMonthlyFees: "Без ежемесячной платы",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Гарантированные обновления",
    limitedTimeOffer: "Ограниченное предложение",
    discountCode: "EARLYBIRD70",
    discountApplied: "Скидка применена!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Начать",
    learnMore: "Узнать больше",
    viewDemo: "Посмотреть демо",
    downloadNow: "Скачать сейчас",
    freeDemo: "Бесплатное демо",
    premiumVersion: "Премиум версия",
    features: "Возможности",
    getExtension: "Получить расширение",
    home: "Главная",
    about: "О нас",
    contact: "Контакты",
    login: "Войти",
    dashboard: "Панель",
    profile: "Профиль",
    orders: "Заказы",
    downloads: "Загрузки",
    logout: "Выйти",
    welcomeBack: "Добро пожаловать обратно",
    welcome_back: "Добро пожаловать обратно!",
    sign_in_account: "Войдите в свой аккаунт",
    user_login: "Вход пользователя",
    admin_login: "Вход администратора",
    your_email: "Ваш email",
    your_password: "Ваш пароль",
    login_btn: "Войти",
    admin_login_btn: "Вход администратора",
    remember_me: "Запомнить меня",
    forgot_password: "Забыли пароль?",
    no_account: "Нет аккаунта?",
    sign_up: "Регистрация",
    create_account: "Создать аккаунт",
    full_name: "Полное имя",
    password_min_length: "Минимум 6 символов",
    confirm_password: "Подтвердить пароль",
    accept_terms: "Я принимаю",
    terms_conditions: "Условия использования",
    support: "Поддержка",
    submitTicket: "Отправить заявку",
    viewTickets: "Посмотреть заявки",
    ticketSubject: "Тема",
    ticketCategory: "Категория",
    ticketPriority: "Приоритет",
    ticketDescription: "Описание",
    ticketStatus: "Статус",
    createTicket: "Создать заявку",
    technical: "Техническая",
    billing: "Оплата",
    featureRequest: "Запрос функции",
    bugReport: "Сообщение об ошибке",
    general: "Общие",
    low: "Низкий",
    medium: "Средний",
    high: "Высокий",
    urgent: "Срочный",
    open: "Открыто",
    inProgress: "В работе",
    resolved: "Решено",
    closed: "Закрыто"
  },

  // Danish translations
  da: {
    announcement: "🎯 Begrænset tid: Få OCUS Job Hunter med 70% rabat!",
    buyNow: "Køb nu",
    watchDemo: "Se demo",
    heroTitle1: "Find fotografijobs",
    heroTitle2: "10x hurtigere",
    heroTitle3: "med OCUS Job Hunter",
    heroSubtitle: "Den ultimative Chrome-udvidelse til fotografer på leveringsplatforme.",
    oneTimePayment: "Engangsbetaling",
    lifetimeAccess: "Livstidsadgang",
    noMonthlyFees: "Ingen månedlige gebyrer",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Garanterede opdateringer",
    limitedTimeOffer: "Begrænset tidstilbud",
    discountCode: "EARLYBIRD70",
    discountApplied: "Rabat anvendt!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Kom i gang",
    learnMore: "Lær mere",
    viewDemo: "Se demo",
    downloadNow: "Download nu",
    freeDemo: "Gratis demo",
    premiumVersion: "Premium version",
    features: "Funktioner",
    getExtension: "Få udvidelsen",
    
    // How JobHunter Works Section (Danish)
    howJobHunterWorksTitle: "Sådan fungerer JobHunter",
    howJobHunterWorksCards: [
      {
        title: "Tilmeld dig gratis",
        description: "Opret din gratis JobHunter-konto for at komme i gang. Ingen forpligtelse påkrævet."
      },
      {
        title: "Installer Chrome-udvidelsen",
        description: "Download vores Chrome-automatiseringsværktøj fra dit dashboard for at begynde at fange jobs automatisk."
      },
      {
        title: "Prøv gratis automatisering",
        description: "Fang dine første 3 lokale jobs automatisk—gratis under prøvetilstand."
      },
      {
        title: "Aktiver fuld adgang",
        description: "Lås op for ubegrænset jobfangst for altid med en enkelt licens—bare omkostningerne for 2 jobs."
      }
    ],
    home: "Hjem",
    about: "Om",
    contact: "Kontakt",
    login: "Log ind",
    dashboard: "Dashboard",
    profile: "Profil",
    orders: "Ordrer",
    downloads: "Downloads",
    logout: "Log ud",
    welcomeBack: "Velkommen tilbage",
    welcome_back: "Velkommen tilbage!",
    sign_in_account: "Log ind på din konto",
    user_login: "Bruger login",
    admin_login: "Admin login",
    your_email: "Din email",
    your_password: "Dit kodeord",
    login_btn: "Log ind",
    admin_login_btn: "Admin login",
    remember_me: "Husk mig",
    forgot_password: "Glemt kodeord?",
    no_account: "Ingen konto?",
    sign_up: "Tilmeld dig",
    create_account: "Opret konto",
    full_name: "Fulde navn",
    password_min_length: "Minimum 6 tegn",
    confirm_password: "Bekræft kodeord",
    accept_terms: "Jeg accepterer",
    terms_conditions: "Vilkår og betingelser",
    support: "Support",
    submitTicket: "Send ticket",
    viewTickets: "Se tickets",
    ticketSubject: "Emne",
    ticketCategory: "Kategori",
    ticketPriority: "Prioritet",
    ticketDescription: "Beskrivelse",
    ticketStatus: "Status",
    createTicket: "Opret ticket",
    technical: "Teknisk",
    billing: "Fakturering",
    featureRequest: "Funktionsanmodning",
    bugReport: "Fejlrapport",
    general: "Generelt",
    low: "Lav",
    medium: "Medium",
    high: "Høj",
    urgent: "Akut",
    open: "Åben",
    inProgress: "I gang",
    resolved: "Løst",
    closed: "Lukket",
    
    // Extension Showcase Section (Danish)
    extensionShowcaseTitle: "Premium OCUS Job Hunter Udvidelse",
    extensionShowcaseSubtitle: "Komplet automatisering til OCUS fotograferingsjobs med intelligent overvågning og sømløs workflow-styring",
    extensionHowItWorksTitle: "🎯 Sådan fungerer Premium-udvidelsen",
    extensionAutoLoginTitle: "🔐 Automatisk login",
    extensionAutoLoginDescription: "Bruger dine OCUS-legitimationsoplysninger til automatisk at logge dig ind igen, når sessioner udløber",
    extension24MonitoringTitle: "🕐 24/7 overvågning",
    extension24MonitoringDescription: "Efter at have accepteret missioner vender den tilbage til hjemmesiden for at fortsætte med at overvåge nye muligheder",
    extensionSmartTimerTitle: "⚡ Smart timer",
    extensionSmartTimerDescription: "Tilpasselige opdateringsintervaller (5-30 sekunder) med flydende panelkontroller og præstationssporing",
    floatingPanelTitle: "Flydende OCUS Hunter Panel",
    floatingPanelDescription: "Dette mørke tema flydende panel forbliver synligt, mens du browser OCUS. Viser realtime nedtællings-timer med tilpasselige opdateringsintervaller. Premium-brugere får ubegrænset adgang med detaljerede sporingsmetrikker for fundne, åbnede, accepterede missioner og login-forsøg.",
    extensionPopupTitle: "Udvidelse Popup Interface",
    extensionPopupDescription: "Klik på browser-udvidelsesikonet for at få adgang til dette komplette kontrolpanel. Konfigurer automatisk login med dine OCUS-legitimationsoplysninger, administrer alle udvidelsesindstillinger og overvåg premium-status. Mørkt tema interface med omfattende konfigurationsmuligheder.",
    
    // Free Demo Section (Danish)
    freeDemoTitle: "Prøv Demo-versionen Gratis",
    freeDemoSubtitle: "Test vores udvidelse med 3 gratis missioner før opgradering til ubegrænset adgang",
    freeDemoBadge: "100% Gratis Prøveperiode",
    freeDemoFeature1: "3 Gratis Mission Tests",
    freeDemoFeature2: "Alle Udvidelsesegenskaber",
    freeDemoFeature3: "Intet Kreditkort Påkrævet",
    freeDemoFeature4: "Øjeblikkelig Download",
    freeDemoDownloadButton: "Download Gratis Demo",
    freeDemoUpgradeText: "Kan du lide det? Opgradér til ubegrænset adgang når som helst",
    freeDemoTestText: "Perfekt til test før køb",
    
    // Purchase Card Features (Danish)
    chromeExtensionFile: "Chrome Udvidelse (.crx fil)",
    autoLoginOcus: "Automatisk login til OCUS konto",
    jobMonitoringSystem: "24/7 job overvågningssystem",
    desktopNotifications: "Øjeblikkelige desktop notifikationer",
    performanceAnalytics: "Ydeevne analyser og statistikker",
    installationManual: "Installationsmanual inkluderet",
    lifetimeUpdatesSupport: "Livstids adgang",
    securePayment: "Sikker betaling via Stripe og PayPal",
    instantDigitalDelivery: "Øjeblikkelig digital levering",
    
    installationSteps: [
      "Download udvidelsefilen",
      "Åbn din browsers udvidelsesindstillinger",
      "Aktivér Udvikler tilstand",
      "Klik på 'Indlæs udpakket' og vælg den downloadede mappe",
      "Fastgør udvidelsen til din værktøjslinje",
      "Begynd at finde fotografijobs!"
    ]
  },

  // Norwegian translations
  no: {
    announcement: "🎯 Begrenset tid: Få OCUS Job Hunter med 70% rabatt!",
    buyNow: "Kjøp nå",
    watchDemo: "Se demo",
    heroTitle1: "Finn fotografijobber",
    heroTitle2: "10x raskere",
    heroTitle3: "med OCUS Job Hunter",
    heroSubtitle: "Den ultimate Chrome-utvidelsen for fotografer på leveringsplattformer.",
    oneTimePayment: "Engangs betaling",
    lifetimeAccess: "Livstids tilgang",
    noMonthlyFees: "Ingen månedlige avgifter",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Garanterte oppdateringer",
    limitedTimeOffer: "Begrenset tidstilbud",
    discountCode: "EARLYBIRD70",
    discountApplied: "Rabatt anvendt!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Kom i gang",
    learnMore: "Lær mer",
    viewDemo: "Se demo",
    downloadNow: "Last ned nå",
    freeDemo: "Gratis demo",
    premiumVersion: "Premium versjon",
    features: "Funksjoner",
    getExtension: "Få utvidelsen",
    
    // How JobHunter Works Section (Norwegian)
    howJobHunterWorksTitle: "Slik fungerer JobHunter",
    howJobHunterWorksCards: [
      {
        title: "Registrer deg gratis",
        description: "Opprett din gratis JobHunter-konto for å komme i gang. Ingen forpliktelse påkrevd."
      },
      {
        title: "Installer Chrome-utvidelsen",
        description: "Last ned vårt Chrome-automatiseringsverktøy fra dashbordet ditt for å begynne å fange jobber automatisk."
      },
      {
        title: "Prøv gratis automatisering",
        description: "Fang dine første 3 lokale jobber automatisk—gratis under prøvemodus."
      },
      {
        title: "Aktiver full tilgang",
        description: "Lås opp ubegrenset jobbfangst for alltid med en enkelt lisens—bare kostnaden for 2 jobber."
      }
    ],
    
    installationSteps: [
      "Last ned utvidelsefilen",
      "Åpne nettleserens utvidelsesinnstillinger", 
      "Aktiver Utviklermodus",
      "Klikk på 'Last inn utpakket' og velg den nedlastede mappen",
      "Fest utvidelsen til verktøylinjen",
      "Begynn å finne fotografijobber!"
    ],
    
    home: "Hjem",
    about: "Om",
    contact: "Kontakt",
    login: "Logg inn",
    dashboard: "Dashboard",
    profile: "Profil",
    orders: "Bestillinger",
    downloads: "Nedlastinger",
    logout: "Logg ut",
    welcomeBack: "Velkommen tilbake",
    welcome_back: "Velkommen tilbake!",
    sign_in_account: "Logg inn på kontoen din",
    user_login: "Bruker innlogging",
    admin_login: "Admin innlogging",
    your_email: "Din e-post",
    your_password: "Ditt passord",
    login_btn: "Logg inn",
    admin_login_btn: "Admin innlogging",
    remember_me: "Husk meg",
    forgot_password: "Glemt passord?",
    no_account: "Ingen konto?",
    sign_up: "Registrer deg",
    create_account: "Opprett konto",
    full_name: "Fullt navn",
    password_min_length: "Minimum 6 tegn",
    confirm_password: "Bekreft passord",
    accept_terms: "Jeg godtar",
    terms_conditions: "Vilkår og betingelser",
    support: "Støtte",
    submitTicket: "Send billett",
    viewTickets: "Se billetter",
    ticketSubject: "Emne",
    ticketCategory: "Kategori",
    ticketPriority: "Prioritet",
    ticketDescription: "Beskrivelse",
    ticketStatus: "Status",
    createTicket: "Opprett billett",
    technical: "Teknisk",
    billing: "Fakturering",
    featureRequest: "Funksjonsforespørsel",
    bugReport: "Feilrapport",
    general: "Generelt",
    low: "Lav",
    medium: "Medium",
    high: "Høy",
    urgent: "Akutt",
    open: "Åpen",
    inProgress: "Pågår",
    resolved: "Løst",
    closed: "Lukket",
    
    // Extension Showcase Section (Norwegian)
    extensionShowcaseTitle: "Premium OCUS Job Hunter Utvidelse",
    extensionShowcaseSubtitle: "Komplett automatisering for OCUS fotografijobber med intelligent overvåking og sømløs arbeidsflyt-styring",
    extensionHowItWorksTitle: "🎯 Slik fungerer Premium-utvidelsen",
    extensionAutoLoginTitle: "🔐 Automatisk innlogging",
    extensionAutoLoginDescription: "Bruker dine OCUS-legitimasjoner for å automatisk logge deg inn igjen når økter utløper",
    extension24MonitoringTitle: "🕐 24/7 overvåking",
    extension24MonitoringDescription: "Etter å ha akseptert oppdrag, returnerer til hjemmesiden for å fortsette å overvåke nye muligheter",
    extensionSmartTimerTitle: "⚡ Smart tidtaker",
    extensionSmartTimerDescription: "Tilpassbare oppdateringsintervaller (5-30 sekunder) med flytende panelkontroller og ytelsesporing",
    floatingPanelTitle: "Flytende OCUS Hunter Panel",
    floatingPanelDescription: "Dette mørke tema flytende panelet forblir synlig mens du blar gjennom OCUS. Viser sanntids nedtellingstidtaker med tilpassbare oppdateringsintervaller. Premium-brukere får ubegrenset tilgang med detaljerte sporingsmetrikker for oppdrag funnet, åpnet, akseptert og innloggingsforsøk.",
    extensionPopupTitle: "Utvidelse Popup Grensesnitt",
    extensionPopupDescription: "Klikk på nettleserutvidelsesikonet for å få tilgang til dette komplette kontrollpanelet. Konfigurer automatisk innlogging med dine OCUS-legitimasjoner, administrer alle utvidelsesinnstillinger og overvåk premium-status. Mørkt tema grensesnitt med omfattende konfigurasjonsalternativer.",
    
    // Free Demo Section (Norwegian)
    freeDemoTitle: "Prøv Demo-versjonen Gratis",
    freeDemoSubtitle: "Test utvidelsen vår med 3 gratis oppdrag før oppgradering til ubegrenset tilgang",
    freeDemoBadge: "100% Gratis Prøveperiode",
    freeDemoFeature1: "3 Gratis Oppdrags-tester",
    freeDemoFeature2: "Alle Utvidelsesegenskaper",
    freeDemoFeature3: "Ingen Kredittkort Påkrevd",
    freeDemoFeature4: "Umiddelbar Nedlasting",
    freeDemoDownloadButton: "Last ned Gratis Demo",
    freeDemoUpgradeText: "Liker du det? Oppgrader til ubegrenset tilgang når som helst",
    freeDemoTestText: "Perfekt for testing før kjøp",
    
    // Purchase Card Features (Norwegian)
    chromeExtensionFile: "Chrome Utvidelse (.crx fil)",
    autoLoginOcus: "Automatisk innlogging til OCUS konto",
    jobMonitoringSystem: "24/7 jobb overvåkingssystem",
    desktopNotifications: "Umiddelbare skrivebord varsler",
    performanceAnalytics: "Ytelses analyser og statistikk",
    installationManual: "Installasjonsmanual inkludert",
    lifetimeUpdatesSupport: "Livstids tilgang",
    securePayment: "Sikker betaling via Stripe og PayPal",
    instantDigitalDelivery: "Umiddelbar digital levering"
  },

  // Finnish translations
  fi: {
    announcement: "🎯 Rajoitettu aika: Hanki OCUS Job Hunter 70% alennuksella!",
    buyNow: "Osta nyt",
    watchDemo: "Katso demo",
    heroTitle1: "Löydä valokuvaustöitä",
    heroTitle2: "10x nopeammin",
    heroTitle3: "OCUS Job Hunterin kanssa",
    heroSubtitle: "Paras Chrome-laajennus valokuvaajille toimitus-alustoilla.",
    oneTimePayment: "Kertamaksu",
    lifetimeAccess: "Elinikäinen käyttöoikeus",
    noMonthlyFees: "Ei kuukausimaksuja",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Taatut päivitykset",
    limitedTimeOffer: "Rajoitettu aikatarjous",
    discountCode: "EARLYBIRD70",
    discountApplied: "Alennus sovellettu!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Aloita",
    learnMore: "Lue lisää",
    viewDemo: "Katso demo",
    downloadNow: "Lataa nyt",
    freeDemo: "Ilmainen demo",
    premiumVersion: "Premium-versio",
    features: "Ominaisuudet",
    getExtension: "Hanki laajennus",
    
    // How JobHunter Works Section (Finnish)
    howJobHunterWorksTitle: "Kuinka JobHunter toimii",
    howJobHunterWorksCards: [
      {
        title: "Rekisteröidy ilmaiseksi",
        description: "Luo ilmainen JobHunter-tilisi aloittaaksesi. Ei sitoumuksia vaaditaan."
      },
      {
        title: "Asenna Chrome-laajennus",
        description: "Lataa Chrome-automaatiotyökalumme hallintapaneelista aloittaaksesi töiden automaattisen kiinnioton."
      },
      {
        title: "Kokeile ilmaista automaatiota",
        description: "Kiinniota ensimmäiset 3 paikallista työtäsi automaattisesti—ilmaiseksi kokeilutilassa."
      },
      {
        title: "Aktivoi täysi käyttöoikeus",
        description: "Avaa rajaton työpaikkojen kiinniotto ikuisiksi ajoiksi yhdellä lisenssillä—vain 2 työn hinta."
      }
    ],
    home: "Koti",
    about: "Tietoa",
    contact: "Yhteystiedot",
    login: "Kirjaudu",
    dashboard: "Hallintapaneeli",
    profile: "Profiili",
    orders: "Tilaukset",
    downloads: "Lataukset",
    logout: "Kirjaudu ulos",
    welcomeBack: "Tervetuloa takaisin",
    welcome_back: "Tervetuloa takaisin!",
    sign_in_account: "Kirjaudu tilillesi",
    user_login: "Käyttäjän kirjautuminen",
    admin_login: "Ylläpitäjän kirjautuminen",
    your_email: "Sähköpostiosoitteesi",
    your_password: "Salasanasi",
    login_btn: "Kirjaudu",
    admin_login_btn: "Ylläpitäjän kirjautuminen",
    remember_me: "Muista minut",
    forgot_password: "Unohditko salasanan?",
    no_account: "Ei tiliä?",
    sign_up: "Rekisteröidy",
    create_account: "Luo tili",
    full_name: "Koko nimi",
    password_min_length: "Vähintään 6 merkkiä",
    confirm_password: "Vahvista salasana",
    accept_terms: "Hyväksyn",
    terms_conditions: "Käyttöehdot",
    support: "Tuki",
    submitTicket: "Lähetä tiketti",
    viewTickets: "Näytä tiketit",
    ticketSubject: "Aihe",
    ticketCategory: "Kategoria",
    ticketPriority: "Prioriteetti",
    ticketDescription: "Kuvaus",
    ticketStatus: "Tila",
    createTicket: "Luo tiketti",
    technical: "Tekninen",
    billing: "Laskutus",
    featureRequest: "Ominaisuuspyyntö",
    bugReport: "Virheraportti",
    general: "Yleinen",
    low: "Matala",
    medium: "Keskitaso",
    high: "Korkea",
    urgent: "Kiireellinen",
    open: "Avoin",
    inProgress: "Käynnissä",
    resolved: "Ratkaistu",
    closed: "Suljettu",
    
    // Extension Showcase Section (Finnish)
    extensionShowcaseTitle: "Premium OCUS Job Hunter Laajennus",
    extensionShowcaseSubtitle: "Täydellinen automaatio OCUS-valokuvaustöille älykkäällä seurannalla ja saumattomalla työnkulun hallinnalla",
    extensionHowItWorksTitle: "🎯 Näin Premium-laajennus toimii",
    extensionAutoLoginTitle: "🔐 Automaattinen kirjautuminen",
    extensionAutoLoginDescription: "Käyttää OCUS-tunnuksiasi kirjautuaksesi automaattisesti takaisin istuntojen päättyessä",
    extension24MonitoringTitle: "🕐 24/7 seuranta",
    extension24MonitoringDescription: "Tehtävien hyväksymisen jälkeen palaa etusivulle jatkaakseen uusien mahdollisuuksien seurantaa",
    extensionSmartTimerTitle: "⚡ Älykäs ajastin",
    extensionSmartTimerDescription: "Mukautettavat päivitysvälit (5-30 sekuntia) kelluvilla paneelin ohjaimilla ja suorituskyvyn seurannalla",
    floatingPanelTitle: "Kelluva OCUS Hunter Paneeli",
    floatingPanelDescription: "Tämä tumman teeman kelluva paneeli pysyy näkyvissä selaillessasi OCUSia. Näyttää reaaliaikaisen laskenta-ajastimen mukautettavilla päivitysväleillä. Premium-käyttäjät saavat rajoittamattoman pääsyn yksityiskohtaisilla seurantamittareilla löydetyille, avatuille, hyväksytyille tehtäville ja kirjautumisyrityksille.",
    extensionPopupTitle: "Laajennuksen Popup Käyttöliittymä",
    extensionPopupDescription: "Napsauta selaimen laajennuskuvaketta päästäksesi tähän täydelliseen ohjauspaneeliin. Määritä automaattinen kirjautuminen OCUS-tunnuksillasi, hallitse kaikkia laajennusasetuksia ja seuraa premium-tilaa. Tumman teeman käyttöliittymä kattavilla konfiguraatiovaihtoehdoilla.",
    
    // Free Demo Section (Finnish)
    freeDemoTitle: "Kokeile Demo-versiota Ilmaiseksi",
    freeDemoSubtitle: "Testaa laajennustamme 3 ilmaisella tehtävällä ennen päivitystä rajoittamattomaan käyttöön",
    freeDemoBadge: "100% Ilmainen Kokeilu",
    freeDemoFeature1: "3 Ilmaista Tehtävätestiä",
    freeDemoFeature2: "Kaikki Laajennusominaisuudet",
    freeDemoFeature3: "Ei Luottokorttia Tarvita",
    freeDemoFeature4: "Välitön Lataus",
    freeDemoDownloadButton: "Lataa Ilmainen Demo",
    freeDemoUpgradeText: "Pidätkö siitä? Päivitä rajoittamattomaan käyttöön milloin tahansa",
    freeDemoTestText: "Täydellinen testaamiseen ennen ostoa",
    
    // Purchase Card Features (Finnish)
    chromeExtensionFile: "Chrome Laajennus (.crx tiedosto)",
    autoLoginOcus: "Automaattinen kirjautuminen OCUS tilille",
    jobMonitoringSystem: "24/7 työpaikkojen seurantajärjestelmä",
    desktopNotifications: "Välittömät työpöytäilmoitukset",
    performanceAnalytics: "Suorituskykyanalytiikka ja tilastot",
    installationManual: "Asennusopas mukana",
    lifetimeUpdatesSupport: "Elinikäinen käyttöoikeus",
    securePayment: "Turvallinen maksu Stripen ja PayPalin kautta",
    instantDigitalDelivery: "Välitön digitaalinen toimitus",
    
    installationSteps: [
      "Lataa laajennustiedosto",
      "Avaa selaimen laajennusasetukset", 
      "Aktivoi Kehittäjätila",
      "Klikkaa 'Lataa pakkaamaton' ja valitse ladattu kansio",
      "Kiinnitä laajennus työkalupalkkiin",
      "Aloita valokuvaustehtävien etsiminen!"
    ]
  },

  // Turkish translations
  tr: {
    announcement: "🎯 Sınırlı süre: OCUS Job Hunter'ı %70 indirimle alın!",
    buyNow: "Şimdi satın al",
    watchDemo: "Demo izle",
    heroTitle1: "Fotoğraf işleri bul",
    heroTitle2: "10x daha hızlı",
    heroTitle3: "OCUS Job Hunter ile",
    heroSubtitle: "Teslimat platformlarındaki fotoğrafçılar için nihai Chrome uzantısı.",
    oneTimePayment: "Tek seferlik ödeme",
    lifetimeAccess: "Ömür boyu erişim",
    noMonthlyFees: "Aylık ücret yok",
    price: "€29.99",
    currency: "EUR",
    guaranteedUpdates: "Garantili güncellemeler",
    limitedTimeOffer: "Sınırlı süre teklifi",
    discountCode: "EARLYBIRD70",
    discountApplied: "İndirim uygulandı!",
    originalPrice: "€99.99",
    discountPrice: "€29.99",
    getStarted: "Başla",
    learnMore: "Daha fazla öğren",
    viewDemo: "Demo izle",
    downloadNow: "Şimdi indir",
    freeDemo: "Ücretsiz demo",
    premiumVersion: "Premium sürüm",
    features: "Özellikler",
    getExtension: "Uzantıyı al",
    
    // Extension Showcase Section (Turkish)
    extensionShowcaseTitle: "Premium OCUS Job Hunter Uzantısı",
    extensionShowcaseSubtitle: "Akıllı izleme ve kesintisiz iş akışı yönetimi ile OCUS fotoğraf işleri için tam otomasyon",
    extensionHowItWorksTitle: "🎯 Premium Uzantı Nasıl Çalışır",
    extensionAutoLoginTitle: "🔐 Otomatik Giriş",
    extensionAutoLoginDescription: "Oturumlar sona erdiğinde otomatik olarak yeniden bağlanmak için OCUS kimlik bilgilerinizi kullanır",
    extension24MonitoringTitle: "🕐 24/7 İzleme",
    extension24MonitoringDescription: "Görevleri kabul ettikten sonra yeni fırsatları izlemeye devam etmek için ana sayfaya döner",
    extensionSmartTimerTitle: "⚡ Akıllı Zamanlayıcı",
    extensionSmartTimerDescription: "Yüzer panel kontrolleri ve performans takibi ile özelleştirilebilir yenileme aralıkları (5-30 saniye)",
    floatingPanelTitle: "Yüzer OCUS Hunter Paneli",
    floatingPanelDescription: "Bu koyu temalı yüzer panel OCUS'ta gezinirken görünür kalır. Özelleştirilebilir yenileme aralıkları ile gerçek zamanlı geri sayım zamanlayıcısı gösterir. Premium kullanıcılar bulunan, açılan, kabul edilen görevler ve giriş denemeleri için ayrıntılı izleme metrikleri ile sınırsız erişime sahiptir.",
    extensionPopupTitle: "Uzantı Popup Arayüzü",
    extensionPopupDescription: "Bu tam kontrol paneline erişmek için tarayıcı uzantısı simgesine tıklayın. OCUS kimlik bilgilerinizle otomatik girişi yapılandırın, tüm uzantı ayarlarını yönetin ve premium durumu izleyin. Kapsamlı yapılandırma seçenekleri ile koyu temalı arayüz.",
    
    // How JobHunter Works Section (Turkish)
    howJobHunterWorksTitle: "JobHunter Nasıl Çalışır",
    howJobHunterWorksCards: [
      {
        title: "Ücretsiz Kaydol",
        description: "Başlamak için ücretsiz JobHunter hesabınızı oluşturun. Hiçbir taahhüt gerekmez."
      },
      {
        title: "Chrome Uzantısını Yükle",
        description: "Otomatik olarak iş yakalamaya başlamak için panelinizden Chrome otomasyon aracımızı indirin."
      },
      {
        title: "Ücretsiz Otomasyonu Dene",
        description: "İlk 3 yerel işinizi otomatik olarak yakalayın—deneme modunda ücretsiz."
      },
      {
        title: "Tam Erişimi Etkinleştir",
        description: "Tek lisansla sonsuza kadar sınırsız iş yakalamayı açın—sadece 2 işin maliyeti."
      }
    ],
    
    installationSteps: [
      "Uzantı dosyasını indirin",
      "Tarayıcı uzantı ayarlarını açın",
      "Geliştirici Modunu etkinleştirin", 
      "'Paketlenmemiş yükle'ye tıklayın ve indirilen klasörü seçin",
      "Uzantıyı araç çubuğuna sabitleyin",
      "Fotoğraf işlerini bulmaya başlayın!"
    ],
    
    home: "Ana sayfa",
    about: "Hakkında",
    contact: "İletişim",
    login: "Giriş yap",
    dashboard: "Panel",
    profile: "Profil",
    orders: "Siparişler",
    downloads: "İndirmeler",
    logout: "Çıkış yap",
    welcomeBack: "Tekrar hoş geldiniz",
    welcome_back: "Tekrar hoş geldiniz!",
    sign_in_account: "Hesabınıza giriş yapın",
    user_login: "Kullanıcı girişi",
    admin_login: "Yönetici girişi",
    your_email: "E-postanız",
    your_password: "Şifreniz",
    login_btn: "Giriş yap",
    admin_login_btn: "Yönetici girişi",
    remember_me: "Beni hatırla",
    forgot_password: "Şifremi unuttum?",
    no_account: "Hesabınız yok mu?",
    sign_up: "Kaydol",
    create_account: "Hesap oluştur",
    full_name: "Tam ad",
    password_min_length: "En az 6 karakter",
    confirm_password: "Şifreyi onayla",
    accept_terms: "Kabul ediyorum",
    terms_conditions: "Şartlar ve koşullar",
    support: "Destek",
    submitTicket: "Bilet gönder",
    viewTickets: "Biletleri görüntüle",
    ticketSubject: "Konu",
    ticketCategory: "Kategori",
    ticketPriority: "Öncelik",
    ticketDescription: "Açıklama",
    ticketStatus: "Durum",
    createTicket: "Bilet oluştur",
    technical: "Teknik",
    billing: "Faturalama",
    featureRequest: "Özellik talebi",
    bugReport: "Hata raporu",
    general: "Genel",
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
    urgent: "Acil",
    open: "Açık",
    inProgress: "Devam ediyor",
    resolved: "Çözüldü",
    closed: "Kapalı",
    
    // Free Demo Section (Turkish)
    freeDemoTitle: "Demo Sürümünü Ücretsiz Deneyin",
    freeDemoSubtitle: "Sınırsız erişime yükseltmeden önce uzantımızı 3 ücretsiz görevle test edin",
    freeDemoBadge: "%100 Ücretsiz Deneme",
    freeDemoFeature1: "3 Ücretsiz Görev Testi",
    freeDemoFeature2: "Tüm Uzantı Özellikleri",
    freeDemoFeature3: "Kredi Kartı Gerekli Değil",
    freeDemoFeature4: "Anında İndirme",
    freeDemoDownloadButton: "Ücretsiz Demo İndir",
    freeDemoUpgradeText: "Beğendiniz mi? İstediğiniz zaman sınırsız erişime yükseltin",
    freeDemoTestText: "Satın almadan önce test etmek için mükemmel",
    
    // Purchase Card Features (Turkish)
    chromeExtensionFile: "Chrome Uzantısı (.crx dosyası)",
    autoLoginOcus: "OCUS hesabı için otomatik giriş",
    jobMonitoringSystem: "24/7 iş izleme sistemi",
    desktopNotifications: "Anında masaüstü bildirimleri",
    performanceAnalytics: "Performans analitiği ve istatistikleri",
    installationManual: "Kurulum kılavuzu dahil",
    lifetimeUpdatesSupport: "Ömür boyu erişim",
    securePayment: "Stripe ve PayPal ile güvenli ödeme",
    instantDigitalDelivery: "Anında dijital teslimat"
  }
};

export type Language = keyof typeof translations;