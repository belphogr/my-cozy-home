"""Supported desktop books, a complete shelf cabinet, and a sculpted floor plant.

Original geometry, using the same materials and coordinate system as the desk.
"""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))

paper=material('Atelier_BookPaper','#e1d7bb',.87)
sage=material('Atelier_BookSage','#526248',.75)
rust=material('Atelier_BookRust','#96664a',.72)
cream=material('Atelier_BookCream','#bfb08c',.79)
pageLine=material('Atelier_PageEdge','#b8aa87',.92)

def upright_book(c,name,x,bottom,z,width,height,depth,cover):
    # Every cover starts exactly at its support surface; no rotated-origin offset.
    for s in (-1,1):
        box(name+' hard cover',(.009,height,depth),(x+s*(width-.009)/2,bottom+height/2,z),cover,c,.003)
    box(name+' pages',(width-.018,height-.018,depth-.027),(x,bottom+height/2,z-.004),paper,c,.003)
    box(name+' rounded spine',(width,height,.015),(x,bottom+height/2,z+depth/2-.006),cover,c,.005)
    for yy in (.16,.82):
        box(name+' gold spine rule',(width*.75,.004,.0015),(x,bottom+height*yy,z+depth/2+.002),gold,c,.0005)
    for j in range(3):
        box(name+' spine emboss',(width*.46,.003,.002),(x,bottom+height*(.55+j*.042),z+depth/2+.003),goldDark,c,.0005)
    for j in range(4):
        box(name+' top page layers',(width-.022,.001,.001),(x,bottom+height-.008,z-depth*.25+j*depth*.13),pageLine,c,.0002)

books=collection('Atelier_Deskbooks')
box('Bookstand supported base',(.50,.024,.48),(0,.012,0),walnut,books,.007)
for s in (-1,1):
    box('Bookstand upright end',(.025,.29,.40),(s*.232,.169,-.015),edge,books,.008)
    box('Bookstand brass foot',(.026,.01,.29),(s*.232,.005,0),goldDark,books,.003)
for i,(x,w,h,cover) in enumerate(((-.14,.10,.45,sage),(-.027,.112,.49,cream),(.096,.118,.425,rust))):
    upright_book(books,'Desktop book '+str(i),x,.024,0,w,h,.345,cover)

shelf=collection('Atelier_Shelf')
# An actual floor-standing cabinet, with legs, sides, back and framed doors.
for x in (-.64,.64):
    for z in (-.19,.19):
        box('Cabinet short leg',(.065,.14,.065),(x,.05,z),edge,shelf,.012)
box('Cabinet bottom',(1.43,.065,.54),(0,.1475,0),edge,shelf,.012)
box('Cabinet upper ledge',(1.49,.07,.57),(0,.73,0),walnut,shelf,.017)
box('Cabinet back',(1.42,.53,.032),(0,.445,-.254),edge,shelf,.006)
for x in (-.697,.697):box('Cabinet side',(.04,.53,.53),(x,.445,0),walnut,shelf,.009)
for s in (-1,1):
    x=s*.35
    box('Door shadow reveal',(.666,.49,.026),(x,.445,.27),dark,shelf,.004)
    box('Door inset panel',(.622,.445,.016),(x,.445,.287),edge,shelf,.005)
    for dx in (-.316,.316):box('Door stile',(.032,.493,.025),(x+dx,.445,.301),walnut,shelf,.005)
    for y in (.215,.675):box('Door rail',(.66,.031,.025),(x,y,.301),walnut,shelf,.005)
    for j in range(14):box('Fluted door batten',(.022,.413,.015),(x-.282+j*.043,.445,.303),walnut,shelf,.005)
    ellipsoid('Small brass knob',(x-s*.24,.47,.329),(.018,.018,.014),gold,shelf)

# Structural rear posts, shelves and visible gussets tie the upper rack together.
for x in (-.69,.69):
    box('Upper solid upright',(.055,1.53,.06),(x,1.49,-.216),edge,shelf,.012)
for y in (1.43,2.18):
    box('Solid display shelf',(1.48,.055,.48),(0,y,0),walnut,shelf,.012)
    box('Shelf front lip',(1.48,.047,.018),(0,y-.011,.24),edge,shelf,.005)
    for s in (-1,1):
        curve('Brass shelf bracket',[(s*.625,y-.19,-.20),(s*.625,y-.02,.13)],.008,goldDark,shelf,False,1)
        box('Shelf support cleat',(.065,.03,.39),(s*.625,y-.043,-.02),edge,shelf,.006)

# Mixed-height books, a ceramic bowl and a vase, all seated on their supports.
for i,(x,w,h,cover) in enumerate(((-.49,.12,.39,rust),(-.354,.135,.46,sage),(-.207,.13,.42,cream))):
    upright_book(shelf,'Shelf volume '+str(i),x,.765,-.025,w,h,.30,cover)
lathe('Ceramic keepsake bowl',[(0,0),(.095,0),(.135,.022),(.19,.115),(.185,.124),(.17,.12),(.13,.045),(.08,.02),(0,.02)],glaze,shelf,(.32,.765,.035))
lathe('Wheel thrown vase',[(0,0),(.095,0),(.133,.06),(.14,.16),(.105,.25),(.047,.285),(.048,.34),(.04,.346),(.033,.34),(.034,.29),(.085,.24),(.119,.15),(.10,.06),(0,.02)],clay,shelf,(-.43,1.4575,.01))
for i in range(3):
    a=i*1.8
    curve('Dried branch', [(-.43,1.64,.01),(-.43+math.cos(a)*.09,1.85,.02),(-.43+math.cos(a)*.14,2.01,.015)],.004,edge,shelf,False,1)
    for j in range(3):
        leaf('Dried oval leaf',(-.43+math.cos(a)*.07,1.80+j*.05,.03),(-.43+math.cos(a)*.07+(-1 if j%2 else 1)*.085,1.87+j*.05,.04),.02,caneLight,shelf)
