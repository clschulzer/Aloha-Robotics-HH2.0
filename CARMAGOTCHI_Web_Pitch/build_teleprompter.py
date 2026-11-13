from bs4 import BeautifulSoup
from pathlib import Path
import json
root=Path(__file__).parent
soup=BeautifulSoup((root/'pitch/index.html').read_text(),'html.parser')
data=[{'title':s.get('data-title',''), 'note':s.get('data-note',''),'appendix':bool(s.get('data-appendix'))} for s in soup.select('section.slide')]
(root/'teleprompter/data.js').write_text('window.PITCH_NOTES='+json.dumps(data,ensure_ascii=False)+';')
