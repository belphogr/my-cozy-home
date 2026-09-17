import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=normalize(join(fileURLToPath(new URL('.',import.meta.url)),'..','dist'))
const port=Number(process.env.HOME_DESKTOP_PORT||4187)
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.glb':'model/gltf-binary','.hdr':'application/octet-stream','.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.wav':'audio/wav','.mp3':'audio/mpeg'}

if(!existsSync(join(root,'index.html'))){
 console.error('Desktop build is missing. Run npm run build first.')
 process.exit(1)
}

createServer((request,response)=>{
 const pathname=decodeURIComponent(new URL(request.url??'/',`http://${request.headers.host}`).pathname)
 const relative=normalize(pathname).replace(/^([/\\])+/, '')
 let file=join(root,relative)
 if(!file.startsWith(root)||!existsSync(file)||statSync(file).isDirectory())file=join(root,'index.html')
 response.setHeader('Content-Type',mime[extname(file).toLowerCase()]??'application/octet-stream')
 // This is a local mutable app build, not a CDN deployment. Long immutable
 // caching leaves replaced public assets stale across desktop launches.
 response.setHeader('Cache-Control','no-store, max-age=0')
 createReadStream(file).on('error',()=>{response.statusCode=500;response.end()}).pipe(response)
}).listen(port,'127.0.0.1',()=>console.log(`My Little Home desktop server: http://127.0.0.1:${port}`))
