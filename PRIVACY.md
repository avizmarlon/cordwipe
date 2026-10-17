# CordWipe privacy policy

Effective October 17, 2026.

CordWipe has one purpose: helping you find and delete your own Discord messages. This policy covers the CordWipe browser extension and userscript maintained at [avizmarlon/cordwipe](https://github.com/avizmarlon/cordwipe).

## Data access and use

Before you allow access in the CordWipe panel, CordWipe does not retrieve your account ID, session authorization or message history. Consent applies to the current page session and is not saved across reloads.

After consent, CordWipe can read your account ID and the selected server/channel identifiers. When you click **Delete**, it retrieves your existing Discord session authorization, verifies your account with Discord, and requests messages within the selected scope. DM history can include other participants' messages; CordWipe filters these locally and only your own matching messages can become deletion candidates. It processes message text, author/channel/message identifiers, timestamps, attachments/link metadata and pinned status to apply your filters and show a confirmation preview. It does not download attachments.

CordWipe sends authenticated HTTPS requests only to Discord to find and delete messages. It does not send this data to the maintainers or another service. There is no CordWipe backend, analytics, advertising, sale of data, or transfer for unrelated purposes. CordWipe's use of user data is limited to its single purpose and complies with the Chrome Web Store User Data Policy, including its Limited Use requirements.

## Storage and security

CordWipe does not save authorization or message history to its own persistent storage. Authorization is held temporarily for a run and removed from the run options afterward; it is never placed in the panel or logs. Filter fields, identifiers and progress remain in the page until you clear them or reload. Closing the panel only hides it. Discord retains its own session and data according to [Discord's privacy policy](https://discord.com/privacy).

CordWipe runs in the same JavaScript environment as Discord because it needs access to the signed-in session. This is **not an isolated credential vault**: Discord page scripts can inspect or interfere with that environment. Install only a trusted CordWipe build and avoid other untrusted scripts or extensions.

## Your choices

You can inspect the panel before allowing access. Unchecking the consent box stops an active run and prevents new access through the controls. **Stop** cancels further work, but a request already sent may still complete. Reloading the page clears CordWipe's page state; disabling or uninstalling it prevents future runs.

Deletion is irreversible. Stopping, revoking consent or uninstalling CordWipe cannot restore deleted messages. Discord account automation may also violate Discord's terms.

Installation, updates, and links you choose to open are handled by your browser, userscript manager, GitHub, Greasy Fork or an extension store, under their respective policies. CordWipe does not use those services to transmit your Discord session or messages.

## Contact and changes

For questions or privacy concerns, [open an issue](https://github.com/avizmarlon/cordwipe/issues). Do not include tokens, cookies, private messages or other sensitive information. Maintainers have no access to your Discord data through CordWipe; share only redacted information you choose to provide for support.

Policy changes will be published in this file with an updated effective date.
