"""Extract the single shared "what sets us apart" sculpture from the Founder-approved
difference-shared-desktop-v1.png (2026-11-01). Native pixels, no upscaling.
The mock's heading/body text column is excluded; stray glyph fragments at the right edge
are hard-masked; edges are feathered to alpha 0 so the scene sits on the section ivory."""
from PIL import Image, ImageDraw, ImageFilter

SRC = r"C:/Users/msgad/Documents/AI/PowOrg/PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/difference-shared-desktop-v1.png"
OUT = "assets/img/difference/difference-shared-sculpture.webp"
BOX = (20, 290, 975, 805)
MASKS = [(925, 95, 955, 150), (935, 215, 955, 270)]  # crop coords: mock text glyphs
FEATHER = 30

im = Image.open(SRC).convert("RGB")
c = im.crop(BOX)
w, h = c.size
a = Image.new("L", (w, h), 0)
ImageDraw.Draw(a).rectangle((FEATHER, FEATHER, w - FEATHER, h - FEATHER), fill=255)
for m in MASKS:
    ImageDraw.Draw(a).rectangle(m, fill=0)
a = a.filter(ImageFilter.GaussianBlur(FEATHER / 2.2))
for m in MASKS:
    ImageDraw.Draw(a).rectangle(m, fill=0)
c.putalpha(a)
c.save(OUT, "WEBP", quality=88, method=6)
print(OUT, c.size)
