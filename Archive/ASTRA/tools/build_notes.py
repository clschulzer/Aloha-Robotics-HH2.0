"""Keep the timed show and copied team presenter view aligned with SPEAKER_SCRIPT.md."""
from pathlib import Path
import json
import re
import html

root = Path(__file__).resolve().parents[1]
script = (root / 'SPEAKER_SCRIPT.md').read_text()
data = json.loads(re.search(r'```json\n(.*?)\n```', script, re.S).group(1))
assert data['durationSeconds'] == 180
assert sum(act['duration'] for act in data['acts']) == 180
spoken = {}
for line in script.splitlines():
    match = re.match(r'^\| \*\*(\d+:\d+(?:\.\d+)?)\*\* \| \*\*(.*?)\*\* \| (.*?) \|$', line)
    if match:
        minute, second = match[1].split(':')
        time = int(minute) * 60 + float(second)
        spoken[time] = match[1] + '\n\n' + re.sub(r'\*\*|`', '', match[2]) + '\n\n' + re.sub(r'\*\*|`', '', match[3])
cues, notes = [], []
for index, act in enumerate(data['acts']):
    times = act['cues'] if index else [0]
    cues.extend({'at': time, 'index': index, 'step': step} for step, time in enumerate(times))
    notes.append([spoken[time] for time in times])
notes[0][0] += '\n\n' + spoken[data['filmSeconds']]
(root / 'show.mjs').write_text('// Generated from SPEAKER_SCRIPT.md by tools/build_notes.py\nexport const DURATION=180;\nexport const CUES=' + json.dumps(cues, indent=2) + ';\nexport const NOTES=' + json.dumps(notes, ensure_ascii=False, indent=2) + ';\n')
titles = ['INTRODUCING ALOHA ROBOTICS', 'THE CHARACTERS', 'INVISIBLE CONNECTIVITY', 'THE GOLDEN WINDOW', 'ONE CONNECTED SERVICE LOOP', 'NOW, BACK TO THE PATIENT']
rows = [{'title': title, 'note': '', 'appendix': False, 'steps': len(notes[index])} for index, title in enumerate(titles)]
(root / 'presenter/data.js').write_text('window.PITCH_NOTES=' + json.dumps(rows) + ';\nwindow.PITCH_BEATS=' + json.dumps({str(index+1): note for index, note in enumerate(notes)}, ensure_ascii=False) + ';\n')
index_html = (root / 'index.html').read_text()
section = iter(notes)
index_html = re.sub(
    r'(<section class="slide [^>]*?data-note=")[^"]*(")',
    lambda match: match[1] + html.escape('\n\n'.join(next(section)), quote=True) + match[2],
    index_html,
)
(root / 'index.html').write_text(index_html)
print('Built 21 show cues and synchronized presenter notes; 180 seconds.')
