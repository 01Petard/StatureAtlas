"""Export the supplied StatureAtlas artwork without cropping or stretching.

Requires Pillow. Run from any directory: python3 scripts/resize-icons.py
"""
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile

from PIL import Image, ImageDraw, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SOURCE = ROOT / "assets/branding/icon-source.png"
SIZES = (16, 32, 48, 64, 96, 128, 180, 192, 256, 384, 512, 1024)
RATIOS = ((1200, 630), (1200, 675), (1200, 900))


def main():
    original = Image.open(SOURCE).convert("RGBA")
    exports = []
    icons = ROOT / "public/icons"
    brand = ROOT / "public/brand"
    icons.mkdir(parents=True, exist_ok=True)
    brand.mkdir(parents=True, exist_ok=True)

    for size in SIZES:
        image = original.resize((size, size), Image.Resampling.LANCZOS)
        path = icons / f"icon-{size}.png"
        image.save(path, optimize=True)
        exports.append(path)

    favicon = ROOT / "public/favicon.ico"
    original.save(favicon, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    exports.append(favicon)
    apple = ROOT / "public/apple-touch-icon.png"
    Image.open(icons / "icon-180.png").save(apple, optimize=True)
    exports.append(apple)

    # Non-square variants preserve the artwork on a transparent canvas.
    for width, height in RATIOS:
        canvas = Image.new("RGBA", (width, height), (0, 0, 0, 0))
        fitted = ImageOps.contain(original, (width, height), Image.Resampling.LANCZOS)
        canvas.alpha_composite(fitted, ((width - fitted.width) // 2, (height - fitted.height) // 2))
        path = brand / f"stature-atlas-{width}x{height}.png"
        canvas.save(path, optimize=True)
        exports.append(path)

    archive = ROOT / "assets/branding/stature-atlas-icons.zip"
    with ZipFile(archive, "w", ZIP_DEFLATED) as bundle:
        bundle.write(SOURCE, "source/icon-source.png")
        for path in exports:
            bundle.write(path, str(path.relative_to(ROOT / "public")))

    preview = Image.new("RGB", (1040, 680), "#f2f5fa")
    draw = ImageDraw.Draw(preview)
    draw.text((24, 18), "StatureAtlas - original artwork / proportional exports", fill="#243854")
    for size, x in [(32, 32), (64, 150), (128, 296), (256, 500)]:
        icon = Image.open(icons / f"icon-{size}.png").convert("RGBA")
        preview.paste(icon, (x, 64), icon)
        draw.text((x, 334), f"{size} x {size}", fill="#243854")
    x = 24
    for width, height in RATIOS:
        thumb = ImageOps.contain(Image.open(brand / f"stature-atlas-{width}x{height}.png"), (312, 236), Image.Resampling.LANCZOS)
        preview.paste(thumb, (x, 394), thumb)
        draw.text((x, 650), f"{width} x {height}", fill="#243854")
        x += 344
    preview.save(ROOT / "assets/branding/preview.png", optimize=True)
    print(f"Exported {len(exports)} assets and {archive.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
