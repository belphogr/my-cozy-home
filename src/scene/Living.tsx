import { Atelier } from './Atelier'
import { coffeeTablePosition, rugPosition, sofaPosition } from './layout'

export function Living({onApproach,computer}:{onApproach:()=>void;computer:boolean}){
 return <group>
  <group position={sofaPosition} rotation={[0,Math.PI/2,0]}
   onClick={e=>{if(!computer&&e.delta<5){e.stopPropagation();onApproach()}}}
   onPointerOver={e=>{e.stopPropagation();if(!computer)document.body.style.cursor='pointer'}}
   onPointerOut={()=>{document.body.style.cursor='auto'}}><Atelier model="sofa"/></group>
  <group position={coffeeTablePosition} onClick={e=>{if(!computer&&e.delta<5){e.stopPropagation();onApproach()}}}><Atelier model="coffeetable"/></group>
  <group position={rugPosition}><Atelier model="rug"/></group>
 </group>
}
