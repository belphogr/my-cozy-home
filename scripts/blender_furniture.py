exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))

desk=collection('Atelier_Desk')
# Separate solid boards, eased edges and stepped aprons, with two inset drawers.
for i in range(5):
    box('Solid walnut board', (5.4,.13,.357),(0,1.055,-.68+i*.365),walnut,desk,.018)
box('Under-top moulding',(5.32,.045,1.73),(0,.975,.05),edge,desk,.012)
for sx in (-1,1):
    for sz in (-1,1):
        x=sx*2.46;z=sz*.67
        # Tapered square legs, with collar and brass feet.
        verts=[(x+dx*w,y,z+dz*w) for y,w in ((.025,.048),(.97,.073)) for dx,dz in ((-1,-1),(1,-1),(1,1),(-1,1))]
        ob=mesh('Tapered walnut leg',verts,[(0,3,2,1),(4,5,6,7),(0,1,5,4),(1,2,6,5),(2,3,7,6),(3,0,4,7)],edge,desk)
        m=ob.modifiers.new('Hand rounded corners','BEVEL');m.width=.008;m.segments=3
        ob.modifiers.new('Leg normals','WEIGHTED_NORMAL')
        box('Brass foot',(.098,.035,.098),(x,.03,z),goldDark,desk,.006)
    box('Side apron',(.09,.19,1.32),(sx*2.46,.865,0),edge,desk,.012)
    box('Drawer carcass',(1.3,.21,1.34),(sx*1.73,.865,.015),edge,desk,.008)
    box('Drawer reveal',(1.28,.176,.016),(sx*1.73,.858,.698),dark,desk,.004)
    box('Inset drawer front',(1.235,.157,.042),(sx*1.73,.858,.718),walnut,desk,.01)
    for dx in (-.12,.12):
        ellipsoid('Handle escutcheon',(sx*1.73+dx,.858,.75),(.028,.028,.008),goldDark,desk)
    curve('Curved brass drawer pull',[(sx*1.73-.12,.858,.755),(sx*1.73-.09,.858,.785),(sx*1.73+.09,.858,.785),(sx*1.73+.12,.858,.755)],.01,gold,desk)
box('Back apron',(4.95,.2,.08),(0,.865,-.69),edge,desk,.012)
box('Central front rail',(2.08,.09,.06),(0,.91,.71),edge,desk,.012)

chair=collection('Atelier_Chair')
for x in (-1,1):
    for z in (-1,1):
        curve('Splayed bent cane leg',[(x*.43,.027,z*.405),(x*.405,.28,z*.375),(x*.355,.62,z*.30)],.031,cane,chair)
    curve('Side stretcher',[(x*.405,.24,-.37),(x*.4,.22,0),(x*.405,.24,.37)],.018,caneDark,chair)
curve('Cross brace',[(-.40,.24,.02),(0,.25,.02),(.4,.24,.02)],.019,cane,chair)
rim=[(-.43,.63,-.31),(-.45,.63,.30),(-.34,.63,.40),(.34,.63,.40),(.45,.63,.30),(.43,.63,-.31)]
curve('Seat outer bentwood',rim,.044,cane,chair,True)
curve('Seat lower binding',[(x,y-.07,z) for x,y,z in rim],.017,caneDark,chair,True)
for i in range(21):
    x=(i-10)*.038
    curve('Seat cane strand',[(x,.626,-.29),(x,.635,0),(x,.625,.34)],.009,caneLight,chair,False,1)

# A soft, pinched cushion with curved edges and small seam wrinkles.
bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24)
cushion=bpy.context.object;cushion.name='Linen cushion with gathered edge'
for v in cushion.data.vertices:
    x,y,z=v.co
    power=.46
    def sp(t):return math.copysign(abs(t)**power,t)
    xx=sp(x)*.4;zz=sp(y)*.337
    yy=sp(z)*.065+.71
    yy+=.0025*math.sin(xx*105+zz*28)*(abs(xx)/.4)**7
    v.co=xyz((xx,yy,zz+.025))
smooth(link(cushion,chair,linen))
curve('Cushion stitched piping',[(-.37,.711,-.27),(-.395,.711,.28),(-.32,.711,.355),(.32,.711,.355),(.395,.711,.28),(.37,.711,-.27)],.005,thread,chair,True,1)

outline=[(-.43,.67,-.33),(-.465,1.11,-.435),(-.39,1.49,-.49),(-.24,1.625,-.50),(0,1.66,-.50),(.24,1.625,-.50),(.39,1.49,-.49),(.465,1.11,-.435),(.43,.67,-.33)]
curve('Steam-bent back frame',outline,.037,cane,chair)
curve('Inner back frame',[(x*.91,.74+(y-.74)*.92,z+.002) for x,y,z in outline],.014,caneDark,chair)

# Over/under weaving is actual ribbon geometry, not a crossed grid texture.
spacing=.031
for i in range(-13,14):
    x=i*spacing;top=1.605-.7*max(0,abs(x)-.20)
    pts=[]
    for k in range(65):
        y=.80+(top-.80)*k/64
        z=-.345-(y-.8)*.20 + .0045*math.cos((y-.8)/spacing*math.pi+i*math.pi)
        pts.append((x,y,z))
    ribbon('Vertical woven cane',pts,.010,caneLight if i%3 else cane,chair)
for j in range(26):
    y=.8+j*spacing;w=.409-max(0,y-1.42)*.85
    pts=[]
    for k in range(65):
        x=-w+2*w*k/64
        z=-.345-(y-.8)*.20-.0045*math.cos(x/spacing*math.pi+j*math.pi)
        pts.append((x,y,z))
    ribbon('Horizontal woven cane',pts,.009,cane if j%3 else caneDark,chair)
for s in (-1,1):
    curve('Swept armrest',[(s*.43,.75,.34),(s*.475,.96,.28),(s*.48,1.005,-.02),(s*.46,.985,-.32),(s*.43,.93,-.39)],.028,cane,chair)
    for i in range(9):
        y=.83+i*.009
        ring('Cane joint wrap',(s*.448,y,-.382),.038,.0034,caneLight,chair)

print('Created original desk and woven chair:',len(desk.objects),len(chair.objects),'parts')
