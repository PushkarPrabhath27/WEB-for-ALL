import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import CognitiveSupport from '../../src/content/cognitiveSupport';

describe('CognitiveSupport Component', () => {
  // Accessibility Tests
  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<CognitiveSupport />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA attributes', () => {
      render(<CognitiveSupport />);
      expect(screen.getByRole('main')).toHaveAttribute('aria-label', 'Cognitive Support Tools');
      expect(screen.getByRole('navigation')).toHaveAttribute('aria-label', 'Cognitive Support Options');
    });

    it('should maintain focus management', () => {
      render(<CognitiveSupport />);
      const controls = screen.getAllByRole('button');
      controls[0].focus();
      expect(document.activeElement).toBe(controls[0]);
      
      // Test keyboard navigation
      fireEvent.keyDown(controls[0], { key: 'Tab' });
      expect(document.activeElement).toBe(controls[1]);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should render within performance budget', async () => {
      const { average } = await measurePerformance(() => {
        const { unmount } = render(<CognitiveSupport />);
        unmount();
      });
      expect(average).toBeLessThan(50); // Should render in less than 50ms
    });

    it('should handle text processing efficiently', async () => {
      render(<CognitiveSupport />);
      const longText = 'A'.repeat(10000);
      
      const { average } = await measurePerformance(() => {
        const processedText = screen.getByRole('textbox');
        fireEvent.change(processedText, { target: { value: longText } });
      });
      
      expect(average).toBeLessThan(100); // Processing should take less than 100ms
    });

    it('should manage memory usage', () => {
      const memoryBefore = getMemoryUsage();
      const { unmount } = render(<CognitiveSupport />);
      const memoryAfter = getMemoryUsage();
      unmount();
      
      if (memoryBefore && memoryAfter) {
        const memoryIncrease = memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize;
        expect(memoryIncrease).toBeLessThan(2000000); // Less than 2MB increase
      }
    });
  });

  // Functionality Tests
  describe('Functionality', () => {
    it('should apply text simplification', async () => {
      render(<CognitiveSupport />);
      const input = screen.getByRole('textbox');
      const simplifyButton = screen.getByRole('button', { name: /simplify/i });

      fireEvent.change(input, { target: { value: 'This is a complex sentence with sophisticated vocabulary.' } });
      fireEvent.click(simplifyButton);

      await waitFor(() => {
        const output = screen.getByRole('region', { name: /simplified text/i });
        expect(output).toHaveTextContent(/simple/i);
      });
    });

    it('should handle focus highlighting', () => {
      render(<CognitiveSupport />);
      const highlightButton = screen.getByRole('button', { name: /highlight/i });
      const textArea = screen.getByRole('textbox');

      fireEvent.click(highlightButton);
      expect(textArea).toHaveClass('focus-mode');
    });

    it('should save user preferences', async () => {
      render(<CognitiveSupport />);
      const settingsButton = screen.getByRole('button', { name: /settings/i });
      
      fireEvent.click(settingsButton);
      const fontSizeInput = screen.getByLabelText(/font size/i);
      
      fireEvent.change(fontSizeInput, { target: { value: '18' } });
      
      await waitFor(() => {
        expect(chrome.storage.sync.set).toHaveBeenCalledWith(
          expect.objectContaining({ fontSize: '18' })
        );
      });
    });
  });

  // Error Handling Tests
  describe('Error Handling', () => {
    it('should handle processing errors gracefully', async () => {
      render(<CognitiveSupport />);
      const processButton = screen.getByRole('button', { name: /process/i });
      
      // Simulate an error condition
      chrome.runtime.sendMessage.mockImplementationOnce(() => Promise.reject('Error'));
      
      fireEvent.click(processButton);
      
      await waitFor(() => {
        expect(screen.getByRole('alert')).toHaveTextContent(/error/i);
      });
    });
  });

  // Browser Compatibility Tests
  describe('Browser Compatibility', () => {
    it('should work across supported browsers', () => {
      const compatibility = checkBrowserCompatibility();
      render(<CognitiveSupport />);
      
      const mainElement = screen.getByRole('main');
      expect(mainElement).toBeInTheDocument();
      
      // Verify core functionality based on browser
      if (compatibility.isChrome || compatibility.isEdge) {
        expect(screen.getByRole('button', { name: /advanced features/i })).toBeEnabled();
      }
    });
  });
});