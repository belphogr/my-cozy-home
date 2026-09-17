export const MAX_PHOTO_FILE_BYTES=15*1024*1024
export const MAX_RENDERED_PHOTO_CHARS=3_000_000
const allowedTypes=new Set(['image/jpeg','image/png','image/webp'])

export function scaledPhotoSize(width:number,height:number,maxEdge=1280){
 if(!Number.isFinite(width)||!Number.isFinite(height)||width<=0||height<=0)throw new Error('无法读取照片尺寸')
 const scale=Math.min(1,maxEdge/Math.max(width,height))
 return {width:Math.max(1,Math.round(width*scale)),height:Math.max(1,Math.round(height*scale))}
}
function render(bitmap:ImageBitmap,maxEdge:number,quality:number){
 const size=scaledPhotoSize(bitmap.width,bitmap.height,maxEdge),canvas=document.createElement('canvas')
 canvas.width=size.width;canvas.height=size.height
 const context=canvas.getContext('2d',{alpha:false})
 if(!context)throw new Error('浏览器无法处理这张照片')
 context.fillStyle='#f1eadb';context.fillRect(0,0,size.width,size.height)
 context.drawImage(bitmap,0,0,size.width,size.height)
 return canvas.toDataURL('image/webp',quality)
}
export async function preparePhoto(file:File){
 if(!allowedTypes.has(file.type))throw new Error('请选择 JPG、PNG 或 WebP 照片')
 if(file.size===0)throw new Error('照片文件为空')
 if(file.size>MAX_PHOTO_FILE_BYTES)throw new Error('照片不能超过 15 MB')
 let bitmap:ImageBitmap|undefined
 try{
  bitmap=await createImageBitmap(file,{imageOrientation:'from-image'})
  let result=render(bitmap,1280,.82)
  if(result.length>2_400_000)result=render(bitmap,960,.72)
  if(result.length>MAX_RENDERED_PHOTO_CHARS)throw new Error('照片压缩后仍然过大，请换一张照片')
  return result
 }catch(error){
  if(error instanceof Error&&error.message.startsWith('照片'))throw error
  throw new Error('照片无法读取，请换用 JPG、PNG 或 WebP 格式')
 }finally{bitmap?.close()}
}
