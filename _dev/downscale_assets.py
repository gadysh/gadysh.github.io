import os
import hashlib
from PIL import Image

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FAVICON_PATH = os.path.join(REPO_ROOT, 'assets', 'icons', 'favicon.png')
LOGO_PATH = os.path.join(REPO_ROOT, 'assets', 'logo-symbol.png')

def file_info(path):
    with open(path, 'rb') as f:
        data = f.read()
    im = Image.open(path)
    return {
        'path': os.path.relpath(path, REPO_ROOT).replace('\\', '/'),
        'bytes': len(data),
        'magic_hex': data[:8].hex(' '),
        'format': im.format,
        'mode': im.mode,
        'dimensions': list(im.size),
        'sha256': hashlib.sha256(data).hexdigest()
    }

def main():
    print('Reading before info...')
    before_fav = file_info(FAVICON_PATH)
    before_logo = file_info(LOGO_PATH)

    # Save backup of originals in _dev
    dev_dir = os.path.join(REPO_ROOT, '_dev')
    orig_fav_path = os.path.join(dev_dir, 'orig_favicon.png')
    orig_logo_path = os.path.join(dev_dir, 'orig_logo-symbol.png')
    with open(FAVICON_PATH, 'rb') as src, open(orig_fav_path, 'wb') as dst:
        dst.write(src.read())
    with open(LOGO_PATH, 'rb') as src, open(orig_logo_path, 'wb') as dst:
        dst.write(src.read())

    # Downscale Favicon: 1024x1024 -> 64x64 PNG (RGB)
    im_fav = Image.open(orig_fav_path)
    assert im_fav.mode == 'RGB', f"Expected RGB mode, got {im_fav.mode}"
    out_fav = im_fav.resize((64, 64), Image.Resampling.LANCZOS)
    out_fav.save(FAVICON_PATH, format='PNG', optimize=True, compress_level=9)

    # Downscale Logo: 730x710 -> 114x111 PNG (RGBA)
    im_logo = Image.open(orig_logo_path)
    assert im_logo.mode == 'RGBA', f"Expected RGBA mode, got {im_logo.mode}"
    out_logo = im_logo.resize((114, 111), Image.Resampling.LANCZOS)
    out_logo.save(LOGO_PATH, format='PNG', optimize=True, compress_level=9)

    after_fav = file_info(FAVICON_PATH)
    after_logo = file_info(LOGO_PATH)

    print('=== BEFORE ===')
    print('Favicon:', before_fav)
    print('Logo:', before_logo)
    print('=== AFTER ===')
    print('Favicon:', after_fav)
    print('Logo:', after_logo)

if __name__ == '__main__':
    main()
