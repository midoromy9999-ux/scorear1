const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function response(){return {code:0,headers:{},setHeader(k,v){this.headers[k]=v},status(s){this.code=s;return this},json(v){this.body=v;return this},end(){return this}};}
function load(file,{claims={uid:'ordinary',role:'student'},env={},db={},auth:authOverrides={},imports={},fetch:fetchMock}={}){
 const mutations=[];
 const auth={verifyIdToken:async token=>{if(token==='invalid')throw Error('bad token');return claims},getUser:async()=>({emailVerified:true,customClaims:{},email:'teacher@example.test'}),setCustomUserClaims:async(...args)=>mutations.push(args),revokeRefreshTokens:async()=>{},...authOverrides};
 const context={console,process:{env},URL,Buffer,Date,Math,Set,AbortSignal,fetch:fetchMock,crypto:require('node:crypto').webcrypto,
  mockImport:async name=>{if(name in imports)return imports[name];if(name==='firebase-admin/app')return {getApps:()=>[{name:'scorear-server'}]};if(name==='firebase-admin/auth')return {getAuth:()=>auth};if(name==='firebase-admin/database')return {getDatabase:()=>db};throw Error('Unexpected module: '+name)}};
 const transform=s=>s.replace(/^import .*;\r?\n/gm,'').replace(/export default async function handler/,'async function handler').replace(/export /g,'').replace(/\bimport\(/g,'mockImport(');
 vm.runInNewContext(transform(read('lib/server/firebase.js'))+'\n'+transform(read(file))+'\nthis.handler=handler;',context);
 return {handler:context.handler,mutations};
}
const req=(body={},token='valid',origin)=>({method:'POST',headers:{authorization:'Bearer '+token,...(origin?{origin}:{})},body});
test('ordinary user denied every administrative action',async()=>{
 const m=load('api/account-request.js');for(const action of ['approve','reject','toggleTeacherStatus','resetStudentPassword','deleteStudentAccount']){const res=response();await m.handler(req({action,targetUid:'target',isActive:true,newPassword:'password123'}),res);assert.equal(res.code,403);}
 assert.equal(m.mutations.length,0);
});
test('invalid token never reaches privileged operations',async()=>{
 const m=load('api/account-request.js'),res=response();await m.handler(req({action:'approve',targetUid:'target'},'invalid'),res);assert.equal(res.code,401);assert.equal(m.mutations.length,0);
});
test('missing Authorization rejected',async()=>{const m=load('api/account-request.js'),res=response();await m.handler({method:'POST',headers:{},body:{}},res);assert.equal(res.code,401)});
test('unrelated vercel domain rejected',async()=>{const m=load('api/account-request.js'),res=response();await m.handler(req({},'valid','https://attacker.vercel.app'),res);assert.equal(res.code,403)});
test('administrator cannot modify own account',async()=>{const m=load('api/account-request.js',{claims:{uid:'admin',role:'admin'}}),res=response();await m.handler(req({action:'approve',targetUid:'admin'}),res);assert.equal(res.code,403)});
test('administrator cannot modify another administrator',async()=>{const m=load('api/account-request.js',{claims:{uid:'admin',role:'admin'},auth:{getUser:async()=>({customClaims:{role:'admin'}})}}),res=response();await m.handler(req({action:'approve',targetUid:'target'}),res);assert.equal(res.code,403)});
test('unknown admin action rejected instead of reporting success',async()=>{const m=load('api/account-request.js',{claims:{uid:'admin',role:'admin'}}),res=response();await m.handler(req({action:'invented',targetUid:'target'}),res);assert.equal(res.code,400)});
test('approve preserves unrelated custom claims',async()=>{
 const updates=[];const db={ref:()=>({once:async()=>({val:()=>({displayName:'معلم'})}),update:async x=>updates.push(x)})};
 const m=load('api/account-request.js',{claims:{uid:'admin',role:'admin'},db,auth:{getUser:async()=>({emailVerified:true,customClaims:{schoolId:'s1'},email:'teacher@example.test'})}}),res=response();
 await m.handler(req({action:'approve',targetUid:'teacher'}),res);assert.equal(res.code,200);assert.equal(m.mutations[0][1].role,'teacher');assert.equal(m.mutations[0][1].schoolId,'s1');assert.equal(updates.length,1);
});
test('Blob out-of-scope pathname is rejected before token creation',async()=>{
 const m=load('api/upload-token.js',{claims:{uid:'teacher',role:'teacher'},env:{BLOB_READ_WRITE_TOKEN:'mock'},imports:{'@vercel/blob/client':{handleUpload:async o=>o.onBeforeGenerateToken('quiz-images/another/image.webp')}}}),res=response();
 await m.handler(req({type:'blob.generate-client-token',payload:{pathname:'quiz-images/another/image.webp'}}),res);assert.equal(res.code,403);
});
test('Blob allowed pathname receives no overwrite token',async()=>{
 let policy;const m=load('api/upload-token.js',{claims:{uid:'teacher',role:'teacher'},env:{BLOB_READ_WRITE_TOKEN:'mock'},imports:{'@vercel/blob/client':{handleUpload:async o=>{policy=await o.onBeforeGenerateToken('quiz-images/teacher/image.webp');return {ok:true}}}}}),res=response();
 await m.handler(req({type:'blob.generate-client-token'}),res);assert.equal(res.code,200);assert.equal(policy.allowOverwrite,false);assert.equal(policy.maximumSizeInBytes,512000);
});
test('missing Blob config is a service error, never successful deletion',async()=>{
 const m=load('api/upload-token.js',{claims:{uid:'teacher',role:'teacher'}}),res=response();await m.handler(req({action:'delete',url:'https://x.public.blob.vercel-storage.com/quiz-images/teacher/a.webp'}),res);assert.equal(res.code,503);
});
test('homework public task strips all answer keys and other submissions',async()=>{
 const h=await import('../lib/server/homework.js');const safe=h.publicTask({id:'t',type:'quiz',title:'واجب',createdAt:1,questions:[{q:'ما الإجابة الصحيحة؟',opts:['أ','ب'],ans:1,explain:'ب'}],answers:{other:{score:100}}});
 assert.equal(safe.questions[0].options.length,2);assert.equal(safe.questions[0].correct,undefined);assert.equal(safe.questions[0].ans,undefined);assert.equal(safe.answers,undefined);
});
test('homework is graded from private canonical key',async()=>{
 const h=await import('../lib/server/homework.js');const task={questions:[{q:'ما الإجابة الصحيحة؟',opts:['أ','ب'],ans:1}]};
 assert.equal(h.gradeTask(task,[0]).score,0);assert.equal(h.gradeTask(task,[1]).score,100);assert.throws(()=>h.gradeTask(task,[3]));assert.throws(()=>h.gradeTask(task,[]));
});
test('missing service account returns 503 instead of fake success',async()=>{
 const m=load('api/account-request.js',{imports:{'firebase-admin/app':{getApps:()=>[]}}}),res=response();await m.handler(req({action:'approve',targetUid:'target'}),res);assert.equal(res.code,503);
});
test('concurrent generation requests reserve at most 20 daily slots',async()=>{
 let quota=null,upstreamCalls=0;
 const db={ref:()=>({transaction:async updater=>{const next=updater(quota);if(next===undefined)return {committed:false};quota=next;return {committed:true,snapshot:{val:()=>next}}}})};
 const fetch=async()=>{upstreamCalls++;return {ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify([{q:'ما علامة رفع الفاعل المفرد؟',opts:['ضمة','فتحة','كسرة','سكون'],ans:0,sourceQuote:'يرفع الفاعل بالضمة'}])}]}}]})}};
 const m=load('api/generate-questions.js',{claims:{uid:'teacher',role:'teacher'},env:{GEMINI_API_KEY:'mock'},db,fetch});
 const responses=await Promise.all(Array.from({length:30},async()=>{const res=response();await m.handler(req({content:'يرفع الفاعل بالضمة',count:1}),res);return res.code}));
 assert.equal(responses.filter(x=>x===200).length,20);assert.equal(responses.filter(x=>x===429).length,10);assert.equal(upstreamCalls,20);assert.equal(quota.usedCount,20);
});
test('invalid generated answer index is rejected rather than silently choosing zero',async()=>{
 const db={ref:()=>({transaction:async updater=>({committed:true,snapshot:{val:()=>updater(null)}})})};
 const fetch=async()=>({ok:true,json:async()=>({candidates:[{content:{parts:[{text:JSON.stringify([{q:'ما علامة رفع الفاعل المفرد؟',opts:['ضمة','فتحة','كسرة','سكون'],ans:9}])}]}}]})});
 const m=load('api/generate-questions.js',{claims:{uid:'teacher',role:'teacher'},env:{GEMINI_API_KEY:'mock'},db,fetch}),res=response();await m.handler(req({content:'يرفع الفاعل بالضمة',count:1}),res);assert.equal(res.code,422);
});
test('homework multi-select requires the complete correct set',async()=>{
 const h=await import('../lib/server/homework.js');const task={questions:[{id:'multi',text:'اختر الحروف',options:['أ','ب','ج'],correct:[0,2]}]};
 assert.equal(h.publicTask({...task,type:'quiz'}).questions[0].multiple,true);
 assert.equal(h.gradeTask(task,[[0,2]]).score,100);assert.equal(h.gradeTask(task,[[0]]).score,0);assert.throws(()=>h.gradeTask(task,[[0,0]]));
});
