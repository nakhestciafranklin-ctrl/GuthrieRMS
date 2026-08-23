# Deployment Readiness Notes

The current app is a local HTML MVP. It is useful for testing workflows and interface design.

Before real multi-device use, the system should move to:
- Web app hosting
- Central database
- Secure authentication
- User backups
- Device testing on Chromebooks, Windows PCs, tablets, and KMS screens

Recommended production stack:
- Frontend: React or plain HTML/JS for MVP
- Backend: Node.js
- Database: PostgreSQL
- Hosting: Render, Railway, Azure, or district-supported hosting

Do not rely on browser local storage for permanent official records.
