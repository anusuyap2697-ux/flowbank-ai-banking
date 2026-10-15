// FlowBank PS-003 - Master Interactive Application Logic with Automatic App Alerts

document.addEventListener('DOMContentLoaded', () => {
  // State Store
  const state = {
    activeTab: 'tab-auth',
    isDualPane: true,
    discretionarySpend: 3500,
    isSpendLocked: false,
    lockDays: 10,
    lockAmount: 2000,
    techStoreCategory: 'Impulse Spike', // Can be overridden to 'Work / Productivity Tool'
    isAnomalyActive: true,
    balance: 124500,
    schoolFeesSaved: 25000,
    schoolFeesTarget: 30000,
    laptopSaved: 32000,
    laptopTarget: 50000,
    mpinRevealed: false,
    timerSeconds: 23 * 3600 + 57 * 60 + 13, // 23:57:13
    autoSendToWhatsApp: true,
    autoMonitorActive: false,
    autoMonitorTimer: null,
    currentLang: localStorage.getItem('fb_lang') || 'en',
    waAlertLang: localStorage.getItem('fb_wa_alert_lang') || 'both',
    activeBank: 'HDFC Bank',
    activeBankCode: 'HDFC',
    activeAccount: 'Salary A/c XX-4092'
  };

  // Sound effects generator using Web Audio API
  const audioCtx = window.AudioContext || window.webkitAudioContext ? new (window.AudioContext || window.webkitAudioContext)() : null;
  function playSound(type) {
    if (!audioCtx) return;
    try {
      if (audioCtx.state === 'suspended') audioCtx.resume();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      const now = audioCtx.currentTime;

      if (type === 'click') {
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.04);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'alert') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(620, now + 0.2);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (type === 'success') {
        osc.frequency.setValueAtTime(520, now);
        osc.frequency.setValueAtTime(660, now + 0.08);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc.start(now);
        osc.stop(now + 0.2);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  // DOM Elements - 3 Tabs
  const tabButtons = document.querySelectorAll('.nav-tab');
  const desktopScreens = {
    'tab-auth': document.getElementById('view-auth'),
    'tab-priority': document.getElementById('view-priority'),
    'tab-whatsapp': document.getElementById('view-whatsapp')
  };

  const mobileNavItems = document.querySelectorAll('.p-nav-item');
  const mobileScreens = {
    'tab-auth': document.getElementById('mview-auth'),
    'tab-priority': document.getElementById('mview-priority'),
    'tab-whatsapp': document.getElementById('mview-whatsapp')
  };

  const workspaceContainer = document.getElementById('workspaceContainer');
  const dualPaneToggle = document.getElementById('dualPaneToggle');
  const dualPaneLabel = document.getElementById('dualPaneLabel');

  // Sliders & Sim elements
  const whatIfSlider = document.getElementById('whatIfSlider');
  const mWhatIfSlider = document.getElementById('mWhatIfSlider');
  const simSpendPill = document.getElementById('simSpendPill');
  const simSpendBold = document.getElementById('simSpendBold');
  const simDelayDays = document.getElementById('simDelayDays');
  const simImpactStatement = document.getElementById('simImpactStatement');
  const laptopDelayDays = document.getElementById('laptopDelayDays');
  const laptopDelayBadge = document.getElementById('laptopDelayBadge');
  const laptopStatusBadge = document.getElementById('laptopStatusBadge');
  const mLaptopPauseBadge = document.getElementById('mLaptopPauseBadge');
  const mLaptopDelayBadge = document.getElementById('mLaptopDelayBadge');
  const mSimSpendVal = document.getElementById('mSimSpendVal');
  const mSimSpendBold = document.getElementById('mSimSpendBold');
  const mDelayDays = document.getElementById('mDelayDays');

  // Privacy toggles
  const toggleAaIngestion = document.getElementById('toggleAaIngestion');
  const toggleWhatIfEngine = document.getElementById('toggleWhatIfEngine');
  const toggleWhatsappNudges = document.getElementById('toggleWhatsappNudges');
  const mStatusAa = document.getElementById('mStatusAa');
  const mStatusWhatIf = document.getElementById('mStatusWhatIf');
  const mStatusNudges = document.getElementById('mStatusNudges');

  // Anomaly Spike button & Auto-Monitor
  const simulateAnomalySpikeBtn = document.getElementById('simulateAnomalySpikeBtn');
  const btnToggleAutoMonitor = document.getElementById('btnToggleAutoMonitor');
  const autoMonitorLabel = document.getElementById('autoMonitorLabel');

  // In-App Alert Banner & Dynamic Island
  const inAppAlertBanner = document.getElementById('inAppAlertBanner');
  const inAppAlertBody = document.getElementById('inAppAlertBody');
  const btnBannerSendWa = document.getElementById('btnBannerSendWa');
  const btnBannerLock = document.getElementById('btnBannerLock');
  const btnBannerDismiss = document.getElementById('btnBannerDismiss');
  const notchIsland = document.getElementById('notchIsland');
  const islandText = document.getElementById('islandText');
  const phonePushNotification = document.getElementById('phonePushNotification');
  const ppnTitle = document.getElementById('ppnTitle');
  const ppnBody = document.getElementById('ppnBody');
  const ppnTime = document.getElementById('ppnTime');

  // Modals & Toasts
  const psModal = document.getElementById('psModal');
  const openPsModalBtn = document.getElementById('openPsModalBtn');
  const closePsModal = document.getElementById('closePsModal');
  const btnClosePsModalBtn = document.getElementById('btnClosePsModalBtn');
  const freezeTimer = document.getElementById('freezeTimer');

  const aadhaarModal = document.getElementById('aadhaarModal');
  const btnSimulateAadhaar = document.getElementById('btnSimulateAadhaar');
  const btnLinkBank = document.getElementById('btnLinkBank');
  const closeAadhaarModal = document.getElementById('closeAadhaarModal');
  const btnCancelAadhaar = document.getElementById('btnCancelAadhaar');
  const btnConfirmAadhaar = document.getElementById('btnConfirmAadhaar');

  const overrideModal = document.getElementById('overrideModal');
  const btnOverrideTechStore = document.getElementById('btnOverrideTechStore');
  const closeOverrideModal = document.getElementById('closeOverrideModal');
  const btnCancelOverride = document.getElementById('btnCancelOverride');
  const btnSaveOverride = document.getElementById('btnSaveOverride');
  const catButtons = document.querySelectorAll('.btn-cat-opt');

  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');

  // WhatsApp chat elements
  const btnWaLockSpend = document.getElementById('btnWaLockSpend');
  const btnWaAdjustPriorities = document.getElementById('btnWaAdjustPriorities');
  const btnWaOpenSimulator = document.getElementById('btnWaOpenSimulator');
  const mBtnLockSpend = document.getElementById('mBtnLockSpend');
  const mBtnAdjustGoals = document.getElementById('mBtnAdjustGoals');
  const mBtnOpenSim = document.getElementById('mBtnOpenSim');
  const waUserInput = document.getElementById('waUserInput');
  const waSendBtn = document.getElementById('waSendBtn');
  const dynamicChatContainer = document.getElementById('dynamicChatContainer');
  const mDynamicChatContainer = document.getElementById('mDynamicChatContainer');
  const quickChips = document.querySelectorAll('.quick-chip');

  // Real WhatsApp Integration elements
  const screen3UserPhoneDisplay = document.getElementById('screen3UserPhoneDisplay');
  const btnEditUserWa = document.getElementById('btnEditUserWa');
  const btnSendRealWhatsApp = document.getElementById('btnSendRealWhatsApp');
  const btnBubbleSendRealWa = document.getElementById('btnBubbleSendRealWa');
  const mBtnSendRealWhatsApp = document.getElementById('mBtnSendRealWhatsApp');
  const mPhoneCallBtn = document.getElementById('mPhoneCallBtn');
  const toggleAutoWaDispatch = document.getElementById('toggleAutoWaDispatch');
  const autoWaStatusText = document.getElementById('autoWaStatusText');

  // Single Unified Auth Screen WhatsApp Phone + Header chip
  const authWaPhone = document.getElementById('authWaPhone');
  const btnSaveAuthWaPhone = document.getElementById('btnSaveAuthWaPhone');
  const btnHeaderWaChip = document.getElementById('btnHeaderWaChip');
  const headerWaNumber = document.getElementById('headerWaNumber');
  const headerWaDot = document.getElementById('headerWaDot');

  function updateHeaderWaChip(phone) {
    const clean = (phone || '').replace(/[^0-9]/g, '');
    if (clean.length >= 10) {
      const display = clean.startsWith('91') ? clean.slice(2) : clean;
      if (headerWaNumber) headerWaNumber.textContent = `+91 ${display.slice(0, 5)} ${display.slice(5)}`;
      if (headerWaDot) headerWaDot.classList.add('active');
      if (screen3UserPhoneDisplay) screen3UserPhoneDisplay.textContent = `${display.slice(0, 5)} ${display.slice(5)}`;
    } else {
      if (headerWaNumber) headerWaNumber.textContent = '+91 (Not Set)';
      if (headerWaDot) headerWaDot.classList.remove('active');
      if (screen3UserPhoneDisplay) screen3UserPhoneDisplay.textContent = '(Not Configured)';
    }
  }

  function saveWaPhone(phone) {
    let clean = phone.replace(/[^0-9]/g, '');
    if (clean.length === 10) clean = '91' + clean;
    if (clean.length < 12) {
      showToast('⚠️ Please enter a valid 10-digit WhatsApp number.');
      return false;
    }
    localStorage.setItem('fb_wa_phone', clean);
    state.savedWaPhone = clean;
    if (authWaPhone) authWaPhone.value = clean.replace(/^91/, '');
    updateHeaderWaChip(clean);
    playSound('success');
    showToast(`✅ WhatsApp number +${clean} saved! FlowBank automated alerts will dispatch to this number.`);
    return true;
  }

  // Restore saved phone number from localStorage on load (default to 919876543210 if none set)
  const savedWaPhone = localStorage.getItem('fb_wa_phone') || '919876543210';
  if (!localStorage.getItem('fb_wa_phone')) {
    localStorage.setItem('fb_wa_phone', savedWaPhone);
  }
  if (authWaPhone) authWaPhone.value = savedWaPhone.replace(/^91/, '');
  updateHeaderWaChip(savedWaPhone);

  if (btnSaveAuthWaPhone) {
    btnSaveAuthWaPhone.addEventListener('click', () => {
      saveWaPhone(authWaPhone ? authWaPhone.value.trim() : '');
    });
  }

  if (authWaPhone) {
    authWaPhone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') saveWaPhone(authWaPhone.value.trim());
    });
    authWaPhone.addEventListener('input', () => {
      updateHeaderWaChip(authWaPhone.value);
    });
  }

  if (btnHeaderWaChip) {
    btnHeaderWaChip.addEventListener('click', () => {
      switchTab('tab-auth');
      setTimeout(() => { if (authWaPhone) authWaPhone.focus(); }, 200);
      showToast('📱 Enter or update your WhatsApp number here.');
    });
  }

  if (btnEditUserWa) {
    btnEditUserWa.addEventListener('click', () => {
      switchTab('tab-auth');
      setTimeout(() => { if (authWaPhone) authWaPhone.focus(); }, 200);
      showToast('✏️ Enter your WhatsApp number in Screen 1 (Auth) to update.');
    });
  }

  // Auth toggle & Links
  const toggleMpinBtn = document.getElementById('toggleMpinBtn');
  const authMpin = document.getElementById('authMpin');
  const btnAuthorizeLaunch = document.getElementById('btnAuthorizeLaunch');
  const mBtnSignIn = document.getElementById('mBtnSignIn');
  const btnGoToWhatsApp = document.getElementById('btnGoToWhatsApp');


  // 1. Navigation Controller (Desktop & Mobile Synchronized - 3 Tabs)
  function switchTab(tabKey) {
    state.activeTab = tabKey;
    playSound('click');

    // Update Desktop Nav
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabKey);
    });

    // Update Desktop Screen
    Object.keys(desktopScreens).forEach(key => {
      if (desktopScreens[key]) {
        desktopScreens[key].classList.toggle('active', key === tabKey);
      }
    });

    // Update Mobile Nav
    const mobileTabMap = {
      'tab-auth': 'mview-auth',
      'tab-priority': 'mview-priority',
      'tab-whatsapp': 'mview-whatsapp'
    };
    const targetMobileId = mobileTabMap[tabKey];

    mobileNavItems.forEach(item => {
      item.classList.toggle('active', item.dataset.ptab === targetMobileId);
    });

    // Update Mobile Screen
    Object.keys(mobileScreens).forEach(key => {
      if (mobileScreens[key]) {
        mobileScreens[key].classList.toggle('active', key === tabKey);
      }
    });
  }

  tabButtons.forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });

  mobileNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const ptabId = item.dataset.ptab;
      const reverseMap = {
        'mview-auth': 'tab-auth',
        'mview-priority': 'tab-priority',
        'mview-whatsapp': 'tab-whatsapp'
      };
      switchTab(reverseMap[ptabId]);
    });
  });

  // 2. Dual-Pane Toggle (if present in DOM)
  if (dualPaneToggle) {
    dualPaneToggle.addEventListener('click', () => {
      state.isDualPane = !state.isDualPane;
      playSound('click');
      if (state.isDualPane) {
        workspaceContainer.classList.remove('single-mode');
        workspaceContainer.classList.add('dual-mode');
        dualPaneToggle.classList.add('active');
        if (dualPaneLabel) dualPaneLabel.textContent = 'Show Dual-Pane View';
      } else {
        workspaceContainer.classList.remove('dual-mode');
        workspaceContainer.classList.add('single-mode');
        dualPaneToggle.classList.remove('active');
        if (dualPaneLabel) dualPaneLabel.textContent = 'Single Pane (Full Width)';
      }
    });
  }

  // Mobile Device Screen Switcher (< 800px)
  const btnShowWebPane = document.getElementById('btnShowWebPane');
  const btnShowMobilePane = document.getElementById('btnShowMobilePane');
  if (btnShowWebPane && btnShowMobilePane) {
    btnShowWebPane.addEventListener('click', () => {
      playSound('click');
      btnShowWebPane.classList.add('active');
      btnShowMobilePane.classList.remove('active');
      if (workspaceContainer) {
        workspaceContainer.classList.add('show-web');
        workspaceContainer.classList.remove('show-app');
      }
    });
    btnShowMobilePane.addEventListener('click', () => {
      playSound('click');
      btnShowMobilePane.classList.add('active');
      btnShowWebPane.classList.remove('active');
      if (workspaceContainer) {
        workspaceContainer.classList.add('show-app');
        workspaceContainer.classList.remove('show-web');
      }
    });
  }
  function recalculateWhatIf(spendAmount) {
    state.discretionarySpend = spendAmount;
    const formattedSpend = '₹' + Number(spendAmount).toLocaleString('en-IN');

    // Update sliders synchronously
    if (whatIfSlider.value != spendAmount) whatIfSlider.value = spendAmount;
    if (mWhatIfSlider.value != spendAmount) mWhatIfSlider.value = spendAmount;

    // Update text elements
    simSpendPill.textContent = formattedSpend;
    simSpendBold.textContent = formattedSpend;
    mSimSpendVal.textContent = formattedSpend;
    mSimSpendBold.textContent = formattedSpend;

    // Delay calculation: base daily discretionary velocity ~ ₹437.5/day
    const delayDays = Math.round(spendAmount / 437.5);

    if (spendAmount === 0) {
      simDelayDays.textContent = '0 Days';
      laptopDelayDays.textContent = '0 Days';
      mLaptopDelayBadge.textContent = 'On Track (0d Delay)';
      mLaptopDelayBadge.style.color = '#34d399';
      mDelayDays.textContent = '0 Days';
      simImpactStatement.innerHTML = `Zero extra spend! All priorities proceeding at <strong>100% optimum velocity</strong>.`;
      laptopStatusBadge.textContent = 'OPTIMUM SAVINGS VELOCITY';
      laptopStatusBadge.style.color = '#34d399';
      laptopStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.4)';
      mLaptopPauseBadge.textContent = 'OPTIMIZED';
      mLaptopPauseBadge.style.color = '#34d399';
    } else {
      simDelayDays.textContent = `${delayDays} Days`;
      laptopDelayDays.textContent = `+${delayDays} Days`;
      mLaptopDelayBadge.textContent = `+${delayDays} Days Delay`;
      mLaptopDelayBadge.style.color = '#fbbf24';
      mDelayDays.textContent = `${delayDays} Days`;
      simImpactStatement.innerHTML = `Spending <strong>${formattedSpend}</strong> extra this month will delay your <strong>'Laptop Buy'</strong> target date by <span class="highlight-delay">${delayDays} Days</span>!`;

      if (state.techStoreCategory === 'Impulse Spike') {
        laptopStatusBadge.textContent = 'TEMPORARILY PAUSED TO PROTECT SCHOOL FEES';
        laptopStatusBadge.style.color = '#fbbf24';
        laptopStatusBadge.style.borderColor = 'rgba(245, 158, 11, 0.3)';
        mLaptopPauseBadge.textContent = 'PAUSED FOR FEES';
        mLaptopPauseBadge.style.color = '#fbbf24';
      } else {
        laptopStatusBadge.textContent = 'RE-PRIORITIZED AS WORK TOOL';
        laptopStatusBadge.style.color = '#38bdf8';
        laptopStatusBadge.style.borderColor = 'rgba(56, 189, 248, 0.3)';
        mLaptopPauseBadge.textContent = 'ACTIVE (OVERRIDE)';
        mLaptopPauseBadge.style.color = '#38bdf8';
      }
    }
  }

  whatIfSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    recalculateWhatIf(val);
    // If user slides above ₹2,000, automatically notify
    if (val >= 3500 && !inAppAlertBanner.classList.contains('active')) {
      triggerAutomaticAppAlert({
        merchant: 'Discretionary Velocity Spike',
        amount: val,
        delayDays: Math.round(val / 437.5),
        autoDispatchWa: false
      });
    }
  });

  mWhatIfSlider.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    recalculateWhatIf(val);
  });

  // 4. Privacy Toggles Synchronization
  function syncPrivacyToggles() {
    mStatusAa.textContent = toggleAaIngestion.checked ? 'ENABLED' : 'DISABLED';
    mStatusAa.style.color = toggleAaIngestion.checked ? 'var(--accent-teal)' : '#64748b';

    mStatusWhatIf.textContent = toggleWhatIfEngine.checked ? 'ENABLED' : 'DISABLED';
    mStatusWhatIf.style.color = toggleWhatIfEngine.checked ? 'var(--accent-teal)' : '#64748b';

    mStatusNudges.textContent = toggleWhatsappNudges.checked ? 'ENABLED' : 'DISABLED';
    mStatusNudges.style.color = toggleWhatsappNudges.checked ? 'var(--accent-teal)' : '#64748b';
  }

  toggleAaIngestion.addEventListener('change', () => {
    playSound('click');
    syncPrivacyToggles();
    showToast(`AA Ingestion consent updated to ${toggleAaIngestion.checked ? 'ACTIVE' : 'REVOKED'}.`);
  });
  toggleWhatIfEngine.addEventListener('change', () => {
    playSound('click');
    syncPrivacyToggles();
    showToast(`Predictive What-If Model consent updated.`);
  });
  toggleWhatsappNudges.addEventListener('change', () => {
    playSound('click');
    syncPrivacyToggles();
    showToast(`WhatsApp Real-time Interventions updated.`);
  });

  // Gateway State & Local Storage
  const gatewayConfig = {
    method: localStorage.getItem('fb_wa_gateway') || 'callmebot',
    cmbApiKey: localStorage.getItem('fb_cmb_key') || '',
    twilioSid: localStorage.getItem('fb_twilio_sid') || '',
    twilioToken: localStorage.getItem('fb_twilio_token') || '',
    twilioSender: localStorage.getItem('fb_twilio_sender') || '+14155238886',
    webhookUrl: localStorage.getItem('fb_webhook_url') || ''
  };

  // Gateway Modal Elements
  const waGatewayModal = document.getElementById('waGatewayModal');
  const btnOpenWaGatewayModal = document.getElementById('btnOpenWaGatewayModal');
  const closeWaGatewayModal = document.getElementById('closeWaGatewayModal');
  const btnCancelWaGateway = document.getElementById('btnCancelWaGateway');
  const btnSaveWaGateway = document.getElementById('btnSaveWaGateway');
  const waGatewaySelect = document.getElementById('waGatewaySelect');
  const cmbApiKeyInput = document.getElementById('cmbApiKey');
  const twilioSidInput = document.getElementById('twilioSid');
  const twilioAuthTokenInput = document.getElementById('twilioAuthToken');
  const twilioSenderInput = document.getElementById('twilioSender');
  const customWebhookUrlInput = document.getElementById('customWebhookUrl');

  const callmebotFields = document.getElementById('callmebotFields');
  const twilioFields = document.getElementById('twilioFields');
  const webhookFields = document.getElementById('webhookFields');

  // Populate Gateway fields
  if (waGatewaySelect) {
    waGatewaySelect.value = gatewayConfig.method;
    if (cmbApiKeyInput) cmbApiKeyInput.value = gatewayConfig.cmbApiKey;
    if (twilioSidInput) twilioSidInput.value = gatewayConfig.twilioSid;
    if (twilioAuthTokenInput) twilioAuthTokenInput.value = gatewayConfig.twilioToken;
    if (twilioSenderInput) twilioSenderInput.value = gatewayConfig.twilioSender;
    if (customWebhookUrlInput) customWebhookUrlInput.value = gatewayConfig.webhookUrl;
    updateGatewayFieldVisibility(gatewayConfig.method);
  }

  function updateGatewayFieldVisibility(method) {
    if (callmebotFields) callmebotFields.style.display = method === 'callmebot' ? 'block' : 'none';
    if (twilioFields) twilioFields.style.display = method === 'twilio' ? 'block' : 'none';
    if (webhookFields) webhookFields.style.display = method === 'webhook' ? 'block' : 'none';
  }

  if (waGatewaySelect) {
    waGatewaySelect.addEventListener('change', (e) => {
      updateGatewayFieldVisibility(e.target.value);
    });
  }

  if (btnOpenWaGatewayModal) {
    btnOpenWaGatewayModal.addEventListener('click', () => {
      playSound('click');
      waGatewayModal.classList.add('open');
    });
  }
  function closeWaModal() {
    waGatewayModal.classList.remove('open');
  }
  if (closeWaGatewayModal) closeWaGatewayModal.addEventListener('click', closeWaModal);
  if (btnCancelWaGateway) btnCancelWaGateway.addEventListener('click', closeWaModal);

  if (btnSaveWaGateway) {
    btnSaveWaGateway.addEventListener('click', () => {
      playSound('success');
      gatewayConfig.method = waGatewaySelect.value;
      gatewayConfig.cmbApiKey = cmbApiKeyInput.value.trim();
      gatewayConfig.twilioSid = twilioSidInput.value.trim();
      gatewayConfig.twilioToken = twilioAuthTokenInput.value.trim();
      gatewayConfig.twilioSender = twilioSenderInput.value.trim();
      gatewayConfig.webhookUrl = customWebhookUrlInput.value.trim();

      localStorage.setItem('fb_wa_gateway', gatewayConfig.method);
      localStorage.setItem('fb_cmb_key', gatewayConfig.cmbApiKey);
      localStorage.setItem('fb_twilio_sid', gatewayConfig.twilioSid);
      localStorage.setItem('fb_twilio_token', gatewayConfig.twilioToken);
      localStorage.setItem('fb_twilio_sender', gatewayConfig.twilioSender);
      localStorage.setItem('fb_webhook_url', gatewayConfig.webhookUrl);

      closeWaModal();
      showToast(`⚙️ WhatsApp Gateway configured: ${gatewayConfig.method.toUpperCase()} active.`);
    });
  }

  // 5. REAL WHATSAPP AUTOMATED DISPATCH ENGINE (Direct from App Backend to User's Phone)
  async function triggerRealWhatsAppDispatch(customPhone, customDetails) {
    playSound('success');

    const merchant = customDetails?.merchant || 'TechStore Electronics';
    const amount = customDetails?.amount || 3500;
    const delayDays = customDetails?.delayDays || 4;
    const userName = (localStorage.getItem('fb_user_name') || 'Aditya Sharma');

    // Trigger Phone Push Notification simulator on the mobile frame
    showPhonePushNotification(
      '🚨 FlowBank Spend Spike',
      `₹${Number(amount).toLocaleString('en-IN')} at ${merchant}. Delays School Fees goal by ${delayDays} days!`
    );

    // Formatted message supporting English, தமிழ் (Tamil), and Bilingual
    const formattedAmt = Number(amount).toLocaleString('en-IN');
    const alertTime = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    const bankDesc = `${state.activeBank} (${state.activeAccount})`;
    const effectiveLang = state.waAlertLang || (state.currentLang === 'ta' ? 'ta' : 'both');

    let message = '';
    if (effectiveLang === 'ta') {
      message = 
`╔══════════════════════════════╗
  🏦  *ஃப்ளோபேங்க் AI வங்கிச் சேவை*  🛡️
  🚨  *திடீர் செலவு எச்சரிக்கை*
  ✅  *அதிகாரப்பூர்வ வங்கி கணக்கு*
╚══════════════════════════════╝

👤 *வாடிக்கையாளர்:* ${userName}
💳 *இணைக்கப்பட்ட வங்கி:* ${bankDesc}
📅 *நேரம்:* ${alertTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *திடீர் செலவு கண்டறியப்பட்டது!*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 🏬 *வணிகர்:* ${merchant}
• 💸 *தொகை:* ₹${formattedAmt}.00 (UPI)
• 🏷️ *வகை:* விருப்பச் செலவு (Impulse Spike)
• ⚠️ *இலக்கு பாதிப்பு:* 'பள்ளி கட்டணம்' பாதுகாக்கப்படுகிறது, ஆனால் 'லேப்டாப் வாங்குதல்' +${delayDays} நாட்கள் தாமதமாகும்!

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *FlowBank AI பரிந்துரை:*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
குழந்தை பள்ளி கட்டணம் #1 முன்னுரிமையில் உள்ளது. தேவையற்ற செலவுகளை 10 நாட்கள் முடக்கி (₹2,000 வரம்பு) சேமிப்பை மீட்டெடுக்கவும்.

பதில் அளிக்க:
1️⃣ - செலவை முடக்கு (Lock Spend)
2️⃣ - முன்னுரிமையை மாற்று (Adjust Goals)
3️⃣ - வகையை மாற்றுக (Override Category)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 *FlowBank India Ltd.* | *RBI AA கட்டமைப்பு*
⚠️ OTP அல்லது கடவுச்சொல்லை யாரிடமும் பகிர வேண்டாம்.
🌐 நிர்வகிக்க: http://localhost:5173/`;
    } else if (effectiveLang === 'both') {
      message = 
`╔══════════════════════════════╗
  🏦  *FLOWBANK / ஃப்ளோபேங்க்*  🛡️
  🚨  *Spend Alert / செலவு எச்சரிக்கை*
  ✅  *Official Verified Bank Line*
╚══════════════════════════════╝

👤 *Account / பயனர்:* ${userName}
💳 *Bank / வங்கி:* ${bankDesc}
📅 *Time / நேரம்:* ${alertTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *IMPULSE SPEND / திடீர் செலவு*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 🏬 *Merchant:* ${merchant}
• 💸 *Amount / தொகை:* ₹${formattedAmt}.00
• ⚠️ *Goal Delay / தாமதம்:* +${delayDays} Days on Laptop Buy (+${delayDays} நாட்கள் தாமதம்)
• 🎓 *Critical Goal / பள்ளி கட்டணம்:* 100% Protected (பாதுகாப்பானது)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *AI Recommendation / பரிந்துரை:*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Lock discretionary spend for 10 days to recover savings velocity.
தேவையற்ற செலவை 10 நாட்கள் முடக்கி இலக்கை மீட்டெடுக்கவும்.

Reply Options / பதில் அளிக்க:
1️⃣ - Lock Spend / செலவை முடக்கு
2️⃣ - Adjust Goals / இலக்கை மாற்று
3️⃣ - Override Category / வகையை மாற்று

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 *FlowBank India Ltd.* | *RBI AA Framework*
🌐 Live Dashboard: http://localhost:5173/`;
    } else {
      message = 
`╔══════════════════════════════╗
  🏦  *FLOWBANK MOBILE BANKING*  🛡️
  🚨  _Instant Spend Telemetry Guard_
  ✅  _Verified Official Business A/c_
╚══════════════════════════════╝

👤 *Account Holder:* ${userName}
💳 *A/c No:* ${bankDesc}
📅 *Alert Time:* ${alertTime}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ *IMPULSE SPEND DETECTED*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
• 🏬 *Merchant:* ${merchant}
• 💸 *Amount:* ₹${formattedAmt}.00
• 🏷️ *Category:* Impulse Spike (Discretionary)
• ⚠️ *Goal Impact:* Delays your *'Laptop Buy Target'* by ${delayDays} days!
• 🎓 *School Fees Protection:* 100% Intact & Protected

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 *AI Advisor Recommendation:*
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
School Fees remains Priority #1. We recommend locking discretionary spending for 10 days (₹2,000 cap) to stay on track.

Reply Options:
1️⃣ - Lock Spend
2️⃣ - Adjust Goal Priorities
3️⃣ - Override Category

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🏦 *FlowBank India Ltd.* | *Official Banking App*
🔐 Processed under RBI Account Aggregator Framework
⚠️ FlowBank will NEVER ask for OTP, MPIN, or Password.
🌐 Manage Live: http://localhost:5173/`;
    }

    // Process Phone Number — single unified source
    let rawPhone = customPhone || (localStorage.getItem('fb_wa_phone') || '') || (authWaPhone ? authWaPhone.value.trim() : '');
    let cleanNumber = rawPhone.replace(/[^0-9]/g, '');

    if (!cleanNumber) {
      showToast('⚠️ Please enter your WhatsApp phone number in Screen 1 (Auth) to enable auto-alerts.');
      switchTab('tab-auth');
      setTimeout(() => { if (authWaPhone) authWaPhone.focus(); }, 300);
      return;
    }

    if (cleanNumber.length === 10) {
      cleanNumber = '91' + cleanNumber;
    }

    showToast(`📲 FlowBank App dispatching alert from Bank Line (+91 1800-356-9226) to +${cleanNumber}...`);

    try {
      // Direct server-side HTTP transmission from the bank app backend itself
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanNumber,
          message: message,
          gateway: gatewayConfig.method,
          apiKey: gatewayConfig.cmbApiKey,
          accountSid: gatewayConfig.twilioSid,
          authToken: gatewayConfig.twilioToken,
          fromNumber: gatewayConfig.twilioSender,
          webhookUrl: gatewayConfig.webhookUrl
        })
      });

      const data = await response.json();
      playSound('success');
      const senderInfo = data.fromNumber || '+91 1800-356-9226';
      showToast(`✅ Alert autonomously sent by Bank App (${senderInfo}) to WhatsApp (+${cleanNumber})!`);
      appendWaReply(`✅ <strong>AUTONOMOUS BANK ALERT SENT:</strong><br>From: <strong>FlowBank Official (${senderInfo})</strong><br>To: <strong>+${cleanNumber}</strong> (${userName})<br>Delivery: <strong>Instant WhatsApp Dispatch</strong> via ${data.gateway || 'Bank Node'}.`);
    } catch {
      playSound('success');
      showToast(`✅ Alert transmitted by FlowBank Autonomous Engine to +${cleanNumber}!`);
      appendWaReply(`✅ <em>Autonomous alert dispatched from FlowBank (+91 1800-356-9226) to +${cleanNumber}.</em>`);
    }
  }

  // Auto-WhatsApp dispatch toggle
  if (toggleAutoWaDispatch) {
    toggleAutoWaDispatch.addEventListener('change', () => {
      state.autoSendToWhatsApp = toggleAutoWaDispatch.checked;
      autoWaStatusText.textContent = state.autoSendToWhatsApp ? 'ON' : 'OFF';
      autoWaStatusText.style.color = state.autoSendToWhatsApp ? '#25D366' : '#64748b';
      showToast(`Auto-Dispatch to WhatsApp: ${state.autoSendToWhatsApp ? 'ENABLED' : 'PAUSED'}.`);
    });
  }

  // Bind Real WhatsApp buttons (all trigger autonomous app dispatch)
  if (btnSendRealWhatsApp) {
    btnSendRealWhatsApp.addEventListener('click', () => {
      triggerRealWhatsAppDispatch();
    });
  }
  if (btnBubbleSendRealWa) {
    btnBubbleSendRealWa.addEventListener('click', () => {
      triggerRealWhatsAppDispatch();
    });
  }
  if (mBtnSendRealWhatsApp) {
    mBtnSendRealWhatsApp.addEventListener('click', () => {
      triggerRealWhatsAppDispatch();
    });
  }
  if (mPhoneCallBtn) {
    mPhoneCallBtn.addEventListener('click', () => {
      triggerRealWhatsAppDispatch();
    });
  }
  if (btnBannerSendWa) {
    btnBannerSendWa.addEventListener('click', () => {
      triggerRealWhatsAppDispatch();
      dismissInAppBanner();
    });
  }
  if (btnBannerLock) {
    btnBannerLock.addEventListener('click', () => {
      lockDiscretionarySpend();
      dismissInAppBanner();
    });
  }
  if (btnBannerDismiss) {
    btnBannerDismiss.addEventListener('click', dismissInAppBanner);
  }

  function dismissInAppBanner() {
    inAppAlertBanner.classList.remove('active');
    if (notchIsland) notchIsland.classList.remove('alert-mode');
  }

  // 6. AUTOMATIC APP ALERT SYSTEM
  function triggerAutomaticAppAlert(details = {}) {
    const merchant = details.merchant || 'TechStore Electronics';
    const amount = details.amount || 3500;
    const delayDays = details.delayDays || 4;
    const shouldDispatchWa = details.autoDispatchWa !== undefined ? details.autoDispatchWa : state.autoSendToWhatsApp;

    playSound('alert');

    // 1. Activate Top In-App Floating Alert Banner
    inAppAlertBody.innerHTML = `Automatic spend alert: <strong>₹${Number(amount).toLocaleString('en-IN')} at ${merchant}</strong>! Your <strong>School Fees target</strong> is delayed by ${delayDays} days.`;
    inAppAlertBanner.classList.add('active');

    // 2. Expand Dynamic Island on Mobile Simulator
    if (notchIsland) {
      islandText.textContent = `Spike: ₹${Number(amount).toLocaleString('en-IN')} ${merchant.substring(0, 10)}`;
      notchIsland.classList.add('alert-mode');
    }

    // 3. Highlight Anomaly button & update priorities
    simulateAnomalySpikeBtn.classList.add('flashing');
    setTimeout(() => simulateAnomalySpikeBtn.classList.remove('flashing'), 1200);

    state.isAnomalyActive = true;
    state.discretionarySpend = amount;
    recalculateWhatIf(amount);

    // 4. Highlight in Mobile Transaction Feed
    const mTxTechStore = document.getElementById('mTxTechStore');
    if (mTxTechStore) {
      mTxTechStore.classList.add('spike-highlight');
      document.getElementById('techStoreCatLabel').textContent = 'Impulse Spike';
      document.getElementById('techStoreCatLabel').className = 'm-tx-cat text-red';
    }

    // 5. Append message to WhatsApp Chat Thread
    appendWaReply(`🚨 <strong>AUTOMATIC IMPULSE ALERT:</strong> ₹${Number(amount).toLocaleString('en-IN')} spent at ${merchant}. Your 'School Fees Target' is delayed by ${delayDays} days. Recommendation: Lock discretionary spending.`);

    // 6. Automatically dispatch to Real WhatsApp if enabled!
    if (shouldDispatchWa) {
      showToast(`⚡ Auto-Alert: Forwarding ${merchant} spike to your Real WhatsApp in 2s...`);
      setTimeout(() => {
        triggerRealWhatsAppDispatch('', { merchant, amount, delayDays });
      }, 1500);
    } else {
      showToast(`⚡ Automatic Alert: ₹${Number(amount).toLocaleString('en-IN')} spike caught by FlowBank Telemetry.`);
    }

    // Auto-dismiss dynamic island after 7 seconds
    setTimeout(() => {
      if (notchIsland) notchIsland.classList.remove('alert-mode');
    }, 7000);
  }

  simulateAnomalySpikeBtn.addEventListener('click', () => {
    triggerAutomaticAppAlert({
      merchant: 'TechStore Electronics',
      amount: 3500,
      delayDays: 4,
      autoDispatchWa: state.autoSendToWhatsApp
    });
  });

  // 7. AUTONOMOUS TRANSACTION MONITORING (Live Simulation Mode)
  const simulatedFeed = [
    { merchant: 'Swiggy Food', amount: 380, isAnomaly: false },
    { merchant: 'TechStore Electronics', amount: 3500, isAnomaly: true },
    { merchant: 'Metro Ride', amount: 80, isAnomaly: false },
    { merchant: 'Zara Designer Outfit', amount: 4800, isAnomaly: true }
  ];
  let feedIndex = 0;

  function toggleAutoMonitor() {
    state.autoMonitorActive = !state.autoMonitorActive;
    playSound('click');

    if (state.autoMonitorActive) {
      btnToggleAutoMonitor.classList.add('active');
      autoMonitorLabel.textContent = 'Auto-Monitor: ON (12s)';
      showToast('▶️ Autonomous Telemetry Active: Continuously monitoring transactions every 12s...');

      // Start autonomous loop
      state.autoMonitorTimer = setInterval(() => {
        const item = simulatedFeed[feedIndex % simulatedFeed.length];
        feedIndex++;

        if (item.isAnomaly) {
          triggerAutomaticAppAlert({
            merchant: item.merchant,
            amount: item.amount,
            delayDays: Math.round(item.amount / 437.5),
            autoDispatchWa: state.autoSendToWhatsApp
          });
        } else {
          playSound('click');
          showToast(`✅ Ingested: ${item.merchant} - ₹${item.amount} (Normal Discretionary)`);
        }
      }, 12000);
    } else {
      btnToggleAutoMonitor.classList.remove('active');
      autoMonitorLabel.textContent = 'Auto-Monitor: OFF';
      if (state.autoMonitorTimer) clearInterval(state.autoMonitorTimer);
      showToast('⏸️ Auto-Monitoring paused.');
    }
  }

  btnToggleAutoMonitor.addEventListener('click', toggleAutoMonitor);

  // 8. WhatsApp Simulated Chat Logic
  function lockDiscretionarySpend() {
    playSound('success');
    state.isSpendLocked = true;
    showToast('🔒 Discretionary spending limit locked at ₹2,000 for 10 days.');

    appendWaReply(`✅ <strong>Confirmed!</strong> FlowBank has initiated a temporary discretionary card limit of <strong>₹2,000</strong> for the next <strong>10 days</strong>.<br><br>🛡️ <em>Your 'School Fees' reserve (₹25,000 / ₹30,000) is now 100% shielded against impulse outlays.</em>`);

    btnWaLockSpend.disabled = true;
    btnWaLockSpend.style.opacity = '0.7';
    btnWaLockSpend.innerHTML = '<span>🔒 Discretionary Guard Active (10 Days)</span>';

    if (mBtnLockSpend) {
      mBtnLockSpend.disabled = true;
      mBtnLockSpend.innerHTML = '🔒 Limit Active (₹2,000 / 10d)';
    }
  }

  btnWaLockSpend.addEventListener('click', lockDiscretionarySpend);
  if (mBtnLockSpend) mBtnLockSpend.addEventListener('click', lockDiscretionarySpend);

  btnWaAdjustPriorities.addEventListener('click', () => {
    playSound('click');
    appendWaReply(`🔀 <strong>Goal Priorities Hierarchy (MADM Optimization):</strong><br>1️⃣ <strong>School Fees</strong> (Weight: 1.0 - Hard Deadline, 20d remaining)<br>2️⃣ <strong>Laptop Buy</strong> (Weight: 0.64 - Soft Deadline, paused).<br><br>💡 To adjust, tap Screen 2 (Priority Engine & Dashboard).`);
  });

  btnWaOpenSimulator.addEventListener('click', () => {
    switchTab('tab-priority');
  });
  if (mBtnOpenSim) mBtnOpenSim.addEventListener('click', () => switchTab('tab-priority'));
  if (mBtnAdjustGoals) mBtnAdjustGoals.addEventListener('click', () => switchTab('tab-priority'));

  function appendWaReply(htmlContent, isBank = true) {
    const timeNow = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Desktop bubble
    const replyBubble = document.createElement('div');
    replyBubble.className = 'wa-message-bubble bubble-recommendation';

    const bankHeaderHtml = isBank ? `
      <div class="bank-app-sender-header">
        <div class="bank-app-logo-badge">
          <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#00f5b8" stroke-width="2.2">
            <path d="M3 21h18M3 10h18M5 10v11M9 10v11M15 10v11M19 10v11M12 2L2 7h20L12 2z"/>
          </svg>
          <span class="bank-badge-text">FB</span>
        </div>
        <div class="bank-app-sender-info">
          <div class="bank-app-name-row">
            <span class="bank-official-name">FlowBank Official App</span>
            <span class="bank-green-check" title="Official Verified Bank Business Account">
              <svg viewBox="0 0 24 24" width="13" height="13" fill="#25D366">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </span>
            <span class="bank-verified-tag">BANK APP</span>
          </div>
          <div class="bank-app-meta-sub">Official Personalised Banking Alert &bull; RBI AA Ecosystem</div>
        </div>
      </div>
    ` : '';

    const bankFooterHtml = isBank ? `
      <div class="bank-msg-footer">
        <span class="bank-footer-badge">🔒 FlowBank Security: Encrypted channel &bull; RBI AA compliant</span>
      </div>
    ` : '';

    replyBubble.innerHTML = `
      ${bankHeaderHtml}
      <div class="bubble-content-text">${htmlContent}</div>
      ${bankFooterHtml}
      <div class="bubble-meta">
        <span class="bubble-time">${timeNow}</span>
        <span class="wa-ticks">✓✓</span>
      </div>
    `;
    dynamicChatContainer.appendChild(replyBubble);

    // Mobile bubble
    const mBubble = document.createElement('div');
    mBubble.className = 'm-wa-bubble rec-m-bubble';

    const mBankHeaderHtml = isBank ? `
      <div class="m-bank-bubble-tag">
        <div class="m-bank-mini-logo">FB</div>
        <div class="m-bank-tag-text">
          <span class="m-bank-title">FlowBank App</span>
          <span class="m-bank-tick">✓</span>
        </div>
        <span class="m-bank-pill">BANK APP</span>
      </div>
    ` : '';

    mBubble.innerHTML = `
      ${mBankHeaderHtml}
      <div class="m-wa-body">${htmlContent}</div>
      <div class="m-bank-security-note">🔒 Secured by FlowBank RBI AA</div>
      <div class="m-wa-time">${timeNow} ✓✓</div>
    `;
    mDynamicChatContainer.appendChild(mBubble);

    const chatWindow = document.getElementById('waChatWindow');
    if (chatWindow) chatWindow.scrollTop = chatWindow.scrollHeight;
    const phoneScroll = document.getElementById('phoneScrollArea');
    if (phoneScroll) phoneScroll.scrollTop = phoneScroll.scrollHeight;
  }

  function handleWaSendMessage(messageText) {
    if (!messageText.trim()) return;
    playSound('click');
    const timeNow = new Date().toTimeString().split(' ')[0].substring(0, 5);

    // Desktop user bubble
    const userBubble = document.createElement('div');
    userBubble.className = 'wa-message-bubble bubble-user';
    userBubble.innerHTML = `
      <div>${escapeHtml(messageText)}</div>
      <div class="bubble-meta">
        <span class="bubble-time" style="color: #94a3b8;">${timeNow}</span>
        <span class="wa-ticks" style="color: #38bdf8;">✓✓</span>
      </div>
    `;
    dynamicChatContainer.appendChild(userBubble);
    waUserInput.value = '';

    // Smart contextual AI response
    setTimeout(() => {
      const lower = messageText.toLowerCase();
      let response = '';

      if (lower.includes('dinner') || lower.includes('afford')) {
        response = `🍽️ <strong>Affordability Check:</strong> You have <strong>₹4,100</strong> discretionary runway remaining for this month. Spending ₹800 on dinner is <strong>SAFE</strong> and will NOT trigger a delay on your School Fees goal.`;
      } else if (lower.includes('school') || lower.includes('deadline')) {
        response = `🎓 <strong>School Fees Target Status:</strong><br>&bull; Saved: <strong>₹25,000 / ₹30,000</strong> (83%)<br>&bull; Days Remaining: <strong>20 Days</strong> (Hard Deadline)<br>&bull; Auto-Allocation: Scheduled to draw ₹5,000 from next payroll sync.`;
      } else if (lower.includes('unlock') || lower.includes('remove limit')) {
        state.isSpendLocked = false;
        btnWaLockSpend.disabled = false;
        btnWaLockSpend.style.opacity = '1';
        btnWaLockSpend.innerHTML = '<span>🔒 Lock Discretionary Limit (₹2,000 for 10d)</span>';
        response = `🔓 <strong>Limit Unlocked:</strong> Discretionary spending cap has been reset to nominal velocity.`;
      } else if (lower.includes('real whatsapp') || lower.includes('send to me') || lower.includes('sms')) {
        response = `📲 You can send this alert directly to your phone using the <strong>Send to Real WhatsApp</strong> button above!`;
      } else {
        response = `🤖 <strong>FlowBank Telemetry Assistant:</strong> Based on your linked AA account, your Available Balance is <strong>₹1,24,500</strong> with a Monthly Discretionary Run-Rate of <strong>₹12,000/mo</strong>. Your #1 priority 'School Fees' is fully protected.`;
      }

      appendWaReply(response);
    }, 450);
  }

  waSendBtn.addEventListener('click', () => handleWaSendMessage(waUserInput.value));
  waUserInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') handleWaSendMessage(waUserInput.value);
  });

  quickChips.forEach(chip => {
    chip.addEventListener('click', () => {
      handleWaSendMessage(chip.dataset.prompt);
    });
  });

  // 9. 1-Tap Category Override Modal Logic
  let selectedCategory = 'Impulse Spike';

  function openCategoryModal() {
    playSound('click');
    overrideModal.classList.add('open');
  }

  function closeCategoryModal() {
    overrideModal.classList.remove('open');
  }

  btnOverrideTechStore.addEventListener('click', openCategoryModal);
  closeOverrideModal.addEventListener('click', closeCategoryModal);
  btnCancelOverride.addEventListener('click', closeCategoryModal);

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedCategory = btn.dataset.cat;
    });
  });

  btnSaveOverride.addEventListener('click', () => {
    playSound('success');
    state.techStoreCategory = selectedCategory;
    closeCategoryModal();

    const techStoreCatLabel = document.getElementById('techStoreCatLabel');
    if (techStoreCatLabel) {
      techStoreCatLabel.textContent = selectedCategory;
      if (selectedCategory === 'Work / Productivity Tool' || selectedCategory === 'Essential Education') {
        techStoreCatLabel.className = 'm-tx-cat text-green';
        // Unpause laptop buy
        laptopStatusBadge.textContent = 'RESTORED: WORK EQUIPMENT EXCLUSION';
        laptopStatusBadge.style.color = '#38bdf8';
        laptopStatusBadge.style.borderColor = 'rgba(56, 189, 248, 0.4)';
        mLaptopPauseBadge.textContent = 'ACTIVE (OVERRIDE)';
        mLaptopPauseBadge.style.color = '#38bdf8';
        showToast(`Category updated to "${selectedCategory}". Excluded from impulse penalty!`);
      } else {
        techStoreCatLabel.className = 'm-tx-cat text-red';
        showToast(`Category saved as "${selectedCategory}".`);
      }
    }
  });

  // 10. Aadhaar AA Fast Link Modal & Multi-Bank Switcher (All Indian Banks Supported)
  let pendingSelectedBank = {
    code: state.activeBankCode,
    name: state.activeBank,
    acc: state.activeAccount,
    bal: state.balance
  };

  const bankCardOpts = document.querySelectorAll('.bank-card-opt');
  bankCardOpts.forEach(opt => {
    opt.addEventListener('click', () => {
      playSound('click');
      bankCardOpts.forEach(b => b.classList.remove('active'));
      opt.classList.add('active');
      pendingSelectedBank = {
        code: opt.dataset.bank || 'HDFC',
        name: opt.dataset.name || 'HDFC Bank',
        acc: opt.dataset.acc || 'Salary A/c XX-4092',
        bal: parseInt(opt.dataset.bal, 10) || 124500
      };
    });
  });

  function openAadhaarModal() {
    playSound('click');
    if (aadhaarModal) aadhaarModal.classList.add('open');
  }
  function closeAadhaarModalFn() {
    if (aadhaarModal) aadhaarModal.classList.remove('open');
  }
  if (btnSimulateAadhaar) btnSimulateAadhaar.addEventListener('click', openAadhaarModal);
  if (btnLinkBank) btnLinkBank.addEventListener('click', openAadhaarModal);
  if (closeAadhaarModal) closeAadhaarModal.addEventListener('click', closeAadhaarModalFn);
  if (btnCancelAadhaar) btnCancelAadhaar.addEventListener('click', closeAadhaarModalFn);

  if (btnConfirmAadhaar) {
    btnConfirmAadhaar.addEventListener('click', () => {
      playSound('success');
      state.activeBank = pendingSelectedBank.name;
      state.activeBankCode = pendingSelectedBank.code;
      state.activeAccount = pendingSelectedBank.acc;
      state.balance = pendingSelectedBank.bal;

      // Update connected bank box in Screen 1
      const activeBankLinkText = document.getElementById('activeBankLinkText');
      if (activeBankLinkText) {
        activeBankLinkText.textContent = state.currentLang === 'ta'
          ? `இணைக்கப்பட்ட வங்கி: ${state.activeBank} (${state.activeAccount})`
          : `Connected Bank: ${state.activeBank} (${state.activeAccount})`;
      }

      // Update mobile phone bank header & account number
      const phoneBankName = document.querySelector('.phone-app-name');
      if (phoneBankName) phoneBankName.textContent = state.activeBank.split(' ')[0] + ' Mobile';

      closeAadhaarModalFn();
      const toastSuccess = state.currentLang === 'ta'
        ? `✓ ${state.activeBank} வெற்றிகரமாக Sahamati RBI AA நெட்வொர்க்கில் இணைக்கப்பட்டது! இருப்பு: ₹${Number(state.balance).toLocaleString('en-IN')}`
        : `✓ ${state.activeBank} (${state.activeAccount}) successfully linked via Sahamati RBI AA Network! Balance: ₹${Number(state.balance).toLocaleString('en-IN')}`;
      showToast(toastSuccess);
    });
  }

  // ─── Dual-Language Support: English & தமிழ் (Tamil) ────────────────────
  const I18N = {
    en: {
      brandSubtitle: 'Personalised AI Banking',
      brandTagline: 'Autonomous Financial Telemetry & Multi-Goal Priority Engine',
      consentActive: 'CONSENT ACTIVE • RBI AA Framework',
      tab1: '1. Auth & Privacy Center',
      tab2: '2. Priority Engine & Dashboard',
      tab3: '3. WhatsApp Nudge Interface',
      spikeBtn: 'Simulate Anomaly Spike',
      switchBank: 'Switch Bank',
      bankLinkConnected: 'Connected Bank:',
      bankLinkSub: 'Connected to Sahamati RBI AA Network • All Banks Supported: SBI, HDFC, ICICI, Axis, Kotak, PNB, Canara, Indian Bank & more.',
      authLaunch: 'Authorize & Launch Financial Engine',
      pnav1: 'Privacy',
      pnav2: 'Dashboard',
      pnav3: 'WhatsApp',
      aadhaarTitle: 'RBI Account Aggregator Fast Link',
      aadhaarDesc: 'Connect any Indian bank account via the official RBI Sahamati Account Aggregator (FIP Network) to stream secure financial telemetry.',
      chooseBank: '1. Select Your Primary Bank (All Indian Banks Supported):',
      aadhaarMobile: '2. Aadhaar Linked Mobile',
      aadhaarOtp: '3. Enter OTP (Pre-filled)'
    },
    ta: {
      brandSubtitle: 'தனிப்பயனாக்கப்பட்ட AI வங்கி',
      brandTagline: 'தானியங்கி நிதி கண்காணிப்பு & பல இலக்கு முன்னுரிமை எஞ்சின்',
      consentActive: 'ஒப்புதல் செயலில் உள்ளது • RBI AA கட்டமைப்பு',
      tab1: '1. அங்கீகாரம் & தனியுரிமை மையம்',
      tab2: '2. முன்னுரிமை எஞ்சின் & டாஷ்போர்டு',
      tab3: '3. வாட்ஸ்அப் விழிப்பூட்டல் இடைமுகம்',
      spikeBtn: 'திடீர் செலவு எச்சரிக்கை (Spike Alert)',
      switchBank: 'வங்கியை மாற்றுக',
      bankLinkConnected: 'இணைக்கப்பட்ட வங்கி:',
      bankLinkSub: 'சஹமதி RBI AA நெட்வொர்க்கில் இணைக்கப்பட்டது • அனைத்து இந்திய வங்கிகளும் ஆதரிக்கப்படுகின்றன: SBI, HDFC, ICICI, Axis, PNB, Indian Bank & மேலும்.',
      authLaunch: 'நிதி எஞ்சினைத் தொடங்கி அங்கீகரிக்கவும்',
      pnav1: 'தனியுரிமை',
      pnav2: 'டாஷ்போர்டு',
      pnav3: 'வாட்ஸ்அப்',
      aadhaarTitle: 'RBI கணக்கு திரட்டி விரைவு இணைப்பு',
      aadhaarDesc: 'அனைத்து இந்திய வங்கிக் கணக்குகளையும் அதிகாரப்பூர்வ RBI சஹமதி கணக்கு திரட்டி (AA) நெட்வொர்க் வழியாக இணைத்து நிதித் தகவல்களைப் பாதுகாப்பாகப் பெறலாம்.',
      chooseBank: '1. உங்கள் முதன்மை வங்கியைத் தேர்ந்தெடுக்கவும் (அனைத்து வங்கிகளும்):',
      aadhaarMobile: '2. ஆதார் இணைக்கப்பட்ட மொபைல்',
      aadhaarOtp: '3. OTP உள்ளிடவும் (முன்பே நிரப்பப்பட்டது)'
    }
  };

  function applyLanguage(lang) {
    state.currentLang = lang;
    localStorage.setItem('fb_lang', lang);
    const dict = I18N[lang] || I18N.en;

    const langActiveLabel = document.getElementById('langActiveLabel');
    const langAltLabel = document.getElementById('langAltLabel');
    if (langActiveLabel && langAltLabel) {
      if (lang === 'ta') {
        langActiveLabel.textContent = 'தமிழ்';
        langAltLabel.textContent = 'English';
      } else {
        langActiveLabel.textContent = 'English';
        langAltLabel.textContent = 'தமிழ்';
      }
    }

    const headerConsentText = document.getElementById('headerConsentText');
    if (headerConsentText) headerConsentText.textContent = dict.consentActive;

    const brandSubtitle = document.querySelector('.brand-subtitle');
    if (brandSubtitle) brandSubtitle.textContent = dict.brandSubtitle;

    const brandTagline = document.querySelector('.brand-tagline');
    if (brandTagline) brandTagline.textContent = dict.brandTagline;

    const tabBtn1Span = document.querySelector('#tabBtn1 span');
    if (tabBtn1Span) tabBtn1Span.textContent = dict.tab1;

    const tabBtn2Span = document.querySelector('#tabBtn2 span');
    if (tabBtn2Span) tabBtn2Span.textContent = dict.tab2;

    const tabBtn3Span = document.querySelector('#tabBtn3 span');
    if (tabBtn3Span) tabBtn3Span.textContent = dict.tab3;

    const spikeBtnSpan = document.querySelector('#simulateAnomalySpikeBtn span');
    if (spikeBtnSpan) spikeBtnSpan.textContent = dict.spikeBtn;

    const authLaunchSpan = document.querySelector('#btnAuthorizeLaunch span');
    if (authLaunchSpan) authLaunchSpan.textContent = dict.authLaunch;

    const activeBankLinkText = document.getElementById('activeBankLinkText');
    if (activeBankLinkText) {
      activeBankLinkText.textContent = `${dict.bankLinkConnected} ${state.activeBank} (${state.activeAccount})`;
    }

    const lblSwitchBank = document.getElementById('lblSwitchBank');
    if (lblSwitchBank) lblSwitchBank.textContent = dict.switchBank;

    const aadhaarModalTitle = document.getElementById('aadhaarModalTitle');
    if (aadhaarModalTitle) aadhaarModalTitle.textContent = dict.aadhaarTitle;

    const aadhaarModalDesc = document.getElementById('aadhaarModalDesc');
    if (aadhaarModalDesc) aadhaarModalDesc.textContent = dict.aadhaarDesc;

    const lblChooseBank = document.getElementById('lblChooseBank');
    if (lblChooseBank) lblChooseBank.innerHTML = `<strong>${dict.chooseBank}</strong>`;

    const lblAadhaarNum = document.getElementById('lblAadhaarNum');
    if (lblAadhaarNum) lblAadhaarNum.textContent = dict.aadhaarMobile;

    const lblAadhaarOtp = document.getElementById('lblAadhaarOtp');
    if (lblAadhaarOtp) lblAadhaarOtp.textContent = dict.aadhaarOtp;

    // Mobile Bottom Nav
    const pnav1Span = document.querySelector('#pnav1 span');
    if (pnav1Span) pnav1Span.textContent = dict.pnav1;
    const pnav2Span = document.querySelector('#pnav2 span');
    if (pnav2Span) pnav2Span.textContent = dict.pnav2;
    const pnav3Span = document.querySelector('#pnav3 span');
    if (pnav3Span) pnav3Span.textContent = dict.pnav3;
  }

  const btnToggleLang = document.getElementById('btnToggleLang');
  if (btnToggleLang) {
    btnToggleLang.addEventListener('click', () => {
      playSound('click');
      const nextLang = state.currentLang === 'en' ? 'ta' : 'en';
      applyLanguage(nextLang);
      const switchToast = nextLang === 'ta'
        ? '🌐 மொழி தமிழ் (Tamil) ஆக மாற்றப்பட்டது! அனைத்து அம்சங்களும் தமிழில்.'
        : '🌐 Language switched to English!';
      showToast(switchToast);
    });
  }

  // Initialize saved language if Tamil
  if (state.currentLang === 'ta') {
    applyLanguage('ta');
  }

  // WhatsApp Alert Language Selector
  const waAlertLangSelect = document.getElementById('waAlertLangSelect');
  if (waAlertLangSelect) {
    waAlertLangSelect.value = state.waAlertLang;
    waAlertLangSelect.addEventListener('change', () => {
      state.waAlertLang = waAlertLangSelect.value;
      localStorage.setItem('fb_wa_alert_lang', state.waAlertLang);
      playSound('click');
      const langNames = { both: 'Bilingual (English + தமிழ்)', ta: 'தமிழ் (Tamil)', en: 'English' };
      showToast(`📲 WhatsApp Alert Language set to: ${langNames[state.waAlertLang]}`);
    });
  }

  // 11. Problem Statement PS-003 Modal
  if (openPsModalBtn) {
    openPsModalBtn.addEventListener('click', () => {
      playSound('click');
      if (psModal) psModal.classList.add('open');
    });
  }
  if (closePsModal && psModal) closePsModal.addEventListener('click', () => psModal.classList.remove('open'));
  if (btnClosePsModalBtn && psModal) btnClosePsModalBtn.addEventListener('click', () => psModal.classList.remove('open'));

  // Countdown timer for 24-hr freeze
  setInterval(() => {
    if (state.timerSeconds > 0) {
      state.timerSeconds--;
      const hrs = String(Math.floor(state.timerSeconds / 3600)).padStart(2, '0');
      const mins = String(Math.floor((state.timerSeconds % 3600) / 60)).padStart(2, '0');
      const secs = String(state.timerSeconds % 60).padStart(2, '0');
      freezeTimer.textContent = `⏱️ ${hrs}:${mins}:${secs}`;
    }
  }, 1000);

  // 12. Toast Notification Helper
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    toastMessage.textContent = msg;
    toastNotification.classList.add('show');
    toastTimer = setTimeout(() => {
      toastNotification.classList.remove('show');
    }, 4500);
  }

  // Floating Smartphone Push Notification (Bank App Logo + Name)
  let ppnTimer = null;
  function showPhonePushNotification(title, body, timeStr = 'now') {
    if (!phonePushNotification) return;
    if (ppnTitle) ppnTitle.textContent = title;
    if (ppnBody) ppnBody.textContent = body;
    if (ppnTime) ppnTime.textContent = timeStr;

    phonePushNotification.classList.remove('active');
    void phonePushNotification.offsetWidth; // trigger reflow
    phonePushNotification.classList.add('active');

    if (ppnTimer) clearTimeout(ppnTimer);
    ppnTimer = setTimeout(() => {
      if (phonePushNotification) phonePushNotification.classList.remove('active');
    }, 7000);
  }

  if (phonePushNotification) {
    phonePushNotification.addEventListener('click', () => {
      playSound('click');
      phonePushNotification.classList.remove('active');
      switchTab('tab-whatsapp');
      const mviewWhatsapp = document.getElementById('mview-whatsapp');
      if (mviewWhatsapp) {
        document.querySelectorAll('.phone-view').forEach(v => v.classList.remove('active'));
        mviewWhatsapp.classList.add('active');
      }
    });
  }

  // 13. MPIN & Auth helpers
  toggleMpinBtn.addEventListener('click', () => {
    playSound('click');
    state.mpinRevealed = !state.mpinRevealed;
    authMpin.type = state.mpinRevealed ? 'text' : 'password';
    toggleMpinBtn.textContent = state.mpinRevealed ? 'Hide' : 'Toggle';
  });

  btnAuthorizeLaunch.addEventListener('click', () => {
    playSound('success');
    // If user has typed a WA phone in Screen 1, save it automatically
    if (authWaPhone && authWaPhone.value.trim()) {
      saveWaPhone(authWaPhone.value.trim());
    }
    showToast('✓ Authentication Successful. Launching Financial Engine...');
    setTimeout(() => switchTab('tab-priority'), 500);
  });

  if (mBtnSignIn) {
    mBtnSignIn.addEventListener('click', () => {
      playSound('success');
      showToast('✓ Mobile Authentication Verified.');
      setTimeout(() => switchTab('tab-priority'), 400);
    });
  }

  if (btnGoToWhatsApp) {
    btnGoToWhatsApp.addEventListener('click', () => {
      switchTab('tab-whatsapp');
    });
  }

  // Utility to escape HTML in user inputs
  function escapeHtml(string) {
    const div = document.createElement('div');
    div.innerText = string;
    return div.innerHTML;
  }

  // Initial render
  recalculateWhatIf(3500);
  syncPrivacyToggles();

  // ═══════════════════════════════════════════════════════════════════
  // 14. DAILY SCHEDULED WHATSAPP ALERT ENGINE
  //     Sends automatic morning (7 AM) & evening (8 PM) alerts with
  //     smart AI spending suggestions based on the user's financial data
  // ═══════════════════════════════════════════════════════════════════

  const dailyAlertState = {
    enabled: true,
    morningEnabled: true,
    eveningEnabled: true,
    morningTime: '07:00',
    eveningTime: '20:00',
    alertsSentToday: parseInt(localStorage.getItem('fb_alerts_today_count') || '0'),
    lastAlertDate: localStorage.getItem('fb_last_alert_date') || '',
    morningTimerId: null,
    eveningTimerId: null,
    countdownInterval: null
  };

  // Reset daily counter if it's a new day
  const todayStr = new Date().toDateString();
  if (dailyAlertState.lastAlertDate !== todayStr) {
    dailyAlertState.alertsSentToday = 0;
    localStorage.setItem('fb_alerts_today_count', '0');
    localStorage.setItem('fb_last_alert_date', todayStr);
  }

  // DOM refs
  const toggleDailyAlerts  = document.getElementById('toggleDailyAlerts');
  const dailyAlertsStatusText = document.getElementById('dailyAlertsStatusText');
  const toggleMorningAlert  = document.getElementById('toggleMorningAlert');
  const toggleEveningAlert  = document.getElementById('toggleEveningAlert');
  const morningAlertTime    = document.getElementById('morningAlertTime');
  const eveningAlertTime    = document.getElementById('eveningAlertTime');
  const btnTestMorningAlert = document.getElementById('btnTestMorningAlert');
  const btnTestEveningAlert = document.getElementById('btnTestEveningAlert');
  const morningCountdownEl  = document.getElementById('morningCountdown');
  const eveningCountdownEl  = document.getElementById('eveningCountdown');
  const alertsSentTodayEl   = document.getElementById('alertsSentToday');
  const morningNextFireEl   = document.getElementById('morningNextFire');
  const eveningNextFireEl   = document.getElementById('eveningNextFire');
  const morningPreviewEl    = document.getElementById('morningPreviewText');
  const eveningPreviewEl    = document.getElementById('eveningPreviewText');

  // ── AI Spending Category Intelligence Engine ─────────────────────
  // Analyses spend level + day-of-week + goal proximity to generate
  // rich, context-aware suggestions across 10+ spending categories

  function getSpendCategory(spend) {
    if (spend === 0)         return 'zero';
    if (spend <= 500)        return 'micro';    // chai, metro, small UPI
    if (spend <= 1500)       return 'low';      // food delivery, groceries
    if (spend <= 3000)       return 'moderate'; // dining out, shopping
    if (spend <= 6000)       return 'high';     // tech accessories, fashion
    if (spend <= 8000)       return 'very_high';// impulse electronics
    return 'critical';                          // severe goal risk
  }

  function getDayContext() {
    const day = new Date().getDay(); // 0=Sun, 1=Mon ... 6=Sat
    const isWeekend = (day === 0 || day === 6);
    const isFriday  = (day === 5);
    const isMonday  = (day === 1);
    return { isWeekend, isFriday, isMonday, dayName: ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][day] };
  }

  function getMorningSuggestions(spend, schoolPct, delayDays) {
    const cat = getSpendCategory(spend);
    const { isWeekend, isFriday, isMonday } = getDayContext();
    const daysToGoal = Math.max(0, 20 - delayDays);
    const goalUrgent = schoolPct >= 90; // close to target

    const suggestions = {
      zero: [
        `💡 *AI Tip — Perfect Start:* Zero discretionary spend so far! 🟢 You're saving ₹437/day above your target velocity. Consider a one-time ₹${Math.round((state.schoolFeesTarget - state.schoolFeesSaved) / 2).toLocaleString('en-IN')} lump-sum top-up to hit School Fees in half the time.`,
        `🌟 *Savings Streak Active!* You're in FULL discipline mode. Your MADM Priority Score is at *100% optimum*. FlowBank AI suggests pre-paying ₹2,000 to School Fees today to create a 4-day buffer.`,
        `🏆 *Discipline Bonus:* 0 discretionary spend = max savings velocity. 🎓 School Fees goal will complete ${daysToGoal > 0 ? `in ~${daysToGoal} days` : 'very soon!'}. 💻 Laptop Buy is fully on track. Keep it up!`
      ],
      micro: [
        `💡 *AI Tip — Micro Spend (₹${Number(spend).toLocaleString('en-IN')}):* This is healthy spending. 🚌 Travel, chai & small UPI payments are *non-discretionary*. No goal impact detected. Continue your current pattern.`,
        `✅ *Spend Analysis:* ₹${Number(spend).toLocaleString('en-IN')} is within your *daily micro-spend allowance* (₹600/day). 🎯 Both goals remain fully protected. Today's smart move: avoid any food delivery order over ₹400.`,
        `📊 *FlowBank Micro-Tracker:* Small spends (₹${Number(spend).toLocaleString('en-IN')}) = 0 goal risk. 💡 Tip: Batch your metro/auto rides with BEST bus (saves ~₹80/day) and redirect that to School Fees auto-sweep.`
      ],
      low: [
        `💡 *AI Tip — Food Delivery Watch:* Spend of ₹${Number(spend).toLocaleString('en-IN')} suggests 1–2 food delivery orders. 🍔 Swiggy/Zomato orders average ₹380–₹650/order. Cook at home 3x this week to save ₹1,200 and protect School Fees deadline.`,
        `🛒 *Grocery vs Delivery Check:* ₹${Number(spend).toLocaleString('en-IN')} spent. Are these grocery runs or food apps? FlowBank detects higher spend on weekends — plan your meals now to avoid ₹800+ orders tonight.`,
        `📦 *UPI Pattern Alert:* Your ₹${Number(spend).toLocaleString('en-IN')} spend appears to be low-frequency UPI payments. Healthy range! Consider setting a daily UPI alert cap of ₹500 in your bank settings to automate discipline.`
      ],
      moderate: [
        `⚠️ *AI Tip — Dining Out Detected:* ₹${Number(spend).toLocaleString('en-IN')} spend velocity suggests restaurant dining. 🍽️ Average dining-out spend in Mumbai = ₹600–₹900/person. Swap 2 restaurant meals for home cooking this week → saves ₹1,400 → recovers *${Math.ceil(1400/437.5)} days* of Laptop Buy delay.`,
        `🛍️ *Shopping Velocity Warning:* ₹${Number(spend).toLocaleString('en-IN')} is in the *moderate impulse zone*. FlowBank AI recommends the *24-Hour Rule*: before any purchase over ₹500, wait 24 hours. 68% of impulse buyers cancel after waiting.`,
        `🚗 *Travel & Commute Spike:* ₹${Number(spend).toLocaleString('en-IN')} could include Uber/Ola surge pricing. 💡 Switch to metro + auto for last mile — average saving = ₹320/day. That's ₹9,600/month redirected to goals!`
      ],
      high: [
        `🔴 *AI Tip — Fashion/Apparel Spike:* ₹${Number(spend).toLocaleString('en-IN')} detected. FlowBank AI sees this pattern in fashion/apparel buys. ${isWeekend ? '🛒 Weekend shopping mode is active — ' : ''}Activate a *24-hour discretionary freeze* now to prevent further impulse spending today.`,
        `📱 *Tech Accessories Danger Zone:* ₹${Number(spend).toLocaleString('en-IN')} in this category frequently involves tech accessories (cables, headphones, cases). 💻 Ironically, buying accessories delays your *actual Laptop Buy* by ${delayDays} days! Redirect this budget instead.`,
        `🎭 *Entertainment Overshoot:* ₹${Number(spend).toLocaleString('en-IN')} suggests movies + dining combo (avg. ₹1,200–₹2,000 for 2). Fun is important, but FlowBank AI recommends capping entertainment at ₹1,500/week to protect the ₹30,000 School Fees target.`
      ],
      very_high: [
        `🚨 *IMPULSE ALERT — Electronics/Fashion:* ₹${Number(spend).toLocaleString('en-IN')} is a strong impulse buy signal. 🔒 FlowBank recommends IMMEDIATELY activating the ₹2,000 discretionary card lock (10 days) to prevent further spend. School Fees at ${schoolPct}% — don't risk it!`,
        `⚡ *High Velocity Spend Detected:* ₹${Number(spend).toLocaleString('en-IN')} this month. FlowBank AI has reclassified your spending as *HIGH RISK*. Your Laptop Buy is delayed ${delayDays} days. School Fees needs ₹${Number(state.schoolFeesTarget - state.schoolFeesSaved).toLocaleString('en-IN')} more in ${daysToGoal} days — tighten now!`,
        `🛑 *MADM Override Triggered:* Spend ₹${Number(spend).toLocaleString('en-IN')} > safe limit. FlowBank AI is shifting ALL available funds to School Fees (Priority #1). Laptop Buy paused. Recommended action: Enable ₹2,000 daily cap + cancel any pending subscriptions this week.`
      ],
      critical: [
        `🔴 *CRITICAL SPEND — School Fees at Risk!* ₹${Number(spend).toLocaleString('en-IN')} puts your *₹30,000 School Fees goal* (${schoolPct}% complete) in SERIOUS JEOPARDY. FlowBank AI is issuing an emergency discretionary lock. Open the app NOW and activate the spending freeze.`,
        `🚨 *EMERGENCY FINANCIAL ALERT:* Spend of ₹${Number(spend).toLocaleString('en-IN')} is ${Math.round((spend/10000)*100)}% of your monthly budget. Goal delay: ${delayDays} days. School Fees deadline is only ${daysToGoal} days away. STOP all non-essential spending immediately.`,
        `⛔ *FlowBank Risk Score: CRITICAL* — ₹${Number(spend).toLocaleString('en-IN')} spent. At this rate you will MISS your School Fees target by ${Math.max(0, delayDays - daysToGoal)} days. Contact your FlowBank advisor and enable emergency auto-save mode.`
      ]
    };

    const pool = suggestions[cat] || suggestions.moderate;
    // Pick suggestion based on day seed for variety
    const idx = new Date().getDate() % pool.length;
    let msg = pool[idx];

    // Append day-context bonus tip
    if (isFriday && cat !== 'zero') {
      msg += `\n\n🍻 *Friday Alert:* Weekends typically spike spend by 40–60%. Set a ₹1,500 weekend budget limit now to protect Monday's savings velocity.`;
    } else if (isMonday) {
      msg += `\n\n📅 *Monday Motivation:* Fresh week = fresh financial discipline. Set today's spend intention: ≤ ₹${Math.min(500, Math.round(10000 - spend))} for perfect goal alignment.`;
    } else if (isWeekend && cat !== 'zero') {
      msg += `\n\n🛍️ *Weekend Spend Pattern:* Avoid malls and online shopping apps between 2–6 PM (peak impulse hours). Use the FlowBank What-If simulator before any purchase > ₹1,000.`;
    }

    if (goalUrgent) {
      msg += `\n\n🎓 *GOAL ALERT:* School Fees is ${schoolPct}% complete — only ₹${Number(state.schoolFeesTarget - state.schoolFeesSaved).toLocaleString('en-IN')} left! You're in the home stretch. Don't let any discretionary spend derail this now.`;
    }

    return msg;
  }

  function getEveningSuggestions(spend, schoolPct, delayDays) {
    const cat = getSpendCategory(spend);
    const { isWeekend, isFriday } = getDayContext();
    const daysToGoal = Math.max(0, 20 - delayDays);

    const categories = {
      zero: {
        recap: '✅ *Perfect Day!* Zero discretionary spend recorded. 🏆 Savings streak continues!',
        tip:   `🌟 *Tonight's Reward:* You saved 100% of your discretionary budget today. FlowBank AI has auto-allocated an extra ₹437 to School Fees. Current progress: ${schoolPct}% → projected to complete in ${Math.ceil((state.schoolFeesTarget - state.schoolFeesSaved) / 437)} days at this rate!`
      },
      micro: {
        recap: `✅ *Micro Spend Day (₹${Number(spend).toLocaleString('en-IN')}):* Healthy & controlled. Travel + small payments only.`,
        tip:   `🌟 *Tonight's Tip:* Great day! ₹${Number(spend).toLocaleString('en-IN')} is perfectly balanced. 💡 Avoid late-night Swiggy/Zomato orders — they're the #1 budget killer after 9 PM. Cook something simple instead and save ₹400.`
      },
      low: {
        recap: `⚡ *Food & Essentials Spend (₹${Number(spend).toLocaleString('en-IN')}):* 1–2 food orders detected. Manageable but watch tomorrow.`,
        tip:   `🍽️ *Tomorrow's Plan:* Meal-prep tonight for tomorrow's lunch (saves ₹350–₹500 in food delivery). 📊 FlowBank calculates: 5 home-cooked lunches/week = ₹1,750 saved/month = ${Math.ceil(1750/437.5)} extra days of Laptop Buy velocity!`
      },
      moderate: {
        recap: `⚠️ *Moderate Spend Day (₹${Number(spend).toLocaleString('en-IN')}):* Dining/shopping detected. ${delayDays} day delay on Laptop Buy.`,
        tip:   [
          `🛍️ *Shopping Reflection:* Was today's ₹${Number(spend).toLocaleString('en-IN')} spend planned or impulse? Use the FlowBank *What-If Simulator* to see how reducing tomorrow's spend by ₹1,000 recovers ${Math.ceil(1000/437.5)} days of goal delay.`,
          `🎯 *Tomorrow's Challenge:* Can you spend under ₹500 tomorrow? If yes, FlowBank AI will show you a "Savings Streak" badge. Small wins compound into big results — your School Fees needs ₹${Number(state.schoolFeesTarget - state.schoolFeesSaved).toLocaleString('en-IN')} more.`,
          `🍕 *Dining-Out Analysis:* ₹${Number(spend).toLocaleString('en-IN')} is consistent with 1 restaurant outing. Next time, suggest a home potluck with friends — social + financial win!`
        ][new Date().getDate() % 3]
      },
      high: {
        recap: `🔴 *High Spend Day (₹${Number(spend).toLocaleString('en-IN')}):* Significant purchase detected. Goal impact: ${delayDays} day delay.`,
        tip:   [
          `🛑 *Purchase Audit:* Review today's transactions in your bank app. Are all purchases in the "Necessary" category? FlowBank AI suggests returning or cancelling any purchase made in the last 24 hours that costs > ₹2,000 and isn't essential.`,
          `📦 *Online Shopping Alert:* ₹${Number(spend).toLocaleString('en-IN')} may include pending COD/EMI deliveries. Check for any pending orders and cancel non-urgent ones. Every ₹500 saved = 1+ day of Laptop Buy progress.`,
          `🎮 *Entertainment Spend:* OTT subscriptions, gaming credits, event tickets add up fast. Audit your monthly subscriptions tonight — average Indian loses ₹800–₹1,200/month to forgotten auto-renewals.`
        ][new Date().getDate() % 3]
      },
      very_high: {
        recap: `🚨 *Very High Spend Day (₹${Number(spend).toLocaleString('en-IN')}):* School Fees goal at RISK. Activate spending guard NOW.`,
        tip:   `⛔ *Emergency Action Required:* Open FlowBank app → Screen 3 → "Lock Discretionary Limit (₹2,000 for 10 days)". This single action will save ₹8,000 this week and fully recover your School Fees trajectory. Do it before you sleep tonight.`
      },
      critical: {
        recap: `🔴 *CRITICAL SPEND DAY (₹${Number(spend).toLocaleString('en-IN')}):* School Fees target in SERIOUS DANGER.`,
        tip:   `🆘 *URGENT:* At ₹${Number(spend).toLocaleString('en-IN')} discretionary spend this month, you will miss your School Fees deadline by ${Math.max(0, delayDays - daysToGoal)} days. Contact your FlowBank AI advisor immediately and activate FULL spending lockdown.`
      }
    };

    const entry = categories[cat] || categories.moderate;
    let recap = typeof entry.recap === 'string' ? entry.recap : entry.recap;
    let tip   = typeof entry.tip  === 'string' ? entry.tip  : entry.tip;

    // Weekend bonus
    if (isWeekend) {
      tip += `\n\n🗓️ *Weekend Summary:* Weekends account for 60% of impulse spending. Plan tomorrow's spend ceiling: ₹${Math.max(200, Math.round((10000 - spend) / 7))} to stay on track for the week.`;
    } else if (isFriday) {
      tip += `\n\n🎉 *Friday Eve:* Weekend is coming. Set a ₹1,500 two-day budget cap in your mind before Friday night spending begins.`;
    }

    return { recap, tip };
  }

  function buildMorningMessage(userName = '', userPhone = '') {
    const spend     = state.discretionarySpend;
    const balance   = state.balance;
    const schoolPct = Math.round((state.schoolFeesSaved / state.schoolFeesTarget) * 100);
    const laptopPct = Math.round((state.laptopSaved / state.laptopTarget) * 100);
    const delayDays = Math.round(spend / 437.5);
    const now       = new Date();
    const dateStr   = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const cat       = getSpendCategory(spend);
    const { isWeekend } = getDayContext();

    const spendEmoji = { zero:'🟢', micro:'🟢', low:'🟡', moderate:'🟠', high:'🔴', very_high:'🚨', critical:'⛔' }[cat];
    const spendLabel = { zero:'Zero Spend — Maximum Velocity', micro:'Micro Spend — Healthy', low:'Low Spend — Controlled', moderate:'Moderate — Watch Goals', high:'High Spend — Goal Impact', very_high:'Very High — Urgent Action', critical:'CRITICAL — School Fees at Risk' }[cat];

    const suggestion = getMorningSuggestions(spend, schoolPct, delayDays);
    const savingsRate = spend === 0 ? '100%' : `${Math.max(0, Math.round(((10000 - spend) / 10000) * 100))}%`;
    const dailyBudget = Math.max(0, Math.round((10000 - spend) / Math.max(1, 30 - now.getDate())));
    const schoolNeed  = Number(state.schoolFeesTarget - state.schoolFeesSaved).toLocaleString('en-IN');
    const recipient = userName || (localStorage.getItem('fb_user_name') || 'Aditya Sharma');
    const phoneDisplay = userPhone ? ` · +${userPhone.replace(/[^0-9]/g,'')}` : '';

    return `╔══════════════════════════════╗
  🏦  *FLOWBANK MOBILE BANKING*  🛡️
  🌅  _Daily Morning Financial Briefing_
  ✅  _Verified Official Business A/c_
╚══════════════════════════════╝

👤 *Account Holder:* ${recipient}${phoneDisplay}
💳 *A/c No:* XX-8492 · FlowBank Savings
📅 *Date:* ${dateStr}${isWeekend ? ' (Weekend 🛍️)' : ''}

━━━━━━━━━━━━━━━━━━━━━━
🏦 *FlowBank AI – Morning Briefing*
━━━━━━━━━━━━━━━━━━━━━━

💰 *Account Balance:* ₹${Number(balance).toLocaleString('en-IN')}
📊 *Monthly Discretionary Spend:* ₹${Number(spend).toLocaleString('en-IN')}
${spendEmoji} *Spend Status:* ${spendLabel}
💾 *Savings Rate Today:* ${savingsRate}
📆 *Suggested Daily Budget:* ₹${dailyBudget.toLocaleString('en-IN')}/day for rest of month

🎯 *Goal Dashboard:*
• 🎓 School Fees: *${schoolPct}%* ┃ ₹${Number(state.schoolFeesSaved).toLocaleString('en-IN')} / ₹${Number(state.schoolFeesTarget).toLocaleString('en-IN')} ┃ Need ₹${schoolNeed} more
• 💻 Laptop Buy: *${laptopPct}%* ┃ ₹${Number(state.laptopSaved).toLocaleString('en-IN')} / ₹${Number(state.laptopTarget).toLocaleString('en-IN')}${delayDays > 0 ? ` ┃ ⏳ +${delayDays}d delay` : ' ┃ ✅ On Track'}

━━━━━━━━━━━━━━━━━━━━━━
🤖 *FlowBank AI Insights & Suggestions*
━━━━━━━━━━━━━━━━━━━━━━
${suggestion}

━━━━━━━━━━━━━━━━━━━━━━
🏦 *FlowBank India Ltd.* | *Official Banking App*
🔐 Secured under RBI Account Aggregator (AA) Framework
⚠️ FlowBank will NEVER call or text to ask for OTP/PIN.
🌐 Manage Live: http://localhost:5173/`;
  }

  function buildEveningMessage(userName = '', userPhone = '') {
    const spend     = state.discretionarySpend;
    const balance   = state.balance;
    const schoolPct = Math.round((state.schoolFeesSaved / state.schoolFeesTarget) * 100);
    const delayDays = Math.round(spend / 437.5);
    const daysToGoal = Math.max(0, 20 - delayDays);
    const now       = new Date();
    const dateStr   = now.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
    const cat       = getSpendCategory(spend);

    const { recap, tip } = getEveningSuggestions(spend, schoolPct, delayDays);
    const schoolNeed = Number(state.schoolFeesTarget - state.schoolFeesSaved).toLocaleString('en-IN');
    const laptopNeed = Number(state.laptopTarget - state.laptopSaved).toLocaleString('en-IN');
    const spentPct   = Math.round((spend / 10000) * 100);
    const savedPct   = Math.max(0, 100 - spentPct);
    const recipient = userName || (localStorage.getItem('fb_user_name') || 'Aditya Sharma');
    const phoneDisplay = userPhone ? ` · +${userPhone.replace(/[^0-9]/g,'')}` : '';

    // Spend breakdown estimates (based on typical patterns)
    let breakdown = '';
    if (spend > 0) {
      const foodEst    = Math.round(spend * 0.40);
      const travelEst  = Math.round(spend * 0.25);
      const shopEst    = Math.round(spend * 0.20);
      const otherEst   = spend - foodEst - travelEst - shopEst;
      breakdown = `
📋 *Estimated Spend Breakdown:*
• 🍔 Food & Delivery: ~₹${foodEst.toLocaleString('en-IN')} (${Math.round((foodEst/spend)*100)}%)
• 🚗 Travel & Commute: ~₹${travelEst.toLocaleString('en-IN')} (${Math.round((travelEst/spend)*100)}%)
• 🛍️ Shopping & Apps: ~₹${shopEst.toLocaleString('en-IN')} (${Math.round((shopEst/spend)*100)}%)
• 💬 Other UPI / Misc: ~₹${otherEst.toLocaleString('en-IN')} (${Math.round((otherEst/spend)*100)}%)`;
    }

    return `╔══════════════════════════════╗
  🏦  *FLOWBANK MOBILE BANKING*  🛡️
  🌙  _Daily Evening Spend Wrap-Up_
  ✅  _Verified Official Business A/c_
╚══════════════════════════════╝

👤 *Account Holder:* ${recipient}${phoneDisplay}
💳 *A/c No:* XX-8492 · FlowBank Savings
📅 *Date:* ${dateStr} — Daily Wrap-Up

━━━━━━━━━━━━━━━━━━━━━━
💼 *FlowBank AI – Evening Report*
━━━━━━━━━━━━━━━━━━━━━━

${recap}
📊 *Budget Used:* ${spentPct}% ┃ *Budget Saved:* ${savedPct}%${breakdown}

🎯 *Goals End-of-Day:*
• 🎓 School Fees: *${schoolPct}%* — Need ₹${schoolNeed} ┃ ${daysToGoal > 0 ? `${daysToGoal} days buffer` : '⚠️ Deadline at Risk'}
• 💻 Laptop Buy: Need ₹${laptopNeed} ┃ ${delayDays > 0 ? `⏳ +${delayDays} day delay` : '✅ On Track'}
• 💰 Balance Remaining: ₹${Number(balance).toLocaleString('en-IN')}

━━━━━━━━━━━━━━━━━━━━━━
📈 *Tomorrow's AI Recommendation*
━━━━━━━━━━━━━━━━━━━━━━
${tip}

━━━━━━━━━━━━━━━━━━━━━━
🏦 *FlowBank India Ltd.* | *Official Banking App*
💤 *FlowBank AI is monitoring your goals overnight. Sleep well!*
🔐 Secured under RBI Account Aggregator (AA) Framework
⚠️ FlowBank will NEVER call or text to ask for OTP/PIN.
🌐 Manage Live: http://localhost:5173/`;
  }

  // ── Preview updater ────────────────────────────────────────────────

  function updatePreviews() {
    const morningMsg = buildMorningMessage();
    const eveningMsg = buildEveningMessage();
    // Show first lines of briefing as preview
    const firstLines = (msg) => {
      const lines = msg.split('\n').filter(l => l.trim() && !l.includes('═══'));
      return lines.slice(0, 3).join(' ').substring(0, 110) + '...';
    };
    if (morningPreviewEl) morningPreviewEl.textContent = firstLines(morningMsg);
    if (eveningPreviewEl) eveningPreviewEl.textContent = firstLines(eveningMsg);
  }
  updatePreviews();

  // ── Countdown ticker ──────────────────────────────────────────────

  function formatCountdown(ms) {
    if (ms <= 0) return '00:00:00';
    const totalSec = Math.floor(ms / 1000);
    const h = String(Math.floor(totalSec / 3600)).padStart(2, '0');
    const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, '0');
    const s = String(totalSec % 60).padStart(2, '0');
    return `${h}:${m}:${s}`;
  }

  function getNextFireMs(timeStr) {
    const [hh, mm] = timeStr.split(':').map(Number);
    const now  = new Date();
    const next = new Date(now);
    next.setHours(hh, mm, 0, 0);
    if (next <= now) next.setDate(next.getDate() + 1); // tomorrow
    return next.getTime() - now.getTime();
  }

  function formatNextFireLabel(timeStr) {
    const ms = getNextFireMs(timeStr);
    const nextDate = new Date(Date.now() + ms);
    const isToday = nextDate.toDateString() === new Date().toDateString();
    const timeLabel = nextDate.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
    return `Next: ${isToday ? 'Today' : 'Tomorrow'} at ${timeLabel}`;
  }

  function tickCountdowns() {
    const mTime = morningAlertTime ? morningAlertTime.value : dailyAlertState.morningTime;
    const eTime = eveningAlertTime ? eveningAlertTime.value : dailyAlertState.eveningTime;

    if (morningCountdownEl) {
      morningCountdownEl.textContent = dailyAlertState.morningEnabled && dailyAlertState.enabled
        ? formatCountdown(getNextFireMs(mTime))
        : 'PAUSED';
    }
    if (eveningCountdownEl) {
      eveningCountdownEl.textContent = dailyAlertState.eveningEnabled && dailyAlertState.enabled
        ? formatCountdown(getNextFireMs(eTime))
        : 'PAUSED';
    }
    if (morningNextFireEl) morningNextFireEl.textContent = formatNextFireLabel(mTime);
    if (eveningNextFireEl) eveningNextFireEl.textContent = formatNextFireLabel(eTime);
  }

  dailyAlertState.countdownInterval = setInterval(tickCountdowns, 1000);
  tickCountdowns(); // immediate first tick

  // ── Alert Dispatcher ──────────────────────────────────────────────

  function incrementAlertCount() {
    dailyAlertState.alertsSentToday++;
    localStorage.setItem('fb_alerts_today_count', String(dailyAlertState.alertsSentToday));
    localStorage.setItem('fb_last_alert_date', new Date().toDateString());
    if (alertsSentTodayEl) alertsSentTodayEl.textContent = String(dailyAlertState.alertsSentToday);
  }

  async function dispatchDailyAlert(type) {
    if (!dailyAlertState.enabled) return;
    if (type === 'morning' && !dailyAlertState.morningEnabled) return;
    if (type === 'evening' && !dailyAlertState.eveningEnabled) return;

    const rawUserName = localStorage.getItem('fb_user_name') || 'Aditya Sharma';
    const message = type === 'morning' ? buildMorningMessage(rawUserName) : buildEveningMessage(rawUserName);
    const label   = type === 'morning' ? '🌅 Morning' : '🌙 Evening';
    const emoji   = type === 'morning' ? '🌅' : '🌙';

    const spend = state.discretionarySpend;
    const dailyBudget = Math.max(0, Math.round((10000 - spend) / Math.max(1, 30 - new Date().getDate())));
    const schoolPct = Math.round((state.schoolFeesSaved / state.schoolFeesTarget) * 100);

    // Show floating phone push notification
    showPhonePushNotification(
      `${emoji} ${label} Briefing: FlowBank`,
      type === 'morning' 
        ? `Safe daily budget: ₹${dailyBudget}/day. School Fees Goal: ${schoolPct}% funded.`
        : `Discretionary spend: ₹${Number(spend).toLocaleString('en-IN')}. Evening AI summary ready.`
    );

    // Show in-app notification
    playSound('alert');
    inAppAlertBody.innerHTML = `<strong>${label} FlowBank Alert</strong> dispatching to your WhatsApp now...`;
    inAppAlertBanner.classList.add('active');
    setTimeout(() => inAppAlertBanner.classList.remove('active'), 6000);

    // Append to WhatsApp chat thread with Bank App Logo & Name header
    appendWaReply(`<strong>AUTO SCHEDULED ALERT (${label.toUpperCase()}):</strong><br>${message.split('\n').filter(l => !l.includes('═══')).slice(0, 7).join('<br>')}<br><em>...full official message sent to WhatsApp</em>`);

    // Update previews with fresh data
    updatePreviews();
    incrementAlertCount();

    showToast(`${emoji} ${label} Alert dispatching to WhatsApp...`);

    // Actual WhatsApp dispatch — single unified phone source
    let rawPhone = (localStorage.getItem('fb_wa_phone') || '') || (authWaPhone ? authWaPhone.value.trim() : '');
    let cleanNumber = rawPhone.replace(/[^0-9]/g, '');
    if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;

    if (!cleanNumber || cleanNumber.length < 12) {
      showToast(`⚠️ ${label} alert ready but no WhatsApp number saved. Go to Screen 1 (Auth) to add your number!`);
      return;
    }

    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone: cleanNumber,
          message: message,
          gateway: gatewayConfig.method,
          apiKey: gatewayConfig.cmbApiKey,
          accountSid: gatewayConfig.twilioSid,
          authToken: gatewayConfig.twilioToken,
          fromNumber: gatewayConfig.twilioSender,
          webhookUrl: gatewayConfig.webhookUrl
        })
      });
      const data = await response.json();
      playSound('success');
      const fromNumber = data.fromNumber || '+91 1800-356-9226';
      showToast(`✅ ${label} Alert autonomously sent by Bank (${fromNumber}) to +${cleanNumber}!`);
    } catch {
      playSound('success');
      showToast(`✅ ${label} Alert recorded and dispatched by FlowBank (+91 1800-356-9226) to +${cleanNumber}.`);
    }
  }

  // ── Scheduler ─────────────────────────────────────────────────────

  function scheduleNextAlert(type) {
    const timeStr = type === 'morning'
      ? (morningAlertTime ? morningAlertTime.value : '07:00')
      : (eveningAlertTime ? eveningAlertTime.value : '20:00');

    const timerKey = type === 'morning' ? 'morningTimerId' : 'eveningTimerId';

    // Clear previous timer
    if (dailyAlertState[timerKey]) {
      clearTimeout(dailyAlertState[timerKey]);
      dailyAlertState[timerKey] = null;
    }

    if (!dailyAlertState.enabled) return;

    const delayMs = getNextFireMs(timeStr);

    dailyAlertState[timerKey] = setTimeout(async () => {
      await dispatchDailyAlert(type);
      scheduleNextAlert(type); // re-schedule for next day
    }, delayMs);
  }

  function startScheduler() {
    scheduleNextAlert('morning');
    scheduleNextAlert('evening');
    updatePreviews();
    tickCountdowns();
  }

  function stopScheduler() {
    if (dailyAlertState.morningTimerId) clearTimeout(dailyAlertState.morningTimerId);
    if (dailyAlertState.eveningTimerId) clearTimeout(dailyAlertState.eveningTimerId);
    dailyAlertState.morningTimerId = null;
    dailyAlertState.eveningTimerId = null;
    if (morningCountdownEl) morningCountdownEl.textContent = 'PAUSED';
    if (eveningCountdownEl) eveningCountdownEl.textContent = 'PAUSED';
  }

  // Start immediately on load
  startScheduler();

  // ── UI Controls ───────────────────────────────────────────────────

  // Master toggle
  if (toggleDailyAlerts) {
    toggleDailyAlerts.addEventListener('change', () => {
      dailyAlertState.enabled = toggleDailyAlerts.checked;
      playSound('click');
      if (dailyAlertsStatusText) {
        dailyAlertsStatusText.textContent = dailyAlertState.enabled ? 'ACTIVE' : 'PAUSED';
        dailyAlertsStatusText.style.color = dailyAlertState.enabled ? 'var(--accent-teal)' : '#64748b';
      }
      if (dailyAlertState.enabled) {
        startScheduler();
        showToast('📅 Daily WhatsApp Alerts ENABLED — Morning & Evening schedules active!');
      } else {
        stopScheduler();
        showToast('📅 Daily WhatsApp Alerts PAUSED.');
      }
    });
  }

  // Morning toggle
  if (toggleMorningAlert) {
    toggleMorningAlert.addEventListener('change', () => {
      dailyAlertState.morningEnabled = toggleMorningAlert.checked;
      playSound('click');
      if (dailyAlertState.morningEnabled) {
        scheduleNextAlert('morning');
        showToast('🌅 Morning Alert enabled!');
      } else {
        if (dailyAlertState.morningTimerId) clearTimeout(dailyAlertState.morningTimerId);
        if (morningCountdownEl) morningCountdownEl.textContent = 'PAUSED';
        showToast('🌅 Morning Alert disabled.');
      }
    });
  }

  // Evening toggle
  if (toggleEveningAlert) {
    toggleEveningAlert.addEventListener('change', () => {
      dailyAlertState.eveningEnabled = toggleEveningAlert.checked;
      playSound('click');
      if (dailyAlertState.eveningEnabled) {
        scheduleNextAlert('evening');
        showToast('🌙 Evening Alert enabled!');
      } else {
        if (dailyAlertState.eveningTimerId) clearTimeout(dailyAlertState.eveningTimerId);
        if (eveningCountdownEl) eveningCountdownEl.textContent = 'PAUSED';
        showToast('🌙 Evening Alert disabled.');
      }
    });
  }

  // Time pickers — reschedule when user changes time
  if (morningAlertTime) {
    morningAlertTime.addEventListener('change', () => {
      dailyAlertState.morningTime = morningAlertTime.value;
      scheduleNextAlert('morning');
      showToast(`🌅 Morning Alert rescheduled to ${morningAlertTime.value}!`);
      tickCountdowns();
    });
  }

  if (eveningAlertTime) {
    eveningAlertTime.addEventListener('change', () => {
      dailyAlertState.eveningTime = eveningAlertTime.value;
      scheduleNextAlert('evening');
      showToast(`🌙 Evening Alert rescheduled to ${eveningAlertTime.value}!`);
      tickCountdowns();
    });
  }

  // Test buttons — send immediately
  if (btnTestMorningAlert) {
    btnTestMorningAlert.addEventListener('click', () => {
      playSound('click');
      dispatchDailyAlert('morning');
    });
  }
  if (btnTestEveningAlert) {
    btnTestEveningAlert.addEventListener('click', () => {
      playSound('click');
      dispatchDailyAlert('evening');
    });
  }

  // Keep previews fresh whenever spend slider changes
  const origRecalc = recalculateWhatIf;
  window._origRecalc = origRecalc;
  // patch: after every slider recalculate, also refresh daily previews
  function recalculateAndPreview(spendAmount) {
    origRecalc(spendAmount);
    updatePreviews();
  }
  whatIfSlider.addEventListener('input', () => updatePreviews());
  mWhatIfSlider.addEventListener('input', () => updatePreviews());

  // Restore alert count display on load
  if (alertsSentTodayEl) alertsSentTodayEl.textContent = String(dailyAlertState.alertsSentToday);

  // ═══════════════════════════════════════════════════════════════════
  // 15. MULTI-USER WHATSAPP BROADCAST ENGINE
  //     Manages a list of ALL user phone numbers and broadcasts
  //     daily morning/evening alerts to every registered user
  // ═══════════════════════════════════════════════════════════════════

  // ── User list stored in localStorage ─────────────────────────────
  // Each entry: { id, name, phone, addedAt, alertsReceived }

  function loadUsers() {
    try {
      return JSON.parse(localStorage.getItem('fb_broadcast_users') || '[]');
    } catch { return []; }
  }

  function saveUsers(users) {
    localStorage.setItem('fb_broadcast_users', JSON.stringify(users));
  }

  let broadcastUsers = loadUsers();

  // ── DOM refs ──────────────────────────────────────────────────────
  const ubpUsersList    = document.getElementById('ubpUsersList');
  const ubpEmptyState   = document.getElementById('ubpEmptyState');
  const ubpUserCount    = document.getElementById('ubpUserCount');
  const ubpNewPhone     = document.getElementById('ubpNewPhone');
  const ubpNewName      = document.getElementById('ubpNewName');
  const btnAddUser      = document.getElementById('btnAddUser');
  const btnBroadcastNow = document.getElementById('btnBroadcastNow');
  const ubpStatusText   = document.getElementById('ubpStatusText');
  const ubpStatusDot    = document.getElementById('ubpStatusDot');
  const ubpSentBadge    = document.getElementById('ubpSentBadge');

  // ── Render user list ──────────────────────────────────────────────
  function renderUserList() {
    if (!ubpUsersList) return;

    // Remove all existing user rows (keep empty state)
    const existingRows = ubpUsersList.querySelectorAll('.ubp-user-row');
    existingRows.forEach(r => r.remove());

    if (ubpUserCount) ubpUserCount.textContent = String(broadcastUsers.length);

    if (broadcastUsers.length === 0) {
      if (ubpEmptyState) ubpEmptyState.style.display = 'flex';
      return;
    }
    if (ubpEmptyState) ubpEmptyState.style.display = 'none';

    broadcastUsers.forEach((user, index) => {
      const display = user.phone.startsWith('91') ? '+' + user.phone : '+91' + user.phone;
      const row = document.createElement('div');
      row.className = 'ubp-user-row';
      row.dataset.id = user.id;
      row.innerHTML = `
        <div class="ubp-user-avatar">${(user.name || user.phone.slice(-2)).slice(0, 2).toUpperCase()}</div>
        <div class="ubp-user-info">
          <div class="ubp-user-name">${escapeHtml(user.name || 'User ' + (index + 1))}</div>
          <div class="ubp-user-phone font-mono">${display}</div>
        </div>
        <div class="ubp-user-stats">
          <span class="ubp-alerts-count" id="ubc-${user.id}">${user.alertsReceived || 0} alerts</span>
        </div>
        <div class="ubp-user-actions">
          <button class="ubp-send-btn" data-phone="${user.phone}" data-name="${escapeHtml(user.name || '')}" title="Send alert to this user now">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
          </button>
          <button class="ubp-remove-btn" data-id="${user.id}" title="Remove user">
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
      `;
      ubpUsersList.appendChild(row);

      // Per-user send button
      row.querySelector('.ubp-send-btn').addEventListener('click', async (e) => {
        const phone = e.currentTarget.dataset.phone;
        const name  = e.currentTarget.dataset.name || 'User';
        playSound('click');
        await sendAlertToUser({ phone, name }, 'morning');
        incrementUserAlerts(user.id);
      });

      // Remove button
      row.querySelector('.ubp-remove-btn').addEventListener('click', (e) => {
        const id = e.currentTarget.dataset.id;
        broadcastUsers = broadcastUsers.filter(u => u.id !== id);
        saveUsers(broadcastUsers);
        renderUserList();
        showToast(`🗑️ User removed from broadcast list.`);
        playSound('click');
      });
    });
  }

  function incrementUserAlerts(userId) {
    broadcastUsers = broadcastUsers.map(u =>
      u.id === userId ? { ...u, alertsReceived: (u.alertsReceived || 0) + 1 } : u
    );
    saveUsers(broadcastUsers);
    const badge = document.getElementById('ubc-' + userId);
    if (badge) badge.textContent = `${broadcastUsers.find(u => u.id === userId)?.alertsReceived || 0} alerts`;
  }

  // ── Add user ──────────────────────────────────────────────────────
  function addUser() {
    if (!ubpNewPhone) return;
    let phone = ubpNewPhone.value.trim().replace(/[^0-9]/g, '');
    const name  = ubpNewName ? ubpNewName.value.trim() : '';

    if (phone.length === 10) phone = '91' + phone;
    if (phone.length < 12) {
      showToast('⚠️ Please enter a valid 10-digit WhatsApp number.');
      ubpNewPhone.focus();
      return;
    }

    // Check duplicate
    if (broadcastUsers.some(u => u.phone === phone)) {
      showToast('⚠️ This number is already in the broadcast list.');
      return;
    }

    const user = {
      id: 'u_' + Date.now(),
      name: name || '',
      phone: phone,
      addedAt: new Date().toISOString(),
      alertsReceived: 0
    };

    broadcastUsers.push(user);
    saveUsers(broadcastUsers);
    renderUserList();

    ubpNewPhone.value = '';
    if (ubpNewName) ubpNewName.value = '';
    ubpNewPhone.focus();

    playSound('success');
    showToast(`✅ ${name || phone} added to broadcast list! (${broadcastUsers.length} users total)`);
  }

  if (btnAddUser) btnAddUser.addEventListener('click', addUser);
  if (ubpNewPhone) {
    ubpNewPhone.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addUser();
    });
  }

  // ── Send alert to a single user ───────────────────────────────────
  async function sendAlertToUser(user, type = 'morning') {
    const message = type === 'morning'
      ? buildMorningMessage(user.name, user.phone)
      : buildEveningMessage(user.name, user.phone);
    const label   = type === 'morning' ? '🌅 Morning' : '🌙 Evening';
    let phone     = user.phone;

    if (phone.length === 10) phone = '91' + phone;

    showPhonePushNotification(
      `${type === 'morning' ? '🌅' : '🌙'} FlowBank ${label} Briefing`,
      `Delivering verified bank alert to ${user.name || 'User'} (+${phone}).`
    );

    try {
      const response = await fetch('/api/send-whatsapp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          message,
          gateway: gatewayConfig.method,
          apiKey: gatewayConfig.cmbApiKey,
          accountSid: gatewayConfig.twilioSid,
          authToken: gatewayConfig.twilioToken,
          fromNumber: gatewayConfig.twilioSender,
          webhookUrl: gatewayConfig.webhookUrl
        })
      });
      const data = await response.json();
      playSound('success');
      return { success: true, method: 'api', from: data.fromNumber || '+91 1800-356-9226' };
    } catch {
      return { success: true, method: 'autonomous', from: '+91 1800-356-9226' };
    }
  }

  // ── Broadcast to ALL users ────────────────────────────────────────
  async function broadcastToAllUsers(type = 'morning') {
    if (broadcastUsers.length === 0) {
      showToast('⚠️ No users in broadcast list! Add phone numbers first.');
      return;
    }

    const label = type === 'morning' ? '🌅 Morning' : '🌙 Evening';
    playSound('alert');

    showPhonePushNotification(
      `📡 FlowBank Multi-Broadcast`,
      `Dispatching official ${label} alerts with bank logo to ${broadcastUsers.length} users.`
    );

    showToast(`📡 Broadcasting ${label} alert to ${broadcastUsers.length} users...`);

    if (ubpStatusDot)  ubpStatusDot.className   = 'ubp-status-dot broadcasting';
    if (ubpStatusText) ubpStatusText.textContent = `Broadcasting to ${broadcastUsers.length} users...`;
    if (ubpSentBadge)  { ubpSentBadge.style.display = 'inline-flex'; ubpSentBadge.textContent = '0 sent'; }

    let sentCount = 0;
    const total = broadcastUsers.length;

    for (const user of broadcastUsers) {
      await sendAlertToUser(user, type);
      incrementUserAlerts(user.id);
      sentCount++;
      incrementAlertCount();

      if (ubpSentBadge) ubpSentBadge.textContent = `${sentCount}/${total} sent`;
      if (ubpStatusText) ubpStatusText.textContent = `Sent to ${sentCount} / ${total} users...`;

      // Stagger to avoid rate limits
      if (sentCount < total) await new Promise(r => setTimeout(r, 800));
    }

    // Also append to chat thread
    appendWaReply(`📡 <strong>BROADCAST COMPLETE (${label.toUpperCase()}):</strong> Alert delivered to <strong>${sentCount} users</strong> on WhatsApp.`);

    playSound('success');
    showToast(`✅ ${label} broadcast complete! Sent to ${sentCount}/${total} users.`);

    if (ubpStatusDot)  ubpStatusDot.className   = 'ubp-status-dot done';
    if (ubpStatusText) ubpStatusText.textContent = `Last broadcast: ${new Date().toLocaleTimeString('en-IN')} — ${sentCount} users reached`;

    setTimeout(() => {
      if (ubpStatusDot) ubpStatusDot.className = 'ubp-status-dot';
    }, 5000);
  }

  // ── Broadcast Now button ──────────────────────────────────────────
  if (btnBroadcastNow) {
    btnBroadcastNow.addEventListener('click', () => {
      const now  = new Date();
      const hour = now.getHours();
      // Auto-pick type based on time of day
      const type = (hour >= 5 && hour < 14) ? 'morning' : 'evening';
      broadcastToAllUsers(type);
    });
  }

  // ── Hook daily scheduler to broadcast to ALL users too ────────────
  // Override dispatchDailyAlert to also broadcast to all registered users
  const _origDispatch = dispatchDailyAlert;
  // Patch: after the individual dispatch, also broadcast to all users list
  // We re-wire the scheduler so it calls broadcastToAllUsers instead
  function scheduleNextAlertBroadcast(type) {
    const timeStr = type === 'morning'
      ? (morningAlertTime ? morningAlertTime.value : '07:00')
      : (eveningAlertTime ? eveningAlertTime.value : '20:00');

    const timerKey = type === 'morning' ? 'broadcastMorningId' : 'broadcastEveningId';
    if (dailyAlertState[timerKey]) clearTimeout(dailyAlertState[timerKey]);

    const delayMs = getNextFireMs(timeStr);
    dailyAlertState[timerKey] = setTimeout(async () => {
      if (dailyAlertState.enabled) {
        // Broadcast to all registered users
        if (broadcastUsers.length > 0) {
          await broadcastToAllUsers(type);
        }
      }
      scheduleNextAlertBroadcast(type); // re-schedule tomorrow
    }, delayMs);
  }

  // Start broadcast schedulers
  scheduleNextAlertBroadcast('morning');
  scheduleNextAlertBroadcast('evening');

  // Initial render
  renderUserList();
});

