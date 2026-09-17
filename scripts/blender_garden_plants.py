"""Garden flower pot, succulent and inspectable watering can, all original geometry."""
exec(compile(open('E:/我的3D小屋/scripts/blender_common.py',encoding='utf-8').read(),'blender_common.py','exec'))
clayGarden=material('Atelier_GardenPottery','#b78b63',.87)
leafGarden=material('Atelier_GardenLeaf','#506a40',.87)
leafLight=material('Atelier_GardenLeafLight','#82965b',.88)
soil=material('Atelier_GardenSoil','#413a2a',1)
petal=material('Atelier_FlowerPetal','#c78370',.86)
flowerHeart=material('Atelier_FlowerHeart','#d4b474',.94)

can=collection('Atelier_Wateringcan')
enamel=material('Atelier_CanGlaze','#7b987b',.35)
lathe('Watering can hollow body',[(0,0),(.17,0),(.20,.025),(.20,.34),(.178,.36),(.148,.36),(.148,.34),(.182,.33),(.182,.035),(0,.035)],enamel,can,segments=48)
curve('Watering can arched handle',[(-.13,.29,-.08),(-.15,.54,-.08),(0,.59,-.08),(.15,.54,-.08),(.13,.29,-.08)],.018,enamel,can)
curve('Watering can spout',[(.15,.08,.02),(.29,.14,.02),(.42,.34,.02),(.47,.39,.02)],.034,enamel,can)
ellipsoid('Rose sprinkler',(.49,.40,.02),(.075,.027,.065),enamel,can)
for i in range(9):
    a=i*math.tau/9
    ellipsoid('Rose perforation',(.49+.045*math.cos(a),.426,.02+.04*math.sin(a)),(.006,.0015,.006),dark,can)

def pot(c,r=.18,h=.26):
    lathe('Clay pot',[(0,0),(.72*r,0),(r,h*.94),(r*1.02,h),(r*.87,h),(r*.84,h*.88),(r*.65,.035),(0,.035)],clayGarden,c,segments=48)
    lathe('Pot soil',[(0,h*.88),(r*.85,h*.88)],soil,c,segments=32)

flowers=collection('Atelier_Flowers');pot(flowers,.19,.26)
for i in range(7):
    a=i*2.399;h=.44+(i%3)*.065;x=math.cos(a)*.12;z=math.sin(a)*.12
    curve('Flower stem',[(0,.23,0),(x*.6,h*.8,z*.6),(x,h,z)],.006,leafGarden,flowers,resolution=1)
    for s in (-1,1):leaf('Flower leaf',(x*.5,.30,z*.5),(x+s*.105,.39,z+.035),.040,leafGarden,flowers)
    for j in range(5):
        b=j*math.tau/5
        ellipsoid('Coral petal',(x+.048*math.cos(b),h+.009,z+.048*math.sin(b)),(.049,.013,.030),petal,flowers)
    ellipsoid('Flower centre',(x,h+.022,z),(.024,.014,.024),flowerHeart,flowers)
succulent=collection('Atelier_Succulent');pot(succulent,.145,.19)
for row in range(3):
    for i in range(7):
        a=i*math.tau/7+row*.6;r=.15-row*.035;h=.21+row*.035
        ob=ellipsoid('Fleshy succulent leaf',(r*.5*math.cos(a),h,r*.5*math.sin(a)),(.037,.023,r*.68),leafLight if row%2 else leafGarden,succulent)
        ob.rotation_euler[2]=-a+math.pi/2
print('Watering can, flowers and succulent created.')
