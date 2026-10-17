# Chrome Web Store listing draft

This is copy-ready listing and review metadata for the CordWipe extension. Verify all privacy declarations against the exact submitted ZIP and current dashboard fields before submission.

## Store listing

**Name**

CordWipe

**Short description** (131 / 132 characters; imported from the ZIP manifest)

Find and delete your own Discord messages using your session. Processed locally; requests only to Discord. Confirm before deletion.

**Category**

Social Media & Networking — Discord is the only supported service and the extension's functions apply to managing messages there. The category is listed in Google's [current Chrome Web Store best practices](https://developer.chrome.com/docs/webstore/best-practices#choose-your-extensions-category).

**Detailed description**

CordWipe lets you delete your own Discord messages in bulk, in DMs, channels and servers.

Choose where to clean up, use filters to find the messages you want to remove, then review the scope and a sample of matches before confirming.

- Narrow your search by text, dates, links, attachments or message IDs.
- Delete only messages from your own account.
- Confirm each channel's deletion and follow the progress as it runs.
- Stop a run when you need to.

CordWipe uses your existing Discord session when you start **Find & review**. It processes messages in your browser and sends requests only to Discord. There are no CordWipe accounts, servers or analytics.

Works with Discord's website in Chrome and Edge, including PTB and Canary.

Deletion is permanent, so review your selection carefully. Discord account automation may violate Discord's Terms of Service.

**Website**

https://github.com/avizmarlon/cordwipe

**Support**

https://github.com/avizmarlon/cordwipe/issues

**Privacy policy**

https://github.com/avizmarlon/cordwipe/blob/main/PRIVACY.md

## Privacy practices tab

**Single purpose**

Help users find, review, and delete their own Discord messages in selected channels and direct messages.

**Data handling / data types**

Declare that the extension handles user data. Local-only processing still counts as handling in Google's guidance. Select all matching data types in the current dashboard taxonomy:

- Personally identifiable information: Discord account identifiers and author metadata returned with messages, used to verify the signed-in author and match the selected scope.
- Personal communications: message text and direct-message content read to find and filter messages.
- Website content: user-generated Discord messages and page data, including text, timestamps, and attachment/link/pinned metadata.
- Authentication information: the Discord session authorization value, accessed transiently only when a valid **Find & review** run starts, and used only for requests to Discord.
- Web history: the current Discord domain/path, read locally to mount the tool on a channel route and when the user selects **current** to fill server/channel scope. CordWipe does not monitor unrelated pages or build browsing history.

User-generated content is covered under Website content; it is not a separate checkbox in the documented dashboard taxonomy. Do not declare unrelated health, financial/payment, location, or user-activity tracking: CordWipe does not request those data for its functionality. Message text may incidentally contain sensitive information; it is handled as communications/content, not extracted for those unrelated purposes.

CordWipe does not send these data to its maintainers or another service. Its authenticated requests are sent to Discord over HTTPS to retrieve and, after a separate confirmation, delete messages. The Discord server search request can include the selected author, channel, date/message bounds, text and attachment/link filters; CordWipe then checks candidate messages locally before each deletion. It does not keep a backend, analytics, or persistent CordWipe copy of authorization or message history. Confirm the dashboard categories against its live wording; do not select a “no data handled” answer just because processing is local or Discord is the only recipient. Google states that local processing is still in scope in its [user data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq).

**Limited Use certifications**

Certify only if the submitted build and privacy policy remain consistent: data is used solely to provide the disclosed message search/review/deletion feature; transferred only to Discord as necessary for that feature; not sold or used for advertising; and not made available to maintainers to read. For the three data-use certifications, the prepared answers are: no sale/transfer outside permitted feature purposes; no use or transfer unrelated to the single purpose; no use or transfer to determine creditworthiness or lending eligibility. These must remain true of the final build. Google describes the Limited Use requirements [here](https://developer.chrome.com/docs/webstore/program-policies/limited-use).

**Remote code**

No. All JavaScript executed by the extension is bundled in the ZIP. It fetches Discord API data, not executable code. This matches Google's [Manifest V3 remote-code guidance](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code).

**Permission justification**

No privileged extension API permissions or separate `host_permissions` entries are requested. Static content-script matches still grant access to the three Discord sites and can produce a browser site-access warning; do not describe CordWipe as requiring no site access. The content script is limited to Discord web app hosts so CordWipe can add its UI to Discord, read the active channel context, and make the feature's user-requested requests to Discord.


**Disclosure and explicit action**

The short and detailed descriptions disclose the intended message/session use before installation. Inside the product, the notice immediately beside **Find & review** explains local session/history processing and Discord-only requests before that explicit action accesses authorization or messages. Deletion has a separate scope/sample confirmation. Google requires [prominent disclosure and affirmative informed consent](https://developer.chrome.com/docs/webstore/program-policies/disclosure-requirements), and its [FAQ 10](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq) requires the disclosure/action inside the product. Neither text specifies a per-session checkbox. This build uses the existing user-initiated action; no new consent screen is proposed. Approval of that presentation belongs to Google's review and is not established by automated tests. The local route check used to mount the UI is disclosed separately; it does not retrieve authorization or messages.

## Reviewer notes (not user-facing listing copy)

**Host access and MAIN world**

CordWipe's content script runs only on `discord.com`, `ptb.discord.com`, and `canary.discord.com`. It uses the `MAIN` world because Discord's session and client modules are exposed to its page JavaScript environment; an isolated content script cannot read that client state. This means Discord page code can inspect or interfere with CordWipe. The extension does not claim an isolated credential boundary. Its UI, filters, search, review, and confirmation are all part of the same narrow Discord message-management purpose. See Google's [content-script execution-world documentation](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts#execution-environment).

**How to inspect**

1. Install the submitted extension in Chrome or Chromium-based Edge and sign in to Discord through the normal Discord site if you want to inspect the authenticated flow. There is no separate CordWipe login, paid feature, license key or reviewer credential. Never paste or share a Discord token. Any disposable Discord account and messages used for live evaluation are supplied by the reviewer.
2. Open a Discord channel or DM and click the purple chat-bubble trash icon labeled **CordWipe** inside the Discord channel toolbar (a floating button with the same icon appears if the toolbar cannot be found). This build has no Chrome toolbar action or extension popup. Inspect its filters and disclosure. Opening the panel does not start a search.
3. For a safe functional review, use a test Discord account and messages created specifically for testing. Use **me** for Author ID and **current** for server/channel scope, or enter your own numeric IDs (server `@me` for a DM). Disable other CordWipe/Undiscord userscripts or extension copies first. Set a narrow test-message text filter. Click **Find & review** to search; inspect the result scope and sample preview; dismiss the confirmation to verify the non-deletion path. Do not confirm deletion of ordinary account messages.
4. The extension uses Discord's existing session and sends API requests only to Discord. No third-party service, CordWipe account, or CordWipe backend is involved.

## Submission checklist

- [ ] Use a final, reviewed ZIP generated from the exact source revision intended for submission; verify its manifest version and included files.
- [x] Owner approved the violet chat-bubble trash-bin icon; it is used by the in-page launcher/header, 16/48/128 px package icons and the new promotional concepts.
- [x] Owner selected concept 1 — Focus. Its wordmark uses white “Cord” and violet “Wipe”, matching the panel header.
- [ ] Review the final ZIP and matching promo/screenshot files before authorizing submission.
- [ ] Select the matching 440×280 promotional PNG and the three 1280×800 screenshots. A marquee and video are optional; no concrete launch need currently justifies creating them.
- [ ] Confirm name, short and detailed descriptions, English language, category, website, support, and privacy-policy URLs in the dashboard. The short description is imported from the manifest, not a separate store-only override.
- [ ] Complete single-purpose, permission, remote-code, and user-data disclosures against the submitted ZIP. Certify Limited Use only if still accurate.
- [ ] Ensure the public privacy-policy URL loads without sign-in and describes the exact submitted build's behavior.
- [ ] Confirm the build does not load executable code remotely; inspect the packaged ZIP, not just source.
- [ ] Complete a final test of install, Discord SPA entry, UI opening, search/review, cancel, rate-limit behavior, and confirmation using synthetic or disposable test data. The owner has independently reported a successful real Discord test; that does not replace a clean reviewer walkthrough.
- [ ] Check Discord's current Terms of Service and applicable policy/legal requirements immediately before submission. Do not imply Discord endorsement.
- [ ] Verify publisher contact email and two-step verification; choose distribution visibility/regions and applicable account declarations in the dashboard. Registration/payment are already completed according to the owner; no further payment is authorized.
- [ ] Review Google's current submission, distribution, content-rating and asset requirements in the dashboard; obtain owner authorization before any upload or submission.

## Official references

- [Chrome Web Store disclosure requirements](https://developer.chrome.com/docs/webstore/program-policies/disclosure-requirements)
- [Chrome Web Store privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Chrome Web Store user data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Chrome Web Store Limited Use policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use)
- [Chrome Web Store listing guidance and current categories](https://developer.chrome.com/docs/webstore/best-practices)
- [Manifest V3 remote-hosted code guidance](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code)
- [Manifest content scripts and execution worlds](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts)

## Artwork and reproducibility

The owner selected [concept 1 — Focus](../images/store/banners/2026-10-17/01-focus-440x280.png), with white “Cord” and violet “Wipe”. The same wordmark colors and bold typographic treatment are used in the panel header. The [five concepts](../images/store/banners/2026-10-17/index.html) and [comparison sheet](../images/store/banners/2026-10-17/comparison.png) remain available. They use the approved violet chat-bin reference, also reconstructed as the shared in-page SVG. Each has a 440×280 RGB PNG and a matching 1540×980 source composition. The [prompt set](../images/store/banners/2026-10-17/prompts.json) records the built-in image-generation inputs and the selected banner's color adjustment. Nothing has been submitted.

A [reversed wordmark preview](../images/store/banners/2026-10-17/wordmark-comparison.png) shows violet “Cord” and white “Wipe” in the banner and actual installed-extension header. It is an alternative for owner comparison, not a runtime setting or a change to the current candidate. The README uses an 880×560 export of the current banner, displayed at 640 pixels wide.

The [earlier icon exploration and screenshots](../images/store/index.html) remain available. The old A–D icon/promo options are retained for comparison; they are not the current banner candidates. The approved violet mark is shared by the in-page UI and browser package icons. Screenshot PNGs are RGB 1280×800 with no alpha.

The screenshots show the installed extension's actual UI over a fictional conversation fixture, not a captured personal Discord account. Search and deletion responses are intercepted mocks. The operation-progress capture follows the real native confirmation and one simulated successful deletion; counts are not edited into the page. The native confirmation itself is not drawn as an invented in-page modal.

After `npm run build:extension`, run `node test/store-assets.mjs` to reproduce screenshots. Run `node test/store-artwork.mjs` to validate the current banner exports and regenerate their comparison sheet, as well as the earlier icon/promo comparisons. Generated raster compositions are retained as source PNGs; the script exports their gallery, not new AI variants. These commands use disposable Chromium contexts and no personal browser profile.

[Google's image specifications](https://developer.chrome.com/docs/webstore/images) require a PNG icon, at least one screenshot and a 440×280 small promo; the 1400×560 marquee is optional. Preserve the selected icon's transparency, visual padding and light/dark legibility when packaging it.
