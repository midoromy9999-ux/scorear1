import {authenticate,cors,failure,validKey} from '../lib/server/firebase.js';
import {publicTask,gradeTask} from '../lib/server/homework.js';
export default async function handler(req,res) {
  if(cors(req,res))return;
  try {
    const {db,user}=await authenticate(req);
    if(user.firebase?.sign_in_provider==='anonymous')return res.status(403).json({error:'سجل دخول الطالب للوصول إلى الواجبات.'});
    const {action,classId,taskId,choices,answer}=req.body || {};
    if(!validKey(classId)||!['list','submit'].includes(action)||(action==='submit'&&!validKey(taskId)))return res.status(400).json({error:'بيانات غير صالحة.'});
    const base=`scorear_learning_v1/classes/${classId}`;
    const [owner,membership]=await Promise.all([db.ref(base+'/ownerUid').once('value'),db.ref(base+'/members/'+user.uid).once('value')]);
    const isOwner=owner.val()===user.uid&&['teacher','admin'].includes(user.role);
    if(!isOwner&&!membership.exists())return res.status(403).json({error:'يلزم قبول عضويتك في الفصل.'});
    if(action==='list') {
      const tasks=(await db.ref(base+'/tasks').once('value')).val() || {};
      return res.status(200).json({tasks:Object.entries(tasks).map(([id,t])=>{
        const safe=publicTask({...t,id});
        const mine=t.answers?.[user.uid];if(mine)safe.answers={[user.uid]:mine};
        return safe;
      })});
    }
    if(isOwner)return res.status(403).json({error:'تسليم الواجب مخصص للطالب.'});
    const task=(await db.ref(`${base}/tasks/${taskId}`).once('value')).val();
    if(!task)return res.status(404).json({error:'الواجب غير موجود.'});
    const deadline=task.deadline?new Date(task.deadline).getTime():null;
    if(deadline&&Date.now()>deadline)return res.status(409).json({error:'انتهت مهلة التسليم.'});
    let payload;
    if(task.type==='quiz')payload={answer:'تم تسليم الاختبار',...gradeTask(task,choices),submittedAt:Date.now()};
    else {
      if(typeof answer!=='string'||!answer.trim()||answer.length>2000)return res.status(400).json({error:'اكتب إجابة من 1 إلى 2000 حرف.'});
      payload={answer:answer.trim(),score:null,submittedAt:Date.now()};
    }
    // One transaction: a forged second submission never replaces an existing grade.
    const result=await db.ref(`${base}/tasks/${taskId}/answers/${user.uid}`).transaction(existing=>existing?undefined:payload);
    if(!result.committed)return res.status(409).json({error:'تم تسليم هذا الواجب بالفعل.'});
    return res.status(200).json({ok:true,payload});
  }catch(err){return failure(res,err);}
}
