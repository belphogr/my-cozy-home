import type { InspectId } from '../data/home'
type V3=[number,number,number]
export type Area='indoor'|'outdoor'
export const isOutside=(area:Area)=>area==='outdoor'
export const roomBounds={left:-6.6,right:4.25,back:-1.38,front:9.2,ceiling:5.5}
export const entryPosition:V3=[4.25,0,3.5]
export const poolPosition:V3=[10.25,-.021,2.15]
export const benchPosition:V3=[6.65,-.021,-.55]
export const loungerPositions:V3[]=[[9.45,-.021,6.65],[11.25,-.021,6.65]]
export const gardenGroundSections:{position:V3;size:V3}[]=[
 {position:[6.32,-.082,4],size:[4,.12,11]},
 {position:[10.86,-.082,6.95],size:[5.08,.12,5.1]},
 {position:[10.86,-.082,-.8],size:[5.08,.12,1.4]},
 {position:[12.79,-.082,2.15],size:[1.22,.12,4.5]},
]
export const portalWaypoints:V3[]=[[3.35,1.9,3.5],[5.95,1.9,3.5]]
export const sofaPosition:V3=[-5.48,-.021,4.3]
export const coffeeTablePosition:V3=[-3.45,-.0035,4.15]
export const rugPosition:V3=[-3.6,-.021,4.15]
export const catpuccinoPosition:V3=[-3.28,.5565,3.94]
export const diningPosition:V3=[1.25,-.021,4.0]
export const diningChairPositions:V3[]=[[2.02,-.021,5.50]]
export const deskChairPosition:V3=[.30,0,1.55]
// The source chair's back is at local -Z; its seat faces local +Z.
export const chairFacing=(position:V3,target:V3)=>Math.atan2(target[0]-position[0],target[2]-position[2])
export const sideboardPosition:V3=[-6.04,-.021,1.25]
export const sideboardScale:V3=[.85,1,1]
export const sideboardRotation=Math.PI/2
export const recordPlayerPosition:V3=[-6.04,1.2465,1.275]
export const narcissusPosition:V3=[-6.04,1.70,2.14]
export const cupPosition:V3=[-2.1,1.14,.55]
// Stand has its origin on its underside; cabinet feet extend to the floor at -.02.
export const deskBooksPosition:V3=[2.36,1.12,-.35]
export const shelfPosition:V3=[-4.85,0,-.95]
export const floorPlantPosition:V3=[-3.35,-.021,.15]
export const dogBedPosition:V3=[-4.25,-.0285,1.55]
export const tallShelfPosition:V3=[3.42,-.021,-1.03]
export const windowPosition:V3=[-6.6,2.7,1.3]
// Four solid sections leave the window opening at z=0..2.6, y=1..3.7.
export const windowWallSections:{size:V3;position:V3}[]=[
 {size:[.16,5.6,1.5],position:[-6.6,2.75,-.75]},
 {size:[.16,5.6,6.6],position:[-6.6,2.75,5.9]},
 {size:[.16,1.40,2.6],position:[-6.6,.65,1.3]},
 {size:[.16,1.45,2.6],position:[-6.6,4.775,1.3]},
]
export const items:{id:InspectId;position:V3;rotation?:V3;scale?:number}[]=[
 // Clearance includes the complete handle, not just the cup body.
 {id:'cup',position:cupPosition},
 {id:'book',position:[-1.2,1.15,.3],rotation:[0,-.2,0]},
 {id:'plant',position:[1.86,1.14,-.39],scale:.85},
 {id:'mouse',position:[1.24,1.165,.62]},
 {id:'phone',position:[2.02,1.12,.55],rotation:[0,-.18,0],scale:1.35},
 {id:'globe',position:[3.42,3.62,-1.03]},
 {id:'hanging',position:[-6.39,4.35,1.3],rotation:[0,Math.PI/2,0]},
 {id:'livingBook',position:[-3.72,.5552,4.35],scale:.65,rotation:[0,.35,0]},
 {id:'catpuccino',position:catpuccinoPosition,rotation:[0,-.18,0],scale:2.60},
 {id:'tablePlant',position:[diningPosition[0],.943,diningPosition[2]-.43],scale:.7},
 {id:'narcissus',position:narcissusPosition},
 {id:'diningMagazine',position:[diningPosition[0]-.47,.964,diningPosition[2]+.10],rotation:[0,-.28,0]},
 {id:'diningCup',position:[diningPosition[0]+.48,.954,diningPosition[2]+.12],scale:.82},
 {id:'wateringCan',position:[6.36,.233,-.49]},
 {id:'gardenGreen',position:[6.04,1.023,-.52],scale:.68},
 {id:'gardenFlowers',position:[6.73,1.023,-.5]},
 {id:'gardenSucculent',position:[7.32,1.023,-.48]},
 {id:'gardenPotA',position:[8.65,-.021,-.78],scale:.6},
 {id:'gardenPotB',position:[11.76,-.021,-.78],scale:.6},
 {id:'gardenPotC',position:[12.8,-.021,8.3],scale:.8},
]
