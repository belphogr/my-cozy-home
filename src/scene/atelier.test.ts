import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { Box3, Matrix4, Mesh, PerspectiveCamera, Raycaster, Vector3 } from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { clampOrbit, ORBIT_LIMIT, cameraRoute, overviewPose, computerPose, focusNames, focusPose } from './navigation'
import type { FocusId } from './navigation'
import { nichePosition, nicheRotation, pathPlantings } from './architecture'
import { roomBounds, chairFacing, deskChairPosition, sideboardRotation, sideboardScale, diningPosition, diningChairPositions, sideboardPosition, recordPlayerPosition, benchPosition, gardenGroundSections, loungerPositions, poolPosition, portalWaypoints, coffeeTablePosition, deskBooksPosition, dogBedPosition, floorPlantPosition, items, catpuccinoPosition, rugPosition, shelfPosition, sofaPosition, windowPosition, windowWallSections } from './layout'

async function asset(name:string){
 const bytes=readFileSync(new URL(`../../public/assets/models/atelier/${name}.glb`,import.meta.url))
 const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString())
 const gltf=await new GLTFLoader().parseAsync(bytes.buffer.slice(bytes.byteOffset,bytes.byteOffset+bytes.byteLength),'')
 return {json,scene:gltf.scene}
}
describe('Blender assets',()=>{
 it('ships the rigged Shiba with separate resting and walking clips',()=>{
  const bytes=readFileSync(new URL('../../public/assets/models/dog.glb',import.meta.url))
  const json=JSON.parse(bytes.subarray(20,20+bytes.readUInt32LE(12)).toString())
  expect(json.animations.map((animation:{name:string})=>animation.name)).toEqual(['Dog_Rest','Dog_Walk'])
  expect(json.skins).toHaveLength(1)
  expect(json.meshes).toHaveLength(1)
 })
 it('supports the oval dog bed on the floor in a clear part of the room',async()=>{
  const bed=new Box3().setFromObject((await asset('dogbed')).scene).translate(new Vector3(...dogBedPosition))
  const desk=new Box3().setFromObject((await asset('desk')).scene)
  const shelf=new Box3().setFromObject((await asset('shelf')).scene).translate(new Vector3(...shelfPosition))
  expect(bed.min.y).toBeCloseTo(-.021,3)
  expect(bed.intersectsBox(desk)).toBe(false)
  expect(bed.intersectsBox(shelf)).toBe(false)
  expect(bed.min.x).toBeGreaterThan(roomBounds.left)
 })
 it('gives the niche real depth and keeps it above the sofa and clear of the window',async()=>{
  const {scene}=await asset('niche');scene.updateMatrixWorld(true)
  const front=new Raycaster(new Vector3(1,1.35,1),new Vector3(0,0,-1)).intersectObject(scene,true)[0]
  const back=new Raycaster(new Vector3(0,2.20,1),new Vector3(0,0,-1)).intersectObject(scene,true)[0]
  expect(front).toBeDefined();expect(back).toBeDefined()
  expect(front.point.z-back.point.z).toBeGreaterThan(.30)
  const bounds=new Box3().setFromObject(scene).applyMatrix4(new Matrix4().makeRotationY(nicheRotation)).translate(new Vector3(...nichePosition))
  const sofa=new Box3().setFromObject((await asset('sofa')).scene).applyMatrix4(new Matrix4().makeRotationY(Math.PI/2)).translate(new Vector3(...sofaPosition))
  expect(bounds.intersectsBox(sofa)).toBe(false)
  expect(bounds.min.z).toBeGreaterThan(2.7);expect(bounds.max.y).toBeLessThan(5)
 })
 it('keeps path planting centres to both sides and preserves the doorway crossing',()=>{
  expect(pathPlantings.some(p=>p[0]<5.4)).toBe(true);expect(pathPlantings.some(p=>p[0]>7.2)).toBe(true)
  for(const [x,,z] of pathPlantings){
   // Fern crowns are at most .47 wide here; the central walking strip stays open.
   expect(Math.abs(x-6.45)).toBeGreaterThan(.84)
   if(x<6)expect(Math.abs(z-3.5)).toBeGreaterThan(.9)
  }
 })
 it('frames both the eave and potting bench from the outdoor path camera',()=>{
  const p=overviewPose('outdoor',1672/941),camera=new PerspectiveCamera(p.fov,1672/941,.03,150)
  camera.position.set(...p.position);camera.lookAt(new Vector3(...p.target));camera.updateMatrixWorld()
  for(const point of [[5.4,5.1,-.5],[6.65,1,-.55],[10.2,0,2.1]]){
   const screen=new Vector3(...point).project(camera)
   expect(Math.abs(screen.x)).toBeLessThan(.95);expect(Math.abs(screen.y)).toBeLessThan(.95)
  }
 })
 it.each(['desk','chair','cup','lamp','plant','pendant','landscape','deskbooks','shelf','floorplant','window','sofa','coffeetable','rug','gardenentry','pottingbench','lounger','poolshell','wateringcan','flowers','succulent','diningtable','sideboard','turntable','vinyl','palm','broadleaf','fern','niche','understory'])('%s loads without external textures or unrelated Blender objects',async name=>{
  const {scene,json}=await asset(name)
  expect(json.images??[]).toHaveLength(0)
  expect(json.nodes.every((n:{name:string})=>n.name.startsWith('Atelier_'))).toBe(true)
  expect(json.scenes).toHaveLength(1)
  const bounds=new Box3().setFromObject(scene)
  expect(bounds.isEmpty()).toBe(false)
  expect([...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite)).toBe(true)
  let triangles=0
  scene.traverse(node=>{if(node instanceof Mesh){
   triangles+=(node.geometry.index?.count??node.geometry.attributes.position.count)/3
   expect(node.geometry.attributes.color).toBeDefined()
  }})
  expect(triangles).toBeLessThan(65000)
 })
 it('keeps the full cup handle clear of the book and cup on the desk',async()=>{
  const {scene}=await asset('cup')
  const cup=items.find(i=>i.id==='cup')!,book=items.find(i=>i.id==='book')!
  const cupBox=new Box3().setFromObject(scene).translate(new Vector3(...cup.position))
  const bookBox=new Box3(new Vector3(-.27,.002,-.35),new Vector3(.26,.17,.48))
   .applyMatrix4(new Matrix4().makeRotationY(book.rotation![1])).translate(new Vector3(...book.position))
  expect(bookBox.min.x-cupBox.max.x).toBeGreaterThan(.10)
  expect(cupBox.min.y).toBeCloseTo(1.14,3)
  expect(cupBox.min.x).toBeGreaterThan(-2.7)
 })
 it('preserves furniture scale and Y-up foot/top alignment',async()=>{
  const desk=new Box3().setFromObject((await asset('desk')).scene)
  const chair=new Box3().setFromObject((await asset('chair')).scene)
  expect(desk.max.y).toBeCloseTo(1.12,2)
  expect(desk.getSize(new Vector3()).x).toBeCloseTo(5.4,2)
  expect(chair.min.y).toBeGreaterThan(-.015)
  expect(chair.max.y).toBeLessThan(1.72)
 })
 it('loads the Blender egg chair without the accidental default cube or image textures',async()=>{
  const {scene,json}=await asset('eggchair')
  expect(json.images??[]).toHaveLength(0)
  expect(json.nodes.some((node:{name:string})=>node.name==='Cube')).toBe(false)
  expect(json.nodes.every((node:{name:string})=>node.name.startsWith('EggChair_'))).toBe(true)
  const bounds=new Box3().setFromObject(scene),size=bounds.getSize(new Vector3())
  expect(bounds.min.y).toBeGreaterThan(-.08)
  expect(size.x).toBeGreaterThan(1.4);expect(size.x).toBeLessThan(1.9)
  expect(size.y).toBeGreaterThan(1.4);expect(size.y).toBeLessThan(1.9)
  expect(size.z).toBeGreaterThan(.7)
 })
 it.each([
  ['hanging','Hanging_'],
 ] as const)('loads the detailed Blender %s model as texture-free named geometry',async(name,prefix)=>{
  const {scene,json}=await asset(name)
  expect(json.images??[]).toHaveLength(0)
  expect(json.nodes.length).toBeGreaterThan(8)
  expect(json.nodes.every((node:{name:string})=>node.name.startsWith(prefix))).toBe(true)
  const bounds=new Box3().setFromObject(scene),size=bounds.getSize(new Vector3())
  expect(bounds.isEmpty()).toBe(false)
  expect(Math.max(...size.toArray())).toBeGreaterThan(.65)
  expect([...bounds.min.toArray(),...bounds.max.toArray()].every(Number.isFinite)).toBe(true)
 })
 it('rests the desktop bookstand on the desk and its covers on the base',async()=>{
  const desk=new Box3().setFromObject((await asset('desk')).scene)
  const {scene}=await asset('deskbooks')
  const bounds=new Box3().setFromObject(scene).translate(new Vector3(...deskBooksPosition))
  expect(bounds.min.y).toBeCloseTo(desk.max.y,4)
  expect(bounds.min.x).toBeGreaterThan(desk.min.x)
  expect(bounds.max.x).toBeLessThan(desk.max.x)
  expect(bounds.min.z).toBeGreaterThan(desk.min.z)
  expect(bounds.max.z).toBeLessThan(desk.max.z)
  let covers=0
  scene.traverse(node=>{
   if(node instanceof Mesh&&!Array.isArray(node.material)&&/^Atelier_Book(Sage|Rust|Cream)$/.test(node.material.name)){
    covers++
    expect(new Box3().setFromObject(node).min.y).toBeCloseTo(.024,4)
   }
  })
  expect(covers).toBe(3)
 })
 it('keeps the new cabinet and floor plant supported and separated',async()=>{
  const shelf=new Box3().setFromObject((await asset('shelf')).scene).translate(new Vector3(...shelfPosition))
  const plant=new Box3().setFromObject((await asset('floorplant')).scene).translate(new Vector3(...floorPlantPosition))
  expect(shelf.min.y).toBeCloseTo(-.02,3)
  expect(plant.min.y).toBeCloseTo(-.021,3)
  expect(plant.min.x).toBeGreaterThan(-6.52)
  expect(plant.intersectsBox(shelf)).toBe(false)
  expect(shelf.max.x).toBeLessThan(-2.7)
 })
 it('leaves a real window aperture and keeps the curtains clear of furniture',async()=>{
  const {scene}=await asset('window')
  scene.updateMatrixWorld(true)
  const opaque:Mesh[]=[]
  scene.traverse(node=>{if(node instanceof Mesh&&!Array.isArray(node.material)&&!node.material.name.includes('Glass'))opaque.push(node)})
  expect(new Raycaster(new Vector3(.4,.7,2),new Vector3(0,0,-1)).intersectObjects(opaque,false)).toHaveLength(0)
  const opening=new Box3(new Vector3(-6.7,1.36,.01),new Vector3(-6.5,4.04,2.59))
  for(const part of windowWallSections){
   const size=new Vector3(...part.size),pos=new Vector3(...part.position)
   expect(new Box3().setFromCenterAndSize(pos,size).intersectsBox(opening)).toBe(false)
  }
  const window=new Box3().setFromObject(scene).applyMatrix4(new Matrix4().makeRotationY(Math.PI/2)).translate(new Vector3(...windowPosition))
  const plant=new Box3().setFromObject((await asset('floorplant')).scene).translate(new Vector3(...floorPlantPosition))
  const shelf=new Box3().setFromObject((await asset('shelf')).scene).translate(new Vector3(...shelfPosition))
  // The user-requested floor-length panels extend below the window sill,
  // while stopping above the floor and staying behind the low cabinet.
  expect(window.min.y).toBeGreaterThan(.55)
  expect(window.min.y).toBeLessThan(.75)
  expect(window.max.x).toBeLessThan(plant.min.x)
  expect(window.min.z).toBeGreaterThan(shelf.max.z)
 })
 it('supports living furniture and keeps it clear of walls, desk and the existing cat route',async()=>{
  const sofa=new Box3().setFromObject((await asset('sofa')).scene).applyMatrix4(new Matrix4().makeRotationY(Math.PI/2)).translate(new Vector3(...sofaPosition))
  const table=new Box3().setFromObject((await asset('coffeetable')).scene).translate(new Vector3(...coffeeTablePosition))
  const rug=new Box3().setFromObject((await asset('rug')).scene).translate(new Vector3(...rugPosition))
  expect(sofa.min.y).toBeCloseTo(-.021,3)
  expect(sofa.min.x).toBeGreaterThan(-6.45)
  expect(sofa.min.z).toBeGreaterThan(2.6)
  expect(table.min.x-sofa.max.x).toBeGreaterThan(.6)
  expect(table.min.y).toBeCloseTo(rug.max.y,3)
  const catpuccinoItem=items.find(i=>i.id==='catpuccino')!
  expect(catpuccinoItem.position).toEqual(catpuccinoPosition)
  expect(catpuccinoPosition[1]).toBeCloseTo(table.max.y,4)
  // The cat is unchanged and walks at z=1.4; leave a generous body-width corridor.
  expect(table.min.z).toBeGreaterThan(2.2)
  expect(rug.min.z).toBeGreaterThan(2.2)
  expect(table.min.x).toBeGreaterThan(rug.min.x)
  expect(table.max.x).toBeLessThan(rug.max.x)
 })
 it('supports garden pots and can on the bench and keeps their full shapes separated',async()=>{
  const bench=new Box3().setFromObject((await asset('pottingbench')).scene).translate(new Vector3(...benchPosition))
  let previous:Box3|undefined
  for(const [id,model,surface] of [['gardenGreen','plant',1.044],['gardenFlowers','flowers',1.044],['gardenSucculent','succulent',1.044],['wateringCan','wateringcan',.254]] as const){
   const item=items.find(i=>i.id===id)!
   const bounds=new Box3().setFromObject((await asset(model)).scene)
    .applyMatrix4(new Matrix4().makeScale(item.scale??1,item.scale??1,item.scale??1)).translate(new Vector3(...item.position))
   expect(bounds.min.y).toBeCloseTo(benchPosition[1]+surface,4)
   expect(bounds.min.x).toBeGreaterThan(bench.min.x)
   expect(bounds.max.x).toBeLessThan(bench.max.x)
   expect(bounds.min.z).toBeGreaterThan(bench.min.z)
   expect(bounds.max.z).toBeLessThan(bench.max.z)
   if(id!=='wateringCan'){
    if(previous)expect(bounds.min.x-previous.max.x).toBeGreaterThan(.08)
    previous=bounds
   }
  }
 })
 it('keeps the water below the rim with an open pool cavity, and supports loungers clear of it',async()=>{
  const shell=new Box3().setFromObject((await asset('poolshell')).scene).translate(new Vector3(...poolPosition))
  const water=poolPosition[1]-.08
  expect(water-shell.min.y).toBeGreaterThan(.6)
  expect(shell.max.y-water).toBeGreaterThan(.18)
  const cavity=new Box3(new Vector3(poolPosition[0]-1.675,water-.5,poolPosition[2]-1.975),new Vector3(poolPosition[0]+1.675,water+.1,poolPosition[2]+1.975))
  for(const section of gardenGroundSections)expect(new Box3().setFromCenterAndSize(new Vector3(...section.position),new Vector3(...section.size)).intersectsBox(cavity)).toBe(false)
  let previous:Box3|undefined
  for(const pos of loungerPositions){
   const chair=new Box3().setFromObject((await asset('lounger')).scene).translate(new Vector3(...pos))
   expect(chair.min.y).toBeCloseTo(-.033+.024/2,4)
   expect(chair.min.z-shell.max.z).toBeGreaterThan(1)
   expect(chair.max.x).toBeLessThan(13.2)
   if(previous)expect(chair.min.x-previous.max.x).toBeGreaterThan(.8)
   previous=chair
  }
 })
 it('leaves a full-height route through the open garden doorway',async()=>{
  const {scene}=await asset('gardenentry')
  scene.updateMatrixWorld(true)
  for(const x of [-.6,0,.6])for(const y of [.4,1.9,2.8]){
   expect(new Raycaster(new Vector3(x,y,-1),new Vector3(0,0,1)).intersectObject(scene,true)).toHaveLength(0)
  }
  expect(portalWaypoints[0][0]).toBeLessThan(4.25)
  expect(portalWaypoints[1][0]).toBeGreaterThan(5.7)
  expect(portalWaypoints.every(p=>p[2]===3.5&&p[1]===1.9)).toBe(true)
 })
 it('keeps the wide camera inside the room, below its roof, on desktop and portrait',()=>{
  for(const aspect of [1672/941,1179/750,510/631,375/667])for(const angle of [-100,-ORBIT_LIMIT,0,ORBIT_LIMIT,100]){
   const p=overviewPose('indoor',aspect,angle)
   expect(p.position[0]).toBeGreaterThan(roomBounds.left+.3);expect(p.position[0]).toBeLessThan(roomBounds.right-.3)
   expect(p.position[2]).toBeLessThan(roomBounds.front-.3);expect(p.position[2]).toBeGreaterThan(6)
   expect(p.position[1]).toBeGreaterThan(2);expect(p.position[1]).toBeLessThan(roomBounds.ceiling-1)
   expect(p.target[2]).toBeLessThan(p.position[2])
   expect(p.position).toEqual(overviewPose('indoor',1.6,angle).position)
   const garden=overviewPose('outdoor',aspect,angle)
   expect(garden.position[0]).toBeGreaterThan(4.5);expect(garden.position[0]).toBeLessThan(13)
   expect(garden.position[2]).toBeLessThan(9.5);expect(garden.target[0]).toBeLessThan(garden.position[0])
  }
 })
 it('crosses the shared boundary through the real doorway, including interrupted transitions',()=>{
  const inside=overviewPose('indoor',1.6).position,outside=overviewPose('outdoor',1.6).position
  const out=cameraRoute(inside,outside),back=cameraRoute(outside,inside)
  expect(out.slice(0,2).map(p=>p[2])).toEqual([3.5,3.5]);expect(out[0][0]).toBeLessThan(4.25);expect(out[1][0]).toBeGreaterThan(4.25)
  expect(back.slice(0,2)).toEqual(out.slice(0,2).reverse());expect(back.at(-1)).toEqual(inside)
  expect(cameraRoute([5,2.5,3.5],inside)[0][2]).toBe(3.5)
 })
 it('faces the desk and both dining chairs toward their tables using the model seat direction',()=>{
  for(const [position,target] of [[deskChairPosition,[0,0,0]],...diningChairPositions.map(p=>[p,diningPosition])] as [typeof deskChairPosition,typeof deskChairPosition][]){
   const angle=chairFacing(position,target),front=new Vector3(0,0,1).applyMatrix4(new Matrix4().makeRotationY(angle))
   const toward=new Vector3(target[0]-position[0],0,target[2]-position[2]).normalize()
   expect(front.dot(toward)).toBeCloseTo(1)
  }
 })
 it('only approaches objects from the front, with finite responsive close views',()=>{
  for(const id of Object.keys(focusNames) as FocusId[])for(const aspect of [1672/941,375/667]){
   const p=focusPose(id,aspect)
   expect([...p.position,...p.target,p.fov].every(Number.isFinite),id).toBe(true)
   if(id==='hanging'){
    expect(p.position[0],id).toBeGreaterThan(p.target[0])
    expect(p.position[2],id).toBeCloseTo(p.target[2])
   }else expect(p.position[2],id).toBeGreaterThan(p.target[2])
   expect(p.position[1],id).toBeGreaterThan(p.target[1])
  }
  expect(focusPose('hanging',1.6).position).toEqual(focusPose('hanging',.7).position)
  expect(focusPose('hanging',1.6).target).toEqual(focusPose('hanging',.7).target)
  expect(clampOrbit(100)).toBe(ORBIT_LIMIT);expect(clampOrbit(-100)).toBe(-ORBIT_LIMIT)
 })
 it('fits the physical monitor in its close camera on wide and portrait screens',()=>{
  for(const aspect of [1672/941,375/667]){
   const p=computerPose(aspect),camera=new PerspectiveCamera(p.fov,aspect,.03,150)
   camera.position.set(...p.position);camera.lookAt(new Vector3(...p.target));camera.updateMatrixWorld()
   for(const x of [-.99,.99])for(const y of [1.23,2.44]){
    const projected=new Vector3(x,y,-.43).project(camera)
    expect(Math.abs(projected.x)).toBeLessThan(.96);expect(Math.abs(projected.y)).toBeLessThan(.96)
   }
  }
 })
 it('puts new furniture in the visible front half without intersecting, and supports the record player',async()=>{
  const cabinet=new Box3().setFromObject((await asset('sideboard')).scene).applyMatrix4(new Matrix4().makeScale(...sideboardScale)).applyMatrix4(new Matrix4().makeRotationY(sideboardRotation)).translate(new Vector3(...sideboardPosition))
  const table=new Box3().setFromObject((await asset('diningtable')).scene).translate(new Vector3(...diningPosition))
  const player=new Box3().setFromObject((await asset('turntable')).scene).applyMatrix4(new Matrix4().makeRotationY(sideboardRotation)).translate(new Vector3(...recordPlayerPosition))
  expect(player.min.y).toBeCloseTo(sideboardPosition[1]+1.2675,4)
  expect(player.min.x).toBeGreaterThan(cabinet.min.x);expect(player.max.x).toBeLessThan(cabinet.max.x)
  expect(player.min.z).toBeGreaterThan(cabinet.min.z);expect(player.max.z).toBeLessThan(cabinet.max.z)
  expect(cabinet.max.z).toBeLessThan(9.2);expect(table.intersectsBox(cabinet)).toBe(false)
  const sofa=new Box3().setFromObject((await asset('sofa')).scene).applyMatrix4(new Matrix4().makeRotationY(Math.PI/2)).translate(new Vector3(...sofaPosition))
  const shelf=new Box3().setFromObject((await asset('shelf')).scene).translate(new Vector3(...shelfPosition))
  const plant=new Box3().setFromObject((await asset('floorplant')).scene).translate(new Vector3(...floorPlantPosition))
  const desk=new Box3().setFromObject((await asset('desk')).scene)
  expect(cabinet.intersectsBox(sofa)).toBe(false);expect(cabinet.intersectsBox(shelf)).toBe(false)
  expect(plant.intersectsBox(desk)).toBe(false);expect(plant.max.x).toBeLessThan(roomBounds.right)
  for(let i=0;i<diningChairPositions.length;i++){
   const chair=new Box3().setFromObject((await asset('eggchair')).scene).applyMatrix4(new Matrix4().makeScale(.90,.90,.90))
    .applyMatrix4(new Matrix4().makeRotationY(chairFacing(diningChairPositions[i],diningPosition))).translate(new Vector3(...diningChairPositions[i]))
   expect(Math.hypot(diningChairPositions[i][0]-diningPosition[0],diningChairPositions[i][2]-diningPosition[2])).toBeGreaterThan(1.5);expect(chair.max.z).toBeLessThan(9.2)
  }
 })
})

