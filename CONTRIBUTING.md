# Contributing to CordWipe

Thanks for helping improve CordWipe. Keep changes focused, preserve the Undiscord copyright and attribution in [`LICENSE`](./LICENSE), and describe any behavior change and its verification in your pull request.

## Development

Use Node.js 20 or later. Install the locked development dependencies and run the automated checks:

```sh
npm ci
npx playwright install chromium
npm test
```

The build output is `cordwipe.user.js`. Do not hand-edit the generated bundle; change source files and rebuild. Tests must use mocks or local fixtures. Never use a real Discord account, capture an authorization value, or delete real messages for development or CI.

## Versioning

`package.json` is the sole version source. `npm run build` and `npm run build:extension` advance it once per branch when distributable files differ from `main`; repeated builds are idempotent and documentation-only changes need no increment. Use `X.Y.Z-dev.N` during development and `X.Y.Z` for a stable version. The build maps development sequence `N` to the fourth numeric userscript and Chrome version component, and reserves `65535` for the stable version, keeping Greasy Fork and Chrome updates ordered. Start a new branch after merging so its build advances from the latest `main` version.

Commit the updated package, lockfile and generated userscript together. CI rejects an insufficient version or stale bundle; update a branch from `main` and rebuild if another change has advanced the version first. The [Greasy Fork listing](https://greasyfork.org/en/scripts/600774-cordwipe) must use its built-in automatic source sync with `https://raw.githubusercontent.com/avizmarlon/cordwipe/main/cordwipe.user.js`; metadata update URLs only configure direct userscript installs. Store submission remains a separate maintainer action.

## Safety expectations

- Keep authorization and message content out of logs, fixtures, screenshots, commits, and issue reports.
- Do not add credential exfiltration, persistence, telemetry, or remote code. Keep userscript update/download URLs limited to the project-owned raw `main` bundle configured in `package.json`.
- Preserve explicit author, channel/server scope, and user-selected filters through search and deletion. Fail closed if a result cannot be validated.
- Respect Discord rate limits and stop or report errors rather than attempting to bypass platform controls.
- Keep the UI understandable about what was found, what succeeded, what failed, and what remains after stopping.

## Pull requests

Explain the user-visible change, list relevant checks, and call out any live Discord behavior that remains unverified. Automated fixture tests are not evidence of live compatibility. Do not claim a feature works in Discord until it has been validated there by a human.

Contributions are submitted under the repository's MIT license and its attribution terms. By opening a pull request, you agree that your contribution may be distributed under those terms.
