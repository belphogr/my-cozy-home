"""Original two-seat sofa, round walnut table and woven rug. No bitmap assets.

Local +Z faces the sofa front; all furniture origins rest on their support plane.
"""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
sofa=collection('Atelier_Sofa')
fabric=material('Atelier_SofaLinen','#e5dac3',.95)
pillow=material('Atelier_PillowLinen','#778362',.98)
throw=material('Atelier_ThrowLinen','#a5ac8c',.98)
seam=material('Atelier_SofaLinenSeam','#c6b99b',.97)
def cushion(name,center,scale,mat,c,power=.48):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=40,ring_count=20)
    ob=bpy.context.object;ob.name=name
    for v in ob.data.vertices:
        x,z,y=v.co
        sp=lambda t:math.copysign(abs(t)**power,t)
        xx=sp(x)*scale[0];yy=sp(y)*scale[1];zz=sp(z)*scale[2]
        # Small tension creases near the cushion edges, never an image normal map.
        yy+=.002*math.sin(xx*80+zz*17)*(abs(xx)/scale[0])**7
        v.co=xyz((center[0]+xx,center[1]+yy,center[2]+zz))
    return smooth(link(ob,c,mat))
for x in (-1.16,1.16):
    for z in (-.40,.39):
        box('Sofa walnut foot',(.095,.29,.095),(x,.145,z),edge,sofa,.012)
box('Sofa solid base',(2.64,.13,1.01),(0,.345,0),walnut,sofa,.034)
box('Sofa front rail',(2.52,.09,.045),(0,.41,.51),cane,sofa,.018)
for x in (-1.29,1.29):
    curve('Swept cane arm',[(x,.39,.44),(x,.78,.46),(x,.83,.26),(x,.83,-.33),(x,1.12,-.47)],.052,cane,sofa)
    for j in range(8):
        z=-.35+j*.102
        curve('Arm vertical spindle',[(x,.43,z),(x,.61,z),(x,.79,z)],.013,caneLight,sofa,resolution=1)
curve('Rounded sofa back frame',[(-1.29,.40,-.48),(-1.30,1.17,-.49),(-1.13,1.27,-.49),(1.13,1.27,-.49),(1.30,1.17,-.49),(1.29,.40,-.48)],.049,cane,sofa)
for i in range(33):
    x=-1.18+i*.07375
    curve('Back cane slat',[(x,.44,-.48),(x,.83,-.49),(x,1.22,-.49)],.010,caneLight,sofa,resolution=1)
for x in (-.62,.62):
    cushion('Generous seat cushion',(x,.54,.05),(.596,.115,.427),fabric,sofa)
    sp=lambda t:math.copysign(abs(t)**.48,t)
    curve('Seat sewn piping',[(x+sp(math.cos(a))*.597,.54,.05+sp(math.sin(a))*.428) for a in [math.tau*i/32 for i in range(32)]],.004,seam,sofa,True,1)
    cushion('Upholstered back cushion',(x,.92,-.30),(.594,.31,.153),fabric,sofa)
for x in (-.85,.89):
    cushion('Sage scatter pillow',(x,.87,.015),(.245,.253,.105),pillow,sofa,.6)
    sp=lambda t:math.copysign(abs(t)**.6,t)
    curve('Pillow stitched border',[(x+sp(.93*math.cos(a))*.245,.87+sp(.93*math.sin(a))*.253,.017+sp(math.sqrt(1-.93**2))*.105) for a in [math.tau*i/32 for i in range(32)]],.003,seam,sofa,True,1)
# The throw lies on the right seat and hangs over the front edge.
verts=[];faces=[]
for j in range(25):
    t=j/24;z=-.12+t*.83
    y=.676 if z<.42 else .676-(z-.42)*1.48
    for i in range(17):
        u=i/16;x=.62+u*.51
        verts.append((x,y+.014*math.sin(u*math.tau*4)*(.4+t*.6),z))
for j in range(24):
    for i in range(16):
        k=j*17+i;faces.append((k,k+1,k+18,k+17))
ob=smooth(mesh('Draped woven throw',verts,faces,throw,sofa));ob.modifiers.new('Blanket thickness','SOLIDIFY').thickness=.006
for i in range(16):
    x=.62+i*.034
    curve('Throw fringe',[(x,.247,.71),(x+.006,.227,.72),(x-.004,.192,.725)],.004,throw,sofa,resolution=1)

table=collection('Atelier_Coffeetable')
lathe('Round walnut tabletop',[(0,.50),(.60,.50),(.657,.506),(.672,.52),(.674,.546),(.661,.56),(0,.56)],walnut,table,segments=96)
lathe('Table edge moulding',[(.60,.49),(.631,.49),(.639,.50),(.632,.51),(.60,.51)],edge,table,segments=80)
for i in range(3):
    a=math.tau*i/3+.3;x=math.cos(a);z=math.sin(a)
    curve('Splayed table leg',[(x*.51,.036,z*.51),(x*.45,.23,z*.45),(x*.40,.497,z*.40)],.035,edge,table)
    ellipsoid('Rounded foot',(x*.51,.022,z*.51),(.036,.022,.036),edge,table)
    curve('Low table brace',[(0,.15,0),(x*.23,.15,z*.23),(x*.47,.15,z*.47)],.016,walnut,table)

carpet=collection('Atelier_Rug')
jute=material('Atelier_RugLinen','#b8a17a',.99)
juteLight=material('Atelier_RugLinenLight','#c3b18e',.99)
juteDark=material('Atelier_RugLinenDark','#a18a66',.99)
# Woven concentric strands have actual cross-sections, batched by material on export.
verts=[];faces=[];n=100
for y in (0,.010):
    for i in range(n):
        a=math.tau*i/n;verts.append((1.32*math.cos(a),y,1.65*math.sin(a)))
faces.append(tuple(reversed(range(n))));faces.append(tuple(range(n,2*n)))
for i in range(n):faces.append((i,(i+1)%n,(i+1)%n+n,i+n))
mesh('Oval rug backing',verts,faces,jute,carpet)
for row in range(58):
    r=.025+row*.0223;verts=[];faces=[];n=100
    for i in range(n):
        a=math.tau*i/n
        for j in range(4):
            b=math.tau*j/4;rr=r+.006*math.cos(b)
            verts.append((rr*math.cos(a),.012+.004*math.sin(b)+.0015*math.sin(a*70+row),rr*1.25*math.sin(a)))
    for i in range(n):
        for j in range(4):faces.append((i*4+j,((i+1)%n)*4+j,((i+1)%n)*4+(j+1)%4,i*4+(j+1)%4))
    smooth(mesh('Braided jute strand',verts,faces,juteDark if row%8==0 else juteLight if row%3 else jute,carpet))
print('Living source parts:',len(sofa.objects),len(table.objects),len(carpet.objects))
