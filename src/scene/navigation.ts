import type { InspectId } from '../data/home'
import { items, recordPlayerPosition, portalWaypoints } from './layout'
import type { Area } from './layout'
export type Point=[number,number,number]
export type FocusId=InspectId|'desk'|'sofa'|'shelf'|'tallShelf'|'niche'|'dining'|'sideboard'|'recordPlayer'|'bench'|'pool'|'window'|'lamp'|'ceilingLight'|'art'|'recognitionWall'
export type Travel={serial:number;kind:'region'|'reset'|'restore'}|{serial:number;kind:'focus';id:FocusId}
export type CameraPose={position:Point;target:Point;fov:number}
export const focusNames:Record<FocusId,string>={cup:'陶瓷茶杯',book:'植物笔记本',plant:'桌上绿植',mouse:'鼠标',phone:'木架上的手机',globe:'维多利亚地球仪',hanging:'风铃与卡片',livingBook:'茶几上的书',catpuccino:'猫咪棉花糖咖啡',tablePlant:'圆桌上的小花',narcissus:'窗边的水仙花',diningCup:'琥珀咖啡杯',diningMagazine:'桌上的杂志',wateringCan:'园艺洒水壶',gardenGreen:'庭院绿植',gardenFlowers:'珊瑚色小花',gardenSucculent:'莲座多肉',gardenPotA:'庭院阔叶盆栽',gardenPotB:'围墙边盆栽',gardenPotC:'露台绿植',desk:'电脑书桌',sofa:'沙发阅读角',shelf:'矮书架',tallShelf:'落地书墙',niche:'拱形收藏壁龛',dining:'圆桌小憩',sideboard:'音乐边柜',recordPlayer:'午后唱片机',bench:'种植台',pool:'泳池躺椅',window:'窗边',lamp:'书桌台灯',ceilingLight:'藤编顶灯',art:'装饰画',recognitionWall:'成果墙'}
export const isSmallItem=(id:FocusId):id is InspectId=>items.some(item=>item.id===id)
export const focusArea=(id:FocusId):Area=>id==='bench'||id==='pool'||id==='wateringCan'||id.startsWith('garden')?'outdoor':'indoor'
export const ORBIT_LIMIT=.20
export const clampOrbit=(angle:number)=>Math.max(-ORBIT_LIMIT,Math.min(ORBIT_LIMIT,angle))
export function overviewPose(area:Area,aspect:number,angle=0):CameraPose{
 const target:Point=area==='indoor'?[-.8,1.85,1.4]:[6.65,2.0,.7]
 const base:Point=area==='indoor'?[-.7,2.75,8.7]:[8.35,2.6,8.8]
 const dx=base[0]-target[0],dz=base[2]-target[2],radius=Math.hypot(dx,dz)
 const a=Math.atan2(dx,dz)+clampOrbit(angle)
 // Never back out through a wall to fit portrait screens: widen the lens instead.
 return {position:[target[0]+Math.sin(a)*radius,base[1],target[2]+Math.cos(a)*radius],target,fov:aspect<1?80:72}
}
export function cameraRoute(start:Point,end:Point):Point[]{
 if((start[0]<4.25)===(end[0]<4.25))return [end]
 const door=portalWaypoints.map(p=>[p[0],2.5,p[2]] as Point)
 return start[0]<4.25?[...door,end]:[...door.reverse(),end]
}
export function computerPose(aspect:number):CameraPose{
 const z=Math.max(2.5,1.14/(Math.tan(32*Math.PI/360)*Math.max(.25,aspect))-.4675)
 return {position:[0,1.95+Math.max(0,z-2.5)*.25,z],target:[0,1.80,-.4675],fov:32}
}
export function focusPose(id:FocusId,aspect:number):CameraPose{
 const item=items.find(i=>i.id===id)
 if(id==='hanging'){
  // The rail is mounted on the left wall and faces into the room (+X).
  // Use an absolute, frontal pose so lighting mode and the previous orbit angle
  // cannot change the apparent viewing direction.
  return {position:[-3.95,4.05,1.3],target:[-6.39,4.02,1.3],fov:aspect<1?58:44}
 }
 if(id==='art')return {position:[-4.82,3.78,3.45],target:[-4.82,3.58,-1.245],fov:aspect<1?58:44}
 let target:Point,distance:number
 if(item){
  const planted=id==='plant'||id==='gardenGreen'||id.startsWith('gardenPot')
  target=[item.position[0],item.position[1]+(id==='narcissus'?.4:planted?.3:.13),item.position[2]]
  distance=planted?2.1:1.65
 }else{
  const targets:Partial<Record<FocusId,[Point,number]>>={
   desk:[[0,1.55,0],5.8],sofa:[[-4.8,.85,4.3],6.7],shelf:[[-4.85,1.3,-.6],4.8],tallShelf:[[3.42,1.75,-1.0],3.8],niche:[[-6.2,2.9,4.55],4.8],
   dining:[[1.25,.8,4.0],5.8],sideboard:[[-6.04,.9,1.25],5.2],recordPlayer:[[recordPlayerPosition[0],1.43,1.275],2.2],
   bench:[[6.65,.9,-.45],4.5],pool:[[10.25,0,3.9],9.2],window:[[-6.2,2.6,1.3],5.5],lamp:[[-2.2,1.9,-.3],2.5],ceilingLight:[[-1.5,4.75,.4],3.8],art:[[-4.85,3.45,-1.2],4.8],recognitionWall:[[0,3.72,-1.2],4.4],
  }
  ;[target,distance]=targets[id]!
 }
 if(id==='niche')return {position:[-2.5,3.2,5.5],target,fov:aspect<1?65:48}
 if(id==='sideboard')return {position:[-2.8,2.25,2.9],target,fov:aspect<1?76:60}
 if(id==='recordPlayer')return {position:[-4.05,2.5,1.825],target,fov:aspect<1?65:42}
 if(id==='ceilingLight')return {position:[-.45,5.18,3.05],target,fov:aspect<1?62:44}
 distance*=Math.max(1,Math.min(1.4,.95/Math.max(.25,aspect)))
 const elevation=id==='pool'?.64:.36
 return {target,position:[target[0]+(id==='window'?1.1:0),Math.min(4.5,target[1]+Math.sin(elevation)*distance),Math.min(focusArea(id)==='indoor'?8.65:9.0,target[2]+Math.cos(elevation)*distance)],fov:aspect<1?65:42}
}

