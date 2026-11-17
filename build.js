import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import vm from 'vm';
import { createHash } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Building and Synchronizing ScoreAR files (Organized Modular Bundler)...');

const publicDir = path.join(__dirname, 'public');
const targets = [publicDir];

function copyDirRecursiveSync(src, dest) {
  if (!fs.existsSync(src)) return;
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirRecursiveSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

// Clean only the verified, generated public directory; never follow a junction.
const expected = path.resolve(__dirname, 'public');
if (path.resolve(publicDir) !== expected || path.dirname(expected) !== path.resolve(__dirname)) throw new Error('Unsafe build output');
if (fs.existsSync(publicDir)) {
  if (fs.lstatSync(publicDir).isSymbolicLink()) throw new Error('Build output cannot be a link');
  fs.rmSync(publicDir, {recursive:true,force:true});
}
fs.mkdirSync(publicDir,{recursive:true});

// 1. Copy clean root metadata and standalone HTML pages to public/
const rootFiles = [
  'cards.html', 'characters.html', 'podium.html',
  '404.html',
  'cards.json', 'manifest.json', 'sw.js', 'robots.txt', 'sitemap.xml',
  'google65739e9df66ba15c.html', 'firebase-config.js'
];

rootFiles.forEach(f => {
  const p = path.join(__dirname, f);
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(publicDir, f));
  }
});
console.log('✅ Copied root metadata and standalone HTML pages to public/');

// 2. Synchronize organized folders: css/ and js/ to preserve individual source files
['css', 'js'].forEach(folder => {
  const src = path.join(__dirname, folder);
  if (fs.existsSync(src)) {
    copyDirRecursiveSync(src, path.join(publicDir, folder));
    console.log(`✅ Synchronized ${folder}/ individual source files to public/`);
  }
});

// 3. Copy assets, vendor, content, and src directories
['assets', 'vendor', 'content', 'src', 'cards'].forEach(folder => {
  const src = path.join(__dirname, folder);
  if (fs.existsSync(src)) {
    copyDirRecursiveSync(src, path.join(publicDir, folder));
    console.log(`✅ Synchronized ${folder}/ directory to public/`);
  }
});

// 4. Bundle Definitions (Strictly non-protected UI/feature files)
const BUNDLE_DEFINITIONS = [
  {
    type: 'css',
    outPath: 'css/scorear-styles.bundle.css',
    files: [
      'css/tokens.css',
      'css/styles.css',
      'css/launch.css',
      'css/workspace.css',
      'css/characters-v4.css',
      'css/cartoon-motion.css',
      'css/classrooms.css'
    ]
  },
  {
    type: 'js',
    outPath: 'js/bundles/auth-core.bundle.js',
    files: [
      'js/auth/api-config.js',
      'js/auth/firebase-config.js',
      'js/auth/auth.js',
      'js/auth/auth-ui.js',
      'js/auth/auth-register-ui.js'
    ]
  },
  {
    type: 'js',
    outPath: 'js/bundles/quiz-host-ui.bundle.js',
    files: [
      'js/quiz/quiz-audio.js',
      'js/quiz/quiz-host-leaderboard.js',
      'js/quiz/quiz-host-events.js',
      'js/quiz/quiz-host-view.js'
    ]
  },
  {
    type: 'js',
    outPath: 'js/bundles/quiz-podium.bundle.js',
    files: [
      'js/quiz/quiz-bots.js',
      'js/quiz/quiz-podium-capture.js',
      'js/quiz/quiz-podium-effects.js',
      'js/quiz/quiz-student-view.js'
    ]
  },
  {
    type: 'js',
    outPath: 'js/bundles/quiz-studio.bundle.js',
    files: [
      'js/quiz/quiz-builder-actions.js',
      'js/quiz/quiz-builder-media.js',
      'js/quiz/quiz-builder.js',
      'js/quiz/quiz-bank-data.js',
      'js/quiz/quiz-bank.js',
      'js/quiz/quiz-importer.js',
      'js/quiz/quiz-doc-extractor.js',
      'js/quiz/quiz-ai-pipeline.js',
      'js/quiz/quiz-ai-review.js',
      'js/quiz/quiz-ai.js',
      'js/quiz/quiz-reports.js',
      'js/auth/admin-management.js'
    ]
  },
  {
    type: 'js',
    outPath: 'js/bundles/journey-ui.bundle.js',
    files: [
      'js/journey/mistake-scheduler.js',
      'js/journey/mistake-notebook.js',
      'js/journey/skill-map.js',
      'js/journey/library-hub.js',
      'js/journey/journey-extras.js',
      'js/ui/nav.js',
      'js/journey/world-content-picker.js',
      'js/journey/world-flow.js',
      'js/journey/cloud-sync-bridge.js',
      'js/ui/cards-gallery.js',
      'js/ui/unified-views.js',
      'js/journey/classrooms-service.js',
      'js/journey/classrooms-homework.js',
      'js/journey/classrooms-ui.js'
    ]
  }
];

