const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 بدء تجهيز المشروع لـ scorear1 تلقائياً...');

// 1. تحديث firebase.json
const fbJsonPath = path.join(__dirname, 'firebase.json');
if (fs.existsSync(fbJsonPath)) {
  let fbJson = fs.readFileSync(fbJsonPath, 'utf8');
  fbJson = fbJson.replace(/"site":\s*"scorear2",?\r?\n?/g, '');
  fs.writeFileSync(fbJsonPath, fbJson, 'utf8');
  console.log('✅ تم تعديل firebase.json بنجاح.');
}

// 2. تحديث package.json
const pkgJsonPath = path.join(__dirname, 'package.json');
if (fs.existsSync(pkgJsonPath)) {
  let pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  pkg.scripts.deploy = "npm run build && npm test && npm run check:assets && npx firebase-tools deploy --only hosting,database";
  pkg.scripts['deploy:scorear1'] = "npm run build && npm test && npm run check:assets && npx firebase-tools deploy --only hosting,database --project scorear1";
  fs.writeFileSync(pkgJsonPath, JSON.stringify(pkg, null, 2), 'utf8');
  console.log('✅ تم تحديث أوامر النشر في package.json.');
}

// 3. تحديث lib/server/firebase.js
const serverFbPath = path.join(__dirname, 'lib/server/firebase.js');
if (fs.existsSync(serverFbPath)) {
  let s = fs.readFileSync(serverFbPath, 'utf8');
  s = s.replace(/projectId:\s*process\.env\.FIREBASE_PROJECT_ID\s*\|\|\s*'scorear2'/g, "projectId: process.env.FIREBASE_PROJECT_ID || 'scorear1'");
  s = s.replace(/https:\/\/scorear2-default-rtdb\.europe-west1\.firebasedatabase\.app/g, "https://scorear1-default-rtdb.europe-west1.firebasedatabase.app");
  if (!s.includes('scorear1.web.app')) {
    s = s.replace(/const known = new Set\(\[/, "const known = new Set(['https://scorear1.web.app', 'https://scorear1.firebaseapp.com', ");
  }
  fs.writeFileSync(serverFbPath, s, 'utf8');
  console.log('✅ تم تحديث إعدادات الخادم وقواعد CORS لدومين scorear1.');
}

// 4. تحديث js/auth/firebase-config.js ونسخة الجذر
const scorear1ConfigBlock = `    // 1. Production Project (scorear1)
    production: {
      projectId: 'scorear1',
      apiKey: 'AIzaSyC2nEpjVu8SA1EY0iL0AflHIDXX5jyTUpQ',
      authDomain: 'scorear1.firebaseapp.com',
      databaseURL: 'https://scorear1-default-rtdb.europe-west1.firebasedatabase.app',
      storageBucket: 'scorear1.firebasestorage.app',
      messagingSenderId: '404118307817',
      appId: '1:404118307817:web:88bfaa906c3356e1c8c178',
      isProduction: true,
      label: 'الإنتاج (scorear1)'
    },`;

function updateFbConfig(filePath) {
  if (!fs.existsSync(filePath)) return;
  let code = fs.readFileSync(filePath, 'utf8');
  code = code.replace(/\/\/ 1\. Production Project \(scorear2\)[\s\S]*?label:\s*'[^']*'\s*\n\s*\},/, scorear1ConfigBlock);
  if (!code.includes("hostname === 'scorear1.web.app'")) {
    code = code.replace(/const isLiveProductionHost = Boolean\(/, "const isLiveProductionHost = Boolean(\n    hostname === 'scorear1.web.app' ||\n    hostname === 'scorear1.firebaseapp.com' ||");
  }
  fs.writeFileSync(filePath, code, 'utf8');
}

updateFbConfig(path.join(__dirname, 'js/auth/firebase-config.js'));
updateFbConfig(path.join(__dirname, 'firebase-config.js'));
console.log('✅ تم تحديث ملفات firebase-config.js بمفاتيح scorear1 الحقيقية.');

// 5. تشغيل البناء لإنتاج مجلد public النهائي
console.log('📦 جاري إعادة بناء المشروع وتحديث الحزم (npm run build)...');
try {
  execSync('node build.js', { stdio: 'inherit', cwd: __dirname });
  console.log('🎉 اكتمل بناء وتجهيز المشروع بنجاح 100%!');
} catch (err) {
  console.error('⚠️ حدث خطأ أثناء البناء:', err.message);
}