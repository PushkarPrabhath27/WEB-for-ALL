import { modelManager } from './mlModelManager';
import { privacyHandler } from './privacyHandler';
import { intersectionalAnalysis } from './intersectionalAnalysis';
import { biasDetectionSystem } from './biasDetectionSystem';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const { action, ...data } = message;

  switch (action) {
    case 'toggleExtension':
      const { enabled: extensionEnabled } = data;
      // Logic to toggle the extension
      console.log(`Extension toggled to ${extensionEnabled}`);
      sendResponse({ message: `Extension toggled to ${extensionEnabled}` });
      break;

    case 'updateFeature':
      const { feature, enabled: featureEnabled } = data;
      // Logic to update the feature
      console.log(`Feature ${feature} toggled to ${featureEnabled}`);
      sendResponse({ message: `Feature ${feature} toggled to ${featureEnabled}` });
      break;

    case 'startTTS':
      // Logic to start Text-to-Speech
      console.log('Text-to-Speech started');
      sendResponse({ message: 'Text-to-Speech started' });
      break;

    case 'startSTT':
      // Logic to start Speech-to-Text
      console.log('Speech-to-Text started');
      sendResponse({ message: 'Speech-to-Text started' });
      break;

    default:
      console.log('Unknown action:', action);
      sendResponse({ message: 'Unknown action' });
  }

  return true; // Keep the message channel open for asynchronous responses
});

// Example of a background task
function performBackgroundTask() {
  // Initialize the BiasDetectionSystem
  biasDetectionSystem.initialize();

  // Simulate a background task
  setTimeout(() => {
    console.log('Background task completed');
    chrome.runtime.sendMessage({ action: 'taskCompleted', message: 'Background task completed' });
  }, 5000);
}

// Start the background task
performBackgroundTask();
