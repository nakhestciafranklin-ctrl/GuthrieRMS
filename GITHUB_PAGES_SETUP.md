# GitHub Pages Setup Guide

## Part 1: Create the repository

1. Sign in to GitHub.
2. Create a new repository named `guthrie-rms`.
3. Select **Private** while building/testing if desired. Note that GitHub Pages availability for private repositories depends on the GitHub plan/account configuration. If Pages is unavailable for a private repository, you may need to make the repository public or use a GitHub plan that supports private Pages.
4. Do not create an extra README, `.gitignore`, or license during repository creation.
5. Choose **uploading an existing file**.
6. Upload the contents of this package to the repository root.

When finished, GitHub should visibly show these files near the top level:

- `index.html`
- `app.js`
- `styles.css`
- `README.md`
- `.nojekyll`
- `docs/`
- `training/`

## Part 2: Turn on GitHub Pages

1. In the repository, click **Settings**.
2. In the left sidebar, click **Pages**.
3. Find **Build and deployment**.
4. For **Source**, choose **Deploy from a branch**.
5. For **Branch**, choose `main`.
6. For the folder, choose `/ (root)`.
7. Click **Save**.

GitHub will publish the site from the root `index.html` file.

## Part 3: Verify the deployment

When GitHub displays the website address, open it and test:

- PIN login
- Dashboard
- Dining Room
- Counter + To-Go
- KMS
- Checkout
- Inventory
- Catering
- Invoices
- Reports
- Student Development

## Important
Do not publish from `/docs`. The RMS website files are in `/ (root)` in this package.
