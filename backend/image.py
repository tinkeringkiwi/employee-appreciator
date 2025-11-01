from PIL import Image, ImageDraw, ImageFont
import random
import io
import base64
from typing import List, Optional


def _load_font(size: int = 48, italic: bool = False):
    """Try to load a truetype font, fall back to default."""
    try:
        if italic:
            return ImageFont.truetype("times-italic.ttf", size=size)
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
            "Productivity",
            "Participation",
            "Dipendability"
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
        template = Image.open('solid-color.jpg').convert("RGBA")
    except FileNotFoundError:
        raise FileNotFoundError("Template base.jpg not found in working directory")

    draw = ImageDraw.Draw(template)
    font = _load_font(size=48)

    font_praise = _load_font(size=40)
    font_praise_italic = _load_font(size=40, italic=True)

    # Title
    title = "Employee Appreciation Award"
    title_color = (0, 0, 0)
    title_position = (25, 25)
    draw.text(title_position, title, fill=title_color, font=font)

    
    # Open employee image
    try:
        employee_img = Image.open(io.BytesIO(employee_bytes)).convert("RGBA")
    except Exception:
        raise ValueError("Unable to open employee image from provided bytes")
    
    try:
        gold_star = Image.open('gold-star.png').convert("RGBA")
    except Exception:
        print("Warning: gold_star.png not found, proceeding without star image")

    # Resize employee image to fit
    employee_img = employee_img.resize((300, 300))
    gold_star = gold_star.resize((150, 150))

    template.paste(gold_star, (450, 225), gold_star)
    # Composite employee image onto template
    template.paste(employee_img, (25, 100), employee_img)


    # Pick three random appreciations
    selected = random.sample(appreciations, min(4, len(appreciations)))
    for i, item in enumerate(selected, start=1):
        if random.choice([True, False]):
            draw.text((350 + random.randint(-50, 50), 25 + i * random.randint(65, 75)), item, fill=title_color, font=font_praise_italic)
        else:
            draw.text((350 + random.randint(-50, 50), 25 + i * random.randint(65, 75)), item, fill=title_color, font=font_praise)


    # Save to bytes
    out_io = io.BytesIO()
    save_kwargs = {}
    if output_format.upper() == 'JPEG':
        # JPEG doesn't support alpha; convert to RGB
        canvas = template.convert('RGB')
        save_format = 'JPEG'
        save_kwargs['quality'] = 20
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

