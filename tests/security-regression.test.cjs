const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f),'utf8');
function moduleContext(file,extras={}) {const c={console,Date,Math,Set,Map,crypto:require('node:crypto').webcrypto,...extras};c.globalThis=c;c.window=c;vm.runInNewContext(read(file),c);return c;}
test('same name never changes an existing player UID',()=>{
 const c=moduleContext('js/quiz/quiz-host-events.js');const room={players:[{id:'first',name:'أحمد',score:10}],answers:{}};
 c.ScoreARHostEvents.handleHostIncomingMessage({type:'STUDENT_JOIN',player:{id:'second',name:'أحمد'}},{currentRoom:room});
 assert.equal(room.players.length,2);assert.equal(room.players[0].id,'first');assert.equal(room.players[0].score,10);
});
test('event notification cannot create or replace a scored answer',()=>{
 const c=moduleContext('js/quiz/quiz-host-events.js');const room={players:[{id:'first',name:'أحمد'}],answers:{0:{first:{optionIndex:0,ts:1}}}};
 c.ScoreARHostEvents.handleHostIncomingMessage({type:'STUDENT_ANSWER',playerId:'first',optionIndex:3,ts:5},{currentRoom:room,currentQIndex:0});
 assert.equal(room.answers[0].first.optionIndex,0);
});
test('local storage cannot grant a student teacher privileges',async()=>{
 const c=moduleContext('js/journey/classrooms-service.js',{localStorage:{getItem:()=>JSON.stringify({uid:'victim',role:'teacher'})},firebase:{auth:()=>({currentUser:{uid:'student',isAnonymous:false,getIdTokenResult:async()=>({claims:{}})}})}});
 const actor=await c.ScoreARClassroomsService.getCurrentActor();assert.equal(actor.uid,'student');assert.equal(actor.isTeacher,false);
});
test('competition guest is not silently turned into a class teacher',async()=>{
 const c=moduleContext('js/journey/classrooms-service.js',{firebase:{auth:()=>({currentUser:{uid:'guest',isAnonymous:true}})}});
 assert.equal(await c.ScoreARClassroomsService.getCurrentActor(),null);
});
test('verified custom claims determine teacher role',async()=>{
 const c=moduleContext('js/journey/classrooms-service.js',{firebase:{auth:()=>({currentUser:{uid:'teacher',emailVerified:false,getIdTokenResult:async()=>({claims:{role:'teacher'}})}})}});
 const a=await c.ScoreARClassroomsService.getCurrentActor();assert.equal(a.isTeacher,true);assert.equal(a.emailVerified,false);
});
test('guest flow uses anonymous Auth and never invents a guest UID on failure',()=>{
 const s=read('js/auth/auth.js');const flow=s.slice(s.indexOf('  // Guest entry:'),s.indexOf('  // Password Reset'));
 assert.match(flow,/signInAnonymously/);assert.doesNotMatch(flow,/Math\.random|createUserWithEmailAndPassword|signInWithEmailAndPassword/);
});
test('all changed browser modules compile',()=>{
 for(const dir of ['js'])for(const f of fs.readdirSync(path.join(root,dir),{recursive:true}).filter(f=>f.endsWith('.js'))){new vm.Script(read(dir+'/'+f),{filename:f});}
});
test('canonical evaluator regression suite',()=>{
 const result=require('node:child_process').spawnSync(process.execPath,[path.join(__dirname,'test_pure_evaluator_regression.cjs')],{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stdout+result.stderr);
});
