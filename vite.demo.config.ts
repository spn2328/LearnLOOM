import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';
import {fileURLToPath} from 'node:url';
const path=(p:string)=>fileURLToPath(new URL(p,import.meta.url));
export default defineConfig({
  root:path('./demo'),publicDir:path('./public'),
  plugins:[react()],
  resolve:{alias:[{find:'@/lib/use-learning',replacement:path('./demo/use-learning.ts')},{find:'@',replacement:path('./')}]},
  define:{'process.env.NEXT_PUBLIC_DEMO':JSON.stringify('true')},
  build:{outDir:path('./dist-demo'),emptyOutDir:true},
});
