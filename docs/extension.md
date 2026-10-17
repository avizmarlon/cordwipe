# Browser extension (experimental)

CordWipe can run as a **Chrome / Edge Manifest V3 extension** without Tampermonkey or Violentmonkey. It uses the same compiled code as the userscript; there is no separate deletion engine. This is an early development build, **not** a browser-store release. No automatic updates are available.

## Build and install from source

Requires Node.js 20+.

```sh
npm ci
npm run build:extension
```

The build creates:

- `dist/extension/`: the unpacked extension, with `manifest.json` at its root.
- `dist/cordwipe-extension-v0.1.0-dev.1.zip` (version varies): a ZIP containing those same files.

For **Chrome**:

1. Visit `chrome://extensions`, enable **Developer mode**.
2. Click **Load unpacked**.
3. Select the **`dist/extension` folder** (or extract the ZIP first and select the folder containing `manifest.json`).
4. Open [Discord web](https://discord.com/channels/@me).

For **Edge**, do the same at `edge://extensions` using **Developer mode** and **Load unpacked**.

**A ZIP is not a one-click installer.** Extract it first; Chrome and Edge do not normally install unpacked developer extensions merely by opening a ZIP. Keep the extracted directory in a stable location: moving or deleting it can break/revoke the local install. To update an unpacked extension, replace its files and click **Reload** on the extensions page. Browser-store publication would offer simpler installation and automatic updates, but is not included.

Disable any other CordWipe, Undiscord or PurgeCord userscript before using this extension to avoid duplicate controls. The extension only runs on Discord's browser client, not the Discord desktop app.

## Implementation and privacy

- Uses a static Manifest V3 content script in the page's **MAIN world** because the existing CordWipe implementation needs access to Discord's page-side JavaScript context. This also means the web page can potentially interact with or interfere with the injected code. Treat the Discord page and any extensions allowed there as sensitive.
- Restricts injection to `discord.com/channels/*`, `ptb.discord.com/channels/*` and `canary.discord.com/channels/*`.
- Requests no privileged extension permissions, background access, cookies, tabs, browsing history, or remote code.
- Does not retrieve credentials, search messages or delete anything merely upon installation or page load. Deletion still requires using the in-page panel and confirming a preview.
- Bundles the original Undiscord attribution and license.
- Does **not** bypass Discord's restrictions or remove the risk that Discord may take action against account automation.

## Automated verification

```sh
npx playwright install chromium
npm test
```

The extension test loads the actual built extension in a temporary Chromium profile and uses an **offline, synthetic Discord-shaped page**. It verifies the UI and a simulated deletion sequence, and blocks every unexpected network request. This does not prove that the extension works on Discord's live website or across all Chrome / Edge builds; no real user messages are touched.

The ZIP is generated locally. Publishing to GitHub Releases or a browser extension store is a **separate, explicit release decision**.
