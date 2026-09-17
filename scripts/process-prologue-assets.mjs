import { mkdir } from 'node:fs/promises'
import sharp from 'sharp'

const sourceRoot='C:/Users/xiaobowen/.codex/generated_images/01a046ab-46c1-70b3-ab15-a925510b0d6b'
const outputRoot='public/assets/prologue'
const sources={
 a:`${sourceRoot}/exec-2caf3ec5-3d29-44f5-9c5d-d2b2e21ef6b5.png`,
 b:`${sourceRoot}/exec-119daf99-7094-455b-a3b6-291431e55689.png`,
 c:`${sourceRoot}/exec-ffc4199c-e2ee-473a-b18e-adca54d68eb1.png`,
 open:`${sourceRoot}/exec-20cd2af8-2175-483f-8810-d4c29cbb516f.png`,
}

await mkdir(outputRoot,{recursive:true})
for(const key of ['a','b','c']){
 await sharp(sources[key]).resize(1920,1080,{fit:'cover',position:'centre'}).png({compressionLevel:9}).toFile(`${outputRoot}/keyframe-${key}.png`)
}
await sharp(sources.a).resize(1920,1080,{fit:'cover'}).webp({quality:88,smartSubsample:true}).toFile(`${outputRoot}/opening-poster.webp`)
await sharp(sources.c).resize(1920,1080,{fit:'cover'}).webp({quality:90,smartSubsample:true}).toFile(`${outputRoot}/doorstep.webp`)
await sharp(sources.open).resize(1920,1080,{fit:'cover'}).webp({quality:90,smartSubsample:true}).toFile(`${outputRoot}/open-portal.webp`)

const closed=sharp(sources.c).resize(1920,1080,{fit:'cover'})
await closed.clone().extract({left:600,top:0,width:360,height:920}).webp({quality:92}).toFile(`${outputRoot}/door-left.webp`)
await closed.clone().extract({left:960,top:0,width:378,height:920}).webp({quality:92}).toFile(`${outputRoot}/door-right.webp`)
