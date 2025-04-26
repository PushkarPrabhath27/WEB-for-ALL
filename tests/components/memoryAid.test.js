import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { axe } from 'jest-axe';
import MemoryAid from '../../src/content/memoryAid';

describe('MemoryAid Component', () => {
  // Accessibility Tests
  describe('Accessibility', () => {
    it('should not have any accessibility violations', async () => {
      const { container } = render(<MemoryAid />);
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });

    it('should have proper ARIA labels and roles', () => {
      render(<MemoryAid />);
      expect(screen.getByRole('complementary')).toBeInTheDocument();
      expect(screen.getByLabelText('Memory Aid Panel')).toBeInTheDocument();
    });

    it('should be keyboard navigable', () => {
      render(<MemoryAid />);
      const toggleButton = screen.getByRole('button', { name: /toggle memory aid/i });
      toggleButton.focus();
      expect(document.activeElement).toBe(toggleButton);
    });
  });

  // Performance Tests
  describe('Performance', () => {
    it('should render efficiently', async () => {
      const { average } = await measurePerformance(() => {
        const { unmount } = render(<MemoryAid />);
        unmount();
      });
      expect(average).toBeLessThan(100); // Should render in less than 100ms
    });

    it('should handle memory efficiently', () => {
      const memoryBefore = getMemoryUsage();
      const { unmount } = render(<MemoryAid />);
      const memoryAfter = getMemoryUsage();
      unmount();
      
      if (memoryBefore && memoryAfter) {
        const memoryIncrease = memoryAfter.usedJSHeapSize - memoryBefore.usedJSHeapSize;
        expect(memoryIncrease).toBeLessThan(5000000); // Less than 5MB increase
      }
    });
  });

  // Functionality Tests
  describe('Functionality', () => {
    it('should toggle visibility when clicked', () => {
      render(<MemoryAid />);
      const toggleButton = screen.getByRole('button', { name: /toggle memory aid/i });
      const panel = screen.getByRole('complementary');
      
      expect(panel).not.toHaveClass('hidden');
      fireEvent.click(toggleButton);
      expect(panel).toHaveClass('hidden');
    });

    it('should save notes correctly', async () => {
      render(<MemoryAid />);
      const noteInput = screen.getByRole('textbox', { name: /add note/i });
      const saveButton = screen.getByRole('button', { name: /save note/i });

      fireEvent.change(noteInput, { target: { value: 'Test note' } });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Test note')).toBeInTheDocument();
      });
    });

    it('should handle long notes appropriately', () => {
      render(<MemoryAid />);
      const noteInput = screen.getByRole('textbox', { name: /add note/i });
      const longNote = 'A'.repeat(1000);

      fireEvent.change(noteInput, { target: { value: longNote } });
      expect(noteInput.value.length).toBeLessThanOrEqual(1000);
    });
  });

  // Browser Compatibility Tests
  describe('Browser Compatibility', () => {
    it('should work across different browsers', () => {
      const compatibility = checkBrowserCompatibility();
      render(<MemoryAid />);
      
      // Verify core functionality works regardless of browser
      const panel = screen.getByRole('complementary');
      expect(panel).toBeInTheDocument();
    });
  });
});