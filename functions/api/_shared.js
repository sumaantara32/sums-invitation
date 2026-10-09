export const response = (data, status = 200) => new Response(JSON.stringify(data), {status, headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
export const validSlug = value => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value || '') && value.length <= 64;
export async function authorize(request, env) {
 if (!env.ADMIN_TOKEN || env.ADMIN_TOKEN.length < 32) return false;
 const supplied = (request.headers.get('authorization') || '').replace(/^Bearer /,'');
 const hash = async text => new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text)));
 const [a,b] = await Promise.all([hash(supplied),hash(env.ADMIN_TOKEN)]);
 let diff=0; for(let i=0;i<a.length;i++) diff |= a[i]^b[i]; return diff===0;
}
export async function readJSON(request) {
 if (!request.headers.get('content-type')?.startsWith('application/json')) throw new Error('Gunakan JSON.');
 if (Number(request.headers.get('content-length') || 0)>262144) throw new Error('Data terlalu besar.');
 const raw=await request.text(); if(new TextEncoder().encode(raw).length>262144) throw new Error('Data terlalu besar.');
 return JSON.parse(raw);
}
export function sameOrigin(request) { const origin=request.headers.get('origin'); return origin===new URL(request.url).origin; }
