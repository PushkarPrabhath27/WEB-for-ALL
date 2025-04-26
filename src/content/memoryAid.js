/**
 * Memory Aid Module
 *
 * Provides features to help users maintain context and track progress
 * while reading or navigating content. Includes bookmarking, progress
 * tracking, and contextual reminders.
 */

// Memory aid configuration
const memoryConfig = {
  enabled: false,
  autoBookmark: true,
  progressTracking: true,
  contextualHints: true,
  reminderInterval: 5 * 60 * 1000, // 5 minutes
  maxBookmarks: 50
};

// Memory state management
const memoryState = {
  currentPosition: null,
  bookmarks: new Map(),
  readingProgress: new Map(),
  lastActivity: Date.now(),
  contextHints: new Map(),
  reminderTimer: null
};

/**
 * Initialize memory aid system
 * @param {Object} config - Configuration options
 */
export function initializeMemoryAid(config = {}) {
  updateConfig(config);
  setupMemoryTracking();
  
  if (memoryConfig.progressTracking) {
    initializeProgressTracking();
  }
  
  if (memoryConfig.contextualHints) {
    setupContextualHints();
  }
}

/**
 * Update memory aid configuration
 * @param {Object} config - New configuration options
 */
function updateConfig(config) {
  memoryConfig.enabled = config.enabled ?? memoryConfig.enabled;
  memoryConfig.autoBookmark = config.autoBookmark ?? memoryConfig.autoBookmark;
  memoryConfig.progressTracking = config.progressTracking ?? memoryConfig.progressTracking;
  memoryConfig.contextualHints = config.contextualHints ?? memoryConfig.contextualHints;
  memoryConfig.reminderInterval = config.reminderInterval ?? memoryConfig.reminderInterval;
  memoryConfig.maxBookmarks = config.maxBookmarks ?? memoryConfig.maxBookmarks;
}

/**
 * Set up memory tracking system
 */
function setupMemoryTracking() {
  // Track scroll position
  window.addEventListener('scroll', handleScroll);
  
  // Track user activity
  document.addEventListener('click', updateActivity);
  document.addEventListener('keydown', updateActivity);
  
  // Set up auto-bookmarking
  if (memoryConfig.autoBookmark) {
    setupAutoBookmark();
  }
}

/**
 * Handle scroll events
 * @param {Event} event - Scroll event
 */
function handleScroll(event) {
  if (!memoryConfig.enabled) return;
  
  // Update current position
  memoryState.currentPosition = {
    x: window.scrollX,
    y: window.scrollY,
    timestamp: Date.now()
  };
  
  // Update reading progress
  if (memoryConfig.progressTracking) {
    updateReadingProgress();
  }
}

/**
 * Update user activity timestamp
 */
function updateActivity() {
  memoryState.lastActivity = Date.now();
}

/**
 * Set up automatic bookmarking
 */
function setupAutoBookmark() {
  // Create bookmark on significant pauses
  let scrollTimeout;
  
  window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      const currentY = window.scrollY;
      const viewportHeight = window.innerHeight;
      const pageHeight = document.documentElement.scrollHeight;
      
      // Create bookmark if we're at a significant point
      if (currentY > viewportHeight && currentY < pageHeight - viewportHeight) {
        createAutoBookmark();
      }
    }, 2000); // Wait 2 seconds after scrolling stops
  });
}

/**
 * Create automatic bookmark at current position
 */
function createAutoBookmark() {
  if (memoryState.bookmarks.size >= memoryConfig.maxBookmarks) {
    // Remove oldest bookmark
    const oldestKey = Array.from(memoryState.bookmarks.keys())[0];
    memoryState.bookmarks.delete(oldestKey);
  }
  
  const bookmark = {
    position: { ...memoryState.currentPosition },
    context: captureContext(),
    auto: true
  };
  
  const key = `bookmark_${Date.now()}`;
  memoryState.bookmarks.set(key, bookmark);
}

/**
 * Initialize progress tracking
 */
