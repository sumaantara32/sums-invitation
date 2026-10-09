import {response} from './_shared.js';
export function onRequestGet({env}) { return response({configured:!!env.DB,siteKey:env.TURNSTILE_SITE_KEY||null}); }
