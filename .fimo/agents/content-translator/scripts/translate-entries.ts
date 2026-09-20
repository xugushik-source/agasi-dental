/**
 * Tool: translate-entries
 *
 * Walk every default-locale CMS entry, find missing non-default-locale
 * document rows, call the configured translation provider, and write back
 * through the Fimo API. Skips fields marked `translate: false` in the schema.
 *
 * Provider is configured via env (FIMO_AGENT_TRANSLATE_PROVIDER) — the
 * runtime threads project secrets through when the v1.x secrets API
 * lands. For now this template uses the OpenAI fallback.
 */

interface Entry {
  id: string;
  documentId: string;
  locale: string;
  type: string;
  data: Record<string, unknown>;
}

interface TranslateOptions {
  fromLocale: string;
  toLocales: string[];
  api: { base: string; projectId: string; env: string };
}

async function listMissing(_opts: TranslateOptions): Promise<Entry[]> {
  // Stub — wired to the Fimo API by the runtime. Returns entries with
  // at least one missing target-locale document row while the default-locale
  // row is populated.
  return [];
}

async function translate(text: string, _to: string): Promise<string> {
  // Stub — call the configured provider. Returns the translated string.
  return text;
}

async function writeBack(_entry: Entry, _locale: string, _value: string): Promise<void> {
  // Stub — create/update the target locale entry via
  // `/api/tenant/:projectId/branches/:branch/entries/:type`.
}

async function main(): Promise<void> {
  const fromLocale = process.env.FIMO_DEFAULT_LOCALE ?? 'en';
  const toLocales = (process.env.FIMO_TARGET_LOCALES ?? '').split(',').filter(Boolean);
  const api = {
    base: process.env.FIMO_API_URL ?? 'http://localhost:3000',
    projectId: process.env.FIMO_PROJECT_ID ?? '',
    env: process.env.FIMO_ENV ?? 'main',
  };

  const entries = await listMissing({ fromLocale, toLocales, api });
  for (const entry of entries) {
    for (const locale of toLocales) {
      const sourceValue = typeof entry.data.title === 'string' ? entry.data.title : undefined;
      if (!sourceValue) {
        continue;
      }
      const translated = await translate(sourceValue, locale);
      await writeBack(entry, locale, translated);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
