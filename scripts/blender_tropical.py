"""Original geometric palm, broad-leaf tropical cluster and fern; no image cards."""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
deep=material('Atelier_TropicalDeep','#294b31',.81)
green=material('Atelier_TropicalGreen','#476c3d',.74)
light=material('Atelier_TropicalLight','#728746',.8)
stem=material('Atelier_TropicalStem','#77825a',.85)
trunk=material('Atelier_TropicalTrunk','#77634a',.94)
palm=collection('Atelier_Palm')
curve('Leaning palm trunk',[(0,0,0),(.08,1.3,0),(.22,2.8,-.05),(.35,4.1,0)],.095,trunk,palm)
for j in range(18):ring('Palm bark collar',(.08+.27*j/18,.45+j*.19,0),.092,.012,trunk,palm)
for k in range(11):
    a=k*math.tau/11;length=1.55+(k%3)*.2
    def point(t):return (.35+math.cos(a)*length*t,4.1+.48*math.sin(math.pi*t)-.45*t,math.sin(a)*length*t)
    curve('Arching palm rachis',[point(t/6) for t in range(7)],.012,stem,palm)
    for j in range(1,17):
        t=j/18;p=Vector(point(t));side=Vector((-math.sin(a),-.28,math.cos(a)))
        spread=.36*math.sin(math.pi*t)**.6+.03
        for sign in (-1,1):
            end=p+side*spread*sign+Vector((math.cos(a)*.21,-.11,math.sin(a)*.21))
            leaf('Palm leaflet',tuple(p),tuple(end),.027,green if j%3 else light,palm)
broad=collection('Atelier_Broadleaf')
for k in range(10):
    a=k*2.39996;h=1.05+(k%4)*.27
    root=(0,0,0);start=(math.cos(a)*.23,h*.64,math.sin(a)*.23)
    tip=(math.cos(a)*(.7+(k%2)*.22),h,math.sin(a)*(.7+(k%2)*.22))
    curve('Broadleaf petiole',[root,(start[0]*.45,h*.35,start[2]*.45),start],.016,stem,broad)
    # Sculpted cupped lamina with a raised midrib, real thickness and tapered tip.
    verts=[];faces=[];direction=Vector(tip)-Vector(start);across=Vector((-math.sin(a),0,math.cos(a)))
    for i in range(13):
        t=i/12;mid=Vector(start)+direction*t+Vector((0,.18*math.sin(math.pi*t),0))
        width=(.22+.025*(k%3))*math.sin(math.pi*t)**.65
        for side in (-1,0,1):verts.append(tuple(mid+across*width*side-Vector((0,abs(side)*.07*math.sin(math.pi*t),0))))
    for i in range(12):
        for j in range(2):n=i*3+j;faces.append((n,n+1,n+4,n+3))
    ob=smooth(mesh('Broad tropical leaf',verts,faces,green if k%3 else deep,broad));ob.modifiers.new('Leaf thickness','SOLIDIFY').thickness=.003
    curve('Raised midrib',[tuple(Vector(start)+direction*t+Vector((0,.18*math.sin(math.pi*t)+.003,0))) for t in (0,.25,.5,.75,1)],.003,light,broad)
fern=collection('Atelier_Fern')
for k in range(10):
    a=k*math.tau/10
    def frond(t):return (math.cos(a)*t*.72,.05+.57*math.sin(math.pi*t*.8),math.sin(a)*t*.72)
    curve('Fern stem',[frond(t/6) for t in range(7)],.006,stem,fern)
    for j in range(1,13):
        t=j/14;p=Vector(frond(t));width=.19*math.sin(math.pi*t)
        for sign in (-1,1):
            end=p+Vector((-math.sin(a)*width*sign,.025,math.cos(a)*width*sign))+Vector((math.cos(a)*.06,0,math.sin(a)*.06))
            leaf('Fern pinna',tuple(p),tuple(end),.019,light if j%3 else green,fern)
print('Created original palm canopy, broadleaf cluster, and fern.')
