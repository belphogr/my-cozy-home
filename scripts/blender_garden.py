"""Original garden architecture and furniture. Local Y up, +Z front; no images."""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
teak=material('Atelier_GardenWalnut','#9a754e',.69)
teakEdge=material('Atelier_GardenWalnutEdge','#79583b',.73)
stone=material('Atelier_PoolStone','#c8bea4',.95)
tile=material('Atelier_PoolTile','#548e88',.4)
grout=material('Atelier_PoolGrout','#7aaba3',.86)
fabric=material('Atelier_OutdoorLinen','#e6dcc4',.96)
glass=material('Atelier_DoorGlass','#c7dcd2',.16)
next(n for n in glass.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Alpha'].default_value=.075

entry=collection('Atelier_Gardenentry')
for x in (-1.47,1.47,-2.77,2.77):box('Entry timber jamb',(.115,4.24,.15),(x,2.10,0),teak,entry,.014)
box('Doorway lintel',(5.66,.16,.18),(0,4.22,0),teak,entry,.016)
box('Flush stone threshold',(2.86,.034,.45),(0,-.004,.08),stone,entry,.007)
for s in (-1,1):
    for y in (.07,1.25,2.62,4.10):box('Sidelight cross rail',(1.23,.064,.085),(s*2.12,y,0),teak,entry,.006)
    box('Sidelight clear glass',(1.20,4.03,.007),(s*2.12,2.08,-.026),glass,entry,.001)
    # Doors are fully open towards the garden; the middle passage remains clear.
    x=s*1.42
    for z in (.09,1.40):box('Open door vertical',(.065,3.96,.075),(x,2.045,z),teak,entry,.008)
    for y in (.10,1.35,2.66,3.99):box('Open door cross rail',(.065,.065,1.38),(x,y,.745),teak,entry,.007)
    box('Open door glass',(.006,3.84,1.22),(x,2.04,.745),glass,entry,.001)
    for y in (.35,2.0,3.70):lathe('Door brass hinge',[(.019,0),(.019,.095)],goldDark,entry,(x,y,.08),segments=16)
    curve('Door pull handle',[(x+s*.06,1.58,1.21),(x+s*.095,1.58,1.21),(x+s*.095,1.93,1.21),(x+s*.06,1.93,1.21)],.013,gold,entry,resolution=2)

bench=collection('Atelier_Pottingbench')
for x in (-.80,.80):
    for z in (-.29,.29):box('Potting bench leg',(.075,1.0,.075),(x,.5,z),teakEdge,bench,.009)
for i in range(4):box('Bench top board',(1.88,.068,.173),(0,1.01,-.27+i*.182),teak,bench,.009)
for x in (-.80,.80):box('Bench apron',(.066,.13,.67),(x,.9,0),teakEdge,bench,.008)
for i in range(6):box('Lower slatted shelf',(.265,.048,.65),(-.70+i*.28,.23,0),teak,bench,.007)
box('Bench rear upstand',(1.86,.13,.038),(0,1.09,-.38),teakEdge,bench,.007)

lounger=collection('Atelier_Lounger')
for x in (-.43,.43):
    for z in (-.70,.79):box('Lounger leg',(.085,.29,.085),(x,.145,z),teakEdge,lounger,.013)
    box('Lounger side rail',(.08,.13,1.86),(x,.335,.02),teak,lounger,.013)
for j in range(11):box('Seat slat',(.84,.042,.092),(0,.38,-.20+j*.111),teak,lounger,.008)
for x in (-.43,.43):
    curve('Reclined back frame',[(x,.37,-.26),(x,.65,-.52),(x,1.12,-.94)],.037,teak,lounger)
    curve('Back adjustment brace',[(x,.31,-.72),(x,.77,-.62)],.024,teakEdge,lounger)
for j in range(8):
    t=j/7;box('Backrest slat',(.85,.045,.068),(0,.41+t*.67,-.28-t*.63),teak,lounger,.008)
box('Seat mattress',(.82,.11,1.28),(0,.455,.35),fabric,lounger,.045)
ob=box('Reclined back mattress',(.82,.105,1.02),(0,.82,-.59),fabric,lounger,.045)
ob.rotation_euler[0]=.82

pool=collection('Atelier_Poolshell')
box('Pool bottom',(3.38,.12,3.98),(0,-.75,0),grout,pool,.012)
for s in (-1,1):
    box('Pool long shell wall',(.20,.83,4.42),(s*1.79,-.35,0),stone,pool,.018)
    box('Pool short shell wall',(3.60,.83,.20),(0,-.35,s*2.11),stone,pool,.018)
    for i in range(11):box('Long coping stone',(.30,.105,.394),(s*1.78,.085,-1.99+i*.398),stone,pool,.013)
    for i in range(9):box('Short coping stone',(.37,.105,.30),(-1.52+i*.38,.085,s*2.10),stone,pool,.013)
    for row in range(4):
        y=-.55+row*.17
        for i in range(21):box('Long glazed tile',(.014,.161,.183),(s*1.684,y,-1.91+i*.191),tile,pool,bevel=0)
        for i in range(18):box('Short glazed tile',(.18,.161,.014),(-1.607+i*.189,y,s*1.994),tile,pool,bevel=0)
for i in range(17):
    for j in range(20):box('Pool floor tile',(.187,.009,.188),(-1.59+i*.198,-.684,-1.88+j*.198),tile,pool,bevel=0)
print('Garden entry, potting bench, loungers and pool created.')
