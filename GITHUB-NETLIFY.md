# Manage this website with GitHub and Netlify

The complete website is in `dist/`. It uses ordinary HTML, CSS, JavaScript, and images. No installation, build command, database, or secret keys are needed.

## Put the files in GitHub

1. Create an empty GitHub repository, for example `fright-before-christmas-branson`. A private repository works with Netlify.
2. Upload the `dist` folder, `netlify.toml`, `README.md`, and this guide to the repository's main branch. If using the downloadable handoff, extract it first and upload its contents rather than the ZIP itself.
3. Keep `dist/index.html` at that exact path. The site images must remain in `dist/assets`.

If someone is uploading the files for you, send them the empty repository's URL.

## Connect Netlify

1. In your Netlify team dashboard, choose **Add new project → Import an existing project → GitHub**.
2. Authorize the repository and select it.
3. Use branch `main`, leave the build command empty, and set the publish directory to `dist`.
4. Publish the project. The included `netlify.toml` also sets the publish directory.
5. Open the new Netlify URL and check it on your phone. You can add your own domain in Netlify's Domain management settings.

After connecting GitHub, commits to the production branch trigger Netlify deployments.

## Make changes

| Change | File |
| --- | --- |
| Wording, dates, button destinations, and image references | `dist/index.html` |
| Layout, typography, mobile spacing, button styles, and image frames | `dist/crossover.css` |
| Base styles and the original frame treatment | `dist/styles.css` and `dist/brand-refresh.css` |
| Snowflake size, drift, and bulb positions | `dist/atmosphere.js` |
| Light flicker strength and timing | `dist/atmosphere.css` |
| Navigation, date selection, and calendar downloads | `dist/app.js` |
| Live countdown, photo viewer, and section reveals | `dist/crossover.js` |
| Website images | `dist/assets/` |

All ticket buttons currently link to `https://www.fieldofscreamsbranson.com/`. When you have the direct purchase-page URL, replace that destination on the ticket buttons, including the mobile bottom button. Keep the footer's Official website link pointing to the main website.

When editing a stylesheet or script, increase its `?v=` number in `dist/index.html` so returning visitors load the new file.

## Update the public address after the move

The current public address is `https://christmascrossover.netlify.app/`. If a custom domain is added, update the canonical link, `og:url`, and absolute `og:image` address in `dist/index.html`. Update the calendar URL and description in `dist/app.js` to the new site's `/#dates` address. Leave relative asset paths as they are.

## Restore a change

GitHub keeps file history. Revert a commit to restore the previous version, then let Netlify publish it. Netlify also keeps deployment history.

Official Netlify guide: https://docs.netlify.com/start/quickstarts/deploy-from-repository/