// 5. Generate and validate the 6 optimized bundles
console.log('📦 Generating optimized bundles for mobile and school networks...');
for (const b of BUNDLE_DEFINITIONS) {
  let combined = '';
  for (const f of b.files) {
    const srcPath = path.join(__dirname, f);
    if (!fs.existsSync(srcPath)) {
      throw new Error(`[Build Error] Missing bundle source file: ${f}`);
    }
    const content = fs.readFileSync(srcPath, 'utf8');
    if (b.type === 'js') {
      combined += `;\n/* --- [${b.outPath}] START: ${f} --- */\n` + content + `\n;\n/* --- END: ${f} --- */\n\n`;
    } else {
      combined += `/* --- [${b.outPath}] START: ${f} --- */\n` + content + `\n\n`;
    }
  }

  // Validate JavaScript bundle syntax
  if (b.type === 'js') {
    try {
      new vm.Script(combined, { filename: b.outPath });
    } catch (syntaxErr) {
      console.error(`❌ Syntax error inside generated bundle: ${b.outPath}`, syntaxErr);
      throw syntaxErr;
    }
  }

  targets.forEach(target => {
    const outFull = path.join(target, b.outPath);
    const parentDir = path.dirname(outFull);
    if (!fs.existsSync(parentDir)) fs.mkdirSync(parentDir, { recursive: true });
    fs.writeFileSync(outFull, combined, 'utf8');
  });
  console.log(`✅ Created bundle: ${b.outPath} (${(Buffer.byteLength(combined) / 1024).toFixed(1)} KB from ${b.files.length} files)`);
}

// 6. Generate optimized public/index.html using the 6 bundles + 13 protected engines
console.log('⚡ Generating optimized public/index.html...');
const rootIndexHtml = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');

