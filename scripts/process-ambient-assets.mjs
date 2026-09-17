import sharp from 'sharp'
import {mkdir} from 'node:fs/promises'

const sourceRoot='C:/Users/xiaobowen/.codex/generated_images/01a046ab-46c1-70b3-ab15-a925510b0d6b'
const outputRoot='public/assets/prologue'
const release='garden-reference-v3'

await mkdir(outputRoot,{recursive:true})

const closed=`${sourceRoot}/exec-cda01218-08a5-4c59-871c-1ffd1ceabfb2.png`
const opened=`${sourceRoot}/exec-cc808a87-25ce-47eb-ae4b-942bbe6467fc.png`
const foreground=`${sourceRoot}/exec-7c9e0cb3-e4ba-46c2-a746-c3e1828c78f8.png`
const midground=`${sourceRoot}/exec-08a9f17d-1807-4989-adcd-d15d352e134e.png`

await Promise.all([
 sharp(closed).resize(1920,1080,{fit:'fill'}).webp({quality:91,effort:5}).toFile(`${outputRoot}/doorstep.webp`),
 sharp(closed).resize(1920,1080,{fit:'fill'}).webp({quality:91,effort:5}).toFile(`${outputRoot}/${release}-closed.webp`),
 sharp(closed).resize(1920,1080,{fit:'fill'}).webp({quality:89,effort:5}).toFile(`${outputRoot}/opening-poster.webp`),
 sharp(closed).resize(1920,1080,{fit:'fill'}).webp({quality:89,effort:5}).toFile(`${outputRoot}/${release}-poster.webp`),
 sharp(closed).resize(1920,1080,{fit:'fill'}).png({compressionLevel:8}).toFile(`${outputRoot}/keyframe-c.png`),
 sharp(opened).resize(1920,1080,{fit:'fill'}).webp({quality:91,effort:5}).toFile(`${outputRoot}/open-portal.webp`),
 sharp(opened).resize(1920,1080,{fit:'fill'}).webp({quality:91,effort:5}).toFile(`${outputRoot}/${release}-open.webp`),
 sharp(foreground).resize(1920,1080,{fit:'fill'}).webp({quality:88,alphaQuality:96,effort:5}).toFile(`${outputRoot}/foreground-botanicals.webp`),
 sharp(foreground).resize(1920,1080,{fit:'fill'}).webp({quality:88,alphaQuality:96,effort:5}).toFile(`${outputRoot}/${release}-foreground.webp`),
 // Door bounds in the new 1672x941 composition: x 641..1015, y 104..728.
 sharp(closed).extract({left:641,top:104,width:195,height:624}).resize(375,717,{fit:'fill'}).webp({quality:92,effort:5}).toFile(`${outputRoot}/door-left.webp`),
 sharp(closed).extract({left:641,top:104,width:195,height:624}).resize(375,717,{fit:'fill'}).webp({quality:92,effort:5}).toFile(`${outputRoot}/${release}-left.webp`),
 sharp(closed).extract({left:836,top:104,width:179,height:624}).resize(344,717,{fit:'fill'}).webp({quality:92,effort:5}).toFile(`${outputRoot}/door-right.webp`),
 sharp(closed).extract({left:836,top:104,width:179,height:624}).resize(344,717,{fit:'fill'}).webp({quality:92,effort:5}).toFile(`${outputRoot}/${release}-right.webp`),
])

const keyed=await sharp(midground).resize(1920,1080,{fit:'fill'}).ensureAlpha().raw().toBuffer({resolveWithObject:true})
for(let index=0;index<keyed.data.length;index+=4){
 const red=keyed.data[index],green=keyed.data[index+1],blue=keyed.data[index+2]
 const darkest=Math.min(red,green,blue),lightest=Math.max(red,green,blue)
 const saturation=lightest-darkest
 // Remove the neutral pale checkerboard while preserving fine coloured stems.
 keyed.data[index+3]=Math.max(0,Math.min(255,Math.round(Math.max(saturation*2.55-30,(238-darkest)*4-45))))
}
await sharp(keyed.data,{raw:{width:keyed.info.width,height:keyed.info.height,channels:4}})
 .webp({quality:87,alphaQuality:95,effort:5})
 .toFile(`${outputRoot}/midground-botanicals.webp`)
await sharp(keyed.data,{raw:{width:keyed.info.width,height:keyed.info.height,channels:4}})
 .webp({quality:87,alphaQuality:95,effort:5})
 .toFile(`${outputRoot}/${release}-midground.webp`)

console.log('Ambient prologue assets written.')
