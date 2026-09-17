import { Atelier } from './Atelier'
import { Box, Round, mat, timber } from './primitives'

const shelfWood=timber('#684832',.72)
const shelfDark=timber('#4b3528',.78)
const bookColors=['#6d8068','#b06f51','#d2b77d','#758995','#ded2b5','#8b674d']
const shelfLevels=[.18,.82,1.46,2.10,2.74,3.38]

function BookRow({level,row}:{level:number;row:number}){
 const rows=[
  {books:[[-.39,.065,.38,-.03],[-.30,.075,.31,.02],[-.20,.055,.42,-.01],[-.11,.070,.35,.08]],stack:[.25,.34,2]},
  {books:[[-.37,.060,.34,-.02],[-.28,.070,.43,.01],[-.18,.055,.30,.10],[.10,.080,.39,-.06],[.21,.065,.33,.02]],stack:null},
  {books:[[.08,.060,.35,-.04],[.17,.075,.44,.03],[.28,.055,.31,-.02],[.37,.065,.39,.09]],stack:[-.23,.34,3]},
  {books:[[-.36,.075,.40,-.03],[-.25,.055,.32,.04],[-.16,.065,.45,.01],[-.06,.060,.36,.13]],stack:null},
  {books:[[-.38,.055,.34,-.02],[-.29,.070,.41,.05],[-.18,.060,.29,-.08],[-.08,.075,.37,.02]],stack:null},
 ] as const
 const current=rows[row]
 return <group>
  {current.books.map(([x,width,height,rotation],index)=><group key={index} position={[x,level+.055+height/2,.105]} rotation={[0,0,rotation]}>
   <Round size={[width,height,.27]} radius={.010} material={mat(bookColors[(index+row*2)%bookColors.length],.84)}/><Box size={[width+.004,.012,.275]} position={[0,height*.31,.002]} material={mat('#e7dec8',.9)}/>
  </group>)}
  {current.stack&&Array.from({length:current.stack[2]},(_,index)=><group key={'stack'+index} position={[current.stack![0],level+.075+index*.052,.105]} rotation={[0,0,index%2?.018:-.012]}>
   <Round size={[current.stack![1]-(index%2)*.035,.045,.28]} radius={.009} material={mat(bookColors[(row+index+3)%bookColors.length],.84)}/><Box size={[current.stack![1]-.03,.008,.284]} position={[0,.024,0]} material={mat('#e7dec8',.9)}/>
  </group>)}
  {row===3&&<group position={[.31,level+.11,.10]}><mesh><cylinderGeometry args={[.09,.075,.18,20]}/><meshStandardMaterial color="#d3bd92" roughness={.9}/></mesh><mesh position={[0,.13,0]} scale={[.14,.06,.08]}><sphereGeometry args={[1,14,8]}/><meshStandardMaterial color="#71856c" roughness={.9}/></mesh></group>}
 </group>
}
export function TallBookshelf(){
 return <group>
  <Box size={[1.22,3.48,.08]} position={[0,1.78,-.19]} material={shelfDark}/>
  <Box size={[.13,3.62,.52]} position={[-.60,1.79,.02]} material={shelfWood}/><Box size={[.13,3.62,.52]} position={[.60,1.79,.02]} material={shelfWood}/>
  {shelfLevels.map((level,index)=><group key={level}><Box size={[1.22,.09,.58]} position={[0,level,.02]} material={shelfWood}/>{index<shelfLevels.length-1&&<BookRow level={level} row={index}/>}</group>)}
  <Round size={[1.36,.16,.64]} position={[0,3.55,.01]} radius={.035} material={shelfDark}/>
  <Box size={[.10,.20,.46]} position={[-.49,.08,.02]} material={shelfDark}/><Box size={[.10,.20,.46]} position={[.49,.08,.02]} material={shelfDark}/>
  <group position={[.36,2.84,.12]} scale={.48}><Atelier model="plant"/></group>
 </group>
}

