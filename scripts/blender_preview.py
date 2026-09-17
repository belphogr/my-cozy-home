"""Assemble a non-destructive preview from collection instances and save sources."""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
preview=bpy.data.scenes.new('Cozy Desk Preview');bpy.context.window.scene=preview
scene=preview
scene.render.engine='CYCLES';scene.cycles.samples=32
scene.render.resolution_x=1280;scene.render.resolution_y=720;scene.render.resolution_percentage=100
scene.view_settings.view_transform='AgX'
stage=collection('Atelier_PreviewStage')
def instance(key,pos,rot=0,scale=1):
    ob=bpy.data.objects.new(key+' placement',None);stage.objects.link(ob)
    ob.instance_type='COLLECTION';ob.instance_collection=bpy.data.collections['Atelier_'+key]
    ob.location=xyz(pos);ob.rotation_euler[2]=rot;ob.scale=(scale,)*3
instance('Desk',(0,0,0));instance('Chair',(.3,0,1.55),math.atan2(-.3,-1.55))
instance('Cup',(-2.1,1.14,.55));instance('Lamp',(-2.2,1.14,-.3))
instance('Plant',(1.86,1.14,-.39),scale=.85);instance('Pendant',(-1.5,5.15,.4))
instance('Deskbooks',(2.36,1.12,-.35));instance('Shelf',(-4.85,0,-.95));instance('Floorplant',(3.4,-.021,-.4))
instance('Window',(-6.6,2.7,1.3),math.pi/2)
instance('Sofa',(-5.48,-.021,4.3),math.pi/2)
instance('Coffeetable',(-3.45,-.0035,4.15));instance('Rug',(-3.6,-.021,4.15))
instance('Cup',(-3.28,.5693,3.94),scale=.8)
instance('Pendant',(-4.2,5.05,4.35))
instance('Diningtable',(1.25,-.021,4));instance('Sideboard',(-6.04,-.021,1.25),math.pi/2)
next(ob for ob in stage.objects if ob.name.startswith('Sideboard placement')).scale=(.85,1,1)
instance('Chair',(-.18,-.021,3.2),math.atan2(1.43,.8),.85);instance('Chair',(2.02,-.021,5.5),math.atan2(-.77,-1.5),.85)
instance('Flowers',(1.25,.964,4),scale=.7);instance('Pendant',(1.25,4.85,4))
instance('Turntable',(-6.04,1.2465,1.275),math.pi/2);instance('Vinyl',(-6.04,1.4555,1.445),math.pi/2)
instance('Palm',(14.5,0,1),scale=1.3);instance('Broadleaf',(13.9,0,2.5),scale=1.4);instance('Fern',(12.85,.4,4),scale=.65)
instance('Gardenentry',(4.25,0,3.5),math.pi/2)
instance('Pottingbench',(6.65,-.021,-.55));instance('Poolshell',(10.25,-.021,2.15))
instance('Lounger',(9.45,-.021,6.65));instance('Lounger',(11.25,-.021,6.65))
instance('Wateringcan',(6.36,.233,-.49));instance('Plant',(6.04,1.023,-.52),scale=.68)
instance('Flowers',(6.73,1.023,-.5));instance('Succulent',(7.32,1.023,-.48))
for i,(pos,size) in enumerate([((-2.55,2.98,-1.24),(.64,.79)),((-1.45,3.05,-1.24),(.92,1.26)),((-.26,3.28,-1.24),(.65,.83)),((.85,3.12,-1.24),(.91,.69))]):
    ob=bpy.data.objects.new('Landscape placement '+str(i),None);stage.objects.link(ob)
    ob.instance_type='COLLECTION';ob.instance_collection=bpy.data.collections['Atelier_Landscape']
    ob.location=xyz(pos);ob.scale=(size[0],1,size[1])
wall=material('Preview_GreenPlaster','#3c4d3c',.9)
box('Preview green wall',(9,4.6,.16),(0,2.25,-1.38),wall,stage)
for i in range(19):
    for j in range(6):box('Preview floorboard',(1.58,.035,.56),(-4+j*1.6+(i%2)*.3,-.035,-1.3+i*.575),walnut,stage,.004)
# Monitor is only a dimensions proxy here; interactive HTML remains in the web app.
box('Monitor proportions',(1.963,1.222,.065),(0,1.829,-.5),dark,stage,.02)
box('Monitor stand',(.435,.026,.247),(0,1.15,-.454),dark,stage,.01)
box('Monitor neck',(.11,.26,.078),(0,1.257,-.539),dark,stage,.01)
box('Screen placeholder',(1.85,1.1,.01),(0,1.842,-.461),glaze,stage,.01)
box('Keyboard proportions',(1.36,.045,.46),(0,1.18,.61),dark,stage,.02)
def area(name,position,energy,color,size,target):
    data=bpy.data.lights.new(name,'AREA');data.energy=energy;data.color=color;data.shape='DISK';data.size=size
    ob=bpy.data.objects.new(name,data);stage.objects.link(ob);ob.location=xyz(position)
    ob.rotation_euler=(Vector(xyz(target))-ob.location).to_track_quat('-Z','Y').to_euler()
area('Window daylight',(4,4,2),900,(1,.87,.69),4,(0,1,0))
area('Soft reflected light',(-3,3,4),350,(.82,.9,1),5,(0,1,0))
world=bpy.data.worlds.new('Atelier studio world');scene.world=world;world.use_nodes=True
bg=next(n for n in world.node_tree.nodes if n.type=='BACKGROUND');bg.inputs['Color'].default_value=(.3,.35,.3,1);bg.inputs['Strength'].default_value=.3
data=bpy.data.cameras.new('Atelier review camera');camera=bpy.data.objects.new('Atelier review camera',data);stage.objects.link(camera)
camera.location=xyz((3.8,3.0,6.8));camera.rotation_euler=(Vector(xyz((0,1.65,0)))-camera.location).to_track_quat('-Z','Y').to_euler();data.lens=43
scene.camera=camera
for screen in bpy.data.screens:
    for a in screen.areas:
        if a.type=='VIEW_3D':
            a.spaces.active.camera=camera
            a.spaces.active.overlay.show_overlays=False
            a.spaces.active.region_3d.view_perspective='CAMERA'
            a.spaces.active.shading.type='MATERIAL'
sources=ROOT/'design/blender';sources.mkdir(parents=True,exist_ok=True)
target=sources/'cozy-desk-atelier.blend'
if target.exists():raise RuntimeError('Refusing to overwrite existing source file')
bpy.ops.wm.save_as_mainfile(filepath=str(target))
print('Saved editable furniture and preview to '+str(target))