function initializeProgressTracking() {
  // Create progress indicator
  const progressBar = document.createElement('div');
  progressBar.id = 'reading-progress-bar';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 0%;
    height: 3px;
    background: #4CAF50;
    transition: width 0.3s;
    z-index: 999999;
  `;
  document.body.appendChild(progressBar);
}

/**
 * Update reading progress
 */
function updateReadingProgress() {
  const scrollPosition = window.scrollY;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  // Calculate progress percentage
  const progress = (scrollPosition / (documentHeight - windowHeight)) * 100;
  
  // Update progress bar
  const progressBar = document.getElementById('reading-progress-bar');
  if (progressBar) {
    progressBar.style.width = `${Math.min(100, progress)}%`;
  }
  
  // Store progress for current page
  const url = window.location.href;
  memoryState.readingProgress.set(url, progress);
}

/**
 * Set up contextual hints system
 */
function setupContextualHints() {
  // Create hints container
  const hintsContainer = document.createElement('div');
  hintsContainer.id = 'contextual-hints';
  hintsContainer.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    max-width: 300px;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    padding: 10px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    display: none;
    z-index: 999999;
  `;
  document.body.appendChild(hintsContainer);
  
  // Set up periodic reminders
  setupReminders();
}

/**
 * Set up periodic reminders
 */
function setupReminders() {
  memoryState.reminderTimer = setInterval(() => {
    const timeSinceActivity = Date.now() - memoryState.lastActivity;
    
    if (timeSinceActivity > memoryConfig.reminderInterval) {
      showContextReminder();
    }
  }, memoryConfig.reminderInterval);
}

/**
 * Show context reminder
 */
function showContextReminder() {
  const hintsContainer = document.getElementById('contextual-hints');
  if (!hintsContainer) return;
  
  const context = captureContext();
  hintsContainer.textContent = `You were reading about: ${context.summary}`;
  hintsContainer.style.display = 'block';
  
  // Hide after 10 seconds
  setTimeout(() => {
    hintsContainer.style.display = 'none';
  }, 10000);
}

/**
 * Capture current reading context
 * @returns {Object} Context information
 */
function captureContext() {
  const selection = window.getSelection();
  const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
  
  let context = {
    url: window.location.href,
    title: document.title,
    timestamp: Date.now(),
    summary: ''
  };
  
  if (range) {
    // Get surrounding text for context
    const container = range.commonAncestorContainer;
    if (container.nodeType === Node.TEXT_NODE) {
      context.summary = container.textContent.trim().substring(0, 100) + '...';
    }
  }
  
  return context;
}

/**
 * Create manual bookmark
 * @param {string} name - Bookmark name
 * @param {string} notes - Optional notes
 */
export function createBookmark(name, notes = '') {
  if (!memoryConfig.enabled) return;
  
  const bookmark = {
    position: { ...memoryState.currentPosition },
    context: captureContext(),
    name,
    notes,
    auto: false
  };
  
  const key = `bookmark_${Date.now()}`;
  memoryState.bookmarks.set(key, bookmark);
}

/**
 * Navigate to bookmark
 * @param {string} key - Bookmark key
 */
export function navigateToBookmark(key) {
  const bookmark = memoryState.bookmarks.get(key);
  if (bookmark && bookmark.position) {
    window.scrollTo({
      left: bookmark.position.x,
      top: bookmark.position.y,
      behavior: 'smooth'
    });
  }
}

/**
 * Get all bookmarks
 * @returns {Array} Array of bookmarks
 */
export function getBookmarks() {
  return Array.from(memoryState.bookmarks.entries()).map(([key, bookmark]) => ({
    key,
    ...bookmark
  }));
}

/**
 * Get reading progress for current page
 * @returns {number} Progress percentage
 */
export function getReadingProgress() {
  const url = window.location.href;
  return memoryState.readingProgress.get(url) || 0;
}

/**
 * Clean up memory aid system
 */
export function cleanupMemoryAid() {
  // Remove event listeners
  window.removeEventListener('scroll', handleScroll);
  document.removeEventListener('click', updateActivity);
  document.removeEventListener('keydown', updateActivity);
  
  // Clear reminder timer
  if (memoryState.reminderTimer) {
    clearInterval(memoryState.reminderTimer);
  }
  
  // Remove UI elements
  const progressBar = document.getElementById('reading-progress-bar');
  if (progressBar) {
    progressBar.remove();
  }
  
  const hintsContainer = document.getElementById('contextual-hints');
  if (hintsContainer) {
    hintsContainer.remove();
  }
  
  // Clear states
  memoryState.bookmarks.clear();
  memoryState.readingProgress.clear();
  memoryState.contextHints.clear();
}