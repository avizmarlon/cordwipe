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

## Safety expectations

- Keep authorization and message content out of logs, fixtures, screenshots, commits, and issue reports.
- Do not add credential exfiltration, persistence, telemetry, remote code, or automatic update/download URLs.
- Preserve explicit author, channel/server scope, and user-selected filters through search and deletion. Fail closed if a result cannot be validated.
- Respect Discord rate limits and stop or report errors rather than attempting to bypass platform controls.
- Keep the UI understandable about what was found, what succeeded, what failed, and what remains after stopping.

## Pull requests

Explain the user-visible change, list relevant checks, and call out any live Discord behavior that remains unverified. Automated fixture tests are not evidence of live compatibility. Do not claim a feature works in Discord until it has been validated there by a human.

Contributions are submitted under the repository's MIT license and its attribution terms. By opening a pull request, you agree that your contribution may be distributed under those terms.
