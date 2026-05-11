"""
Remove ALL fake transparency checkerboard from the logo image.
Pass 1: Flood-fill from edges to remove outer background.
Pass 2: Remove ALL remaining grey checkerboard pixels anywhere in the image.
"""
from PIL import Image
from collections import deque

def is_grey_pixel(r, g, b):
    """Check if a pixel is grey (part of checkerboard)."""
    max_c = max(r, g, b)
    min_c = min(r, g, b)
    diff = max_c - min_c
    # Grey pixels have very low color variance
    if diff > 25:
        return False
    avg = (r + g + b) / 3
    # Both light and dark checkerboard squares
    if 90 <= avg <= 235:
        return True
    return False

def is_gold_pixel(r, g, b):
    """Check if a pixel is gold-colored (the logo)."""
    # Gold has R > G > B, with noticeable difference
    if r > 120 and g > 80 and (r - b) > 40 and r > b:
        return True
    return False

def remove_checkerboard_bg(input_path, output_path):
    img = Image.open(input_path).convert('RGBA')
    w, h = img.size
    pixels = img.load()
    
    to_remove = set()
    
    # Pass 1: Flood-fill from edges
    visited = set()
    queue = deque()
    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
    for y in range(h):
        queue.append((0, y))
        queue.append((w - 1, y))
    
    while queue:
        x, y = queue.popleft()
        if (x, y) in visited:
            continue
        if x < 0 or x >= w or y < 0 or y >= h:
            continue
        visited.add((x, y))
        
        r, g, b, a = pixels[x, y]
        if is_grey_pixel(r, g, b):
            to_remove.add((x, y))
            for dx, dy in [(-1,0),(1,0),(0,-1),(0,1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and (nx, ny) not in visited:
                    queue.append((nx, ny))
    
    print(f"Pass 1 (flood-fill from edges): {len(to_remove)} pixels")
    
    # Pass 2: Remove ALL remaining grey non-gold pixels
    # These are interior checkerboard areas trapped inside the logo outline
    pass2_count = 0
    for y in range(h):
        for x in range(w):
            if (x, y) in to_remove:
                continue
            r, g, b, a = pixels[x, y]
            if is_grey_pixel(r, g, b) and not is_gold_pixel(r, g, b):
                to_remove.add((x, y))
                pass2_count += 1
    
    print(f"Pass 2 (interior cleanup): {pass2_count} pixels")
    print(f"Total removed: {len(to_remove)} pixels")
    
    # Apply transparency
    for (x, y) in to_remove:
        pixels[x, y] = (0, 0, 0, 0)
    
    img.save(output_path, 'PNG')
    print(f"Saved to: {output_path}")

if __name__ == '__main__':
    input_path = 'Gemini_Generated_Image_tyfl5ctyfl5ctyfl.png'
    output_path = 'src/assets/logo-hd-transparent.png'
    remove_checkerboard_bg(input_path, output_path)
