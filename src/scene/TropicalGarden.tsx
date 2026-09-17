import { Box, mat } from './primitives'
import { pathPlantings, backPlantings } from './architecture'
import { PlantInstances } from './PlantInstances'
import type { PlantPlacement } from './PlantInstances'

const pathFerns:PlantPlacement[]=pathPlantings.map((position,i)=>({position,scale:.48+(i%3)*.08}))
const groundcover:PlantPlacement[]=pathPlantings.map(([x,y,z],i)=>({position:[x+Math.sin(i)*.13,y,z+.18],scale:.55+(i%4)*.15}))
const pathLeaves:PlantPlacement[]=pathPlantings.filter((_,i)=>i%3===0).map((position,i)=>({position,scale:.23+(i%3)*.06}))
const backLeaves:PlantPlacement[]=[...backPlantings.map((position,i)=>({position,scale:.75+(i%3)*.20})),
 {position:[11.75,-.02,-.9],scale:1.58},{position:[12.82,-.02,.35],scale:1.36}]
const backFerns:PlantPlacement[]=backPlantings.map(([x,y,z],i)=>({position:[x,y,z+.23],scale:.55+(i%2)*.15}))
const floweringEdge:PlantPlacement[]=[...backPlantings,...Array.from({length:11},(_,i)=>[12.82,-.02,.1+i*.76] as [number,number,number])]
 .map((position,i)=>({position,scale:1.15+(i%3)*.18}))

// Planted outside the room and around the courtyard, never in the connecting doorway.
export const palmPlacements=[
 [6.4,-2.9,1.25],[9.2,-3.1,1.4],[12.1,-2.9,1.2],[15.2,-.7,1.3],
 [15.3,2.5,1.5],[15.5,5.7,1.25],[15.0,9.5,1.3],[-9.0,0,1.2],[-9.3,3.4,1.4],[-9.0,7,1.15],
] as const
const instancedPalms:PlantPlacement[]=palmPlacements.map(([x,z,scale],i)=>({position:[x,-.02,z],scale,angle:i*1.7}))
const architecturalBroadleaf:PlantPlacement[]=[
 ...Array.from({length:11},(_,i)=>({position:[4.8+i*.95,-.02,-2.6] as [number,number,number],scale:2.0+(i%3)*.22,angle:i*2.4})),
 ...Array.from({length:12},(_,i)=>({position:[14.0+(i%2)*.55,-.02,-1.2+i*.95] as [number,number,number],scale:1.25+(i%3)*.2,angle:i*2.4})),
 ...Array.from({length:8},(_,i)=>({position:[13.04,.40,-.2+i*1.12] as [number,number,number],scale:.9,angle:i*1.7})),
 ...Array.from({length:5},(_,i)=>({position:[-7.9,-.02,-.5+i*1.8] as [number,number,number],scale:1.25,angle:i*1.3})),
]
const architecturalFerns:PlantPlacement[]=Array.from({length:11},(_,i)=>({position:[12.85,.41,-.2+i*.79],scale:.65,angle:i}))
const naturalBroadleaf=[...pathLeaves,...backLeaves],naturalFerns=[...pathFerns,...backFerns],naturalUnderstory=[...groundcover,...floweringEdge]
export function TropicalGarden(){
 return <group>
  <Box size={[12,.1,4.4]} position={[9,-.18,-3.7]} material={mat('#586844',1)}/>
  <Box size={[5,.1,15]} position={[16,-.18,3.4]} material={mat('#586844',1)}/>
  <Box size={[4,.1,13]} position={[-9,-.18,4]} material={mat('#586844',1)}/>
  <PlantInstances model="palm" placements={instancedPalms} crafted/>
  <PlantInstances model="broadleaf" placements={architecturalBroadleaf} crafted/>
  <Box size={[.56,.42,9.5]} position={[13.03,.18,3.9]} material={mat('#928d72',.97)}/>
  <PlantInstances model="fern" placements={architecturalFerns} crafted/>
  <PlantInstances model="fern" placements={naturalFerns}/>
  <PlantInstances model="broadleaf" placements={naturalBroadleaf}/>
  <PlantInstances model="understory" placements={naturalUnderstory}/>
 </group>
}
