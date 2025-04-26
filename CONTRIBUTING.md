# Contributing to Accessibility Tools Extension

Thank you for your interest in contributing to the Accessibility Tools Extension! This document provides guidelines and instructions for contributing to make the process smooth and effective.

## 🌟 Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md). Please read it before contributing.

## 🔄 Development Process

### Setting Up Development Environment

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/accessibility-tools-extension.git
   cd accessibility-tools-extension
   ```
3. **Add the original repository as upstream**:
   ```bash
   git remote add upstream https://github.com/PushkarPrabhath27/accessibility-tools-extension.git
   ```
4. **Install dependencies**:
   ```bash
   npm install
   ```
5. **Create a new branch** for your feature or bugfix:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Make your changes** in your feature branch
2. **Run tests** to ensure your changes don't break existing functionality:
   ```bash
   npm test
   ```
3. **Build the extension** to verify it works as expected:
   ```bash
   npm run build
   ```
4. **Commit your changes** with a descriptive commit message:
   ```bash
   git commit -m "Add feature: your feature description"
   ```
5. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Create a Pull Request** from your fork to the main repository

## 📝 Pull Request Guidelines

- **One pull request per feature** - If you want to do more than one thing, send multiple pull requests
- **Add tests** for any new features or bug fixes
- **Document new code** based on the documentation style present throughout the project
- **Follow the existing code style** - Use ESLint and Prettier to ensure your code matches the style of the project
- **Include screenshots** for UI changes
- **Update documentation** if necessary

### Pull Request Process

1. Update the README.md or relevant documentation with details of changes if appropriate
2. The PR should work in all major browsers (Chrome, Firefox, Edge)
3. PRs need approval from at least one maintainer before being merged
4. If you've added code that should be tested, add tests

## 🐛 Reporting Bugs

Bugs are tracked as GitHub issues. Create an issue and provide the following information:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the bug**
- **Provide specific examples** to demonstrate the steps
- **Describe the behavior you observed**
- **Explain the behavior you expected to see**
- **Include screenshots or animated GIFs** if possible
- **Include your browser and OS information**

## 💡 Suggesting Enhancements

Enhancement suggestions are also tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **Include any relevant examples or mockups**

## 🔍 Code Review Process

- All contributions will be reviewed by the maintainers
- Feedback will be provided on pull requests
- After feedback has been addressed, the pull request will be merged by a maintainer

## ⚙️ Coding Standards

- Use ESLint and follow the existing code style
- Write clear, commented, and testable code
- Keep accessibility as a primary focus for all features

## 🧪 Testing Guidelines

- Write unit tests for new features using Jest
- Ensure all tests pass before submitting a pull request
- Test your changes in multiple browsers if possible

## 📄 License

By contributing, you agree that your contributions will be licensed under the project's [MIT License](LICENSE).

---

Thank you for contributing to making the web more accessible for everyone!