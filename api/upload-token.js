import {authenticate,cors,failure} from '../lib/server/firebase.js';
export default async function handler(req,res) {
  // Blob callbacks are authenticated by the SDK signature, not a browser Firebase token.
  if(req.method==='POST'&&req.body?.type==='blob.upload-completed') {
    try {
      const {handleUpload}=await import('@vercel/blob/client');
      return res.status(200).json(await handleUpload({request:req,body:req.body,
        onBeforeGenerateToken:async()=>{throw new Error('Unsupported callback');},onUploadCompleted:async()=>{}}));
    }catch(err){return res.status(400).json({error:'توقيع إشعار الرفع غير صالح.'});}
  }
  if(cors(req,res))return;
  try {
    const {user,db}=await authenticate(req,['teacher','admin']);
    if(!process.env.BLOB_READ_WRITE_TOKEN)return res.status(503).json({error:'خدمة رفع الصور غير مهيأة.'});
    const prefix=`quiz-images/${user.uid}/`;
    if(req.body?.action==='delete') {
      let target;
      try{target=new URL(req.body.url);}catch{return res.status(400).json({error:'رابط الصورة غير صالح.'});}
      if(target.protocol!=='https:'||!target.hostname.endsWith('.public.blob.vercel-storage.com')||!target.pathname.startsWith('/'+prefix)||target.search||target.hash)return res.status(403).json({error:'لا تملك هذه الصورة.'});
      const {head,del}=await import('@vercel/blob');
      // head validates that the URL belongs to the configured Blob store/token.
      const blob=await head(target.href);
      if(!blob.pathname.startsWith(prefix))return res.status(403).json({error:'لا تملك هذه الصورة.'});
      await del(target.href);return res.status(200).json({success:true});
    }
    if(req.body?.imageBase64||req.body?.fileBase64) {
      const raw=req.body.imageBase64||req.body.fileBase64;
      if(typeof raw!=='string'||raw.length>750000)return res.status(413).json({error:'الصورة أكبر من الحجم المسموح.'});
      const bytes=Buffer.from(raw.replace(/^data:[^;]+;base64,/,''),'base64');
      if(!bytes.length||bytes.length>500*1024)return res.status(413).json({error:'الحد الأقصى للصورة 500 كيلوبايت.'});
      const {default:sharp}=await import('sharp');
      let output;
      try{output=await sharp(bytes,{limitInputPixels:16_000_000,animated:false}).rotate().resize({width:1600,height:1600,fit:'inside',withoutEnlargement:true}).webp({quality:82}).toBuffer();}
      catch{return res.status(400).json({error:'محتوى الصورة غير صالح.'});}
      if(output.length>500*1024)return res.status(413).json({error:'تعذر ضغط الصورة للحجم المسموح.'});
      const {put}=await import('@vercel/blob');
      const filename=prefix+crypto.randomUUID()+'.webp';
      const blob=await put(filename,output,{access:'public',contentType:'image/webp',addRandomSuffix:true,allowOverwrite:false});
      return res.status(200).json({url:blob.url,size:output.length,contentType:'image/webp'});
    }
    const {handleUpload}=await import('@vercel/blob/client');
    const result=await handleUpload({request:req,body:req.body,
      onBeforeGenerateToken:async pathname=>{
        // Reject out-of-scope paths: returning a different pathname does not rewrite SDK input.
        if(typeof pathname!=='string'||!pathname.startsWith(prefix)||!/^[-A-Za-z0-9_.]+$/.test(pathname.slice(prefix.length))||pathname.length>220)throw Object.assign(new Error('مسار الصورة غير مسموح.'),{status:403});
        return {allowedContentTypes:['image/webp','image/jpeg','image/png'],maximumSizeInBytes:500*1024,addRandomSuffix:true,allowOverwrite:false,tokenPayload:JSON.stringify({uid:user.uid})};
      },onUploadCompleted:async()=>{}});
    return res.status(200).json(result);
  }catch(err){return failure(res,err);}
}
