# GitHub Setup

## First-time repository setup
1. Create a new empty GitHub repository named `guthrie-rms` or another name you prefer.
2. Do not add a second README or .gitignore during repository creation because this package already includes them.
3. Upload the contents of this folder to the repository root, or push them with Git.
4. Confirm that `app/index.html`, `app/app.js`, `app/styles.css`, and `netlify.toml` are visible at the repository root level shown in GitHub.

## Connect the repository to Netlify
Once the repository is on GitHub, connect your Netlify site to that repository. The included `netlify.toml` points Netlify to the `app` folder for deployment.

## Updating the live site later
1. Make changes in a feature/fix branch.
2. Test the branch locally.
3. Merge the approved changes into `main`.
4. Netlify can then deploy the updated `main` branch automatically once the site is connected to GitHub.

## Suggested protection habit
Keep `main` as the live/stable version and avoid editing it directly. Use branches so a broken update can be fixed before it reaches the live site.
