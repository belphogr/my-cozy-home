import type { V3 } from './primitives'
export const roof={wallX:4.25,eaveWidth:1.35,eavePitch:.14}
// Raised above the sofa, clear of the left window and its curtains.
export const nichePosition:V3=[-6.50,1.55,4.55]
export const nicheRotation=Math.PI/2
// A clear central stone route and an unplanted doorway crossing at z=3.5.
export const pathPlantings:V3[]=Array.from({length:12},(_,i)=>.35+i*.72)
 .flatMap((z,i):V3[]=>Math.abs(z-3.5)<.9?[[7.46,-.02,z]]:[[5.12+Math.sin(i*2.4)*.12,-.02,z],[7.46+Math.sin(i*1.9)*.10,-.02,z+.12]])
export const backPlantings:V3[]=Array.from({length:7},(_,i)=>[8.2+i*.64,-.02,-.95])
