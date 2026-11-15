/**
 * ScoreAR Firebase Environment Configuration (firebase-config.js)
 * Phase B0: Decoupled Environment Management & Hostname Resolution
 *
 * Hostname Resolution:
 *   - scorear2.web.app & scorear2.firebaseapp.com -> 'production' (scorear2)
 *   - localhost, 127.0.0.1, [::1] -> 'staging' (scorear-staging-test / Emulator)
 *   - Any other hostname -> 'staging'
 *
 * Override Restrictions:
 *   - URL parameter (?env=) and localStorage ('scorear_env') are strictly honored
 *     on localhost/127.0.0.1 ONLY, and completely ignored on live domains.
 *
 * Strictly Rule 7 Compliant (<500 lines).
 */
(function (global) {
  'use strict';

  const FIREBASE_ENV_CONFIGS = {
        // 1. Production Project (scorear1)
    production: {
      projectId: 'scorear1',
      apiKey: 'AIzaSyC2nEpjVu8SA1EY0iL0AflHIDXX5jyTUpQ',
      authDomain: 'scorear1.firebaseapp.com',
      databaseURL: 'https://scorear1-default-rtdb.europe-west1.firebasedatabase.app',
      storageBucket: 'scorear1.firebasestorage.app',
      messagingSenderId: '404118307817',
      appId: '1:404118307817:web:88bfaa906c3356e1c8c178',
      isProduction: true,
      label: 'الإنتاج (scorear1)'
    },

    // 2. Staging / Test Project (scorear-staging-test)
    // Values: Temporary placeholder config for testing and local emulator
    staging: {
      projectId: 'scorear-staging-test',
      apiKey: 'AIzaSyStagingTestDummyKeyForIsolatedTesting987',
      authDomain: 'scorear-staging-test.firebaseapp.com',
      databaseURL: 'https://scorear-staging-test-default-rtdb.europe-west1.firebasedatabase.app',
      storageBucket: 'scorear-staging-test.firebasestorage.app',
      messagingSenderId: '100000000000',
      appId: '1:100000000000:web:stagingtestdummykey',
      isProduction: false,
      label: 'التجريبي (scorear-staging-test)'
    }
  };

  // 1. Resolve Hostname
  let hostname = '';
  try {
    if (typeof window !== 'undefined' && window.location && window.location.hostname) {
      hostname = window.location.hostname.toLowerCase();
    }
  } catch (e) {
    hostname = '';
  }

  const isLocalhost = Boolean(
    hostname === 'localhost' ||
    hostname === '127.0.0.1' ||
    hostname === '[::1]' ||
    hostname === ''
  );

  const isLiveProductionHost = Boolean(
    hostname === 'scorear1.web.app' ||
    hostname === 'scorear1.firebaseapp.com' ||
    hostname === 'scorear2.web.app' ||
    hostname === 'scorear2.firebaseapp.com' ||
    hostname.endsWith('.vercel.app') ||
    hostname === 'scorear.vercel.app'
  );

  // 2. Determine Base Environment by Hostname
  let activeEnvKey = 'staging';
  if (isLiveProductionHost) {
    activeEnvKey = 'production';
  } else {
    // localhost, 127.0.0.1, or any other domain defaults to staging
    activeEnvKey = 'staging';
  }

  // 3. Localhost-Only Override: ?env= and localStorage
  if (isLocalhost) {
    try {
      if (typeof window !== 'undefined' && window.location && window.location.search) {
        const urlParam = new URLSearchParams(window.location.search).get('env');
        if (urlParam === 'production' || urlParam === 'prod') {
          activeEnvKey = 'production';
        } else if (urlParam === 'staging' || urlParam === 'test') {
          activeEnvKey = 'staging';
        }
      }
      if (activeEnvKey === 'staging' && typeof localStorage !== 'undefined') {
        const stored = localStorage.getItem('scorear_env');
        if (stored === 'production' || stored === 'staging') {
          activeEnvKey = stored;
        }
      }
    } catch (e) {}
  }

  const activeConfig = FIREBASE_ENV_CONFIGS[activeEnvKey] || FIREBASE_ENV_CONFIGS.staging;

  // 4. Safe Firebase App Initialization
  if (typeof window !== 'undefined' && window.firebase && !window.firebase.apps.length) {
    try {
      window.firebase.initializeApp(activeConfig);
      console.log(`[ScoreAR Firebase] تم تهيئة بيئة: ${activeConfig.label} (Project: ${activeConfig.projectId})`);

      if (isLocalhost && window.SCOREAR_CONNECT_EMULATOR && window.firebase.database) {
        try {
          window.firebase.database().useEmulator('127.0.0.1', 9000);
          console.log('[ScoreAR Firebase] متصل بمحاكي Realtime Database المحلي (127.0.0.1:9000)');
        } catch (emErr) {
          console.warn('[ScoreAR Firebase] تحذير الاتصال بالمحاكي:', emErr);
        }
      }
    } catch (err) {
      console.error('[ScoreAR Firebase] خطأ تهيئة التطبيق:', err);
    }
  }

  function setEnvironment(envKey) {
    if (!isLocalhost) {
      console.warn('[ScoreAR Firebase] تم تجاهل محاولة تبديل البيئة: التبديل عبر الكود/التخزين مسموح على localhost فقط.');
      return false;
    }
    if (!FIREBASE_ENV_CONFIGS[envKey]) {
      console.error(`[ScoreAR Firebase] بيئة غير صالحة: ${envKey}. الخيارات: 'staging' | 'production'`);
      return false;
    }
    try {
      localStorage.setItem('scorear_env', envKey);
      activeEnvKey = envKey;
      console.log(`[ScoreAR Firebase] تم تحويل البيئة محلياً إلى: ${FIREBASE_ENV_CONFIGS[envKey].label}`);
      return true;
    } catch (e) {
      return false;
    }
  }

  const Api = {
    getActiveEnv: () => activeEnvKey,
    isProduction: () => activeEnvKey === 'production',
    isLocalhost: () => isLocalhost,
    getActiveConfig: () => ({ ...(FIREBASE_ENV_CONFIGS[activeEnvKey] || FIREBASE_ENV_CONFIGS.staging) }),
    getConfig: (envKey) => (envKey ? { ...FIREBASE_ENV_CONFIGS[envKey] } : { ...activeConfig }),
    setEnvironment,
    CONFIGS: FIREBASE_ENV_CONFIGS
  };

  global.ScoreARFirebaseConfig = Api;

})(typeof window !== 'undefined' ? window : this);
