// Builds standalone/HO-Tracker.html: the whole web app in ONE file that works when opened
// directly from disk (double-click), without a web server, GitHub Pages or an internet connection.
//
//   npm run build:standalone
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const out = mkdtempSync(join(tmpdir(), 'ho-tracker-'));
try {
  execFileSync('npx', ['expo', 'export', '--platform', 'web', '--output-dir', out], {
    stdio: 'inherit',
    shell: process.platform === 'win32',
  });

  const jsDir = join(out, '_expo', 'static', 'js', 'web');
  const bundles = readdirSync(jsDir).filter((file) => file.endsWith('.js'));
  if (bundles.length !== 1) throw new Error(`Expected exactly one web bundle, found ${bundles.length}`);
  // "</script" inside the bundle would end the inline script tag early.
  const js = readFileSync(join(jsDir, bundles[0]), 'utf8').replaceAll('</script', '<\\/script');

  const html = `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>HO-Tracker</title>
<style>
  html, body { height: 100%; margin: 0; background: #f5f6f8; }
  body { overflow: hidden; }
  #root { display: flex; height: 100%; flex: 1; }
</style>
</head>
<body>
<noscript>You need to enable JavaScript to run this app.</noscript>
<div id="root"></div>
<script>${js}</script>
</body>
</html>
`;

  mkdirSync('standalone', { recursive: true });
  writeFileSync(join('standalone', 'HO-Tracker.html'), html);
  console.log(`standalone/HO-Tracker.html written (${Math.round(html.length / 1024)} KB)`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
