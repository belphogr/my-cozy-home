import type { ThreeEvent } from '@react-three/fiber'
import type { Recognition } from '../data/home'
import { Box, Round, mat, timber } from './primitives'

const brass=mat('#bd8a3c',.76)
const paleGold=mat('#d9bd78',.78)
const paper=mat('#f1ead8',.97)
const ink=mat('#43594f',.90)
const muted=mat('#9ca49a',.86)
const wood=timber('#5d3d29',.84)
const darkWood=timber('#3f3029',.88)
const terracotta=mat('#bd7657',.84)
const mistBlue=mat('#9eb4b6',.86)

function Poster({filled}:{filled:boolean}){
 return <group>
  <Round size={[1.12,1.12,.09]} radius={.03} material={darkWood}/><Round size={[1,1,.036]} position={[0,0,.058]} radius={.012} material={paper}/>
  <Box size={[.78,.10,.014]} position={[0,.35,.086]} material={ink}/>
  <Box size={[.30,.34,.015]} position={[-.24,.05,.087]} material={mat('#e6c981',.88)}/><Box size={[.30,.34,.015]} position={[.10,.05,.087]} material={mat('#d6a9a0',.88)}/><Box size={[.18,.34,.015]} position={[.36,.05,.087]} material={mat('#a8bec5',.88)}/>
  {[-.16,-.26,-.36].map((y,i)=><Box key={y} size={[.72-i*.12,.018,.014]} position={[-i*.03,y,.087]} material={i===0?ink:muted}/>) }
  <mesh position={[-.38,-.43,.094]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.035,.035,.018,20]}/><meshStandardMaterial color={filled?'#5c8068':'#c8ad76'} roughness={.8}/></mesh>
 </group>
}
function Certificate({filled}:{filled:boolean}){
 return <group>
  <Round size={[1.10,1.12,.09]} radius={.025} material={wood}/><Round size={[1,1,.038]} position={[0,0,.057]} radius={.012} material={paper}/><Round size={[.86,.82,.012]} position={[0,0,.083]} radius={.008} material={mat('#f7f1e2',.98)}/>
  <Box size={[.70,.018,.012]} position={[0,.31,.092]} material={paleGold}/><Box size={[.38,.055,.012]} position={[0,.18,.093]} material={ink}/>
  {[.07,-.02,-.11].map((y,i)=><Box key={y} size={[.62-i*.12,.016,.012]} position={[0,y,.093]} material={i===0?muted:mat('#b6b4a8',.8)}/>) }
  <mesh position={[0,-.28,.104]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.105,.105,.022,32]}/><meshStandardMaterial color={filled?'#5e7e69':'#c7903d'} roughness={.68}/></mesh>
  <Box size={[.055,.20,.018]} position={[-.045,-.40,.099]} rotation={[0,0,.18]} material={terracotta}/><Box size={[.055,.20,.018]} position={[.045,-.40,.099]} rotation={[0,0,-.18]} material={mistBlue}/>
 </group>
}
function Medal({filled}:{filled:boolean}){
 return <group>
  <Round size={[1.12,1.12,.10]} radius={.04} material={wood}/><Round size={[1,1,.04]} position={[0,0,.06]} radius={.02} material={mat('#38584c',.94)}/>
  <mesh position={[0,.11,.102]} rotation={[Math.PI/2,0,0]}><torusGeometry args={[.25,.035,12,40]}/><meshStandardMaterial color="#d9b967" metalness={.18} roughness={.58}/></mesh>
  <mesh position={[0,.11,.103]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.18,.18,.025,32]}/><meshStandardMaterial color={filled?'#d9a44c':'#e7d8ae'} roughness={.7}/></mesh>
  <Box size={[.14,.42,.022]} position={[-.08,-.25,.099]} rotation={[0,0,.16]} material={terracotta}/><Box size={[.14,.42,.022]} position={[.08,-.25,.099]} rotation={[0,0,-.16]} material={mistBlue}/>
  {[[-.32,.34],[.32,.34],[-.34,-.37],[.34,-.37]].map(([x,y],i)=><mesh key={i} position={[x,y,.096]} rotation={[Math.PI/2,0,0]}><cylinderGeometry args={[.025,.025,.015,16]}/><meshStandardMaterial color="#d9bd78" roughness={.7}/></mesh>)}
 </group>
}

export function RecognitionWall({items=[],night,onOpen}:{items?:Recognition[];night:boolean;onOpen:()=>void}){
 const click=(event:ThreeEvent<MouseEvent>)=>{if(event.delta<5){event.stopPropagation();onOpen()}}
 return <group onClick={click} onPointerOver={event=>{event.stopPropagation();document.body.style.cursor='pointer'}} onPointerOut={()=>{document.body.style.cursor='auto'}}>
  <group position={[0,4.68,-1.03]}><Box size={[1.28,.09,.18]} material={wood}/><Round size={[.18,.30,.16]} position={[0,-.18,.03]} radius={.04} material={brass}/><Round size={[1.04,.21,.18]} position={[0,-.37,.12]} radius={.04} material={mat(night?'#fff0bd':'#e8d8b1',.86)}/><mesh position={[0,-.37,.23]}><planeGeometry args={[.82,.075]}/><meshBasicMaterial color={night?'#ffe7a7':'#f8edcf'} toneMapped={false}/></mesh><pointLight position={[0,-.46,.45]} intensity={night?1.7:0} distance={3.2} color="#ffd28b"/></group>
  <group position={[-1.48,3.60,-1.245]} scale={[1.05,1.30,1]}><Poster filled={items.length>0}/></group>
  <group position={[0,3.73,-1.245]} scale={[1.50,1.00,1]}><Certificate filled={items.length>1}/></group>
  <group position={[1.48,3.62,-1.245]} scale={[1.00,1.18,1]}><Medal filled={items.length>2}/></group>
 </group>
}
