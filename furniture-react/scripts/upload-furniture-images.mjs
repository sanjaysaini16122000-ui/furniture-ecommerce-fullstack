/**
 * Upload Script: Uploads images from the Chair folder to Firebase Storage
 * and creates furniture entries in Firestore across ALL categories.
 * 
 * Usage: node scripts/upload-furniture-images.mjs
 * 
 * This distributes the 53 Chair images evenly across all categories,
 * approximately 5 images per category (with extras going to initial categories).
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { readFileSync, readdirSync } from 'fs';
import { join, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Firebase config (same as .env)
const firebaseConfig = {
    apiKey: 'AIzaSyCJRRwShfB9rtk9LKXgrNQAnv2T8-3YclQ',
    authDomain: 'the-urban-karigar-c92b0.firebaseapp.com',
    projectId: 'the-urban-karigar-c92b0',
    storageBucket: 'the-urban-karigar-c92b0.firebasestorage.app',
    messagingSenderId: '960206465278',
    appId: '1:960206465278:web:34dd7e4c4741f73b129daf'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

// All furniture categories (matching the website)
const ALL_CATEGORIES = [
    'Sofa Sets',
    'Beds',
    'Wardrobes',
    'Dining',
    'TV Units',
    'Center Tables',
    'Study Tables',
    'Dressing Tables',
    'Shoe Racks',
    'Temple Units',
    'Custom'
];

// Realistic product name templates per category
const PRODUCT_NAMES = {
    'Sofa Sets': ['Royal Chesterfield Sofa', 'Modern L-Shape Sofa', 'Classic 3-Seater Sofa', 'Luxury Recliner Set', 'Fabric Corner Sofa', 'Premium Leather Sofa', 'Scandinavian Sofa', 'Minimalist Sofa Set', 'Velvet Tufted Sofa', 'Sectional Sofa Set'],
    'Beds': ['King Size Platform Bed', 'Queen Storage Bed', 'Modern Upholstered Bed', 'Wooden Four Poster Bed', 'Minimalist Bed Frame', 'Luxury Panel Bed', 'Floating Bed Design', 'Classic Sleigh Bed', 'Storage Hydraulic Bed', 'Contemporary Bed Set'],
    'Wardrobes': ['Walk-in Wardrobe', 'Sliding Door Wardrobe', 'Mirror Wardrobe', 'Corner Wardrobe', 'Modular Wardrobe System', 'Classic Wooden Wardrobe', 'Built-in Wardrobe', 'Luxury Dressing Room', 'Compact Wardrobe', 'Premium Wardrobe Set'],
    'Dining': ['6-Seater Dining Table', '4-Seater Marble Top', 'Extendable Dining Set', 'Round Dining Table', 'Glass Top Dining Set', 'Rustic Wood Dining', 'Modern Dining Suite', 'Compact Dining Set', 'Luxury Dining Collection', 'Contemporary Dining Table'],
    'TV Units': ['Floating TV Unit', 'Wall-mounted Media Console', 'Modern TV Cabinet', 'Entertainment Center', 'Minimalist TV Stand', 'LED TV Unit', 'Wooden TV Console', 'Modular TV Wall Unit', 'Contemporary TV Panel', 'Premium Media Unit'],
    'Center Tables': ['Marble Top Center Table', 'Wooden Coffee Table', 'Glass Center Table', 'Nesting Table Set', 'Round Coffee Table', 'Modern Side Table', 'Lift-Top Coffee Table', 'Industrial Center Table', 'Oval Coffee Table', 'Designer Center Table'],
    'Study Tables': ['Ergonomic Study Desk', 'L-Shaped Computer Desk', 'Compact Study Table', 'Executive Office Desk', 'Standing Desk', 'Corner Study Table', 'Wooden Writing Desk', 'Modern Work Station', 'Foldable Study Table', 'Kids Study Desk'],
    'Dressing Tables': ['Vanity Dressing Table', 'Mirror Console Table', 'Modern Makeup Station', 'Classic Dressing Unit', 'Wall-mounted Vanity', 'Luxury Dressing Console', 'Compact Dressing Table', 'LED Mirror Vanity', 'Corner Dressing Table', 'Designer Vanity Set'],
    'Shoe Racks': ['Multi-tier Shoe Rack', 'Wooden Shoe Cabinet', 'Entryway Shoe Storage', 'Modern Shoe Organizer', 'Rotating Shoe Rack', 'Slimline Shoe Cabinet', 'Open Shoe Shelf', 'Bench Shoe Storage', 'Wall-mount Shoe Rack', 'Premium Shoe Cabinet'],
    'Temple Units': ['Wooden Temple Unit', 'Wall-mounted Mandir', 'Modern Pooja Unit', 'Traditional Temple Design', 'LED Temple Unit', 'Compact Mandir', 'Marble Temple Unit', 'Custom Pooja Room', 'Corner Temple Unit', 'Premium Mandir Design'],
    'Custom': ['Custom Furniture Piece', 'Bespoke Design', 'Tailored Interior', 'Custom Built Unit', 'Personalized Design', 'Made-to-Order Set', 'Custom WoodWork', 'Artisan Handcraft', 'Unique Design Piece', 'Premium Custom Build']
};

// Price ranges per category (min, max)
const PRICE_RANGES = {
    'Sofa Sets': [25000, 150000],
    'Beds': [15000, 120000],
    'Wardrobes': [20000, 180000],
    'Dining': [12000, 90000],
    'TV Units': [8000, 60000],
    'Center Tables': [5000, 35000],
    'Study Tables': [6000, 40000],
    'Dressing Tables': [8000, 50000],
    'Shoe Racks': [3000, 20000],
    'Temple Units': [5000, 45000],
    'Custom': [10000, 200000]
};

// Feature templates per category
const FEATURES = {
    'Sofa Sets': ['Premium upholstery', 'High-density foam', 'Sturdy wooden frame', 'Stain-resistant fabric'],
    'Beds': ['Solid wood construction', 'Built-in storage', 'Anti-sag support', 'Premium finish'],
    'Wardrobes': ['Soft-close hinges', 'Full mirror option', 'Modular shelving', 'Anti-rust fittings'],
    'Dining': ['Scratch-resistant top', 'Comfortable chairs', 'Easy to clean', 'Sturdy base'],
    'TV Units': ['Cable management', 'LED light panel', 'Concealed storage', 'Wall-mount option'],
    'Center Tables': ['Tempered glass', 'Anti-scratch coating', 'Modern design', 'Easy assembly'],
    'Study Tables': ['Ergonomic design', 'Cable management', 'Drawer storage', 'Adjustable height'],
    'Dressing Tables': ['LED mirror', 'Jewelry organizer', 'Soft-close drawers', 'Velvet-lined storage'],
    'Shoe Racks': ['Ventilated shelves', 'Easy assembly', 'Dust-proof doors', 'Compact design'],
    'Temple Units': ['Handcrafted details', 'LED lighting', 'Solid wood', 'Traditional motifs'],
    'Custom': ['Fully customizable', 'Premium materials', 'Expert craftsmanship', 'Free installation']
};

function getRandomPrice(category) {
    const [min, max] = PRICE_RANGES[category];
    // Round to nearest 500
    return Math.round((Math.random() * (max - min) + min) / 500) * 500;
}

async function uploadImageToStorage(filePath, category) {
    const fileName = basename(filePath);
    const storagePath = `furniture/${category.toLowerCase().replace(/\s+/g, '-')}/${Date.now()}_${fileName}`;
    const storageRef = ref(storage, storagePath);

    const fileBuffer = readFileSync(filePath);
    // Create a Uint8Array from the buffer
    const uint8Array = new Uint8Array(fileBuffer);

    console.log(`  📤 Uploading ${fileName}...`);
    const snapshot = await uploadBytes(storageRef, uint8Array, {
        contentType: 'image/jpeg'
    });
    const downloadURL = await getDownloadURL(snapshot.ref);
    console.log(`  ✅ Uploaded: ${downloadURL.substring(0, 80)}...`);
    return downloadURL;
}

async function createFurnitureEntry(category, imageUrl, productIndex) {
    const names = PRODUCT_NAMES[category] || PRODUCT_NAMES['Custom'];
    const name = names[productIndex % names.length];
    const price = getRandomPrice(category);
    const features = FEATURES[category] || FEATURES['Custom'];

    const data = {
        name: name,
        category: category,
        price: price,
        description: `Premium ${category.toLowerCase()} crafted with attention to detail. Made from finest materials with modern design aesthetics.`,
        features: features,
        images: [imageUrl],
        createdAt: serverTimestamp()
    };

    const docRef = await addDoc(collection(db, 'furniture'), data);
    console.log(`  📝 Created: "${name}" (₹${price.toLocaleString('en-IN')}) → ${docRef.id}`);
    return docRef.id;
}

async function main() {
    console.log('🚀 Furniture Image Upload Script');
    console.log('================================\n');

    // Read images from Chair folder
    const chairFolder = join(__dirname, '..', 'Chair');
    const allImages = readdirSync(chairFolder)
        .filter(f => f.match(/\.(jpg|jpeg|png|webp)$/i))
        .sort();

    console.log(`📁 Found ${allImages.length} images in Chair/`);
    console.log(`📋 Categories: ${ALL_CATEGORIES.length}\n`);

    // Distribute images: ~5 per category (53 images / 11 categories ≈ 4.8)
    const imagesPerCategory = Math.floor(allImages.length / ALL_CATEGORIES.length);
    let imageIndex = 0;

    for (const category of ALL_CATEGORIES) {
        // Give each category its share, last category gets remaining
        const isLastCategory = category === ALL_CATEGORIES[ALL_CATEGORIES.length - 1];
        const count = isLastCategory
            ? allImages.length - imageIndex
            : imagesPerCategory;

        console.log(`\n🏷️  ${category} (${count} images)`);
        console.log('-'.repeat(40));

        for (let i = 0; i < count && imageIndex < allImages.length; i++) {
            const imageName = allImages[imageIndex];
            const imagePath = join(chairFolder, imageName);

            try {
                // Upload image to Firebase Storage
                const imageUrl = await uploadImageToStorage(imagePath, category);

                // Create Firestore entry
                await createFurnitureEntry(category, imageUrl, i);
            } catch (error) {
                console.error(`  ❌ Error with ${imageName}: ${error.message}`);
            }

            imageIndex++;
        }
    }

    console.log('\n================================');
    console.log(`✅ Done! Uploaded ${imageIndex} images across ${ALL_CATEGORIES.length} categories.`);
    console.log('🔄 Refresh your website to see the new products.\n');

    process.exit(0);
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});
