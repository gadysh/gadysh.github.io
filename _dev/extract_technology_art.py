"""Extract the clean #technology scenes (2026-11-01) from the Founder-approved PRE-LOGO mocks, so no
generated brand marks and no baked heading/paragraph end up on the page (the approved v2 logo mocks are
layout references only; brand marks are separate official files in assets/img/technology/logos/).
- desktop/tablet stage: technology-dark-desktop-v1.png, box 0,130-925,1000 (stops before the baked heading/
  paragraph at x~935) in the same frame as the v2
  desktop mock, so chip/connector positions measured on v2 map 1:1 onto the 1070x870 stage (scene = left 925px).
- phone: technology-dark-mobile-v1.png scene band.
Native pixels, no upscaling; edges feathered to alpha 0 so each scene sits on the section petrol."""
from PIL import Image, ImageDraw, ImageFilter

DIR = r"C:/Users/msgad/Documents/AI/PowOrg/PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/"
SETS = [
    ("technology-dark-desktop-v1.png", (0, 130, 925, 1000), 40, "technology-stage-desktop.webp"),
    ("technology-dark-mobile-v1.png", (0, 770, 946, 1335), 26, "technology-stage-mobile.webp"),
]
for src, box, f, out in SETS:
    c = Image.open(DIR + src).convert("RGB").crop(box)
    w, h = c.size
    a = Image.new("L", (w, h), 0)
    ImageDraw.Draw(a).rectangle((f, f, w - f, h - f), fill=255)
    a = a.filter(ImageFilter.GaussianBlur(f / 2.2))
    c.putalpha(a)
    c.save("assets/img/technology/" + out, "WEBP", quality=88, method=6)
    print(out, c.size)
