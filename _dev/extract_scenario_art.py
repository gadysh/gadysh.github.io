"""Extract the five clean homepage scenario scenes from the Founder-approved
home-scenarios-editorial-desktop-v1.png (2026-11-01). Native pixels, no upscaling.
Text columns of the mock are excluded/hard-masked; edges are feathered to alpha 0."""
import sys
from PIL import Image, ImageDraw, ImageFilter

SRC = r"C:/Users/msgad/Documents/AI/PowOrg/PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/home-scenarios-editorial-desktop-v1.png"
OUT = "assets/img/scenarios/"
# name, crop box, extra hard masks (crop coords) where mock heading/paragraph text sits
SCENES = [
    ("scenario-whatsapp-service-actions", (8, 160, 624, 424), []),
    ("scenario-agent-assist-onboarding", (8, 438, 630, 704), []),
    ("scenario-documents-across-systems", (8, 722, 650, 966), [(612, 0, 642, 104)]),
    ("scenario-knowledge-chat-actions", (8, 984, 630, 1240), [(600, 0, 622, 175)]),
    ("scenario-recording-to-outputs", (8, 1254, 614, 1478), []),
]
FEATHER = 26

im = Image.open(SRC).convert("RGB")
for name, box, masks in SCENES:
    c = im.crop(box)
    w, h = c.size
    a = Image.new("L", (w, h), 0)
    ImageDraw.Draw(a).rectangle((FEATHER, FEATHER // 2, w - FEATHER, h - FEATHER), fill=255)
    for m in masks:
        ImageDraw.Draw(a).rectangle(m, fill=0)
    a = a.filter(ImageFilter.GaussianBlur(FEATHER / 2.2))
    for m in masks:  # keep masked text areas fully transparent after blur
        ImageDraw.Draw(a).rectangle(m, fill=0)
    c.putalpha(a)
    c.save(OUT + name + ".webp", "WEBP", quality=88, method=6)
    print(name, c.size)
