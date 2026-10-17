# Rate limits and stopping

CordWipe observes Discord's rate-limit responses and waits for the requested retry period. It does not bypass limits. A run may take longer or stop with an error if Discord rejects or blocks a request.

Stopping prevents further work when the active request or wait is cancelled. Messages already deleted remain deleted. See [safety and privacy](../README.md#safety-and-privacy).
