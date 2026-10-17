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

CordWipe helps you find and delete your own messages in Discord channels and direct messages.

Choose a server or channel, narrow results with text, pattern, date, or message-ID filters, and review the scope and a sample of matching messages before confirming deletion. CordWipe checks that candidates belong to your account and asks for confirmation before each channel's deletion run. It applies filters to candidates locally before deletion, observes Discord's responses and rate limits, and reports deleted, missing, failed, or skipped messages separately.

CordWipe accesses your existing Discord session authorization only after you start **Find & review**. Message filtering happens in the page; authenticated requests go to Discord. CordWipe has no service backend, analytics, or account of its own. The extension works on Discord's web app at discord.com, ptb.discord.com, and canary.discord.com in Chrome and Chromium-based Edge.

Deleting messages is irreversible. Discord account automation may violate Discord's Terms of Service. Use only on messages you intend to remove and review the scope and preview carefully before confirming.

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
2. Open a Discord channel or DM and click the trash icon labeled **CordWipe** inside the Discord channel toolbar (a floating trash button appears if the toolbar cannot be found). This build has no Chrome toolbar action or extension popup. Inspect its filters and disclosure. Opening the panel does not start a search.
3. For a safe functional review, use a test Discord account and messages created specifically for testing. Use **me** for Author ID and **current** for server/channel scope, or enter your own numeric IDs (server `@me` for a DM). Disable other CordWipe/Undiscord userscripts or extension copies first. Set a narrow test-message text filter. Click **Find & review** to search; inspect the result scope and sample preview; dismiss the confirmation to verify the non-deletion path. Do not confirm deletion of ordinary account messages.
4. The extension uses Discord's existing session and sends API requests only to Discord. No third-party service, CordWipe account, or CordWipe backend is involved.

## Submission checklist

- [ ] Use a final, reviewed ZIP generated from the exact source revision intended for submission; verify its manifest version and included files.
- [x] Owner selected **D — Conversation stack**, with transparent artwork. Its 16/48/128 px exports are integrated in the candidate branch.
- [ ] Review the final ZIP and matching D promo/screenshot files before authorizing submission.
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

Review the [icon options, matching promo tiles and three screenshots](../images/store/index.html). All icon proposals have transparent canvases, with exports at 512, 128, 48 and 16 pixels; checkerboard/light/dark surfaces in the comparison sheet are presentation backgrounds. The owner selected D; its exports are integrated into the extension package on the review branch. The other proposals are retained for comparison. The proposals were generated with the built-in image tool; the [prompt set](../images/store/icon-prompts.json) records their design inputs. Promotional PNGs are RGB 440×280; screenshots are RGB 1280×800 with no alpha.

The screenshots show the installed extension's actual UI over a fictional conversation fixture, not a captured personal Discord account. Search and deletion responses are intercepted mocks. The operation-progress capture follows the real native confirmation and one simulated successful deletion; counts are not edited into the page. The native confirmation itself is not drawn as an invented in-page modal.

After `npm run build:extension`, run `node test/store-assets.mjs` to reproduce screenshots. Run `node test/store-artwork.mjs` to validate icon exports and regenerate promo/comparison PNGs from the local artwork page. These commands use disposable Chromium contexts and no personal browser profile.

[Google's image specifications](https://developer.chrome.com/docs/webstore/images) require a PNG icon, at least one screenshot and a 440×280 small promo; the 1400×560 marquee is optional. Preserve the selected icon's transparency, visual padding and light/dark legibility when packaging it.
