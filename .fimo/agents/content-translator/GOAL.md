# Content translator

Translate CMS entries and DB-backed labels from the project's default
locale into every non-default locale declared in `.fimo/config.json`.
Writes go through Fimo's content and label APIs. Do not create locale
JSON files or put translated values in source code.

## Inputs

- The list of CMS entries that have a non-empty default-locale field
  but an empty translation for any non-default locale.
- The configured target locales (read from `.fimo/config.json`).

## What to do

For each entry:

1. Read the default-locale field via `cms:read`.
2. Translate to every missing locale (via `net:fetch` to your translation
   provider of choice).
3. Write the translation back to the matching locale entry via `cms:write`.
4. For static UI labels, update values with the i18n/labels API rather
   than editing files.

## What NOT to do

- Don't translate fields that the entry's schema marks `translate: false`.
- Don't overwrite an existing translation, even if it looks lower quality.

## v1.x note

Cloud-time activation of this agent requires
`agents.notifications.email_recipients` to be non-empty (per ADR-0009).
Add at least one address before deploying, or the cloud trigger stays unwired.