// Replace 7 CSS links with 1 CSS bundle link
const cssRegex = /<link rel="stylesheet" href="css\/(?:tokens|styles)\.css[^"]*">[\s\S]*?<link rel="stylesheet" href="css\/classrooms\.css[^"]*">/;
const bundledCss = '<link rel="stylesheet" href="css/scorear-styles.bundle.css?v=20261114_v18_05b2">';
let bundledIndexHtml = rootIndexHtml.replace(cssRegex, bundledCss);

// Replace 5 Auth scripts with auth-core.bundle.js
const authRegex = /<script src="js\/auth\/api-config\.js[^"]*" defer><\/script>[\s\S]*?<script src="js\/auth\/auth-register-ui\.js[^"]*" defer><\/script>/;
const bundledAuth = '<script src="js/bundles/auth-core.bundle.js?v=20261114_v18_heroes_verified" defer></script>';
if (!authRegex.test(bundledIndexHtml)) throw new Error('Build marker missing: authRegex');
bundledIndexHtml = bundledIndexHtml.replace(authRegex, bundledAuth);

// Replace 4 Host UI scripts with quiz-host-ui.bundle.js
const hostUiRegex = /<script src="js\/quiz\/quiz-audio\.js[^"]*" defer><\/script>[\s\S]*?<script src="js\/quiz\/quiz-host-view\.js[^"]*" defer><\/script>/;
const bundledHostUi = '<script src="js/bundles/quiz-host-ui.bundle.js?v=20261114_v18_heroes_verified" defer></script>';
if (!hostUiRegex.test(bundledIndexHtml)) throw new Error('Build marker missing: hostUiRegex');
bundledIndexHtml = bundledIndexHtml.replace(hostUiRegex, bundledHostUi);

// Replace 4 Podium scripts with quiz-podium.bundle.js
const podiumRegex = /<script src="js\/quiz\/quiz-bots\.js[^"]*" defer><\/script>[\s\S]*?<script src="js\/quiz\/quiz-student-view\.js[^"]*" defer><\/script>/;
const bundledPodium = '<script src="js/bundles/quiz-podium.bundle.js?v=20261114_v18_heroes_verified" defer></script>';
if (!podiumRegex.test(bundledIndexHtml)) throw new Error('Build marker missing: podiumRegex');
bundledIndexHtml = bundledIndexHtml.replace(podiumRegex, bundledPodium);

// Replace 13 Studio scripts with quiz-studio.bundle.js
const studioRegex = /<script src="js\/quiz\/quiz-builder-actions\.js[^"]*" defer><\/script>[\s\S]*?<script src="js\/auth\/admin-management\.js[^"]*" defer><\/script>/;
const bundledStudio = '<script src="js/bundles/quiz-studio.bundle.js?v=20261114_v18_heroes_verified" defer></script>';
if (!studioRegex.test(bundledIndexHtml)) throw new Error('Build marker missing: studioRegex');
bundledIndexHtml = bundledIndexHtml.replace(studioRegex, bundledStudio);

// Replace 9 Journey UI scripts with journey-ui.bundle.js while strictly preserving student-journey.js, streak.js, skill-engine.js
const journeyBlockRegex = /<script src="js\/engines\/student-journey\.js[^"]*" defer><\/script>[\s\S]*?<script src="js\/journey\/world-flow\.js[^"]*" defer><\/script>/;
const bundledJourneyBlock = `<script src="js/engines/student-journey.js?v=20261114_v18_heroes_verified" defer></script>
<script src="js/engines/streak.js?v=20261114_v18_heroes_verified" defer></script>
<script src="js/engines/skill-engine.js?v=20261114_v18_heroes_verified" defer></script>
<script src="js/bundles/journey-ui.bundle.js?v=20261114_v18_heroes_verified" defer></script>`;
if (!journeyBlockRegex.test(bundledIndexHtml)) throw new Error('Build marker missing: journeyBlockRegex');
bundledIndexHtml = bundledIndexHtml.replace(journeyBlockRegex, bundledJourneyBlock);

// Remove individual cards-gallery, unified-views, classrooms-service, classrooms-homework, and classrooms-ui in production since they are merged in journey-ui.bundle.js
const extraViewsRegex = /\s*<script src="js\/ui\/cards-gallery\.js[^"]*" defer><\/script>\s*<script src="js\/ui\/unified-views\.js[^"]*" defer><\/script>\s*<script src="js\/journey\/classrooms-service\.js[^"]*" defer><\/script>\s*<script src="js\/journey\/classrooms-homework\.js[^"]*" defer><\/script>\s*<script src="js\/journey\/classrooms-ui\.js[^"]*" defer><\/script>/;
if (!extraViewsRegex.test(bundledIndexHtml)) throw new Error('Build marker missing: extraViewsRegex');
bundledIndexHtml = bundledIndexHtml.replace(extraViewsRegex, '');

function injectCacheBusters(html) {
  return html.replace(/((?:src|href)="(?:js|css)\/[^"?]+)(?:\?[^" ]*)?"/g, (match, prefix) => {
    const file = path.join(publicDir, prefix.split('="')[1]);
    if (!fs.existsSync(file)) throw new Error('Missing generated asset: ' + file);
    return prefix + '?v=' + createHash('sha256').update(fs.readFileSync(file)).digest('hex').slice(0, 12) + '"';
  });
}

bundledIndexHtml = injectCacheBusters(bundledIndexHtml);
targets.forEach(target => {
  fs.writeFileSync(path.join(target, 'index.html'), bundledIndexHtml, 'utf8');
  for (const page of ['characters.html', 'cards.html', 'podium.html']) {
    const pagePath = path.join(target, page);
    if (fs.existsSync(pagePath)) {
      const updated = injectCacheBusters(fs.readFileSync(pagePath, 'utf8'));
      fs.writeFileSync(pagePath, updated, 'utf8');
    }
  }
});
console.log('✅ Generated production index.html and cache-busted standalone HTML pages in public/ (saved 33 network requests!)');

fs.copyFileSync(path.join(__dirname, 'js/auth/firebase-config.js'), path.join(publicDir, 'firebase-config.js'));
console.log('ScoreAR build completed: one public output, one assets tree.');
