# CordWipe browser extension

CordWipe is available for Chrome and Edge as an extension that runs directly in Discord's web app.

## Install the ZIP

1. [Download the latest preview ZIP](https://github.com/avizmarlon/cordwipe/releases/download/v0.1.0-dev.1/cordwipe-extension-v0.1.0-dev.1.zip) and extract it to a folder you'll keep.
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

## Test

```sh
npx playwright install chromium
npm test
```

Tests include an offline Chromium run with simulated Discord messages. For issues, [open a GitHub issue](https://github.com/avizmarlon/cordwipe/issues).
