#!/usr/bin/env python3
import subprocess
import base64
from PIL import Image, ImageDraw, ImageFont
import io

def create_cover_image():
    """Create a professional cover image for OCUS Job Hunter"""
    # Create a 1200x630 image (Facebook OG standard)
    img = Image.new('RGB', (1200, 630), color='#4A90E2')
    draw = ImageDraw.Draw(img)
    
    # Try to use a system font, fallback to default
    try:
        title_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 72)
        subtitle_font = ImageFont.truetype("/System/Library/Fonts/Arial.ttf", 36)
    except:
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
    
    # Add text
    draw.text((600, 250), "Find Photography Jobs", font=title_font, fill='white', anchor='mm')
    draw.text((600, 320), "10x Faster", font=title_font, fill='#FFD700', anchor='mm')
    draw.text((600, 380), "with OCUS Job Hunter", font=subtitle_font, fill='white', anchor='mm')
    
    # Convert to base64
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    b64_data = base64.b64encode(img_data).decode('utf-8')
    return f"data:image/png;base64,{b64_data}"

def create_logo():
    """Create a simple logo"""
    img = Image.new('RGB', (200, 200), color='#4A90E2')
    draw = ImageDraw.Draw(img)
    
    # Draw circles for target logo
    draw.ellipse([20, 20, 180, 180], fill='white')
    draw.ellipse([40, 40, 160, 160], fill='#4A90E2')
    draw.ellipse([60, 60, 140, 140], fill='white')
    draw.ellipse([80, 80, 120, 120], fill='#4A90E2')
    draw.ellipse([90, 90, 110, 110], fill='white')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    b64_data = base64.b64encode(img_data).decode('utf-8')
    return f"data:image/png;base64,{b64_data}"

def create_favicon():
    """Create a favicon"""
    img = Image.new('RGB', (32, 32), color='#4A90E2')
    draw = ImageDraw.Draw(img)
    
    # Simple target icon
    draw.ellipse([2, 2, 30, 30], fill='white')
    draw.ellipse([6, 6, 26, 26], fill='#4A90E2')
    draw.ellipse([10, 10, 22, 22], fill='white')
    draw.ellipse([14, 14, 18, 18], fill='#4A90E2')
    
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    img_data = buffer.getvalue()
    b64_data = base64.b64encode(img_data).decode('utf-8')
    return f"data:image/png;base64,{b64_data}"

def upload_to_d1(key, value):
    """Upload to D1 database using wrangler"""
    # Write to temp file to avoid command line length limits
    with open(f'/tmp/{key}.txt', 'w') as f:
        f.write(value)
    
    # Use file input for large data
    cmd = f"""
    cd /Users/houmanghavamzadeh/Documents/GitHub/OCUS-jub-hunter && 
    source ~/.nvm/nvm.sh && 
    nvm use 20 && 
    wrangler d1 execute ocus-tickets --command "INSERT OR REPLACE INTO settings (key, value, updated_at) VALUES ('{key}', '$(cat /tmp/{key}.txt)', CURRENT_TIMESTAMP);" --remote
    """
    
    try:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Successfully uploaded {key}")
            return True
        else:
            print(f"❌ Failed to upload {key}: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error uploading {key}: {e}")
        return False

if __name__ == "__main__":
    print("Creating SEO images...")
    
    # Create images
    cover_data = create_cover_image()
    logo_data = create_logo()
    favicon_data = create_favicon()
    
    print("Uploading to database...")
    
    # Upload to database
    upload_to_d1('seo_cover_image', cover_data)
    upload_to_d1('seo_logo', logo_data)
    upload_to_d1('seo_favicon', favicon_data)
    
    print("Done!")
