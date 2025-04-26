import { fireEvent } from '@testing-library/dom';
import { initializeMemoryAid, createBookmark, navigateToBookmark, getBookmarks, getReadingProgress, cleanupMemoryAid } from '../src/content/memoryAid';

describe('Memory Aid Module', () => {
  beforeEach(() => {
    // Setup DOM elements
    document.body.innerHTML = `
      <div id="test-content" style="height: 1000px; overflow: auto;">
        <p>Test content for scrolling and bookmarking</p>
      </div>
    `;
    
    // Reset window scroll position
    window.scrollTo(0, 0);
  });

  afterEach(() => {
    cleanupMemoryAid();
    document.body.innerHTML = '';
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    test('Progress bar meets WCAG requirements', async () => {
      initializeMemoryAid({ progressTracking: true });
      const progressBar = document.getElementById('reading-progress-bar');
      await testAccessibility(progressBar);
    });

    test('Contextual hints are screen reader friendly', async () => {
      initializeMemoryAid({ contextualHints: true });
      const hintsContainer = document.getElementById('contextual-hints');
      expect(hintsContainer).toHaveAttribute('role', 'alert');
      await testAccessibility(hintsContainer);
    });

    test('Keyboard navigation for bookmarks', () => {
      initializeMemoryAid({ enabled: true });
      createBookmark('Test Bookmark');
      const bookmarkElements = document.querySelectorAll('[data-testid="bookmark"]');
      expect(bookmarkElements[0]).toHaveFocus();
    });
  });

  // Performance Tests
  describe('Performance', () => {
    test('Scroll event handling performance', async () => {
      initializeMemoryAid({ enabled: true });
      
      const scrollPerformance = await measurePerformance(() => {
        window.scrollTo(0, 500);
        fireEvent.scroll(window);
      });

      expect(scrollPerformance.average).toBeLessThan(16); // Target: 60fps (16ms)
    });

    test('Memory usage during extended usage', () => {
      initializeMemoryAid({ enabled: true, autoBookmark: true });
      
      // Create multiple bookmarks
      for (let i = 0; i < 50; i++) {
        createBookmark(`Bookmark ${i}`);
      }

      const memoryUsage = getMemoryUsage();
      if (memoryUsage) {
        expect(memoryUsage.usedJSHeapSize).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
      }
    });

    test('Bookmark creation and retrieval performance', async () => {
      initializeMemoryAid({ enabled: true });
      
      const bookmarkPerformance = await measurePerformance(() => {
        createBookmark('Performance Test');
        return getBookmarks();
      });

      expect(bookmarkPerformance.average).toBeLessThan(5); // Less than 5ms
    });
  });

  // Browser Compatibility Tests
  describe('Browser Compatibility', () => {
    test('Progress tracking works across browsers', () => {
      initializeMemoryAid({ progressTracking: true });
      window.scrollTo(0, 500);
      fireEvent.scroll(window);

      const progress = getReadingProgress();
      const browserInfo = checkBrowserCompatibility();

      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThan(100);

      // Log browser-specific behavior
      console.log(`Progress tracking test on ${browserInfo.version}:`, {
        browser: browserInfo,
        progress
      });
    });

    test('Bookmark persistence across browser sessions', () => {
      initializeMemoryAid({ enabled: true });
      createBookmark('Cross-browser Test');

      const bookmarks = getBookmarks();
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].name).toBe('Cross-browser Test');

      // Verify storage API usage
      expect(chrome.storage.sync.set).toHaveBeenCalled();
    });

    test('UI elements render correctly across browsers', () => {
      initializeMemoryAid({ progressTracking: true, contextualHints: true });

      const progressBar = document.getElementById('reading-progress-bar');
      const hintsContainer = document.getElementById('contextual-hints');

      expect(progressBar).toBeInTheDocument();
      expect(hintsContainer).toBeInTheDocument();

      // Verify computed styles
      const progressBarStyles = window.getComputedStyle(progressBar);
      const hintsContainerStyles = window.getComputedStyle(hintsContainer);

      expect(progressBarStyles.position).toBe('fixed');
      expect(hintsContainerStyles.position).toBe('fixed');
    });
  });

  // Functional Tests
  describe('Core Functionality', () => {
    test('Automatic bookmarking on scroll pause', (done) => {
      initializeMemoryAid({ enabled: true, autoBookmark: true });
      
      window.scrollTo(0, 500);
      fireEvent.scroll(window);

      setTimeout(() => {
        const bookmarks = getBookmarks();
        expect(bookmarks.length).toBeGreaterThan(0);
        expect(bookmarks[0].auto).toBe(true);
        done();
      }, 2500);
    });

    test('Manual bookmark creation and navigation', () => {
      initializeMemoryAid({ enabled: true });
      
      createBookmark('Test Position', 'Test Notes');
      const bookmarks = getBookmarks();
      
      expect(bookmarks).toHaveLength(1);
      expect(bookmarks[0].name).toBe('Test Position');
      expect(bookmarks[0].notes).toBe('Test Notes');

      navigateToBookmark(bookmarks[0].key);
      expect(window.scrollY).toBe(bookmarks[0].position.y);
    });

    test('Progress tracking accuracy', () => {
      initializeMemoryAid({ progressTracking: true });
      
      // Scroll to middle of page
      const scrollHeight = document.documentElement.scrollHeight;
      window.scrollTo(0, scrollHeight / 2);
      fireEvent.scroll(window);

      const progress = getReadingProgress();
      expect(progress).toBeCloseTo(50, 5); // Within 5% of 50%
    });
  });
}));