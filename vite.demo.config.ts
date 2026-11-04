import {defineConfig, loadEnv, type Plugin} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
import {readdirSync} from 'node:fs';
import {join,relative,sep} from 'node:path';
const path=(p:string)=>fileURLToPath(new URL(p,import.meta.url));

// Server-only values (Vercel's Supabase integration adds these next to the public ones). They must never reach the browser.
const SECRET=/SERVICE_ROLE|SECRET|JWT|PASSWORD|^POSTGRES_/;

// Fails the build if any server-only value appears in an output file.
function noSecrets(env:Record<string,string>):Plugin{
  const values=Object.entries(env).filter(([k,v])=>SECRET.test(k)&&v&&v.length>=16);
  return {name:'learnloom-no-secrets',apply:'build',generateBundle(_,bundle){
    for(const f of Object.values(bundle)){
      const text=f.type==='chunk'?f.code:typeof f.source==='string'?f.source:Buffer.from(f.source).toString('utf8');
      for(const [k,v] of values)if(text.includes(v))this.error(`${k} would be exposed in ${f.fileName}`);
    }
  }};
}

// Lists every picture under public/images as /offline-images.json so the offline download includes them all.
function offlineImages():Plugin{
  const list=()=>JSON.stringify(readdirSync(path('./public/images'),{recursive:true,withFileTypes:true}).filter(e=>e.isFile()).map(e=>'/'+relative(path('./public'),join(e.parentPath,e.name)).split(sep).join('/')).sort());
  return {name:'learnloom-offline-images',
    configureServer(server){server.middlewares.use('/offline-images.json',(_req,res)=>{res.setHeader('Content-Type','application/json');res.end(list());});},
    generateBundle(){this.emitFile({type:'asset',fileName:'offline-images.json',source:list()});}};
}

// The anon key is public by design; a service_role key in its place would bypass Row Level Security.
function publicKey(key:string){
  try{const role=JSON.parse(Buffer.from(key.split('.')[1]??'','base64url').toString()).role;if(role&&role!=='anon')throw new Error(`Supabase key has role "${role}", expected anon`);}
  catch(e){if((e as Error).message.startsWith('Supabase key'))throw e;}
  return key;
}

export default defineConfig(({mode})=>{
  const env={...loadEnv(mode,path('./'),''),...process.env} as Record<string,string>;
  // VITE_* first; otherwise the NEXT_PUBLIC_* names the Vercel Supabase integration sets
  const url=env.VITE_SUPABASE_URL||env.NEXT_PUBLIC_SUPABASE_URL||'';
  const key=publicKey(env.VITE_SUPABASE_ANON_KEY||env.NEXT_PUBLIC_SUPABASE_ANON_KEY||env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY||'');
  return {
    root:path('./demo'),envDir:path('./'),publicDir:path('./public'),
    plugins:[react(),noSecrets(env),offlineImages()],
    resolve:{alias:[{find:'@/lib/use-learning',replacement:path('./demo/use-learning.ts')},{find:'@',replacement:path('./')}]},
    define:{'process.env.NEXT_PUBLIC_DEMO':JSON.stringify('true'),'import.meta.env.VITE_SUPABASE_URL':JSON.stringify(url),'import.meta.env.VITE_SUPABASE_ANON_KEY':JSON.stringify(key)},
    build:{outDir:path('./dist-demo'),emptyOutDir:true},
  };
});
