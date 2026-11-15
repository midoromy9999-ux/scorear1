const https = require('https');

https.get('https://scorear2.web.app/quiz-student.js', { rejectUnauthorized: false }, res => {
  let buf = '';
  res.on('data', c => buf += c);
  res.on('end', () => {
    console.log('Live quiz-student.js check:');
    console.log(' - Has neutral pin (📌):', buf.includes('📌 تم اختيارك'));
    console.log(' - Has old green check on tap (✓ اختيارك):', buf.includes('✓ اختيارك'));
    console.log(' - Has robust grading lookup:', buf.includes('byName = Object.values(resData.playerResults)'));
  });
});

https.get('https://scorear2.web.app/quiz-host.js', { rejectUnauthorized: false }, res => {
  let buf = '';
  res.on('data', c => buf += c);
  res.on('end', () => {
    console.log('Live quiz-host.js check:');
    console.log(' - Has getCorrectAnswerIndex helper:', buf.includes('getCorrectAnswerIndex'));
    console.log(' - Has magic lobby music:', buf.includes("music('magic', 0.28)"));
    console.log(' - Has treasure question music:', buf.includes("music('treasure', 0.32)"));
    console.log(' - Has points in podium:', buf.includes('${item.p.score} نقطة'));
  });
});
