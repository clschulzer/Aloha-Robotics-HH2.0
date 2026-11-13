"""Regenerate the presenter data from slide data-note attributes (stdlib only)."""
from html.parser import HTMLParser
from pathlib import Path
import json

class NoteParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.slides = []
    def handle_starttag(self, tag, attrs):
        if tag != 'section':
            return
        d = dict(attrs)
        if 'slide' not in d.get('class', '').split():
            return
        self.slides.append({
            'title': d.get('data-title', ''),
            'note': d.get('data-note', ''),
            'appendix': 'data-appendix' in d,
        })

root = Path(__file__).parent
parser = NoteParser()
parser.feed((root / 'pitch/index.html').read_text(encoding='utf-8'))
(root / 'teleprompter/data.js').write_text(
    'window.PITCH_NOTES=' + json.dumps(parser.slides, ensure_ascii=False) + ';',
    encoding='utf-8',
)
print(f'Wrote {len(parser.slides)} presenter scenes.')
