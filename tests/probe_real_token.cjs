const host = process.env.FIREBASE_DATABASE_EMULATOR_HOST || '127.0.0.1:9000';
const ns = 'scorear2-default-rtdb';
const realToken = "eyJhbGciOiJSUzI1NiIsImtpZCI6IjkwNGIwZjkxYmU2ZWIwODY3ZGFiYmFhYjU4N2RmYzJlMzNmMDBhMjQiLCJ0eXAiOiJKV1QifQ.eyJwcm92aWRlcl9pZCI6ImFub255bW91cyIsImlzcyI6Imh0dHBzOi8vc2VjdXJldG9rZW4uZ29vZ2xlLmNvbS9zY29yZWFyMiIsImF1ZCI6InNjb3JlYXIyIiwiYXV0aF90aW1lIjoxNzk0MDgzMDA5LCJ1c2VyX2lkIjoiMnNxNWhjTDRSS1pwdWN2RXFHOGhrTnF4VTlGMiIsInN1YiI6IjJzcTVoY0w0UktacHVjdkVxRzhoa05xeFU5RjIiLCJpYXQiOjE3OTQwODMwMDksImV4cCI6MTc5NDA4NjYwOSwiZmlyZWJhc2UiOnsiaWRlbnRpdGllcyI6e30sInNpZ25faW5fcHJvdmlkZXIiOiJhbm9ueW1vdXMifX0.FZEiGNNXZekBYczfOJ_1QhEXpv_v4-vFxEh17VLcy7xj-Fu5ti306hCrWlDzbBWClejIyztawXgWhLREFBwofqCtQB-AeSBiK7FqDuflbXvybV7m5mRS6oEwPvDMZ2-cb90fVObOyoZ66qmMM1RICrdhweNF1VSSlU_Nb-5N6tLP2PgkBgEXO88E1HLTZM76INdM7ivx8e16LN-4h3IkXHpZdvkQfOTlfG5nXKMpfnHEl0QWc48M3yqyOoEIrYOXfUi9pAvZkTTwewtnlf-0szmU9OC1FOY5BeXbUynlomWhO-kt7lo0OnL0oOK9KHWQK8X-_A5z5az7cQC5H4p5iQ";
const realUid = "2sq5hcL4RKZpucvEqG8hkNqxU9F2";

async function run() {
  console.log('[PROBE REAL TOKEN] Testing with real signed token UID:', realUid);

  // Test: Real student joins room 123456 at players/<realUid>
  const res = await fetch(`http://${host}/rooms/123456/players/${realUid}.json?ns=${ns}&auth=${realToken}`, {
    method: 'PUT',
    body: JSON.stringify({ id: realUid, name: 'طالب حقيقي' })
  });
  console.log('Real token join status:', res.status, await res.text());
}

run().catch(e => { console.error(e); process.exit(1); });
