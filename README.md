# CordWipe

CordWipe is an open-source browser userscript for finding and deleting your own Discord messages in a direct message, group DM, or server. It is an early development build derived from Undiscord. Discord can change its web client or API at any time, so compatibility is not guaranteed.

> **Use with care.** Message deletion is irreversible. [Discord prohibits automating normal user accounts](https://support.discord.com/hc/en-us/articles/115002192352-Automated-User-Accounts-Self-Bots) and may terminate accounts that do so. You are responsible for deciding whether to use this software. CordWipe is unaffiliated with Discord.

## Install

**[Install CordWipe](https://raw.githubusercontent.com/avizmarlon/cordwipe/main/cordwipe.user.js)** (development version)

1. Install a userscript manager such as [Tampermonkey](https://www.tampermonkey.net/) or [Violentmonkey](https://violentmonkey.github.io/).
2. Click **Install CordWipe** above and confirm the installation in your userscript manager.
3. Open [Discord in your browser](https://discord.com/channels/@me). CordWipe's trash button should appear in the channel header, or as a floating fallback.

If the link displays JavaScript instead of an installation prompt, check that your userscript manager is enabled and allowed to run, or manually create a new script and paste the contents of [cordwipe.user.js](./cordwipe.user.js). Disable any other Undiscord/PurgeCord userscript to avoid duplicate controls.

This is an **early development build**, not a stable release. Auto-updates are disabled; install newer versions manually from this repository after reviewing the changes. No browser-store publication is available. CordWipe only runs in the Discord web app, not the desktop app.

## Browser extension (Chrome / Edge, experimental)

CordWipe can also run as a **standalone Manifest V3 extension**, with no userscript manager required. To build a ZIP or unpacked extension from the same source, run `npm ci` and `npm run build:extension`. In Chrome/Edge, **extract the ZIP**, enable Developer mode in the browser's Extensions page, then select **Load unpacked** and choose the folder containing `manifest.json`. A ZIP is **not** a one-click extension installer.

See the [complete extension installation, security and testing instructions](./docs/extension.md). No extension has been published to a store or enabled for automatic updates.
## Usage

Open the CordWipe panel from its trash button. The **me** control fills your author ID from Discord's in-page data. This reads the ID only; it does not retrieve an authorization token or make an API request. **current** beside Channel fills the current server and channel. **current** beside Server fills the current server; in a DM it sets the target to `@me` and fills the DM channel.

To search a whole server, fill **Author ID** with **me**, fill **Server ID**, and leave **Channel ID** empty. To search a single server channel, use that channel's **current** button. For a DM or group DM, select **current** channel while the conversation is open; the server target must be `@me`. You can enter multiple channel IDs separated by commas. CordWipe validates each target and asks for confirmation separately for each channel.

Filters intersect: a candidate must match every selected filter. Text is a case-insensitive literal substring; a regular expression is also case-insensitive. Link, file/attachment, and pinned options further narrow matches. Choose either message ID bounds or date bounds, not both; interval boundaries are exclusive. CordWipe only considers ordinary messages and replies (Discord message types `0` and `19`) authored by the verified signed-in user.

Defaults wait 30 seconds between search pages and one second between deletion requests. These waits are configurable, with a one-second minimum. Discord rate-limit instructions may require longer waits. CordWipe stops after its bounded retry limit rather than bypassing rate limits.

The first deletion action explicitly retrieves authorization and checks the signed-in user through Discord's API. It then searches, shows a confirmation preview of the first matching page, and only sends deletion requests after you confirm. The preview is not a final total. **To check the interface safely, open the panel and inspect it without clicking Fill or Delete.** If you later decide to test deletion, use disposable messages and review the confirmation carefully.

In a DM or group DM, CordWipe reads history pages into memory to locate your messages; other participants' messages are never deletion candidates. CordWipe does not send those messages to any service other than Discord or persist them. In servers, it searches Discord's indexed search results and only processes entries marked as hits.

## Safety and privacy

CordWipe does not retrieve an authorization token or make API requests when the page loads. The **me** button reads your user ID from Discord's in-page data. The **Fill** button explicitly retrieves the authorization needed for requests; **Delete** does so if you did not use Fill first. CordWipe does not write the authorization value to logs or save it, and clears it from the panel and run state after use. Treat your browser session and userscript manager as sensitive; inspect the source before installing, and never share authorization values, screenshots, or diagnostic output that may expose private messages.

The code runs in the browser while you are signed in and sends requests to Discord. A userscript manager or another extension with access to Discord pages may have broader capabilities. Install only code you trust.

Deletion cannot be undone by CordWipe. Review the target, author, filters, and confirmation preview carefully. Stop halts further work, but messages already deleted remain deleted. Deleting your own messages does not remove copies, notifications, or data retained by other users or Discord.

Stop cannot recall a deletion request already sent to Discord. A stopped or timed-out request may have reached Discord even if its response was not received; counters include confirmed responses only. Logs omit message content, but confirmation previews display it outside Streamer mode's masking. Review your screen before sharing it.

## Compatibility and limitations

- CordWipe targets Discord's web client in a browser. The desktop application is not supported.
- This is `0.1.0-dev.1`. On October 17, 2026, the maintainer confirmed the launcher and panel worked in Discord web and separately reported successfully deleting messages with CordWipe. That is a limited real-world test, not proof of reliability across all message types, browsers or accounts. Automated tests use synthetic API responses and offline browser fixtures.
- Discord's server search is indexed and may omit messages. A completed server search means the returned matches were exhausted; it does not prove every matching server message was found.
- DM/group-DM history is paged directly. Completion means the history available to the script was traversed to the selected lower bound; access, retention, and API behavior can limit results.
- Discord may change its DOM, API, permissions, or rate limits without notice. Search results, message availability, and deletion permissions are controlled by Discord.
- This tool cannot delete messages written by other people. Discord may reject an individual deletion; failures are reported and do not count as successful deletions.

## Development and tests

Requires Node.js 20 or later. The browser fixture uses Playwright with Chromium; install its browser once with `npx playwright install chromium` if it is not already available.

```sh
npm ci
npx playwright install chromium
npm test
```

`npm test` runs lint, unit tests, the build, and offline browser tests against a local fixture. `npm run test:browser` runs the fixture tests on their own. The fixture blocks network access and uses synthetic data; no test accesses a Discord account or deletes real messages. These checks do not validate a live Discord UI or any Tampermonkey/Violentmonkey and browser combination. Manual UI validation is still required. Any optional deletion test must use disposable messages only.

## Project and credits

- CordWipe repository: [github.com/avizmarlon/cordwipe](https://github.com/avizmarlon/cordwipe)
- Original project: [Undiscord](https://github.com/victornpb/undiscord), created by [`victornpb`](https://github.com/victornpb) with contributions from its contributors. CordWipe preserves the original copyright and attribution required by the inherited MIT license.
- Related work reviewed: [PurgeCord](https://github.com/feelmypain/purgecord), by `feelmypain` and its contributors. Its separation of DM history traversal from server search and its bounded pagination/error handling informed this investigation. CordWipe's current implementation is independently written; no PurgeCord source code is copied.
- UI issue research: Undiscord [#805](https://github.com/victornpb/undiscord/issues/805), [#767](https://github.com/victornpb/undiscord/issues/767), and [#769](https://github.com/victornpb/undiscord/pull/769).

## License

CordWipe is distributed under the [MIT License](./LICENSE), including the original Undiscord copyright and required attribution notice. Contributions are welcome through pull requests. By submitting a contribution, you agree that it may be distributed under the repository's MIT license and attribution terms. Please read [CONTRIBUTING.md](./CONTRIBUTING.md) before making a change.
