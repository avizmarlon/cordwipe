# Filters

CordWipe applies selected filters locally to returned messages. Depending on the build, these include case-insensitive text matching, regular expressions, links, attachments, pinned status, date bounds, and message ID bounds. A message must satisfy the selected filters to become a deletion candidate.

Guild searches use Discord's search index and may omit messages. Local filtering cannot recover hits Discord does not return. Complex regular expressions can freeze the page; prefer a literal text filter where possible. See [limitations](../README.md#good-to-know).
