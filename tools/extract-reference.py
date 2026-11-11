"""Extract original artwork and embedded type from the supplied Canva PDF."""
from pathlib import Path
import hashlib
import io
import json
import re
import zlib
from PIL import Image, ImageDraw
from fontTools.ttLib import TTFont
from fontTools.ttLib.tables._c_m_a_p import CmapSubtable
from fontTools.merge import Merger

ROOT = Path(__file__).resolve().parents[1]
data = (ROOT / 'PosiKids_20261109_200153_0000.pdf').read_bytes()
objects = {}
for match in re.finditer(rb'(?m)^(\d+) 0 obj\s*', data):
    start = match.end()
    objects[int(match[1])] = data[start:data.index(b'endobj', start)]

def stream(number):
    value = objects[number]
    start = re.search(rb'stream\r?\n', value).end()
    length = int(re.search(rb'/Length (\d+)', value)[1])
    raw = value[start:start + length]
    return zlib.decompress(raw) if b'/FlateDecode' in value[:start] else raw

out = ROOT / '.reference' / 'extracted'
out.mkdir(parents=True, exist_ok=True)
images = []
seen = {}
for number, value in objects.items():
    header = value.split(b'stream')[0]
    if b'/Subtype /Image' not in header or b'/DeviceGray' in header:
        continue
    width = int(re.search(rb'/Width (\d+)', header)[1])
    height = int(re.search(rb'/Height (\d+)', header)[1])
    raw = stream(number)
    digest = hashlib.sha256(raw).hexdigest()
    if digest in seen:
        continue
    seen[digest] = number
    try:
        im = Image.open(io.BytesIO(raw)) if b'/DCTDecode' in header else Image.frombytes('RGB', (width, height), raw)
        mask = re.search(rb'/SMask (\d+) 0 R', header)
        if mask:
            im.putalpha(Image.frombytes('L', (width, height), stream(int(mask[1]))))
        im.save(out / f'{number}.png')
        images.append({'object': number, 'width': width, 'height': height})
    except Exception as error:
        print('Image', number, str(error))

for offset in range(0, len(images), 48):
    group = images[offset:offset+48]
    sheet = Image.new('RGB', (1200, ((len(group)+5)//6)*150), '#dedbd5')
    draw = ImageDraw.Draw(sheet)
    for i, entry in enumerate(group):
        im = Image.open(out / f'{entry["object"]}.png').convert('RGBA')
        im.thumbnail((190, 120))
        x, y = (i % 6)*200, (i//6)*150
        sheet.paste(im, (x+(190-im.width)//2, y), im)
        draw.text((x+5,y+123), str(entry['object']) + ' / ' + str(entry['width'])+'x'+str(entry['height']), fill='black')
    sheet.save(out / f'contact-{offset//48}.png')
(out / 'images.json').write_text(json.dumps(images, indent=2))
print('Unique artwork:', len(images))

fonts = []
for number, value in objects.items():
    if b'/Subtype /Type0' not in value:
        continue
    name = re.search(rb'/BaseFont /([^\s]+)', value)[1].decode().split('+')[-1]
    descendant = int(re.search(rb'/DescendantFonts \[(\d+)', value)[1])
    descriptor = int(re.search(rb'/FontDescriptor (\d+)', objects[descendant])[1])
    fontfile = int(re.search(rb'/FontFile2 (\d+)', objects[descriptor])[1])
    unicode_map = stream(int(re.search(rb'/ToUnicode (\d+)', value)[1]))
    font = TTFont(io.BytesIO(stream(fontfile)))
    glyphs = font.getGlyphOrder()
    mapping = {}
    for block in re.findall(rb'beginbfchar(.*?)endbfchar', unicode_map, re.S):
        for code, uni in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', block):
            character = bytes.fromhex(uni.decode()).decode('utf-16-be')
            if len(character) == 1:
                mapping[ord(character)] = glyphs[int(code,16)]
    for block in re.findall(rb'beginbfrange(.*?)endbfrange', unicode_map, re.S):
        for first, last, uni in re.findall(rb'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>', block):
            for gid in range(int(first,16), int(last,16)+1):
                mapping[int(uni,16)+gid-int(first,16)] = glyphs[gid]
    cmap = CmapSubtable.newSubtable(4)
    cmap.platformID, cmap.platEncID, cmap.language = 3, 1, 0
    cmap.cmap = mapping
    font['cmap'].tables = [cmap]
    path = out / f'{name}-{number}.ttf'
    font.save(path)
    fonts.append({'object': number, 'name': name, 'characters': ''.join(chr(c) for c in sorted(mapping)), 'path': str(path)})
(out / 'fonts.json').write_text(json.dumps(fonts, indent=2))
print('Fonts:', [(f['object'], f['name'], f['characters']) for f in fonts])
for page in range(10,25):
    content = int(re.search(rb'/Contents (\d+)', objects[page])[1])
    (out / f'page-{page-9:02}.txt').write_bytes(stream(content))

exports = {84: 'map-bg', 720: 'select-zaa', 730: 'select-zee',
           76: 'stage-rara', 77: 'stage-amar', 78: 'stage-mora', 80: 'stage-letter'}
for number, name in exports.items():
    im = Image.open(out / f'{number}.png')
    if number != 84:
        im = im.crop(im.getbbox())
    im.save(ROOT / 'public/assets' / f'{name}.webp', quality=95)
for name in sorted(set(f['name'] for f in fonts)):
    font = Merger().merge([f['path'] for f in fonts if f['name'] == name])
    font.flavor = 'woff'
    font.save(ROOT / 'public/fonts' / f'{name}.woff')
dimensions = {file.stem: Image.open(file).size for file in (ROOT / 'public/assets').glob('*.webp')}
(ROOT / 'asset-dimensions.json').write_text(json.dumps(dimensions, indent=2))
