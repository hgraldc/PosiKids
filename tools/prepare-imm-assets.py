"""Refresh intrinsic dimensions for the IMM artwork in public/assets."""
import json
from pathlib import Path
from PIL import Image

root = Path(__file__).resolve().parents[1]
source = root / "public" / "assets"
manifest_path = root / "imm-assets.json"
asset_names = json.loads(manifest_path.read_text())
manifest = {}
for name in sorted(asset_names):
    path = source / f"{name}.webp"
    with Image.open(path) as image:
        manifest[path.stem] = list(image.size)
manifest_path.write_text(json.dumps(manifest, indent=2) + "\n")
print(f"Recorded dimensions for {len(manifest)} assets in public/assets.")
