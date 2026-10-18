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

Free and open source. Based on Undiscord by victornpb and contributors (MIT license). CordWipe is independent and is not affiliated with or endorsed by Discord.

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

## Submission status and checklist

Owner approved the final icon, Focus banner (violet Cord / white Wipe), all three real screenshots, PR #9 merge, a new GitHub release and Chrome Web Store upload/review submission on 2026-10-17. Public visibility is authorized, with automatic publication disabled after approval. No extra spending or other announcements are authorized.

- [x] Existing automated suite and real disposable-message walkthrough reviewed; final checks recorded in [Issue #8](https://github.com/avizmarlon/cordwipe/issues/8).
- [x] Selected final artwork and screenshot order below; alternatives removed from the current tree and recoverable through PR #9 history.
- [x] Official image, privacy, local-processing disclosure, publishing and Discord self-bot guidance rechecked on 2026-10-17. Discord's policy prohibits normal-account automation and warns of account termination; the public documentation discloses this risk. No Discord endorsement is claimed.
- [ ] Upload the exact release ZIP; confirm package version `0.1.0.7` and English language.
- [ ] Fill listing, privacy declarations, permission justifications and reviewer instructions from this document against the live dashboard.
- [ ] Verify account contact/2FA and applicable legal declarations. Ask the owner only for an unavailable personal/legal choice or authentication.
- [ ] Select free/public distribution in all supported regions and **disable Publish automatically** in the review submission dialog. Do not publish immediately.
- [ ] Confirm the actual review state and item URL; record them in Issue #8. No submission state is inferred from a successful upload.

Google's [publishing guide](https://developer.chrome.com/docs/webstore/publish/) confirms deferred publication: uncheck automatic publishing when submitting for review. After approval, a staged submission can remain unpublished for up to 30 days; after that it returns to draft and needs review again.

## Official references

- [Chrome Web Store disclosure requirements](https://developer.chrome.com/docs/webstore/program-policies/disclosure-requirements)
- [Chrome Web Store privacy fields](https://developer.chrome.com/docs/webstore/cws-dashboard-privacy)
- [Chrome Web Store user data FAQ](https://developer.chrome.com/docs/webstore/program-policies/user-data-faq)
- [Chrome Web Store Limited Use policy](https://developer.chrome.com/docs/webstore/program-policies/limited-use)
- [Chrome Web Store listing guidance and categories](https://developer.chrome.com/docs/webstore/best-practices)
- [Manifest V3 remote-hosted code guidance](https://developer.chrome.com/docs/extensions/develop/migrate/remote-hosted-code)
- [Manifest content scripts and execution worlds](https://developer.chrome.com/docs/extensions/reference/manifest/content-scripts)
- [Discord automated-user-account policy](https://support.discord.com/hc/en-us/articles/115002192352-Automated-User-Accounts-Self-Bots)

## Approved artwork and reproducibility

Use these exact files, without another design round:

- Store icon: [`extension/icons/icon128.png`](../extension/icons/icon128.png), 128×128 PNG with transparency; the 16/48 px versions are beside it. The [512 px master](../images/store/icons/approved-chat-bin.png) and [shared UI vector](../src/ui/cordwipe-icon.svg) remain available.
- Small promotional tile: [Focus 440×280](../images/store/banners/2026-10-17/01-focus-440x280.png), violet Cord / white Wipe. The [1540×980 master](../images/store/banners/2026-10-17/sources/01-focus-1540x980.png), approved icon reference and [creation prompts](../images/store/banners/2026-10-17/prompts.json) remain. The [README hero](../images/cordwipe-banner.png) is an 880×560 export.

Upload the three approved real Discord screenshots in this order (filenames retain their original capture numbering):

1. [Panel with filters](../images/store/screenshots/real/02-filters.png).
2. [Completed deletion](../images/store/screenshots/real/03-operation.png).
3. [CordWipe icon integrated into Discord](../images/store/screenshots/real/01-launcher.png).

All three are RGB 1280×800 PNGs, captured from installed MV3 in Edge. The owner approved them on 2026-10-17. They show an explicitly authorized disposable-message workflow: 4 deleted, 0 already absent, 0 failed, 24 skipped; four differently worded test messages remained. Names, avatars and identifying surroundings were anonymized locally before capture; private conversations, servers and unrelated messages were hidden. Native navigation/counters and the operation's confirmation, form values, counts and outcome were not fabricated. No credential or raw capture is included. The panel layout fix shown is included in source and ZIP.

The separate [synthetic fixture screenshots](../images/store/screenshots/) and `test/fixtures/store-conversation.html` remain for reproducible offline testing. After `npm run build:extension`, `node test/store-assets.mjs` recreates only those synthetic screenshots using intercepted requests in disposable Chromium contexts. It never contacts a real account or recreates the real captures. `node test/store-artwork.mjs` validates final/source/test PNG dimensions, decoding, transparency and metadata without modifying the approved images.

Earlier concepts, galleries, duplicate exports and comparisons are recoverable in PR #9 history through commit `a8497ac`. Untracked local concepts and output files are preserved.

[Google's image specifications](https://developer.chrome.com/docs/webstore/images) require a PNG icon, at least one screenshot and a 440×280 small promotional tile. Marquee and video are optional and are not part of this submission.
