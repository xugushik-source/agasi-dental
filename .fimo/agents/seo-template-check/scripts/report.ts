/**
 * Tool: report
 *
 * Render a markdown report from the per-page audit results.
 *
 * Inputs (stdin JSON): { score: number, pages: PageReport[] }
 * Outputs (stdout): markdown
 */

interface Finding {
  rule: string;
  severity: 'ok' | 'warn' | 'fail';
  message: string;
}

interface PageReport {
  path: string;
  score: number;
  findings: Finding[];
}

function statusChip(score: number): string {
  if (score >= 80) {
    return 'OK';
  }
  if (score >= 60) {
    return 'WARN';
  }
  return 'FAIL';
}

async function readStdin(): Promise<string> {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}

async function main(): Promise<void> {
  const text = await readStdin();
  const data = JSON.parse(text) as { score: number; pages: PageReport[] };

  const date = new Date().toISOString().slice(0, 10);
  const lines: string[] = [];
  lines.push(`# SEO audit · ${date}`);
  lines.push('');
  lines.push(`**Overall score:** ${data.score} / 100`);
  lines.push('');
  lines.push('## Per-page summary');
  lines.push('');
  lines.push('| Path | Score | Status |');
  lines.push('|------|-------|--------|');
  for (const page of data.pages) {
    lines.push(`| \`${page.path}\` | ${page.score} | ${statusChip(page.score)} |`);
  }
  lines.push('');
  lines.push('## Findings');
  lines.push('');
  for (const page of data.pages) {
    const failures = page.findings.filter((f) => f.severity !== 'ok');
    if (failures.length === 0) {
      continue;
    }
    lines.push(`### \`${page.path}\``);
    lines.push('');
    for (const finding of failures) {
      const sev = finding.severity === 'fail' ? '❌' : '⚠️';
      lines.push(`- ${sev} **${finding.rule}** — ${finding.message}`);
    }
    lines.push('');
  }
  lines.push('');
  lines.push(`<!-- agent-summary: { "score": ${data.score}, "pages": ${data.pages.length} } -->`);

  process.stdout.write(lines.join('\n'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
