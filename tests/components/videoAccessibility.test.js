import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import VideoAccessibility from '../../src/content/videoAccessibility';

describe('VideoAccessibility Component', () => {
  let videoElement;

  beforeEach(() => {
    videoElement = document.createElement('video');
    document.body.appendChild(videoElement);
  });

  afterEach(() => {
    document.body.removeChild(videoElement);
  });

  // Accessibility Tests
  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<VideoAccessibility video={videoElement} />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels for controls', () => {
      render(<VideoAccessibility video={videoElement} />);
      expect(screen.getByRole('button', { name: /play/i })).toBeInTheDocument();
      expect(screen.getByRole('slider', { name: /volume/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /captions/i })).toBeInTheDocument();
    });

    it('should support keyboard navigation', () => {
      render(<VideoAccessibility video={videoElement} />);
      const controls = screen.getAllByRole('button');
      
      controls[0].focus();
      expect(document.activeElement).toBe(controls[0]);
      
      fireEvent.keyDown(controls[0], { key: 'Tab' });
      expect(document.activeElement).toBe(controls[1]);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should render controls efficiently', async () => {
      const { average } = await measurePerformance(() => {
        const { unmount } = render(<VideoAccessibility video={videoElement} />);
        unmount();
      });
      expect(average).toBeLessThan(50); // Should render in less than 50ms
    });

    it('should handle caption processing efficiently', async () => {
      render(<VideoAccessibility video={videoElement} />);
      const captionButton = screen.getByRole('button', { name: /captions/i });
      
      const { average } = await measurePerformance(() => {
        fireEvent.click(captionButton);
      }, 10);
      
      expect(average).toBeLessThan(20); // Caption toggle should be quick
    });

    it('should manage memory usage', () => {
      const memoryBefore = getMemoryUsage();
      const { unmount } = render(<VideoAccessibility video={videoElement} />);
      const memoryAfter = getMemoryUsage();
      unmount();
      
      if (memoryBefore && memoryAfter) {
        const memoryIncrease = memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize;
        expect(memoryIncrease).toBeLessThan(1000000); // Less than 1MB increase
      }
    });
  });

  // Functionality Tests
  describe('Functionality', () => {
    it('should toggle play/pause', () => {
      render(<VideoAccessibility video={videoElement} />);
      const playButton = screen.getByRole('button', { name: /play/i });
      
      fireEvent.click(playButton);
      expect(videoElement.play).toHaveBeenCalled();
      
      fireEvent.click(playButton);
      expect(videoElement.pause).toHaveBeenCalled();
    });

    it('should adjust volume', () => {
      render(<VideoAccessibility video={videoElement} />);
      const volumeSlider = screen.getByRole('slider', { name: /volume/i });
      
      fireEvent.change(volumeSlider, { target: { value: '0.5' } });
      expect(videoElement.volume).toBe(0.5);
    });

    it('should toggle captions', async () => {
      render(<VideoAccessibility video={videoElement} />);
      const captionButton = screen.getByRole('button', { name: /captions/i });
      
      fireEvent.click(captionButton);
      await waitFor(() => {
        const track = videoElement.querySelector('track[kind="captions"]');
        expect(track).toBeInTheDocument();
      });
    });

    it('should handle playback speed changes', () => {
      render(<VideoAccessibility video={videoElement} />);
      const speedButton = screen.getByRole('button', { name: /playback speed/i });
      
      fireEvent.click(speedButton);
      const speedOption = screen.getByRole('option', { name: '1.5x' });
      fireEvent.click(speedOption);
      
      expect(videoElement.playbackRate).toBe(1.5);
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle missing video source gracefully', () => {
      render(<VideoAccessibility video={videoElement} />);
      fireEvent.error(videoElement);
      
      expect(screen.getByRole('alert')).toHaveTextContent(/video error/i);
    });

    it('should handle caption loading errors', async () => {
      render(<VideoAccessibility video={videoElement} />);
      const captionButton = screen.getByRole('button', { name: /captions/i });
      
      // Simulate caption loading error
      videoElement.textTracks.onaddtrack = null;
      fireEvent.click(captionButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/caption error/i);
      });
    });
  });

  // Browser Compatibility Tests
  describe('Browser Compatibility', () => {
    it('should work across supported browsers', () => {
      const compatibility = checkBrowserCompatibility();
      render(<VideoAccessibility video={videoElement} />);
      
      // Verify core functionality based on browser
      if (compatibility.isChrome || compatibility.isFirefox) {
        expect(screen.getByRole('button', { name: /advanced features/i })).toBeEnabled();
      }
    });
  });
});