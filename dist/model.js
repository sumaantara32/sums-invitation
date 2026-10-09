export const defaults={theme:'royal',bride:'Ni Putu Ayu',groom:'I Made Darma',brideShort:'Ayu',groomShort:'Darma',brideParents:'Putri dari Bapak & Ibu keluarga Ayu',groomParents:'Putra dari Bapak & Ibu keluarga Darma',date:'2027-02-14T10:00',venue:'Kediaman Mempelai Pria',address:'Tabanan, Bali',map:'https://www.google.com/maps/search/?api=1&query=Tabanan%20Bali',guest:'Bapak / Ibu / Saudara/i',intro:'Dengan penuh rasa syukur, kami mengundang Anda untuk hadir dan berbagi kebahagiaan di hari pernikahan kami.',story:'Dari sebuah pertemuan sederhana, tumbuh perjalanan yang ingin kami lanjutkan bersama. Kini, dengan restu keluarga, kami memulai babak baru.',music:'bamboo',musicUrl:'',volume:0.35,hero:'',gallery:[],events:[{title:'Pawiwahan',time:'10.00 – 12.00 WITA',detail:'Prosesi pernikahan bersama keluarga.'},{title:'Resepsi',time:'13.00 – 18.00 WITA',detail:'Merayakan kebahagiaan bersama orang-orang terkasih.'}],dresscode:'Busana adat Bali / formal',whatsapp:'',giftName:'',giftBank:'',giftNumber:'',slug:'ayu-darma',turnstileSiteKey:''};
const text=(v,max=1000)=>String(v??'').trim().slice(0,max);
export function safeURL(v,{data=false,blob=false,audio=false}={}) {if(!v)return '';try{const u=new URL(v);if(u.protocol==='https:')return u.href;if(data&&/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(v))return v;if(audio&&/^data:audio\/(mpeg|mp4|wav|ogg|x-wav);base64,[A-Za-z0-9+/=]+$/.test(v))return v;if(blob&&u.protocol==='blob:')return v;}catch{}return '';}
export function normalize(input={}) {
 const d={...defaults};for(const key of ['bride','groom','brideShort','groomShort','brideParents','groomParents','venue','address','guest','dresscode','giftName','giftBank','giftNumber','slug','turnstileSiteKey']) if(key in input)d[key]=text(input[key],200);
 for(const key of ['intro','story'])if(key in input)d[key]=text(input[key],2000);
 d.theme=['royal','botanical','modern'].includes(input.theme)?input.theme:defaults.theme;
 d.date=Number.isFinite(Date.parse(input.date))&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input.date)?input.date:defaults.date;
 d.music=['bamboo','piano','ambient','custom','off'].includes(input.music)?input.music:defaults.music;
 d.volume=Number.isFinite(Number(input.volume))?Math.max(0,Math.min(1,Number(input.volume))):defaults.volume;
 d.musicUrl=safeURL(input.musicUrl,{blob:true,audio:true});d.map=safeURL(input.map);
 d.hero=safeURL(input.hero,{data:true,blob:true});d.gallery=Array.isArray(input.gallery)?input.gallery.slice(0,12).map(u=>safeURL(u,{data:true,blob:true})).filter(Boolean):[];
 d.whatsapp=text(input.whatsapp,20).replace(/\D/g,'').replace(/^0/,'62');
 d.events=Array.isArray(input.events)&&input.events.length?input.events.slice(0,6).map(e=>({title:text(e.title,80),time:text(e.time,100),detail:text(e.detail,500)})):defaults.events.map(e=>({...e}));
 return d;
}
export function validateInvitation(input,{published=false}={}) {
 const d=normalize(input),errors=[];
 if(!d.bride||!d.groom)errors.push('Isi nama kedua mempelai.');
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(d.slug)||d.slug.length>64)errors.push('Slug hanya boleh memakai huruf kecil, angka, dan tanda hubung.');
 if(!input.date||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(input.date)||!Number.isFinite(Date.parse(input.date)))errors.push('Tanggal acara tidak valid.');
 if(!d.venue)errors.push('Isi lokasi acara.');
 if(published&&(String(input.hero||'').startsWith('data:')||String(input.hero||'').startsWith('blob:')||(input.gallery||[]).some(u=>/^(data:|blob:)/.test(u))))errors.push('Untuk terbit online, gunakan URL HTTPS foto dari penyimpanan media.');
 if(published&&d.music==='custom'&&!d.musicUrl.startsWith('https:'))errors.push('Gunakan URL HTTPS untuk musik online.');
 return errors;
}
export function eventDate(d) {return new Date(d.date+':00+08:00');}
export function calendar(d) {const start=eventDate(d),end=new Date(start.getTime()+2*3600000);const stamp=v=>v.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}/,'');const esc=v=>v.replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/,/g,'\\,').replace(/;/g,'\\;');return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//SUMS Invitation//ID','BEGIN:VEVENT',`UID:${d.slug}@sums-invitation`,`DTSTAMP:${stamp(new Date())}`,`DTSTART:${stamp(start)}`,`DTEND:${stamp(end)}`,`SUMMARY:${esc(d.brideShort+' & '+d.groomShort+' — Pawiwahan')}`,`LOCATION:${esc(d.venue+', '+d.address)}`,'END:VEVENT','END:VCALENDAR'].join('\r\n');}