export function DiningMagazine(){
 return <group>
  {/* A visible cloth cover and layered page block keep the magazine readable at room scale. */}
  <Round size={[.76,.028,.53]} position={[0,.014,0]} radius={.025} material={mat('#4e6958',.84)}/>
  {Array.from({length:5},(_,index)=><Round key={index} size={[.715,.009,.495]} position={[index%2?.004:-.004,.036+index*.008,0]} radius={.018} material={mat(index%2?'#e8dfca':'#f2ead8',.96)}/>)}
  <Round size={[.036,.068,.505]} position={[0,.066,0]} radius={.014} material={mat('#b8a47c',.88)}/>
  {/* Slightly raised open spreads make it clearly a magazine rather than a flat placemat. */}
  <group position={[-.184,.082,0]} rotation={[0,0,.055]}>
   <Round size={[.365,.024,.49]} radius={.018} material={mat('#f6efdf',.97)}/>
   <Round size={[.27,.008,.205]} position={[-.015,.017,-.105]} radius={.012} material={mat('#7e9c8e',.82)}/>
   <Box size={[.235,.009,.018]} position={[-.02,.018,.055]} material={mat('#4a5d51',.82)}/>
   <Box size={[.28,.007,.012]} position={[0,.018,.095]} material={mat('#b5aa92',.8)}/>
   <Box size={[.22,.007,.012]} position={[-.03,.018,.126]} material={mat('#b5aa92',.8)}/>
  </group>
  <group position={[.184,.082,0]} rotation={[0,0,-.055]}>
   <Round size={[.365,.024,.49]} radius={.018} material={mat('#f8f1e2',.97)}/>
   <Box size={[.27,.008,.025]} position={[0,.017,-.175]} material={mat('#5b725f',.84)}/>
   <Round size={[.12,.009,.16]} position={[-.07,.018,-.035]} radius={.01} material={mat('#d9ad78',.84)}/>
   <Round size={[.12,.009,.16]} position={[.07,.018,-.035]} radius={.01} material={mat('#b8c4a7',.84)}/>
   <Box size={[.27,.007,.012]} position={[0,.018,.09]} material={mat('#afa58e',.8)}/>
   <Box size={[.21,.007,.012]} position={[-.03,.018,.125]} material={mat('#afa58e',.8)}/>
   <Box size={[.245,.007,.012]} position={[-.012,.018,.158]} material={mat('#afa58e',.8)}/>
  </group>
 </group>
}

export function TableReadingSet({hidden,onFocus}:{hidden?:'diningCup'|'diningMagazine'|null;onFocus:(id:'diningCup'|'diningMagazine')=>void}){
 const interactive=(id:'diningCup'|'diningMagazine')=>({
  visible:hidden!==id,
  onClick:(event:{delta:number;stopPropagation:()=>void})=>{if(event.delta<5){event.stopPropagation();onFocus(id)}},
  onPointerOver:(event:{stopPropagation:()=>void})=>{event.stopPropagation();document.body.style.cursor='pointer'},
  onPointerOut:()=>{document.body.style.cursor='auto'},
 })
 return <group>
  <group position={[-.47,.985,.10]} rotation={[0,-.28,0]} {...interactive('diningMagazine')}><DiningMagazine/></group>
  <group position={[.48,.975,.12]} scale={.82} {...interactive('diningCup')}><ModernCoffeeCup/></group>
 </group>
}

export function ModernCoffeeCup(){
 return <group>
  <Round size={[.56,.035,.56]} position={[0,.018,0]} radius={.09} material={timber('#8b6948',.88)}/>
  <mesh position={[0,.25,0]} castShadow><cylinderGeometry args={[.23,.18,.42,28]}/><meshPhysicalMaterial color="#c7834f" roughness={.16} metalness={0} transmission={.12} thickness={.08} transparent opacity={.78}/></mesh>
  <mesh position={[0,.466,0]}><cylinderGeometry args={[.205,.205,.018,28]}/><meshStandardMaterial color="#432b20" roughness={.62}/></mesh>
  <mesh position={[.25,.27,0]} rotation={[0,0,0]} castShadow><torusGeometry args={[.145,.035,10,28]}/><meshPhysicalMaterial color="#c7834f" roughness={.16} transmission={.10} thickness={.06} transparent opacity={.82}/></mesh>
  {Array.from({length:8},(_,index)=><Box key={index} size={[.018,.32,.010]} position={[Math.cos(index*Math.PI/4)*.195,.245,Math.sin(index*Math.PI/4)*.195]} rotation={[0,-index*Math.PI/4,0]} material={mat('#e5b078',.44)}/>) }
 </group>
}
