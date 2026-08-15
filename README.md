# Guthrie RMS

Guthrie RMS is a learning-focused restaurant management system prototype for student-operated culinary enterprise workflows.

## Current version
Phase 8C

## Live app files
The deployable site is in the `app/` folder:

- `app/index.html`
- `app/app.js`
- `app/styles.css`

## Netlify
This repository includes `netlify.toml`, which tells Netlify to publish the `app/` folder. No build command is required for the current static HTML/JavaScript version.

## Demo access
Demo credentials remain available while Demo Mode is enabled. A manager can disable Demo Mode from the manager setup interface before production use.

## Repository folders
- `app/` — live application files
- `docs/` — deployment, testing, and foundation documentation
- `training/` — student, teacher, manager, and KMS quick guides
- `templates/` — bug tracker and setup templates
- `.github/` — GitHub issue and pull request templates

## Recommended Git workflow
Use `main` as the stable/live branch. Create a separate branch for each new phase or bug fix, test it, then merge it into `main` when approved.

Suggested branch names:
- `feature/phase-8d`
- `fix/checkout-remove-items`
- `fix/report-export`

## Before deploying a new version
Run through `docs/FINAL_WORKFLOW_TEST_CHECKLIST.md` and confirm the major workflows still work.

## Data note
The current prototype stores operational data in browser local storage. Do not treat local browser storage as permanent official records. A future production release should use a central database and secure authentication.
