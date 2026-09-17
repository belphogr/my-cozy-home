import { readFileSync,statSync } from 'node:fs'
import { describe,expect,it } from 'vitest'

const asset=new URL('../../public/assets/intro/bali-intro.glb',import.meta.url)

describe('Blender Bali intro asset',()=>{
 it('stays within the startup budget',()=>expect(statSync(asset).size).toBeLessThan(15*1024*1024))
 it('contains the interactive door and camera contract',()=>{
  const text=new TextDecoder().decode(readFileSync(asset))
  for(const name of ['Door_Left_Pivot','Door_Right_Pivot','Door_Handle_Left','Door_Handle_Right','Cam_00','Cam_07','Target_00','Target_07','Island_Main','Water_Ocean','Build_MainHipRoof','Build_ReusedPool'])expect(text).toContain(name)
  expect(text).toContain('HouseBuild__')
  expect(text).toContain('ValleyGrowth__')
 })
})
