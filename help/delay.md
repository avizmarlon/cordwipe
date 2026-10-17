# Rate limits and stopping

CordWipe observes Discord's rate-limit responses and waits for the requested retry period. It does not bypass limits. A run may take longer or stop with an error if Discord rejects or blocks a request.

Stopping cancels further work; a request already sent may still complete. Messages already deleted remain deleted. See the [privacy policy](../PRIVACY.md).
