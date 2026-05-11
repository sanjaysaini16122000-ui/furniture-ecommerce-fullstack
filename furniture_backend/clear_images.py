#!/usr/bin/env python
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.base')
django.setup()

from products.models import ProductImage

# Get all images
images = ProductImage.objects.all()
print(f"Total images in database: {images.count()}")

for img in images:
    print(f"Deleting: {img.image.name}")
    img.delete()

print("All image records cleared!")
