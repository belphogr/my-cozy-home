exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))

cup=collection('Atelier_Cup')
# Closed cross-section: real underside, foot ring, wall thickness, lip and cavity.
lathe('Wheel-thrown glazed cup',[(0,.024),(.13,.024),(.166,.03),(.183,.055),(.20,.17),(.213,.31),(.212,.351),(.207,.36),(.197,.359),(.193,.348),(.192,.31),(.178,.1),(.158,.065),(0,.06)],glaze,cup,segments=96)
lathe('Unglazed foot',[(.13,0),(.158,0),(.161,.012),(.16,.026),(.132,.027),(.13,0)],clay,cup)
curve('Comfortable curved handle',[(.201,.304,0),(.316,.317,0),(.385,.247,0),(.376,.157,0),(.298,.112,0),(.193,.12,0)],.030,glaze,cup,False,4)
ring('Hand-finished lip',(0,.354,0),.202,.0055,ivory,cup)
# A shallow raised botanical motif follows the exterior, never entering the cavity.
curve('Raised leaf stem',[(-.09,.075,.155),(-.03,.15,.187),(.02,.22,.203),(.045,.29,.199)],.0045,botanical,cup,False,1)
for i in range(5):
    y=.112+i*.033;x=-.072+i*.023;s=-1 if i%2 else 1
    leaf('Glazed leaf relief',(x,y,.196),(x+s*.067,y+.044,.191),.016,botanical,cup)
# Conform the ornament to the curved cup wall instead of intersecting it.
def cup_front(x,y):
    radius=.183+(min(.31,max(.055,y))-.055)*(.03/.255)
    return math.sqrt(max(.001,radius*radius-x*x))+.004
for ob in cup.objects:
    if ob.name.startswith('Glazed leaf relief'):
        for v in ob.data.vertices:v.co.y=-cup_front(v.co.x,v.co.z)
    if ob.name=='Raised leaf stem':
        for p in ob.data.splines[0].bezier_points:p.co.y=-cup_front(p.co.x,p.co.z)

lamp=collection('Atelier_Lamp')
lathe('Weighted stepped base',[(0,0),(.195,0),(.225,.014),(.226,.032),(.215,.043),(.19,.048),(.18,.065),(.085,.069),(.06,.083),(0,.083)],gold,lamp)
ring('Base trim',(0,.036,0),.215,.004,goldDark,lamp)
lathe('Telescopic column',[(.029,.075),(.029,.79),(.023,.80),(.023,1.01),(.034,1.015)],gold,lamp)
for y in (.14,.76,1.01):ring('Column collar',(0,y,0),.033,.006,goldDark,lamp)
for z in (-.029,.029):
    curve('Parallel adjustable arm',[(0,1.015,z),(.25,1.245,z),(.48,1.395,z)],.012,gold,lamp,False,2)
for x,y in ((0,1.015),(.48,1.395)):
    ellipsoid('Pivot housing',(x,y,0),(.046,.046,.037),gold,lamp)
    ring('Pivot knurled rim',(x,y,.038),.026,.004,goldDark,lamp,'z')
    box('Pivot screw slot',(.025,.003,.002),(x,y,.043),dark,lamp,.001)
curve('Shade neck',[(.48,1.395,0),(.58,1.37,0),(.60,1.295,0)],.021,gold,lamp)
lathe('Spun brass shade',[(.249,0),(.255,.012),(.25,.031),(.207,.106),(.161,.217),(.117,.293),(.079,.326),(.065,.34),(.039,.34),(.039,.325),(.068,.315),(.108,.279),(.151,.211),(.197,.101),(.239,.028),(.239,.012),(.249,0)],gold,lamp,(.60,.97,0))
lathe('Ivory enamel shade interior',[(.238,.016),(.197,.1),(.15,.21),(.106,.277),(.066,.311)],ivory,lamp,(.60,.97,0))
ring('Rolled shade rim',(.60,.982,0),.25,.0045,goldDark,lamp)
ellipsoid('Pearl bulb',(.60,1.185,0),(.044,.062,.044),ivory,lamp)
curve('Braided power cord',[(0,.027,-.07),(-.04,.012,-.17),(-.08,.012,-.31),(-.12,.012,-.40)],.007,dark,lamp,False,1)
ellipsoid('Inline switch',(-.1,.025,-.35),(.022,.014,.037),dark,lamp)

plant=collection('Atelier_Plant')
pot=material('Atelier_Pottery','#a98961',.54)
soil=material('Atelier_Soil','#40382a',1)
green=[material('Atelier_Leaf'+str(i),c,.4) for i,c in enumerate(('#566c39','#6c8044','#3e5c34','#879056'))]
vein=material('Atelier_Vein','#9a9f63',.6)
lathe('Stoneware pot with inner lip',[(0,0),(.128,0),(.143,.018),(.184,.22),(.207,.285),(.213,.307),(.21,.32),(.188,.32),(.181,.298),(.171,.224),(.134,.035),(0,.035)],pot,plant)
for y in (.055,.09,.135,.18,.235):ring('Wheel-thrown ridges',(0,y,0),.14+(y-.04)*.21,.0015,clay,plant)
lathe('Soil surface',[(0,.278),(.18,.278)],soil,plant)
for i in range(11):
    a=i*2.399;h=.42+(i%4)*.125;reach=.10+(i%3)*.045
    x=math.cos(a)*reach;z=math.sin(a)*reach
    curve('Living stem',[(0,.276,0),(x*.45,h*.72,z*.45),(x,h,z)],.006,green[2],plant,False,1)
    for j in range(3):
        t=.66+j*.15;y=.278+(h-.278)*t
        sx=x*t;sz=z*t;direction=a+(j%2)*2.5
        end=(sx+math.cos(direction)*.16,y+.12+(i%2)*.045,sz+math.sin(direction)*.14)
        leaf('Curved foliage',(sx,y,sz),end,.045+(i%2)*.012,green[(i+j)%4],plant)
        curve('Leaf midrib',[(sx,y,sz),((sx+end[0])/2,(y+end[1])/2,(sz+end[2])/2+.012),end],.0018,vein,plant,False,1)

# A dense, rounded pendant instead of the original sparse wire lampshade.
pendant=collection('Atelier_Pendant')
for i in range(40):
    a=math.tau*i/40
    pts=[(math.cos(a)*r,y,math.sin(a)*r) for r,y in ((.075,0),(.14,-.08),(.245,-.27),(.275,-.45),(.265,-.51))]
    curve('Pendant cane rib',pts,.006,cane,pendant,False,1)
for i in range(20):
    t=i/19;y=-t*.51;r=.075+.205*math.sin(t*math.pi*.62)
    ring('Pendant woven hoop',(0,y,0),r,.006,caneLight if i%2 else caneDark,pendant)
ring('Pendant bottom binding',(0,-.51,0),.265,.012,cane,pendant)
curve('Pendant cable',[(0,0,0),(0,.7,0)],.008,dark,pendant)
ellipsoid('Pendant warm bulb',(0,-.20,0),(.043,.083,.043),ivory,pendant)
print('Created cup, lamp, plant and pendant:',len(cup.objects),len(lamp.objects),len(plant.objects),len(pendant.objects))
