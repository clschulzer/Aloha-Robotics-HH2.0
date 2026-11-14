"""Make a compact visual review artifact from actual browser screenshots."""
from pathlib import Path
import sys, subprocess
base=Path('ASTRA/versions')/sys.argv[1]/'research'
kind=sys.argv[2] if len(sys.argv)>2 else 'previews'
shots=sorted((base/kind).glob('*.png'))
subprocess.run(['magick','montage','-font','ASTRA/assets/fonts/manrope.ttf','-pointsize','12','-fill','#ced8df','-label','%f',*[str(p) for p in shots],'-geometry','480x270+0+12','-tile','3x','-background','#12191e','-quality','84',str(base/(kind+'-contact.webp'))],check=True)
print(base/(kind+'-contact.webp'))