# Two horizontal journals sit together, distinct from the interactive diary.
for i,cover in enumerate((rust,sage)):
    base=1.4575+i*.068
    box('Stacked journal pages',(.31,.043,.23),(.12,base+.031,.055),paper,shelf,.004)
    for y in (base+.004,base+.060):box('Stacked journal cover',(.33,.008,.25),(.12,y,.055),cover,shelf,.003)

# Small trailing plant on the upper shelf, with geometry leaves and hanging stems.
lathe('Trailing plant pot',[(0,0),(.1,0),(.128,.18),(.134,.195),(.12,.207),(.104,.20),(.08,.025),(0,.025)],glaze,shelf,(.42,2.2075,-.01))
soil=material('Atelier_Soil','#40382a',1)
lathe('Trailing plant soil',[(0,.18),(.116,.18)],soil,shelf,(.42,2.2075,-.01))
green=material('Atelier_FloorLeaf','#496443',.42)
lightGreen=material('Atelier_FloorLeafLight','#6f8351',.46)
vein=material('Atelier_LeafMidrib','#91a365',.6)
for i in range(3):
    pts=[(.42,2.39,-.01),(.37+i*.055,2.36,.16),(.31+i*.09,2.17,.28),(.28+i*.11,1.99,.30),(.34+i*.09,1.81-i*.07,.285)]
    curve('Trailing stem',pts,.004,green,shelf,False,1)
    for j in range(7):
        y=2.32-j*.074;x=.32+i*.075+math.sin(j*1.6+i)*.027;z=.28 if j>1 else .15+j*.065
        leaf('Trailing heart leaf',(x,y,z),(x+(-1 if j%2 else 1)*.075,y-.07,z+.025),.03,green if j%2 else lightGreen,shelf)

plant=collection('Atelier_Floorplant')
pot=material('Atelier_FloorPottery','#ac9776',.67)
# Shaped stoneware rather than the old oversized, unbroken cylinder.
lathe('Floor pot body',[(0,0),(.26,0),(.29,.026),(.32,.19),(.345,.43),(.352,.51),(.35,.54),(.327,.544),(.323,.514),(.307,.43),(.284,.18),(.24,.05),(0,.05)],pot,plant)
ring('Floor pot rolled lip',(0,.528,0),.339,.012,clay,plant)
lathe('Floor pot soil',[(0,.48),(.317,.48)],soil,plant)
for i in range(9):
    y=.07+i*.045;r=.29+y*.11
    ring('Fine ceramic throwing ridges',(0,y,0),r,.0018,clay,plant)

# Smooth cupped laminae with bent midribs; 2D images are not used for foliage.
def tropical_leaf(name,base,angle,length,width,rise,material):
    radial=Vector((math.cos(angle),0,math.sin(angle)))
    side=Vector((-math.sin(angle),0,math.cos(angle)))
    start=Vector(base);verts=[];faces=[];midpoints=[]
    for i in range(19):
        t=i/18;mid=start+radial*(length*t)+Vector((0,rise*math.sin(t*math.pi*.74),0))
        mid.y-=.13*t*t
        if i%3==0:midpoints.append(tuple(mid+Vector((0,.004,0))))
        for j in range(7):
            across=(j-3)/3
            w=math.sin(math.pi*t)**.72*width
            p=mid+side*w*across
            p.y-=abs(across)**1.5*w*.27
            p.y+=math.sin(t*math.pi*8+angle)*.006*abs(across)
            verts.append(tuple(p))
    for i in range(18):
        for j in range(6):
            a=i*7+j;faces.append((a,a+1,a+8,a+7))
    ob=smooth(mesh(name,verts,faces,material,plant))
    mod=ob.modifiers.new('Real leaf thickness','SOLIDIFY');mod.thickness=.002
    curve(name+' midrib',midpoints,.0025,vein,plant,False,1)
    for k in range(3,16,3):
        t=k/18;mid=start+radial*(length*t)+Vector((0,rise*math.sin(t*math.pi*.74)-.13*t*t,0))
        w=math.sin(math.pi*t)**.72*width
        for s in (-1,1):
            tip=mid+radial*.05+side*w*s*.83+Vector((0,-w*.19,0))
            curve(name+' secondary vein',[tuple(mid+Vector((0,.004,0))),tuple((mid+tip)/2+Vector((0,.004,0))),tuple(tip)],.0009,vein,plant,False,0)

for i,(angle,h,l,w,rise) in enumerate(((.1,1.22,.49,.16,.27),(2.6,1.50,.48,.16,.34),(4.15,1.37,.38,.145,.37),(1.25,1.75,.29,.14,.44),(3.2,1.01,.44,.15,.29),(5.8,.85,.47,.17,.22),(2.0,.71,.38,.15,.26),(5.15,1.60,.30,.14,.44),(3.8,1.79,.27,.115,.33),(.65,1.43,.48,.19,.24),(2.2,1.16,.51,.19,.23),(3.65,1.65,.43,.18,.23),(5.7,1.45,.46,.18,.31),(1.3,.93,.43,.17,.21))):
    x=math.cos(angle)*.09;z=math.sin(angle)*.07
    curve('Tapered plant petiole',[(0,.48,0),(x*.4,h*.72,z*.4),(x,h,z)],.010 if i<4 else .008,green,plant,False,1)
    tropical_leaf('Sculpted tropical leaf '+str(i),(x,h,z),angle,l,w,rise,green if i%3 else lightGreen)
print('Created desk bookstand, shelf cabinet and floor plant:',len(books.objects),len(shelf.objects),len(plant.objects),'parts')
