"""Extract the clean #fit scenes (2026-11-01) from the Founder-approved fit-light mocks
(fit-light-desktop-v1.png / fit-light-mobile-v1.png). Only the shared organization-work vignette is
kept: no baked heading, intro, list, check marks or closing note, and not the dark strip at the top
(it only illustrates the preceding technology section).
- desktop/tablet: box 20,220-915,840 (stops before the baked list at x~930).
- phone: box 0,345-897,965 (below the baked intro at y~340, above the baked list at y~1010).
Native pixels, no upscaling; edges feathered to alpha 0 so each scene sits on the section ivory."""
from PIL import Image, ImageDraw, ImageFilter

DIR = r"C:/Users/msgad/Documents/AI/PowOrg/PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/"
SETS = [
    ("fit-light-desktop-v1.png", (20, 220, 915, 840), 44, "fit-scene-desktop.webp"),
    ("fit-light-mobile-v1.png", (0, 345, 897, 965), 30, "fit-scene-mobile.webp"),
]
for src, box, f, out in SETS:
    c = Image.open(DIR + src).convert("RGB").crop(box)
    w, h = c.size
    a = Image.new("L", (w, h), 0)
    ImageDraw.Draw(a).rectangle((f, f, w - f, h - f), fill=255)
    a = a.filter(ImageFilter.GaussianBlur(f / 2.2))
    c.putalpha(a)
    c.save("assets/img/fit/" + out, "WEBP", quality=90, method=6)
    print(out, c.size)
