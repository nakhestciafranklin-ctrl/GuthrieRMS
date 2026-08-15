# Guthrie RMS

GitHub Pages-ready repository for the Guthrie Restaurant Management System.

## Live Website Files
The files GitHub Pages needs are intentionally stored in the repository root:

- `index.html`
- `app.js`
- `styles.css`

Do not move these three files into another folder unless the GitHub Pages publishing settings are changed too.

## GitHub Pages Setup
After uploading this repository to GitHub:

1. Open the repository.
2. Select **Settings**.
3. Select **Pages** in the left menu.
4. Under **Build and deployment**, set **Source** to `Deploy from a branch`.
5. Set **Branch** to `main`.
6. Set the folder to `/ (root)`.
7. Click **Save**.
8. GitHub will build the site. Refresh the Pages settings screen after a minute or two to see the live website URL.

The live RMS will launch from the root `index.html` file.

## Updating the live RMS
For future approved updates, replace or edit the root `index.html`, `app.js`, and `styles.css`, then commit the changes to `main`. GitHub Pages will publish the new version automatically.

## Recommended workflow
Keep `main` as the stable/live version. For major changes, create a branch first, test it, then merge into `main` when approved.
