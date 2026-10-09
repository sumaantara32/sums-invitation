import {response,authorize,sameOrigin} from '../_shared.js';
const types={'image/jpeg':'jpg','image/png':'png','image/webp':'webp','audio/mpeg':'mp3','audio/mp4':'m4a','audio/wav':'wav','audio/x-wav':'wav','audio/ogg':'ogg'};
export async function onRequest({request,env,params}) {
 if(!env.MEDIA) return response({error:'Penyimpanan foto dan musik belum diaktifkan.'},503);
 if(request.method==='GET') {
  const name=Array.isArray(params.name)?params.name.join('/'):params.name;
  if(!/^[a-f0-9-]{36}\.(jpg|png|webp|mp3|m4a|wav|ogg)$/.test(name||''))return response({error:'Media tidak ditemukan.'},404);
  const object=await env.MEDIA.get(name);if(!object)return response({error:'Media tidak ditemukan.'},404);
  return new Response(object.body,{headers:{'Content-Type':object.httpMetadata?.contentType||'application/octet-stream','Cache-Control':'public,max-age=31536000,immutable','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
 }
 if(request.method!=='POST')return response({error:'Metode tidak didukung.'},405);
 if(!sameOrigin(request)||!await authorize(request,env))return response({error:'Akses admin diperlukan.'},401);
 const type=request.headers.get('content-type')?.split(';')[0];
 if(!types[type])return response({error:'Format media tidak didukung.'},400);
 const max=20*1024*1024;
 if(Number(request.headers.get('content-length')||0)>max)return response({error:'Ukuran media maksimal 20 MB.'},413);
 try {
  const buffer=await request.arrayBuffer();if(buffer.byteLength>max||buffer.byteLength<12)return response({error:'Ukuran media tidak valid.'},400);
  const bytes=new Uint8Array(buffer);const ascii=(a,b)=>new TextDecoder().decode(bytes.slice(a,b));
  const valid=type==='image/jpeg'?bytes[0]===255&&bytes[1]===216&&bytes[2]===255:type==='image/png'?bytes[0]===137&&ascii(1,4)==='PNG':type==='image/webp'?ascii(0,4)==='RIFF'&&ascii(8,12)==='WEBP':type==='audio/ogg'?ascii(0,4)==='OggS':type==='audio/wav'||type==='audio/x-wav'?ascii(0,4)==='RIFF'&&ascii(8,12)==='WAVE':type==='audio/mp4'?ascii(4,8)==='ftyp':ascii(0,3)==='ID3'||bytes[0]===255&&(bytes[1]&224)===224;
  if(!valid)return response({error:'Isi file tidak sesuai dengan format media.'},400);
  const name=crypto.randomUUID()+'.'+types[type];await env.MEDIA.put(name,buffer,{httpMetadata:{contentType:type}});
  return response({url:`${new URL(request.url).origin}/api/media/${name}`},201);
 } catch { return response({error:'Upload belum berhasil. Silakan coba lagi.'},500); }
}
