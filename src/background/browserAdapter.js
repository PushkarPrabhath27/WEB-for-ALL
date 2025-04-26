/**
 * Browser Adapter for cross-browser compatibility
 */

class BrowserAdapter {
  constructor() {
    this.browser = this.detectBrowser();
    this.features = this.detectFeatures();
    this.apis = this.initializeAPIs();
    this.setupErrorHandling();
  }

  /**
   * Detect current browser environment
   * @returns {Object} Browser information
   */
  detectBrowser() {
    const userAgent = navigator.userAgent;
    let browserInfo = {
      name: '',
      version: '',
      engine: '',
      features: {}
    };

    // Detect Chrome
    if (userAgent.indexOf('Chrome') > -1 && userAgent.indexOf('Edg') === -1) {
      browserInfo.name = 'chrome';
      browserInfo.engine = 'blink';
      browserInfo.version = userAgent.match(/Chrome\/(\d+\.\d+)/)?.[1] || '';
    }
    // Detect Firefox
    else if (userAgent.indexOf('Firefox') > -1) {
      browserInfo.name = 'firefox';
      browserInfo.engine = 'gecko';
      browserInfo.version = userAgent.match(/Firefox\/(\d+\.\d+)/)?.[1] || '';
    }
    // Detect Safari
    else if (userAgent.indexOf('Safari') > -1 && userAgent.indexOf('Chrome') === -1) {
      browserInfo.name = 'safari';
      browserInfo.engine = 'webkit';
      browserInfo.version = userAgent.match(/Version\/(\d+\.\d+)/)?.[1] || '';
    }
    // Detect Edge
    else if (userAgent.indexOf('Edg') > -1) {
      browserInfo.name = 'edge';
      browserInfo.engine = 'blink';
      browserInfo.version = userAgent.match(/Edg\/(\d+\.\d+)/)?.[1] || '';
    }

    return browserInfo;
  }

  /**
   * Initialize browser-specific APIs
   * @returns {Object} Normalized browser APIs
   */
  /**
   * Detect browser-specific features and capabilities
   * @returns {Object} Available features
   */
  detectFeatures() {
    return {
      storage: {
        sync: typeof chrome?.storage?.sync !== 'undefined' || typeof browser?.storage?.sync !== 'undefined',
        local: typeof chrome?.storage?.local !== 'undefined' || typeof browser?.storage?.local !== 'undefined',
        managed: typeof chrome?.storage?.managed !== 'undefined' || typeof browser?.storage?.managed !== 'undefined'
      },
      notifications: {
        basic: typeof chrome?.notifications !== 'undefined' || typeof browser?.notifications !== 'undefined',
        rich: typeof chrome?.notifications?.create !== 'undefined' || typeof browser?.notifications?.create !== 'undefined'
      },
      contextMenus: typeof chrome?.contextMenus !== 'undefined' || typeof browser?.contextMenus !== 'undefined',
      commands: typeof chrome?.commands !== 'undefined' || typeof browser?.commands !== 'undefined',
      webRequest: typeof chrome?.webRequest !== 'undefined' || typeof browser?.webRequest !== 'undefined'
    };
  }

  /**
   * Setup global error handling for browser APIs
   */
  setupErrorHandling() {
    window.addEventListener('error', (event) => {
      if (event.error?.message?.includes('browser') || event.error?.message?.includes('chrome')) {
        console.error('Browser API Error:', event.error);
        // Attempt recovery or fallback
        this.handleAPIError(event.error);
      }
    });
  }

  /**
   * Handle browser API errors
   * @param {Error} error - The error to handle
   */
  handleAPIError(error) {
    // Log error for tracking
    console.error('API Error:', error);

    // Attempt to reinitialize failed APIs
    if (error.message.includes('storage')) {
      this.apis.storage = this.initializeStorageAPI();
    } else if (error.message.includes('runtime')) {
      this.apis.runtime = this.initializeRuntimeAPI();
    }
  }

  initializeAPIs() {
    const apis = {
      storage: this.initializeStorageAPI(),
      runtime: this.initializeRuntimeAPI(),
      tabs: this.initializeTabsAPI(),
      contextMenus: this.initializeContextMenusAPI(),
      notifications: this.initializeNotificationsAPI()
    };

    return apis;
  }

  /**
   * Initialize notifications API
   * @returns {Object} Normalized notifications API
   */
  initializeNotificationsAPI() {
    const browserAPI = this.getBrowserAPI();
    return {
      create: async (notificationId, options) => {
        try {
          return await browserAPI.notifications.create(notificationId, options);
        } catch (error) {
          console.error('Notifications create error:', error);
          throw error;
        }
      },
      clear: async (notificationId) => {
        try {
          return await browserAPI.notifications.clear(notificationId);
        } catch (error) {
          console.error('Notifications clear error:', error);
          throw error;
        }
      },
      getAll: async () => {
        try {
          return await browserAPI.notifications.getAll();
        } catch (error) {
          console.error('Notifications getAll error:', error);
          throw error;
        }
      },
      onClicked: {
        addListener: (callback) => {
          browserAPI.notifications.onClicked.addListener(callback);
        },
        removeListener: (callback) => {
          browserAPI.notifications.onClicked.removeListener(callback);
        }
      }
    };
  }

