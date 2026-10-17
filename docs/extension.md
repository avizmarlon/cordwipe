# CordWipe browser extension

CordWipe runs in Discord's web app on Chrome and Edge 111 or later. It is not yet listed in an extension store. Read the [privacy policy](../PRIVACY.md) before use.

## Install the ZIP

1. Download the [public preview ZIP, v0.1.0-dev.1](https://github.com/avizmarlon/cordwipe/releases/download/v0.1.0-dev.1/cordwipe-extension-v0.1.0-dev.1.zip) from [GitHub Releases](https://github.com/avizmarlon/cordwipe/releases) and extract it to a folder you'll keep. No GitHub login is needed.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode** and click **Load unpacked**.
4. Choose the folder containing `manifest.json` and open Discord.

To update, replace the extracted files with a newer version, click **Reload** on the browser's Extensions page, and reload Discord.

The newer `0.1.0-dev.3` candidate was tested and merged into `main`, but has not been released as an extension ZIP. The public ZIP still contains the older interface. To test an unreleased candidate, build its branch from source below; public installation does not depend on temporary CI artifacts.

## Build from source

Requires Node.js 20+.

```sh
npm ci
npm run build:extension
```

The unpacked extension is in `dist/extension/` and the distributable ZIP is in `dist/`. Both use the same CordWipe code as the userscript.

The build advances `package.json` when a branch changes distributed code. See the [versioning convention](../CONTRIBUTING.md#versioning). An unpacked installation still needs a manual reload; this build does not create or publish a release or store update.

## Test

```sh
npx playwright install chromium
npm test
```

Tests include an offline Chromium run with simulated Discord messages. For issues, [open a GitHub issue](https://github.com/avizmarlon/cordwipe/issues).
