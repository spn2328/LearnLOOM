"""One-time lossless conversion of the original website assets.

Requires Pillow and fonttools[woff]. Original source ZIP remains the archive.
"""
from pathlib import Path
from PIL import Image, ImageChops
from fontTools.ttLib import TTFont

root = Path(__file__).resolve().parents[1]
replacements = {}
before = after = 0
for source in sorted((root / 'public/images').glob('*.png')):
    target = source.with_suffix('.webp')
    with Image.open(source) as original:
        original.save(target, 'WEBP', lossless=True, method=6)
        with Image.open(target) as converted:
            assert original.convert('RGBA').tobytes() == converted.convert('RGBA').tobytes()
    before += source.stat().st_size
    after += target.stat().st_size
    replacements[source.name] = target.name
    source.unlink()
for source in sorted((root / 'public/fonts').glob('*.ttf')):
    target = source.with_suffix('.woff2')
    font = TTFont(source)
    font.flavor = 'woff2'
    font.save(target)
    before += source.stat().st_size
    after += target.stat().st_size
    replacements[source.name] = target.name
    source.unlink()
for folder in ('app', 'components', 'lib', 'public'):
    for path in (root / folder).rglob('*'):
        if path.suffix not in ('.tsx', '.ts', '.css', '.js'):
            continue
        original = path.read_text()
        updated = original
        for old, new in replacements.items():
            updated = updated.replace(old, new)
        if path.name == 'fonts.css':
            updated = updated.replace("format('truetype')", "format('woff2')")
        if updated != original:
            path.write_text(updated)
print(f'Assets: {before:,} -> {after:,} bytes; saved {before-after:,} ({(1-after/before)*100:.1f}%)' if before else 'Already optimized')