  /**
   * Initialize storage API
   * @returns {Object} Normalized storage API
   */
  initializeStorageAPI() {
    const browserAPI = this.getBrowserAPI();
    return {
      get: async (keys) => {
        try {
          return await browserAPI.storage.local.get(keys);
        } catch (error) {
          console.error('Storage get error:', error);
          throw error;
        }
      },
      set: async (items) => {
        try {
          return await browserAPI.storage.local.set(items);
        } catch (error) {
          console.error('Storage set error:', error);
          throw error;
        }
      },
      remove: async (keys) => {
        try {
          return await browserAPI.storage.local.remove(keys);
        } catch (error) {
          console.error('Storage remove error:', error);
          throw error;
        }
      },
      clear: async () => {
        try {
          return await browserAPI.storage.local.clear();
        } catch (error) {
          console.error('Storage clear error:', error);
          throw error;
        }
      }
    };
  }

  /**
   * Initialize runtime API
   * @returns {Object} Normalized runtime API
   */
  initializeRuntimeAPI() {
    const browserAPI = this.getBrowserAPI();
    return {
      sendMessage: async (message) => {
        try {
          return await browserAPI.runtime.sendMessage(message);
        } catch (error) {
          console.error('Runtime sendMessage error:', error);
          throw error;
        }
      },
      onMessage: {
        addListener: (callback) => {
          browserAPI.runtime.onMessage.addListener(callback);
        },
        removeListener: (callback) => {
          browserAPI.runtime.onMessage.removeListener(callback);
        }
      }
    };
  }

  /**
   * Initialize tabs API
   * @returns {Object} Normalized tabs API
   */
  initializeTabsAPI() {
    const browserAPI = this.getBrowserAPI();
    return {
      query: async (queryInfo) => {
        try {
          return await browserAPI.tabs.query(queryInfo);
        } catch (error) {
          console.error('Tabs query error:', error);
          throw error;
        }
      },
      sendMessage: async (tabId, message) => {
        try {
          return await browserAPI.tabs.sendMessage(tabId, message);
        } catch (error) {
          console.error('Tabs sendMessage error:', error);
          throw error;
        }
      },
      onUpdated: {
        addListener: (callback) => {
          browserAPI.tabs.onUpdated.addListener(callback);
        },
        removeListener: (callback) => {
          browserAPI.tabs.onUpdated.removeListener(callback);
        }
      }
    };
  }

  /**
   * Initialize context menus API
   * @returns {Object} Normalized context menus API
   */
  initializeContextMenusAPI() {
    const browserAPI = this.getBrowserAPI();
    return {
      create: async (createProperties) => {
        try {
          return await browserAPI.contextMenus.create(createProperties);
        } catch (error) {
          console.error('ContextMenus create error:', error);
          throw error;
        }
      },
      remove: async (menuItemId) => {
        try {
          return await browserAPI.contextMenus.remove(menuItemId);
        } catch (error) {
          console.error('ContextMenus remove error:', error);
          throw error;
        }
      },
      onClicked: {
        addListener: (callback) => {
          browserAPI.contextMenus.onClicked.addListener(callback);
        },
        removeListener: (callback) => {
          browserAPI.contextMenus.onClicked.removeListener(callback);
        }
      }
    };
  }

  /**
   * Get browser-specific API
   * @returns {Object} Browser API
   */
  getBrowserAPI() {
    return window.browser || window.chrome;
  }

  /**
   * Execute browser-specific code
   * @param {Object} implementations Browser-specific implementations
   * @returns {*} Result of browser-specific implementation
   */
  executeBrowserSpecific(implementations) {
    const browserName = this.browser.name;
    if (implementations[browserName]) {
      return implementations[browserName]();
    }
    return implementations.default?.();
  }

  /**
   * Check feature compatibility
   * @param {string} feature Feature to check
   * @returns {boolean} Whether feature is supported
   */
  isFeatureSupported(feature) {
    const compatibilityMap = {
      chrome: {
        webAccessibility: true,
        textToSpeech: true,
        biasDetection: true,
        intersectionalAnalysis: true,
        advancedNotifications: true,
        customContextMenus: true
      },
      firefox: {
        webAccessibility: true,
        textToSpeech: true,
        biasDetection: true,
        intersectionalAnalysis: true,
        advancedNotifications: true,
        customContextMenus: true
      },
      safari: {
        webAccessibility: true,
        textToSpeech: false,
        biasDetection: true,
        intersectionalAnalysis: false,
        advancedNotifications: false,
        customContextMenus: false
      },
      edge: {
        webAccessibility: true,
        textToSpeech: true,
        biasDetection: true,
        intersectionalAnalysis: true,
        advancedNotifications: true,
        customContextMenus: true
      }
    };

    return compatibilityMap[this.browser.name]?.[feature] ?? false;
  }

  /**
   * Get browser-specific styles
   * @returns {Object} Browser-specific CSS
   */
  getBrowserStyles() {
    const styles = {
      chrome: {
        scrollbar: {
          width: '8px',
          trackColor: '#f1f1f1',
          thumbColor: '#888'
        }
      },
      firefox: {
        scrollbar: {
          width: '10px',
          trackColor: '#f1f1f1',
          thumbColor: '#888'
        }
      },
      safari: {
        scrollbar: {
          width: '6px',
          trackColor: '#f1f1f1',
          thumbColor: '#888'
        }
      },
      edge: {
        scrollbar: {
          width: '8px',
          trackColor: '#f1f1f1',
          thumbColor: '#888'
        }
      }
    };

    return styles[this.browser.name] || styles.chrome;
  }
}

export const browserAdapter = new BrowserAdapter();