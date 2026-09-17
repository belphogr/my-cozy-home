"""Original wooden window and open linen curtains; local XY, interior faces +Z.

The opening is 2.6 by 2.7. Geometry includes cloth thickness and hems; no images.
Run once inside the existing Blender atelier, then export Window only.
"""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
c=collection('Atelier_Window')
brass=material('Atelier_WindowBrass','#a38b54',.38,.7)
oak=material('Atelier_WindowWalnut','#94704d',.58)
edge=material('Atelier_WindowWalnutEdge','#77573d',.6)
linen=material('Atelier_CurtainLinen','#e2d9c3',.96)
hem=material('Atelier_CurtainLinenHem','#c6b89c',.94)
glass=material('Atelier_WindowGlass','#d3e3d9',.17)
glass.diffuse_color=(*glass.diffuse_color[:3],.10)
next(n for n in glass.node_tree.nodes if n.type=='BSDF_PRINCIPLED').inputs['Alpha'].default_value=.10
for x in (-1.30,1.30):
    box('Window oak jamb',(.105,2.80,.17),(x,0,0),oak,c,.013)
    box('Interior architrave',(.065,2.91,.045),(x*1.055,0,.10),edge,c,.009)
for y in (-1.35,1.35):
    box('Window header and apron',(2.71,.115,.17),(0,y,0),oak,c,.014)
box('Deep rounded windowsill',(2.95,.085,.41),(0,-1.40,.09),oak,c,.016)
box('Sill shadow moulding',(2.70,.055,.16),(0,-1.475,.025),edge,c,.008)
for x in (-.645,.645):
    for dx in (-.604,.604):box('Sash vertical',(.046,2.58,.055),(x+dx,0,.018),oak,c,.005)
    for y in (-1.27,.34,1.27):box('Sash horizontal',(1.24,.046,.055),(x,y,.018),oak,c,.005)
    box('Clear window pane',(1.18,2.50,.006),(x,0,-.02),glass,c,.001)
    box('Latch plate',(.035,.16,.018),(x*.10,-.24,.064),brass,c,.007)
    curve('Brass window latch',[(x*.10,-.20,.085),(x*.10,-.24,.105),(x*.10,-.30,.105)],.012,brass,c)
curve('Curtain pole',[(-1.73,1.51,.21),(1.73,1.51,.21)],.023,edge,c)
for s in (-1,1):
    ellipsoid('Turned pole finial',(s*1.76,1.51,.21),(.055,.045,.045),oak,c)
    curve('Wall mounted pole bracket',[(s*1.50,1.44,.035),(s*1.50,1.44,.21),(s*1.50,1.51,.21)],.016,brass,c)
    verts=[];faces=[];cols=48;rows=38
    def cloth(u,t):
        # Floor-length linen narrows at a braided tieback, then opens into a weighted hem.
        gather=math.exp(-((t-.54)/.17)**2)
        width=.70-.34*gather
        x=s*(1.28+(u-.5)*width+.15*gather)
        y=1.44-3.50*t+.025*math.cos(u*math.tau*7)*t**7
        z=.25+.075*math.cos(u*math.tau*7)+.035*math.sin(t*math.pi)
        return (x,y,z)
    for j in range(rows+1):
        for i in range(cols+1):verts.append(cloth(i/cols,j/rows))
    for j in range(rows):
        for i in range(cols):
            k=j*(cols+1)+i;faces.append((k,k+1,k+cols+2,k+cols+1))
    ob=smooth(mesh('Open draped linen curtain',verts,faces,linen,c))
    mod=ob.modifiers.new('Cloth physical thickness','SOLIDIFY');mod.thickness=.004
    for u in (0,1):curve('Curtain side seam',[cloth(u,j/38) for j in range(39)],.004,hem,c,resolution=1)
    curve('Weighted bottom hem',[cloth(i/40,1) for i in range(41)],.008,hem,c,resolution=1)
    for i in range(6):
        pt=cloth(i/5,0);ring('Curtain hanging ring',(pt[0],1.50,.21),.040,.007,brass,c,axis='x')
    tie=cloth(.5,.54)
    ring('Braided curtain tieback',(tie[0],tie[1],tie[2]),.15,.010,brass,c,axis='x')
print('Created',len(c.objects),'window source parts')
