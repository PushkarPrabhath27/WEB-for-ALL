import '@testing-library/jest-dom';
import { toHaveNoViolations } from 'jest-axe';
import { configure } from '@testing-library/dom';
import 'jest-performance';

// Add custom matchers for accessibility testing
expect.extend(toHaveNoViolations);

// Configure testing library
configure({
  testIdAttribute: 'data-testid',
});

// Mock browser APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

// Performance measurement helpers
global.measurePerformance = async (callback, iterations = 100) => {
  const times = [];
  for (let i = 0; i < iterations; i++) {
    const start = performance.now();
    await callback();
    times.push(performance.now() - start);
  }
  return {
    average: times.reduce((a, b) => a + b, 0) / times.length,
    min: Math.min(...times),
    max: Math.max(...times)
  };
};

// Memory usage helper
global.getMemoryUsage = () => {
  if (window.performance && window.performance.memory) {
    return window.performance.memory;
  }
  return null;
};

// Accessibility test helper
global.testAccessibility = async (container) => {
  const { axe } = await import('jest-axe');
  const results = await axe(container);
  expect(results).toHaveNoViolations();
};

// Browser compatibility helper
global.checkBrowserCompatibility = () => {
  const userAgent = window.navigator.userAgent;
  return {
    isChrome: /Chrome/.test(userAgent),
    isFirefox: /Firefox/.test(userAgent),
    isEdge: /Edg/.test(userAgent),
    isSafari: /Safari/.test(userAgent) && !/Chrome/.test(userAgent),
    version: userAgent.match(/(Chrome|Firefox|Safari|Edge?)\/([\d.]+)/)?.[2]
  };
};