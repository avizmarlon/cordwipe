# CordWipe browser extension

CordWipe runs in Discord's web app on Chrome and Edge 111 or later. It is not yet listed in an extension store. Read the [privacy policy](../PRIVACY.md) before allowing access in the panel.

## Install the ZIP

1. Sign in to GitHub and open the latest successful [main build](https://github.com/avizmarlon/cordwipe/actions/workflows/test.yml?query=branch%3Amain). Download the extension ZIP under **Artifacts** and extract it to a folder you'll keep. Downloads expire after 30 days; building from source remains available.
2. Open `chrome://extensions` or `edge://extensions`.
3. Enable **Developer mode** and click **Load unpacked**.
4. Choose the folder containing `manifest.json` and open Discord.

To update, replace the extracted files with a newer version and click **Reload** on the browser's Extensions page.

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
