const fs = require('fs');
const path = require('path');
const os = require('os');

const uid = "erNK4FSMKmXha20D4HohxPes2442";
const projectId = "scorear1";

async function run() {
  console.log('⏳ جاري تفعيل صلاحية الأدمن للمستخدم:', uid);
  try {
    const configPath = path.join(os.homedir(), '.config', 'configstore', 'firebase-tools.json');
    if (!fs.existsSync(configPath)) {
      throw new Error('لم يتم العثور على جلسة Firebase CLI، يرجى تشغيل npx firebase-tools login');
    }
    const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    let token = config.tokens?.access_token;

    // تجديد الرمز تلقائياً إن لزم
    if (config.tokens?.refresh_token && (!config.tokens.expires_at || Date.now() > config.tokens.expires_at - 60000)) {
      const refreshRes = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
          grant_type: 'refresh_token',
          refresh_token: config.tokens.refresh_token
        })
      });
      const refreshData = await refreshRes.json();
      if (refreshData.access_token) token = refreshData.access_token;
    }

    const res = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        localId: uid,
        customAttributes: JSON.stringify({ role: 'admin' })
      })
    });

    const data = await res.json();
    if (data.error) {
      console.error('❌ تنبيه من فايرباس:', data.error.message || JSON.stringify(data.error));
    } else {
      console.log('======================================================');
      console.log('🎉 مبروك يا أستاذ أحمد! تم تفعيل حسابك كـ (مدير المنصة Admin) بنجاح!');
      console.log('👤 البريد المفعل:', data.email || uid);
      console.log('🛡️ الرتبة: admin (كامل صلاحيات الإدارة والاستوديو)');
      console.log('======================================================');
    }
  } catch (err) {
    console.error('⚠️ خطأ:', err.message);
  }
}

run();