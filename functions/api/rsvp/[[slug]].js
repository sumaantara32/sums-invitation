import {response,validSlug,authorize,readJSON,sameOrigin} from '../_shared.js';
export async function onRequest({request,env,params}) {
 const slug=Array.isArray(params.slug)?params.slug.join('/'):params.slug;
 if(!env.DB) return response({error:'RSVP belum diaktifkan. Silakan hubungi pasangan melalui WhatsApp.'},503);
 if(!validSlug(slug)) return response({error:'Alamat tidak valid.'},400);
 if(request.method==='GET') {
  if(!await authorize(request,env)) return response({error:'Akses admin diperlukan.'},401);
  const rows=await env.DB.prepare('SELECT name,attendance,guests,message,created_at FROM rsvps WHERE slug=? ORDER BY created_at DESC LIMIT 1000').bind(slug).all();
  return response({items:rows.results});
 }
 if(request.method!=='POST') return response({error:'Metode tidak didukung.'},405);
 if(!sameOrigin(request)) return response({error:'Asal permintaan tidak valid.'},403);
 try {
  const row=await env.DB.prepare('SELECT payload FROM invitations WHERE slug=?').bind(slug).first();
  if(!row) return response({error:'Undangan tidak ditemukan.'},404);
  const config=JSON.parse(row.payload);
  if(env.TURNSTILE_SECRET) {
   const b=await readJSON(request); return await save(b);
  }
  return response({error:'Perlindungan RSVP belum dikonfigurasi.'},503);
  async function save(b) {
   if(typeof b.turnstileToken!=='string'||b.turnstileToken.length>4096) return response({error:'Verifikasi keamanan diperlukan.'},400);
   const form=new FormData();form.set('secret',env.TURNSTILE_SECRET);form.set('response',b.turnstileToken);form.set('remoteip',request.headers.get('CF-Connecting-IP')||'');
   const check=await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify',{method:'POST',body:form});
   const verified=await check.json();
   if(!verified.success||verified.hostname!==new URL(request.url).hostname) return response({error:'Verifikasi gagal. Silakan coba lagi.'},403);
   const name=String(b.name||'').trim(),message=String(b.message||'').trim(),guests=Number(b.guests);
   if(name.length<2||name.length>80||message.length>1000||!['yes','no','maybe'].includes(b.attendance)||!Number.isInteger(guests)||guests<1||guests>10||!/^[-a-f0-9]{36}$/.test(b.id||'')) return response({error:'Isian RSVP tidak valid.'},400);
   await env.DB.prepare('INSERT INTO rsvps(id,slug,name,attendance,guests,message) VALUES(?,?,?,?,?,?) ON CONFLICT(id) DO NOTHING').bind(b.id,slug,name,b.attendance,guests,message).run();
   return response({ok:true});
  }
 } catch { return response({error:'RSVP belum terkirim. Silakan coba lagi.'},400); }
}
