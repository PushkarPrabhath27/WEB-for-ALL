# Background Scripts API Reference

## User Profile API

### `UserProfile.create(settings)`
Creates a new user profile with specified accessibility settings.

```javascript
const settings = {
  visual: {
    contrast: 'high',
    fontSize: 16,
    colorScheme: 'dark'
  },
  audio: {
    ttsEnabled: true,
    speechRate: 1.0
  }
};

await UserProfile.create(settings);
```

### `UserProfile.update(changes)`
Updates existing user profile settings.

```javascript
await UserProfile.update({
  visual: { fontSize: 18 }
});
```

## Bias Detection API

### `BiasDetector.analyze(content)`
Analyzes content for potential accessibility issues.

```javascript
const result = await BiasDetector.analyze({
  text: 'Content to analyze',
  type: 'text'
});
```

### `BiasMitigation.apply(content, issues)`
Applies corrections to identified accessibility issues.

```javascript
const corrected = await BiasMitigation.apply(
  content,
  issues
);
```

## State Management API

### `StateManager.get(key)`
Retrieves stored state value.

```javascript
const state = await StateManager.get('userSettings');
```

### `StateManager.set(key, value)`
Stores state value.

```javascript
await StateManager.set('userSettings', settings);
```

## Message Handling

### `MessageHandler.listen(type, callback)`
Registers message listener for specific message type.

```javascript
MessageHandler.listen('settingsUpdate', (message) => {
  // Handle settings update
});
```

### `MessageHandler.send(type, data)`
Sends message to content scripts or popup.

```javascript
await MessageHandler.send('applySettings', settings);
```

## Error Handling

### `ErrorHandler.log(error)`
Logs error for tracking and analysis.

```javascript
ErrorHandler.log({
  type: 'settingsError',
  message: 'Failed to update settings',
  details: error
});
```

## Events

### `Events.on(event, handler)`
Registers event handler.

```javascript
Events.on('profileUpdated', (profile) => {
  // Handle profile update
});
```

### `Events.emit(event, data)`
Emits event with data.

```javascript
Events.emit('settingsChanged', newSettings);
```

## Utilities

### `Storage.get(key)`
Retrieves data from extension storage.

```javascript
const data = await Storage.get('userPreferences');
```

### `Storage.set(key, value)`
Stores data in extension storage.

```javascript
await Storage.set('userPreferences', preferences);
```