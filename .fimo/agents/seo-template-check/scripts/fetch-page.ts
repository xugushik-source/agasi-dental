/**
 * Tool: fetch-page
 *
 * Fetch HTML + headers for a given URL. Used by the audit to walk every
 * route returned by `list-routes` and feed the bytes to `analyze-html`.
 *
 * Inputs (argv):
 *   1. The URL to fetch (must be the project's own domain)
 *
 * Outputs (stdout JSON):
 *   {
 *     "url": "...",
 *     "status": 200,
 *     "headers": { "content-type": "text/html; charset=utf-8", ... },
 *     "body": "<!doctype html>..."
 *   }
 */

async function main(): Promise<void> {
  const url = process.argv[2];
  if (!url) {
    console.error('Usage: fetch-page <url>');
    process.exit(1);
  }

  const res = await fetch(url, { redirect: 'manual' });
  const headers: Record<string, string> = {};
  res.headers.forEach((value, key) => {
    headers[key] = value;
  });

  const body = await res.text();
  process.stdout.write(JSON.stringify({ url, status: res.status, headers, body }, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
