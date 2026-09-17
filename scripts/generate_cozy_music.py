"""Original 32-second synthesized ambient loop, CC0; no samples or downloaded music."""
import math, wave, array
from pathlib import Path
rate=22050
seconds=32
notes=[(48,55,60,64),(45,52,57,60),(41,48,53,57),(43,50,55,59)]
frames=array.array('f',[0])*(rate*seconds)
def tone(midi,start,length,gain):
    freq=440*2**((midi-69)/12)
    for n in range(int(length*rate)):
        t=n/rate
        envelope=min(1,t/.08)*math.exp(-t/2.7)*min(1,(length-t)/.6)
        sound=math.sin(2*math.pi*freq*t)+.20*math.sin(2*math.pi*freq*2*t)+.06*math.sin(2*math.pi*freq*3*t)
        frames[(int(start*rate)+n)%len(frames)]+=gain*envelope*sound
for bar,chord in enumerate(notes):
    for j,midi in enumerate(chord):tone(midi,bar*8+j*.08,8,.045)
    for beat,index in enumerate([2,3,1,2,3,2,1,3]):tone(chord[index]+12,bar*8+beat,5,.065)
peak=max(abs(x) for x in frames)
pcm=array.array('h',(int(max(-1,min(1,x/peak*.56))*32767) for x in frames))
path=Path(__file__).resolve().parents[1]/'public/assets/audio/cozy-afternoon.wav'
path.parent.mkdir(parents=True,exist_ok=True)
with wave.open(str(path),'wb') as f:
    f.setnchannels(1);f.setsampwidth(2);f.setframerate(rate);f.writeframes(pcm.tobytes())
print(f'Original ambient loop: {path}, {seconds}s, {path.stat().st_size} bytes')
