# Accessibility Tools Extension

<div align="center">

![Accessibility Tools Logo](src/assets/icon128.svg)

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

**A comprehensive browser extension that enhances web accessibility for users with diverse needs**

</div>

## 🌟 Overview

The Accessibility Tools Extension is a powerful browser add-on designed to make the web more accessible for everyone. It provides a suite of tools that address various accessibility needs, including visual, auditory, motor, and cognitive challenges. Our goal is to create a more inclusive web experience by removing barriers to digital content.

### Key Features

- **Audio Assistance**: Text-to-Speech and Speech-to-Text capabilities
- **Visual Enhancements**: Contrast improvements, text resizing, and image descriptions
- **Cognitive Support**: Reading assistance and focus management tools
- **Customizable Experience**: Personalized settings to meet individual needs

## 📋 Table of Contents

- [Installation](#-installation)
- [Features](#-features)
- [Usage](#-usage)
- [Technical Architecture](#-technical-architecture)
- [Development](#-development)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

## 🚀 Installation

### From Browser Extension Store

*Coming soon to Chrome Web Store, Firefox Add-ons, and Edge Add-ons*

### Manual Installation (Developer Mode)

1. Clone this repository:
   ```bash
   git clone https://github.com/PushkarPrabhath27/accessibility-tools-extension.git
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build
   ```

4. Load the extension in your browser:
   - Chrome: Go to `chrome://extensions/`, enable Developer mode, click "Load unpacked", and select the `dist` folder
   - Firefox: Go to `about:debugging#/runtime/this-firefox`, click "Load Temporary Add-on", and select any file in the `dist` folder
   - Edge: Go to `edge://extensions/`, enable Developer mode, click "Load unpacked", and select the `dist` folder

## 🔍 Features

### Audio Features

- **Text-to-Speech**: Reads page content aloud with customizable voice settings
- **Speech-to-Text**: Control the extension and navigate web pages using voice commands

### Visual Assistance

- **Visual Enhancements**: Improve contrast, adjust text size, and modify color schemes
- **Image Descriptions**: Automatically generate alternative text for images lacking proper descriptions

### Cognitive Support

- **Reading Assistance**: Simplify complex text and provide reading guides
- **Focus Management**: Reduce distractions and highlight important content

### Additional Features

- **Cross-disability Support**: Comprehensive tools that work together for users with multiple accessibility needs
- **User Profiles**: Save and switch between different accessibility configurations
- **Keyboard Shortcuts**: Quick access to commonly used features

## 💡 Usage

### Quick Start

1. Click the extension icon in your browser toolbar to open the popup panel
2. Toggle the main switch to enable/disable the extension
3. Select the specific accessibility features you need
4. Use the settings page for more detailed customization

### Keyboard Shortcuts

- **Alt+Shift+P**: Toggle the accessibility panel
- **Alt+Shift+T**: Toggle Text-to-Speech
- **Alt+Shift+S**: Start/Stop Speech-to-Text
- **Alt+Shift+V**: Toggle Visual Enhancements

## 🔧 Technical Architecture

The extension is built with a modular architecture that separates concerns and allows for easy maintenance and extension:

- **Background Scripts**: Handle extension lifecycle, user preferences, and cross-tab communication
- **Content Scripts**: Modify web page content and inject accessibility features
- **Popup UI**: Provides quick access to common features
- **Options Page**: Offers detailed customization settings

### Technologies Used

- **JavaScript**: Core programming language
- **HTML/CSS**: User interface components
- **WebExtension API**: Browser extension functionality
- **Web Speech API**: Text-to-speech and speech recognition capabilities

## 💻 Development

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Setup Development Environment

1. Clone the repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`

### Build for Production

```bash
npm run build
```

### Testing

```bash
npm test
```

## 👥 Contributing

We welcome contributions from everyone! Please see our [Contributing Guidelines](CONTRIBUTING.md) for more information on how to get started.

### Code of Conduct

This project adheres to a [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- GitHub: [@PushkarPrabhath27](https://github.com/PushkarPrabhath27)
- Project Link: [https://github.com/PushkarPrabhath27/accessibility-tools-extension](https://github.com/PushkarPrabhath27/accessibility-tools-extension)

---

<div align="center">

**Made with ❤️ for a more accessible web**

</div>