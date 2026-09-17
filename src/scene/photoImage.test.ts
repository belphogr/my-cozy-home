import { describe,expect,it } from 'vitest'
import { scaledPhotoSize } from './photoImage'

describe('照片墙图片压缩尺寸',()=>{
 it('keeps small photos unchanged',()=>expect(scaledPhotoSize(900,600)).toEqual({width:900,height:600}))
 it('shrinks landscape and portrait photos without changing their proportions',()=>{
  expect(scaledPhotoSize(6000,4000)).toEqual({width:1280,height:853})
  expect(scaledPhotoSize(3000,6000)).toEqual({width:640,height:1280})
 })
 it('rejects invalid dimensions',()=>expect(()=>scaledPhotoSize(0,100)).toThrow('尺寸'))
})
