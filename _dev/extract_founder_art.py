"""Build the clean #founder notebook scene (2026-11-01) from the Founder-selected phone mock
founder-notebook-mobile-v1.png (the only mock whose notebook/pen region is unobstructed: the desktop
mocks have an open nav flyout over the art). Crop box 0,430-876,1112 (below the baked heading, above
the baked biography). The AI-repainted face in the mock is replaced by the ORIGINAL portrait
assets/img/team/gadi.webp (360x360), perspective-warped onto the photo-print quad of the clipped print
(measured corners, expanded ~2px so no mock face pixels remain), then the paper clip is restored on top.
Native pixels, no upscaling of the scene; edges feathered to alpha 0 so it sits on the section ivory."""
import numpy as np
from PIL import Image, ImageDraw, ImageFilter

SRC = r"C:/Users/msgad/Documents/AI/PowOrg/PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/founder-notebook-mobile-v1.png"
mock = Image.open(SRC).convert("RGB")
orig = mock.copy()
face = Image.open("assets/img/team/gadi.webp").convert("RGB")

# photo-print quad in mock coordinates: TL, TR, BR, BL
quad = [(63, 528), (334, 500), (377, 784), (96, 815)]

def coeffs(dst, src):
    # PIL PERSPECTIVE maps output (dst) -> input (src)
    m = []
    for (x, y), (u, v) in zip(dst, src):
        m.append([x, y, 1, 0, 0, 0, -u * x, -u * y])
        m.append([0, 0, 0, x, y, 1, -v * x, -v * y])
    b = np.array(src).reshape(8)
    return np.linalg.solve(np.array(m, float), b).tolist()

W, H = mock.size
s = face.size[0]
warped = face.transform((W, H), Image.PERSPECTIVE, coeffs(quad, [(0, 0), (s, 0), (s, s), (0, s)]), Image.BICUBIC)
mask = Image.new("L", (W * 4, H * 4), 0)  # 4x supersampled polygon -> anti-aliased print edge
ImageDraw.Draw(mask).polygon([(x * 4, y * 4) for x, y in quad], fill=255)
mask = mask.resize((W, H), Image.LANCZOS)
mock.paste(warped, (0, 0), mask)
# restore the paper clip over the print's top-left corner
clip = (78, 478, 122, 532)
mock.paste(orig.crop(clip), clip[:2])

box = (0, 430, 876, 1112)
c = mock.crop(box)
w, h = c.size
f = 26
a = Image.new("L", (w, h), 0)
ImageDraw.Draw(a).rectangle((f, f, w - f, h - f), fill=255)
a = a.filter(ImageFilter.GaussianBlur(f / 2.2))
c.putalpha(a)
c.save("assets/img/founder/founder-notebook.webp", "WEBP", quality=90, method=6)
c.convert("RGB").crop((30, 40, 420, 420)).resize((780, 760)).save("_dev/tmp_founder/composite_zoom.png")
print("founder-notebook.webp", c.size)
