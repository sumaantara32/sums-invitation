import {response,validSlug,authorize,readJSON,sameOrigin} from '../_shared.js';
import {normalize,validateInvitation} from '../../../dist/model.js';
export async function onRequest({request,env,params}) {
 const slug=Array.isArray(params.slug)?params.slug.join('/'):params.slug;
 if(!env.DB) return response({error:'Penyimpanan undangan belum diaktifkan.'},503);
 if(!validSlug(slug)) return response({error:'Alamat undangan tidak valid.'},400);
 if(request.method==='GET') {
  const row=await env.DB.prepare('SELECT payload FROM invitations WHERE slug=?').bind(slug).first();
  return row?response(JSON.parse(row.payload)):response({error:'Undangan belum diterbitkan.'},404);
 }
 if(request.method!=='PUT') return response({error:'Metode tidak didukung.'},405);
 if(!sameOrigin(request) || !await authorize(request,env)) return response({error:'Akses admin diperlukan.'},401);
 try {
  const input=await readJSON(request); const errors=validateInvitation(input,{published:true});
  if(errors.length) return response({error:errors.join(' ')},400);
  const data=normalize(input); data.turnstileSiteKey=env.TURNSTILE_SITE_KEY||'';
  await env.DB.prepare('INSERT INTO invitations(slug,payload) VALUES(?,?) ON CONFLICT(slug) DO UPDATE SET payload=excluded.payload, updated_at=CURRENT_TIMESTAMP').bind(slug,JSON.stringify(data)).run();
  return response({slug,url:`${new URL(request.url).origin}/${slug}`});
 } catch { return response({error:'Data undangan tidak valid atau terlalu besar.'},400); }
}
