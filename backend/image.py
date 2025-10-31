from PIL import Image, ImageDraw, ImageFont
import random
import io
import base64
from typing import List, Optional


def _load_font(size: int = 48):
    """Try to load a truetype font, fall back to default."""
    try:
        return ImageFont.truetype("times.ttf", size=size)
    except Exception:
        return ImageFont.load_default()


def generate_appreciation(employee_image_b64: str,
                          appreciations: Optional[List[str]] = None,
                          output_format: str = "JPEG") -> str:
    """
    Generate an appreciation image by compositing the provided employee image (base64)
    onto the certificate template and adding random appreciation bullets.

    Inputs:
    - employee_image_b64: base64-encoded image (PNG/JPEG). Data may include data URI prefix.
    - appreciations: optional list of appreciation strings to choose from. If None, use defaults.
    - output_format: image output format ("JPEG" or "PNG").

    Returns:
    - base64-encoded image bytes (no data URI prefix), in the requested format.
    """
    # Default appreciations
    if appreciations is None:
        appreciations = [
            "Performance",
            "Dedication",
            "Appearance",
            "Teamwork",
            "Timeliness",
            "Attitude",
        ]

    # Decode the base64 image (support data URI)
    if employee_image_b64.startswith("data:"):
        # strip the prefix
        employee_image_b64 = employee_image_b64.split(",", 1)[1]

    try:
        employee_bytes = base64.b64decode(employee_image_b64)
    except Exception as e:
        raise ValueError("Invalid base64 image provided") from e

    # Open base template
    try:
        template = Image.open('base.jpg').convert("RGBA")
    except FileNotFoundError:
        raise FileNotFoundError("Template base.jpg not found in working directory")

    draw = ImageDraw.Draw(template)
    font = _load_font(size=48)

    # Title
    title = "Employee Appreciation Award"
    title_color = (0, 0, 0)
    title_position = (25, 25)
    draw.text(title_position, title, fill=title_color, font=font)

    # Pick three random appreciations
    selected = random.sample(appreciations, min(3, len(appreciations)))
    for i, item in enumerate(selected, start=1):
        draw.text((350, 100 + i * 50), item, fill=title_color, font=font)

    # Open employee image
    try:
        employee_img = Image.open(io.BytesIO(employee_bytes)).convert("RGBA")
    except Exception:
        raise ValueError("Unable to open employee image from provided bytes")

    # Resize employee image to fit
    employee_img = employee_img.resize((200, 200))

    # Composite employee image onto template
    template.paste(employee_img, (50, 150), employee_img)

    # Save to bytes
    out_io = io.BytesIO()
    save_kwargs = {}
    if output_format.upper() == 'JPEG':
        # JPEG doesn't support alpha; convert to RGB
        canvas = template.convert('RGB')
        save_format = 'JPEG'
        save_kwargs['quality'] = 85
        canvas.save(out_io, format=save_format, **save_kwargs)
    else:
        template.save(out_io, format=output_format)

    out_bytes = out_io.getvalue()
    return base64.b64encode(out_bytes).decode('ascii')


if __name__ == '__main__':
    # Quick local smoke test when running image.py directly
    import sys
    if len(sys.argv) > 1:
        # expect path to an employee image file
        img_path = sys.argv[1]
        with open(img_path, 'rb') as f:
            b64 = base64.b64encode(f.read()).decode('ascii')
        out_b64 = generate_appreciation(b64)
        print(out_b64[:200])

