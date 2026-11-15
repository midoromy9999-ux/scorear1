/**
 * Automated Verification: Image Upload & Security Test for Items 8 & 9
 * Tests:
 * 8 & 9) Image Upload Security & Constraints:
 *    - Rejection without auth token (401 Unauthorized).
 *    - Rejection without teacher role (403 Forbidden).
 *    - Rejection of invalid file types (allowed only WebP, JPEG, PNG).
 *    - Rejection of files exceeding size limit (> 500KB).
 *    - Successful upload with teacher token returning secure URL.
 *    - CORS restriction check.
 */
process.env.NODE_ENV = 'test';
import assert from 'assert';
import handler from '../api/upload-token.js';

console.log('\n--- 1. Testing /api/upload-token Authentication & Role Guards ---');

function createMockReqRes({ method = 'POST', headers = {}, body = {} } = {}) {
  const res = {
    statusCode: 200,
    headers: {},
    bodyData: null,
    setHeader: (k, v) => { res.headers[k.toLowerCase()] = v; },
    status: (code) => { res.statusCode = code; return res; },
    json: (data) => { res.bodyData = data; return res; },
    end: () => res
  };
  const req = {
    method,
    headers: { origin: 'https://socerar2.vercel.app', ...headers },
    body
  };
  return { req, res };
}

// 1.1 Request without Authorization header -> 401
const { req: r1, res: s1 } = createMockReqRes({
  body: { imageBase64: 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA' }
});
await handler(r1, s1);
assert.strictEqual(s1.statusCode, 401, 'Request without token must return 401');
assert.ok(s1.bodyData.error.includes('تسجيل دخول المعلم'), 'Error message must specify teacher login required');
console.log('✓ Rejected request without Authorization token (401 Unauthorized)');

// 1.2 Request with non-teacher (student) token -> 403
const { req: r2, res: s2 } = createMockReqRes({
  headers: { authorization: 'Bearer test_student_token_123' },
  body: { imageBase64: 'data:image/webp;base64,UklGRkAAAABXRUJQVlA4IDQAAADwAQCdASoBAAEAAQAcJaACdLoAAP7/2QAA' }
});
await handler(r2, s2);
assert.strictEqual(s2.statusCode, 403, 'Student token must be rejected with 403');
assert.ok(s2.bodyData.error.includes('غير مصرح'), 'Error message must state unauthorized role');
console.log('✓ Rejected non-teacher account without teacher role (403 Forbidden)');

// 1.3 Request with invalid file type -> 400
const { req: r3, res: s3 } = createMockReqRes({
  headers: { authorization: 'Bearer test_teacher_token_123' },
  body: {
    imageBase64: 'data:application/pdf;base64,JVBERi0xLjUK',
    contentType: 'application/pdf'
  }
});
await handler(r3, s3);
assert.strictEqual(s3.statusCode, 400, 'Invalid file type must return 400');
assert.ok(s3.bodyData.error.includes('غير مدعوم'), 'Error message must state unsupported file type');
console.log('✓ Rejected unsupported file type (400 Bad Request)');

// 1.4 Request with file exceeding size limit (> 500KB) -> 400
const largeBase64 = Buffer.alloc(550 * 1024, 'a').toString('base64');
const { req: r4, res: s4 } = createMockReqRes({
  headers: { authorization: 'Bearer test_teacher_token_123' },
  body: {
    imageBase64: `data:image/webp;base64,${largeBase64}`,
    contentType: 'image/webp'
  }
});
await handler(r4, s4);
assert.strictEqual(s4.statusCode, 400, 'Large file must return 400');
assert.ok(s4.bodyData.error.includes('يتجاوز الحد المسموح'), 'Error message must state file size exceeded');
console.log('✓ Rejected file exceeding 500KB limit (400 Bad Request)');

// 1.5 Valid teacher upload within limits -> 200 with URL
const validSmallWebP = Buffer.alloc(100 * 1024, 0).toString('base64');
const { req: r5, res: s5 } = createMockReqRes({
  headers: { authorization: 'Bearer test_teacher_token_123' },
  body: {
    imageBase64: `data:image/webp;base64,${validSmallWebP}`,
    contentType: 'image/webp'
  }
});
await handler(r5, s5);
assert.strictEqual(s5.statusCode, 200, 'Valid teacher upload must succeed with 200');
assert.ok(s5.bodyData.url, 'Must return blob URL');
assert.ok(s5.bodyData.url.startsWith('http'), 'URL must be valid web URL');
assert.ok(s5.bodyData.url.includes('/quiz-images/teacher_123/'), 'Path must strictly start with quiz-images/{uid}/');
console.log('✓ Valid teacher upload succeeded with 200 and returned URL with quiz-images/{uid}/ prefix:', s5.bodyData.url);

// 1.6 CORS verification: Authorized vs Unauthorized Origins
assert.strictEqual(s5.headers['access-control-allow-origin'], 'https://socerar2.vercel.app');
console.log('✓ CORS header strictly verified for authorized ScoreAR origin');

const { req: rCors, res: sCors } = createMockReqRes({
  headers: { origin: 'https://malicious-random-site.vercel.app', authorization: 'Bearer test_teacher_token_123' },
  body: { action: 'delete', url: 'https://scorear-cdn.vercel.app/quiz-images/teacher_123/sample.webp' }
});
await handler(rCors, sCors);
assert.strictEqual(sCors.statusCode, 403, 'CORS rejection must return 403 Forbidden for unauthorized origin');
console.log('✓ CORS strictly rejected unauthorized origin with 403 Forbidden');

// 1.7 Cross-Teacher Deletion Defense (Teacher B tries to delete Teacher A image)
const { req: rCross, res: sCross } = createMockReqRes({
  headers: { authorization: 'Bearer test_teacher_token_teacherB' },
  body: {
    action: 'delete',
    url: 'https://scorear-cdn.vercel.app/quiz-images/teacher_123/sample.webp'
  }
});
await handler(rCross, sCross);
assert.strictEqual(sCross.statusCode, 403, 'Teacher B attempting to delete Teacher A image must be rejected with 403');
console.log('✓ Cross-Teacher defense verified: Teacher B rejected (403 Forbidden) when attempting to delete Teacher A image');

// 1.8 Teacher A successfully deletes own image
const { req: rOwn, res: sOwn } = createMockReqRes({
  headers: { authorization: 'Bearer test_teacher_token_123' },
  body: {
    action: 'delete',
    url: 'https://scorear-cdn.vercel.app/quiz-images/teacher_123/sample.webp'
  }
});
await handler(rOwn, sOwn);
assert.strictEqual(sOwn.statusCode, 200, 'Teacher A deleting own image must succeed with 200');
assert.strictEqual(sOwn.bodyData.success, true, 'Must return success: true');
console.log('✓ Authorized image deletion verified: Teacher A successfully deleted own image from Blob');

console.log('\n========================================');
console.log('ALL IMAGE UPLOAD & SECURITY TESTS PASSED 100%! 🚀');
console.log('========================================');
