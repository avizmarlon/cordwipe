# Integration investigation

This note records the sources reviewed for the CordWipe 0.1.0 development work. Discord's web client and private APIs are not stable public interfaces; these observations describe the reviewed source and reports, not a compatibility guarantee.

## Why the trash control disappeared

Undiscord's inherited UI created the panel, then searched for a toolbar using a CSS class selector and appended its button there. Its mutation observer only re-mounted the button when the app subtree changed; it did not help if the selector stopped matching. The panel could therefore exist while the entry point was absent.

- [Undiscord #805](https://github.com/victornpb/undiscord/issues/805) reports Discord changing toolbar class names and confirms that the panel remained in the page. The suggested console command exposed it by ID, but required the user to paste code in DevTools; CordWipe should not require that workaround.
- [Undiscord #767](https://github.com/victornpb/undiscord/issues/767) describes the same missing icon on a then-current Chrome build. The conversation includes a community script and reports of successful use, but that is not independent security or compatibility validation.
- [Undiscord #769](https://github.com/victornpb/undiscord/pull/769) is the linked toolbar fix. A selector fix may restore mounting for a given Discord build, but a selector tied to Discord's private DOM can break again.

CordWipe uses semantic/role and class fallbacks, a mutation observer that re-resolves the toolbar as Discord rebuilds it, a singleton panel/launcher, and a floating fallback if no toolbar can be found. Offline browser fixtures cover these mount paths. This makes discovery more resilient while acknowledging that Discord can still change its page.

## CordWipe behavior and limits

CordWipe applies an immutable run scope: it validates inputs before authorization access, verifies the current user with Discord on Find & review, then requires every candidate to match the selected author, target, and local filters before deletion. The **me** control reads the current user ID, but does not retrieve a token or make an API request. The controls require no session acceptance checkbox. A short disclosure beside Find & review explains session/message use before that explicit action retrieves authorization. Loading or opening the panel never retrieves authorization. For DMs, the channel is validated as type 1 or 3 and history is scanned in memory only to locate the user's matching messages; other participants' messages are never deletion candidates. For guilds, CordWipe consumes marked Discord search hits with a descending ID cursor. Both paths use bounded pagination/retries, honor Discord's requested rate-limit delay, and Stop aborts an active request or wait. Each channel in a multi-channel run gets a new confirmation. CordWipe does not unarchive threads.

Text substring and regex checks, link/file state, pinned state, date bounds, and message-ID bounds are applied locally; selected filters intersect. Date and message-ID intervals cannot be used together. Only message types 0 and 19 are candidates. Server-search completion means returned hits were exhausted, not that Discord's index exposed every match. DM-history completion means traversal reached the selected lower bound, subject to Discord's available history and API behavior. Unsupported message types, inaccessible channels, authorization failures, rate limits, and other API errors are not reported as successful deletions.

## Sources

- [Undiscord source](https://github.com/victornpb/undiscord)
- [Undiscord issue #805](https://github.com/victornpb/undiscord/issues/805)
- [Undiscord issue #767](https://github.com/victornpb/undiscord/issues/767)
- [Undiscord pull request #769](https://github.com/victornpb/undiscord/pull/769)
