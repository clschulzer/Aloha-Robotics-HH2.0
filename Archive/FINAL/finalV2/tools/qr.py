"""QR code for the closing slide: https://github.com/clschulzer/Aloha-Robotics-HH2.0
Drawn like the TALOS pitch's QR: white rounded card, rounded modules, rounded finder patterns.
Run from FINAL/finalV2:  python3 tools/qr.py   (needs: pip install qrcode)"""
import qrcode

URL = 'https://github.com/clschulzer/Aloha-Robotics-HH2.0'
q = qrcode.QRCode(error_correction=qrcode.constants.ERROR_CORRECT_M, border=0)
q.add_data(URL)
q.make(fit=True)
m = q.get_matrix()
n = len(m)
B = 4                      # quiet zone, in modules
S = n + 2 * B
finders = [(0, 0), (n - 7, 0), (0, n - 7)]
def in_finder(x, y):
    return any(fx <= x < fx + 7 and fy <= y < fy + 7 for fx, fy in finders)
out = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" role="img" aria-label="QR code: {URL}">',
       f'<rect width="{S}" height="{S}" rx="3.5" fill="#fff"/><g fill="#0b0d10">']
for y in range(n):
    for x in range(n):
        if m[y][x] and not in_finder(x, y):
            out.append(f'<rect x="{x + B}" y="{y + B}" width="1" height="1" rx=".22"/>')
for fx, fy in finders:
    X, Y = fx + B, fy + B
    out.append(f'<path fill-rule="evenodd" d="M{X} {Y + .9}a.9 .9 0 0 1 .9-.9h5.2a.9 .9 0 0 1 .9.9v5.2a.9 .9 0 0 1-.9.9h-5.2a.9 .9 0 0 1-.9-.9zM{X + 1} {Y + 1.5}a.5 .5 0 0 1 .5-.5h4a.5.5 0 0 1 .5.5v4a.5.5 0 0 1-.5.5h-4a.5.5 0 0 1-.5-.5z"/>')
    out.append(f'<rect x="{X + 2}" y="{Y + 2}" width="3" height="3" rx=".45"/>')
out.append('</g></svg>')
open('assets/qr-github.svg', 'w').write(''.join(out))
print(f'version {q.version}, {n}x{n} modules -> assets/qr-github.svg')
