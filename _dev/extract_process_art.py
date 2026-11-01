"""Extract the five "how we work" stage scenes from the Founder-approved process mocks (2026-11-01).
Desktop stations come from process-five-stages-desktop-v1.png, phone/tablet scenes from
process-five-stages-mobile-v1.png. Native pixels, no upscaling. Mock titles, ordinals, rules and
buttons are excluded (rebuilt as native HTML); edges are feathered to alpha 0 so each scene sits
on the section ivory and neighbouring-station fragments fade out."""
from PIL import Image, ImageDraw, ImageFilter

DIR = r"C:/Users/msgad/Documents/AI/PowOrg/PowOrg-AI Platform/docs/strategy/website/visual_concepts_2026-11-01/"
SETS = {
    "desktop": ("process-five-stages-desktop-v1.png", 24, {
        1: (1245, 420, 1572, 738),
        2: (955, 390, 1240, 705),
        3: (630, 405, 955, 715),
        4: (318, 390, 648, 672),
        5: (20, 370, 330, 628),
    }),
    "mobile": ("process-five-stages-mobile-v1.png", 18, {
        1: (52, 178, 478, 442),
        2: (48, 462, 440, 708),
        3: (50, 738, 472, 1012),
        4: (50, 1040, 445, 1294),
        5: (55, 1338, 470, 1552),
    }),
}

for kind, (src, feather, boxes) in SETS.items():
    im = Image.open(DIR + src).convert("RGB")
    for n, box in boxes.items():
        c = im.crop(box)
        w, h = c.size
        a = Image.new("L", (w, h), 0)
        ImageDraw.Draw(a).rectangle((feather, feather, w - feather, h - feather), fill=255)
        a = a.filter(ImageFilter.GaussianBlur(feather / 2.2))
        c.putalpha(a)
        out = f"assets/img/process/process-{n}-{kind}.webp"
        c.save(out, "WEBP", quality=88, method=6)
        print(out, c.size)
