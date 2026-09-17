"""Original architectural niche and understory, no image textures or external assets."""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))

c=collection('Atelier_Niche')
plaster=material('Atelier_NichePlaster','#d4c5a8',.94)
recess=material('Atelier_NicheRecess','#b9ad92',.96)
pot=material('Atelier_PotterySage','#819074',.46)
soil=material('Atelier_Soil','#3f3829',1)
leafmat=material('Atelier_NicheLeaf','#466443',.74)
leaflight=material('Atelier_NicheLeafLight','#738450',.77)

# The plaster opening has actual jambs, an arch intrados and a recessed back.
def arch(radius):
    return [(-radius,0)]+[(radius*math.cos(math.pi-i*math.pi/40),1.75+radius*math.sin(math.pi-i*math.pi/40)) for i in range(41)]+[(radius,0)]
inner,outer=arch(.90),arch(1.10)
verts=[]
for z in (.015,.40):
    for contour in (outer,inner): verts.extend((x,y,z) for x,y in contour)
n=len(inner);faces=[]
for i in range(n-1):
    faces.extend([(i,i+1,n+i+1,n+i),(2*n+i,3*n+i,3*n+i+1,2*n+i+1),
                  (n+i,n+i+1,3*n+i+1,3*n+i),(i,2*n+i,2*n+i+1,i+1)])
faces.extend([(0,n,3*n,2*n),(n-1,2*n-1,4*n-1,3*n-1)])
ob=mesh('Rounded plaster arch',verts,faces,plaster,c)
bevel=ob.modifiers.new('Lime plaster softened edges','BEVEL');bevel.width=.018;bevel.segments=3
ob.modifiers.new('Plaster normals','WEIGHTED_NORMAL')
mesh('Recessed arched back',[(x,y,.02) for x,y in outer],[tuple(range(n))],recess,c)
for y in (0,.86,1.64):
    box('Solid walnut shelf',(1.84,.075,.40),(0,y+.0375,.23),walnut,c,.014)
    box('Shelf front nosing',(1.89,.065,.045),(0,y+.04,.435),edge,c,.01)

def vessel(name,x,y,r,h,material=pot):
    return lathe(name,[(.04,0),(r*.7,.015),(r,.15*h),(r*.98,.66*h),(r*.72,h),(r*.61,h),
                       (r*.75,.70*h),(r*.64,.06),(0,.06)],material,c,(x,y,.25),40)
vessel('Sage vase',-.46,.075,.22,.50)
vessel('Low ceramic bowl',.36,.075,.26,.18,clay)
vessel('Amber keepsake jar',-.50,.935,.18,.27,edge)
vessel('Small cream vessel',.22,.935,.13,.24,clay)
vessel('Trailing plant pot',.43,1.715,.24,.34)
lathe('Visible pot soil',[(0,.28),(.19,.28)],soil,c,(.43,1.715,.25),32)
for stem in range(4):
    x=.24+stem*.13
    end_y=.72+stem*.17
    pts=[(x,2.0,.29),(x+.045,1.80,.46),(x+.035,1.30,.49),(x-.035,end_y,.48)]
    curve('Slender trailing vine',pts,.006,leafmat,c,resolution=1)
    count=6+stem
    for j in range(count):
        t=(j+.3)/count;y=1.90-(1.90-end_y)*t;side=(-1 if j%2 else 1)
        start=(x+.035,y,.49);end=(start[0]+side*(.105+.015*(j%3)),y-.075,.51+(j%2)*.025)
        leaf('Defined heart leaf',start,end,.040+(j%2)*.005,leafmat if j%3 else leaflight,c)
for i in range(9):
    a=i*2.4
    leaf('Vase greenery',(-.46,.54,.25),(-.46+math.cos(a)*.28,.67+(i%3)*.09,.25+math.sin(a)*.22),.075,leafmat,c)
# Fresh flowers make the small cream vase legible from the room overview.
coral=material('Atelier_NicheCoral','#c56f5f',.72)
petal=material('Atelier_NichePetal','#e4a38c',.78)
for i in range(7):
    a=i*2.4;x=.22+math.cos(a)*(.10+(i%2)*.03);z=.26+math.sin(a)*.09;y=1.37+(i%3)*.11
    curve('Fresh flower stem',[(.22,1.175,.27),(.22+(x-.22)*.45,1.28,.29),(x,y,z)],.006,leafmat,c,resolution=1)
    leaf('Small flower foliage',(.22,1.27,.28),(.22-math.cos(a)*.13,1.40,.30+math.sin(a)*.08),.038,leaflight,c)
    for j in range(7):
        b=j*math.tau/7
        leaf('Layered fresh petal',(x,y,z),(x+math.cos(b)*.070,y+.025,z+math.sin(b)*.070),.025,coral if j%2 else petal,c)
    ellipsoid('Golden flower centre',(x,y+.018,z),(.016,.011,.016),caneLight,c)
# Two small wooden storage boxes with a geometric lid and brass pull.
for x in (-.60,-.15):
    box('Keepsake box',(.31,.25,.27),(x,1.84,.25),cane,c,.017)
    box('Box lid',(.33,.026,.29),(x,1.975,.25),edge,c,.006)
    ellipsoid('Box pull',(x,1.84,.398),(.02,.018,.009),gold,c)

c=collection('Atelier_Understory')
grass=material('Atelier_UnderstoryGreen','#49662f',.91)
grasslight=material('Atelier_UnderstoryLight','#7e8c43',.9)
flower=material('Atelier_CoralFlower','#b45c43',.73)
for i in range(54):
    a=i*2.39996;r=.33*math.sqrt((i+.5)/54)
    x,z=r*math.cos(a),r*math.sin(a);h=.17+(i%7)*.043
    leaf('Arching grass blade',(x,0,z),(x+math.cos(a)*.15,h,z+math.sin(a)*.15),.014+(i%3)*.005,grass if i%3 else grasslight,c)
for i in range(14):
    a=i*2.4;x=math.cos(a)*.18;z=math.sin(a)*.18
    leaf('Low glossy foliage',(x,.03,z),(x+math.cos(a)*.24,.20+(i%4)*.04,z+math.sin(a)*.24),.09,grass,c)
for i in range(3):
    x=(i-1)*.16;z=.08*math.sin(i);y=.46+i*.09
    curve('Flower stalk',[(x,0,z),(x+.02,y*.5,z),(x,y,z)],.007,grass,c,resolution=1)
    for j in range(5):
        a=j*math.tau/5
        leaf('Coral flower petal',(x,y,z),(x+math.cos(a)*.075,y+.03,z+math.sin(a)*.075),.03,flower,c)
    ellipsoid('Flower centre',(x,y+.015,z),(.018,.014,.018),caneLight,c)
print('Created Atelier_Niche and Atelier_Understory; export separately.')
