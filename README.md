# CordWipe

CordWipe is an open-source browser userscript for finding and deleting your own Discord messages in a direct message, group DM, or server. It is an early development build derived from Undiscord. Discord can change its web client or API at any time, so compatibility is not guaranteed.

> **Use with care.** Message deletion is irreversible. [Discord prohibits automating normal user accounts](https://support.discord.com/hc/en-us/articles/115002192352-Automated-User-Accounts-Self-Bots) and may terminate accounts that do so. You are responsible for deciding whether to use this software. CordWipe is unaffiliated with Discord.

## Development build

This repository does not publish a release or userscript-manager update feed. Install the local development build yourself:

1. Install a userscript manager compatible with your browser, such as [Violentmonkey](https://violentmonkey.github.io/) or [Tampermonkey](https://www.tampermonkey.net/).
2. Clone or download this repository and open the userscript manager's dashboard.
3. Choose **Create a new script**, replace its editor contents with the full contents of [`cordwipe.user.js`](./cordwipe.user.js), and save with <kbd>Ctrl</kbd>+<kbd>S</kbd> (or <kbd>Cmd</kbd>+<kbd>S</kbd> on macOS).
4. Disable any other Undiscord or PurgeCord userscript while testing to avoid duplicate controls.
5. Open Discord in a browser at [discord.com](https://discord.com/channels/@me), not the desktop application. CordWipe's control should appear in the channel interface or its floating fallback.

The build artifact is generated from source; after changing code, run `npm run build` and install the resulting `cordwipe.user.js` again. Do not install a script from an unreviewed mirror or paste code into Discord's developer console.

If the script is enabled but no control appears, check that the manager has permission to run userscripts on Discord. Tampermonkey documents this browser permission in its [userscript execution FAQ](https://www.tampermonkey.net/faq.php#Q209).

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
- This is `0.1.0-dev.1`; no live Discord UI, browser/userscript-manager combination, or real deletion has been validated for this build. Automatic tests use local fixtures and simulated responses only.
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
