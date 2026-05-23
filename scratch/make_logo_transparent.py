import os
from PIL import Image

def make_outer_white_transparent(image_path, output_path):
    # Open the image
    img = Image.open(image_path)
    img = img.convert("RGBA")
    width, height = img.size
    pixels = img.load()
    
    # Flood fill starting from the corners
    visited = set()
    queue = []
    
    # Let's seed queue with all border pixels to make absolutely sure we catch all outer background pixels
    for x in range(width):
        queue.append((x, 0))
        queue.append((x, height - 1))
        visited.add((x, 0))
        visited.add((x, height - 1))
    for y in range(height):
        queue.append((0, y))
        queue.append((width - 1, y))
        visited.add((0, y))
        visited.add((width - 1, y))
        
    # We want to fill near-white pixels. Let's define near-white as R, G, B all > 240.
    def is_target(x, y):
        r, g, b, a = pixels[x, y]
        return r > 240 and g > 240 and b > 240
        
    while queue:
        x, y = queue.pop(0)
        # Check if the pixel is near-white
        if is_target(x, y):
            # Set pixel to fully transparent (0, 0, 0, 0)
            # We keep colors as black with 0 alpha or keep original color with 0 alpha
            r, g, b, a = pixels[x, y]
            pixels[x, y] = (r, g, b, 0)
            
            # Add neighbors
            for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
                nx, ny = x + dx, y + dy
                if 0 <= nx < width and 0 <= ny < height:
                    if (nx, ny) not in visited:
                        visited.add((nx, ny))
                        queue.append((nx, ny))
                        
    # Save the modified image
    img.save(output_path, "PNG")
    print(f"Successfully processed {image_path} and saved transparent version to {output_path}")

if __name__ == "__main__":
    src_path = "/Users/thomasknutsen/Documents/His Kingdom Prophets/src/assets/logo.png"
    make_outer_white_transparent(src_path, src_path)
