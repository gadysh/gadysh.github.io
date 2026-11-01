import sys
from PIL import Image, ImageDraw, ImageFont, ImageFilter
src, out = sys.argv[1], sys.argv[2]
im = Image.open(src).convert('RGB')
S = 4  # supersample
font = ImageFont.truetype(r'C:\Windows\Fonts\arialbd.ttf', int(17.5 * S))
# (text, center x, center y, tilt deg, ink) from the original Hebrew plaque lettering
labels = [('DATA', 122.3, 689.0, 7.0, (43, 32, 23)),
          ('SYSTEM', 701.5, 730.3, 8.5, (49, 38, 29)),
          ('USER', 1090.6, 799.6, 9.5, (52, 41, 32))]
for text, cx, cy, ang, ink in labels:
    L = 140 * S
    layer = Image.new('L', (L, L), 0)
    d = ImageDraw.Draw(layer)
    l, t, r, b = d.textbbox((0, 0), text, font=font, anchor='lt')
    d.text(((L - (r - l)) / 2 - l, (L - (b - t)) / 2 - t), text, font=font, fill=235)
    layer = layer.rotate(-ang, resample=Image.BICUBIC)
    layer = layer.resize((L // S, L // S), Image.LANCZOS).filter(ImageFilter.GaussianBlur(0.35))
    x0, y0 = round(cx - L / S / 2), round(cy - L / S / 2)
    ink_img = Image.new('RGB', layer.size, ink)
    im.paste(ink_img, (x0, y0), layer)
im.save(out)
