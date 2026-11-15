/**
 * Two-Account Live Firebase RTDB Cycle Test
 * Account 1: Teacher creates class
 * Account 2: Student registers with class code
 * Verifies:
 * - Student is strictly PENDING in RTDB (no auto-approval)
 * - Teacher sees pending alert with count and student profile
 * - Teacher approves student
 * - Student becomes APPROVED in RTDB
 */
const fs = require('fs');
const path = require('path');
const assert = require('assert');

// Test unit simulation using actual service code
async function runTwoAccountCycle() {
  console.log('\n--- Running Two-Account Live Cycle Simulation ---');

  // Load modules
  const serviceCode = fs.readFileSync(path.join(__dirname, '../js/journey/classrooms-service.js'), 'utf8');

  // Shared RTDB Store
  const rtdbStore = {
    scorear_learning_v1: {
      classes: {},
      teacher_classes: {},
      student_classes: {},
      profiles: {}
    },
    scorear_students: {}
  };

  function createEnv(actorRole, actorUid, actorName) {
    const localStore = {};
    const env = {
      localStorage: {
        getItem: k => localStore[k] || null,
        setItem: (k, v) => { localStore[k] = String(v); },
        removeItem: k => { delete localStore[k]; }
      },
      sessionStorage: {
        getItem: () => null,
        setItem: () => {},
        removeItem: () => {}
      },
      firebase: {
        auth: () => ({
          currentUser: { uid: actorUid, displayName: actorName, emailVerified: true },
          signInAnonymously: async () => ({ user: { uid: actorUid } })
        }),
        database: () => ({
          ref: (rPath = '') => {
            const clean = rPath.replace(/^\/+|\/+$/g, '');
            const parts = clean.split('/');
            return {
              child: sub => env.firebase.database().ref(clean ? `${clean}/${sub}` : sub),
              set: async val => {
                let curr = rtdbStore;
                for (let i = 0; i < parts.length - 1; i++) {
                  curr[parts[i]] = curr[parts[i]] || {};
                  curr = curr[parts[i]];
                }
                if (val === null) delete curr[parts[parts.length - 1]];
                else curr[parts[parts.length - 1]] = JSON.parse(JSON.stringify(val));
              },
              once: async () => {
                let curr = rtdbStore;
                for (const p of parts) {
                  if (curr === undefined || curr === null) break;
                  curr = curr[p];
                }
                const exists = curr !== undefined && curr !== null;
                const cloned = exists ? JSON.parse(JSON.stringify(curr)) : null;
                return {
                  exists: () => exists,
                  val: () => cloned,
                  forEach: fn => {
                    if (cloned && typeof cloned === 'object') {
                      for (const [k, v] of Object.entries(cloned)) fn({ key: k, val: () => v });
                    }
                  }
                };
              }
            };
          }
        })
      }
    };

    if (actorRole === 'teacher') {
      env.localStorage.setItem('scorear_teacher_session', JSON.stringify({
        uid: actorUid, name: actorName, displayName: actorName, role: 'teacher', isTeacher: true
      }));
    } else {
      env.localStorage.setItem('scorear_student_session', JSON.stringify({
        uid: actorUid, name: actorName, displayName: actorName, role: 'student', isTeacher: false
      }));
    }

    env.window = env;
    env.globalThis = env;
    const fn = new Function('window', 'globalThis', 'global', serviceCode);
    fn(env, env, env);
    return { env, svc: env.ScoreARClassroomsService };
  }

  // 1. Teacher Environment
  const teacher = createEnv('teacher', 'teacher_ahmed_1', 'أ. أحمد رميح');
  const tActor = await teacher.svc.getCurrentActor();
  assert(tActor.isTeacher, 'Teacher actor must be teacher');

  // Teacher creates class
  const classRes = await teacher.svc.createClass({ name: 'الصف الأول الثانوي - أ', subject: 'اللغة العربية' });
  assert(classRes.ok, 'Class creation must succeed');
  const classCode = classRes.classData.code;
  console.log(`✅ Step 1: Teacher created class "${classRes.classData.name}" with code: ${classCode}`);

  // 2. Student Environment (Account 2)
  const student = createEnv('student', 'student_omar_9', 'عمر البطل');
  const sActor = await student.svc.getCurrentActor();
  assert(!sActor.isTeacher, 'Student actor must not be teacher');

  // Student registers with class code -> calls saveStudentProfile then requestJoinClass
  await student.svc.saveStudentProfile({ displayName: 'عمر البطل', avatarId: 'char_05', grade: 'الصف الأول الثانوي' });
  const joinRes = await student.svc.requestJoinClass(classCode);
  assert(joinRes.ok, 'Join request must succeed');
  assert.strictEqual(joinRes.status, 'pending', 'Student must be PENDING, NOT auto-approved!');
  console.log(`✅ Step 2: Student requested to join with code "${classCode}" -> Status strictly PENDING!`);

  // Verify Student's own class list shows pending
  const sClasses = await student.svc.loadMyClasses();
  assert.strictEqual(sClasses.length, 1);
  assert.strictEqual(sClasses[0].status, 'pending', 'Student class status must be pending');
  console.log(`✅ Step 3: Student view shows class "${sClasses[0].name}" as "pending"`);

  // 3. Teacher checks roster & pending requests (Account 1)
  const tClasses = await teacher.svc.loadMyClasses();
  assert.strictEqual(tClasses.length, 1);
  assert.strictEqual(tClasses[0].pending.length, 1, 'Teacher must see exactly 1 pending student in RTDB');
  assert.strictEqual(tClasses[0].pending[0].displayName, 'عمر البطل');
  console.log(`✅ Step 4: Teacher received pending request in RTDB for student: "${tClasses[0].pending[0].displayName}"`);

  // 4. Teacher Approves Student
  const approveRes = await teacher.svc.reviewMembership({
    classId: classCode,
    uid: 'student_omar_9',
    action: 'approve'
  });
  assert(approveRes.ok && approveRes.action === 'approve', 'Approval must succeed');
  console.log('✅ Step 5: Teacher approved student membership in class');

  // 5. Verify Student is now Approved
  const sClassesAfter = await student.svc.loadMyClasses();
  assert.strictEqual(sClassesAfter[0].status, 'approved', 'Student must now be APPROVED after teacher action!');
  console.log('✅ Step 6: Student class status transitioned to "approved"!');

  console.log('\n🎉 ALL TWO-ACCOUNT CYCLE CHECKS PASSED 100%!\n');
}

runTwoAccountCycle().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
