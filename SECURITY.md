# Security Policy — Smart Library Management System (SLMS)

## Overview

The Smart Library Management System (SLMS) team takes cybersecurity seriously. This document outlines our security standards, environment configuration policies, secret management procedures, and responsible vulnerability reporting guidelines.

---

## 1. Supported Versions

| Version | Supported |
| ------- | --------- |
| 1.0.x   | :white_check_mark: Yes |
| < 1.0   | :x: No |

---

## 2. Reporting a Vulnerability

If you discover a potential security vulnerability within SLMS, please report it responsibly rather than opening a public issue on GitHub.

### How to Report:
- **Email**: Send detailed vulnerability reports to `security@slms-library.org` or contact the core maintainers privately.
- **Content**: Include steps to reproduce, affected component (Backend, React Portal, Angular Admin, socket server), potential impact, and suggested remediations if available.
- **Response Time**: We aim to acknowledge receipt of security disclosures within 48 hours and provide remediation updates within 7 days.

---

## 3. Secret Management & GitHub Hygiene

Because the SLMS source code is publicly available on GitHub:

1. **No Real Secrets in Source Code**:
   - `backend/.env` is excluded via `.gitignore`.
   - Never commit API keys, database connection strings containing credentials, JWT signing secrets, or SMTP passwords.
2. **Environment Variable Strategy**:
   - Production deployments on Render and Vercel use platform environment variable injection.
   - Development uses `backend/.env.example`, `frontend-react/.env.example`, and `admin-angular/.env.example` templates containing placeholders only.
3. **Secret Rotation Policy**:
   - If credentials (e.g. MongoDB Atlas passwords) are accidentally exposed, they must be considered immediately compromised and rotated in the cloud dashboard before updating environment configs.

---

## 4. Architectural Security Practices

- **Authentication**: Stateless JSON Web Tokens (JWT) signed with 256-bit secrets.
- **Authorization**: Server-side Role-Based Access Control (RBAC) enforcing permissions for Super Admin, Librarian, Faculty, and Student roles on all API endpoints.
- **NoSQL & ReDoS Mitigation**: Input sanitization via `escapeRegExp` on regex search inputs and strict Mongoose schema validation.
- **Web Security Headers**: Enforced via Helmet middleware (X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- **CORS & Socket Protection**: Enforced origin validation and JWT handshake token verification.
- **Rate Limiting**: Targeted request limiting on sensitive authentication routes (`/api/v1/auth/*`) to protect against brute-force attacks.
