# Security Policy

## Supported Versions

The following versions of the Accessibility Tools Extension are currently supported with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of the Accessibility Tools Extension seriously. If you believe you've found a security vulnerability, please follow these steps:

1. **Do not disclose the vulnerability publicly** until it has been addressed by the maintainers.
2. **Email the details to** [INSERT CONTACT EMAIL] with the subject line "[SECURITY] Vulnerability Report".
3. **Include the following information** in your report:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact of the vulnerability
   - Any potential solutions you may have identified

## What to Expect

When you report a vulnerability, you can expect the following:

1. **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours.
2. **Verification**: We will validate the vulnerability and determine its impact.
3. **Remediation**: We will develop a fix and test it.
4. **Release**: A new release will be deployed that addresses the vulnerability.
5. **Recognition**: We will publicly acknowledge your responsible disclosure, unless you prefer to remain anonymous.

## Security Best Practices for Contributors

If you're contributing to the Accessibility Tools Extension, please follow these security best practices:

1. **Keep dependencies updated** to their latest secure versions.
2. **Follow the principle of least privilege** when requesting permissions in the extension manifest.
3. **Sanitize all user inputs** to prevent injection attacks.
4. **Use Content Security Policy (CSP)** to mitigate XSS attacks.
5. **Avoid storing sensitive data** in localStorage or sessionStorage.
6. **Use HTTPS** for all external communications.
7. **Implement proper error handling** that doesn't expose sensitive information.

Thank you for helping keep the Accessibility Tools Extension and its users safe!