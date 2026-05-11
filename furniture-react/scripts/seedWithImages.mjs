/**
 * 🔧 Seed Script — Upload LOCAL images to Firebase Storage & seed Firestore
 * 
 * Uses your own images from:
 *   • public/images/products/  (12 product images)
 *   • Chair/                   (53 product photos)
 * 
 * Prerequisites:
 *   1. Download your Firebase service account key:
 *      - Go to: https://console.firebase.google.com/project/the-urban-karigar-c92b0/settings/serviceaccounts/adminsdk
 *      - Click "Generate new private key"
 *      - Save the JSON file as: scripts/serviceAccountKey.json
 * 
 *   2. Run: node scripts/seedWithImages.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { resolve, dirname, join, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ================================================================
//  CONFIGURATION
// ================================================================

const SERVICE_ACCOUNT_PATH = resolve(__dirname, 'serviceAccountKey.json');
const STORAGE_BUCKET = 'the-urban-karigar-c92b0.firebasestorage.app';

// ================================================================
//  LOCAL IMAGE SOURCES — Map each product to local image files
// ================================================================

// Images from public/images/products/
const PRODUCTS_DIR = join(ROOT, 'public', 'images', 'products');
// Images from public/images/ (category showcase)
const IMAGES_DIR = join(ROOT, 'public', 'images');
// Chair folder (real product photos)
const CHAIR_DIR = join(ROOT, 'Chair');

// Get content type from extension
function getContentType(filePath) {
    const ext = extname(filePath).toLowerCase();
    const types = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png', '.webp': 'image/webp',
        '.gif': 'image/gif',
    };
    return types[ext] || 'image/jpeg';
}

// Get all image files from a directory
function getImageFiles(dir) {
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
        .filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f))
        .sort()
        .map(f => join(dir, f));
}

// ================================================================
//  IMAGE ASSIGNMENT — Map local images to each product
// ================================================================

// Product images from public/images/products/
const productImages = {
    beds: [
        join(PRODUCTS_DIR, 'bed-kingsize.png'),
        join(PRODUCTS_DIR, 'bed-queen.png'),
        join(IMAGES_DIR, 'king-size-bed.png'),
        join(IMAGES_DIR, 'queen-size-bed.png'),
    ],
    sofa_sets: [
        join(PRODUCTS_DIR, 'sofa-lshape.png'),
        join(PRODUCTS_DIR, 'sofa-3seater.png'),
        join(IMAGES_DIR, 'l-shape-sofa.png'),
        join(IMAGES_DIR, 'three-seater-sofa.png'),
    ],
    wardrobes: [
        join(PRODUCTS_DIR, 'wardrobe-sliding.png'),
        join(PRODUCTS_DIR, 'wardrobe-walkin.png'),
        join(IMAGES_DIR, 'sliding-wardrobe.png'),
    ],
    dining: [
        join(PRODUCTS_DIR, 'dining-6seater.png'),
        join(PRODUCTS_DIR, 'dining-marble.png'),
        join(IMAGES_DIR, 'dining-table.png'),
    ],
    tv_units: [
        join(PRODUCTS_DIR, 'tvunit-modern.png'),
        join(IMAGES_DIR, 'tv-unit.png'),
    ],
    study_tables: [
        join(PRODUCTS_DIR, 'studytable-executive.png'),
    ],
    center_tables: [
        join(PRODUCTS_DIR, 'centertable-glass.png'),
        join(PRODUCTS_DIR, 'centertable-marble.png'),
    ],
};

// Chair folder images — distributed across remaining categories
const chairImages = getImageFiles(CHAIR_DIR);

// ================================================================
//  PRODUCTS DATA
// ================================================================

function buildProducts(imageMap) {
    return [
        // ===== BEDS =====
        {
            name: 'Arch King Size Bed in Honey Finish Without Storage',
            category: 'Beds',
            price: 29999,
            originalPrice: 66898,
            rating: 4.8,
            description: 'Elegant king size bed with arch headboard, crafted from premium Sheesham wood. The honey finish adds warmth to any bedroom.',
            features: [
                'Premium Quality Sheesham Wood',
                'Elegant Handcrafted Design',
                'Long-Lasting & Termite Resistant',
                'Smooth Finish with Natural Polish',
                'EMI Option Also Available'
            ],
            finishes: [
                { name: 'Teak', color: '#8B6914' },
                { name: 'Light Walnut', color: '#A0785A' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Natural', color: '#D2B48C' },
                { name: 'Honey', color: '#EB9605' },
                { name: 'Mahogany', color: '#420D09' }
            ],
            _localImages: pickLocal(imageMap, 'beds', [0, 1]),
        },
        {
            name: 'Sheesham Wood Queen Bed with Storage',
            category: 'Beds',
            price: 34999,
            originalPrice: 72000,
            rating: 4.7,
            description: 'Spacious queen bed with built-in under-bed storage drawers. Made from solid Sheesham wood with a rich walnut finish.',
            features: [
                'Solid Sheesham Wood Construction',
                'Under-bed Storage Drawers',
                'Queen Size (60" x 78")',
                'Termite & Borer Resistant',
                'Easy Assembly'
            ],
            finishes: [
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Honey', color: '#EB9605' },
                { name: 'Teak', color: '#8B6914' },
                { name: 'Natural', color: '#D2B48C' }
            ],
            _localImages: pickLocal(imageMap, 'beds', [2, 3]),
        },
        {
            name: 'Modern Platform Bed with LED Headboard',
            category: 'Beds',
            price: 42999,
            originalPrice: 85000,
            rating: 4.9,
            description: 'Contemporary platform bed featuring integrated LED lighting in the headboard. Upholstered in premium fabric with solid wood frame.',
            features: [
                'Integrated LED Headboard Lighting',
                'Premium Upholstered Finish',
                'Solid Wood Frame',
                'USB Charging Ports Built-in',
                'EMI Option Also Available'
            ],
            finishes: [
                { name: 'Dark Brown', color: '#3B2316' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Honey', color: '#EB9605' }
            ],
            _localImages: pickLocal(imageMap, 'beds', [0, 2]),
        },

        // ===== SOFA SETS =====
        {
            name: 'Premium 5-Seater L-Shape Sofa Set',
            category: 'Sofa Sets',
            price: 45999,
            originalPrice: 89000,
            rating: 4.6,
            description: 'Luxurious L-shaped sofa set with high-density foam cushions and premium velvet upholstery. Perfect for modern living rooms.',
            features: [
                'Premium Quality Fabric & Wood',
                'Comfortable High-Density Foam',
                'Durable & Long-Lasting Frame',
                'Easy to Clean & Maintain',
                'EMI Option Also Available'
            ],
            finishes: [
                { name: 'Navy Blue', color: '#1B2A4A' },
                { name: 'Charcoal Grey', color: '#4A4A4A' },
                { name: 'Beige', color: '#D5C4A1' },
                { name: 'Forest Green', color: '#2D5F2D' }
            ],
            _localImages: pickLocal(imageMap, 'sofa_sets', [0, 2]),
        },
        {
            name: 'Classic 3+1+1 Wooden Sofa Set',
            category: 'Sofa Sets',
            price: 38500,
            originalPrice: 75000,
            rating: 4.5,
            description: 'Traditional wooden sofa set with plush cushions. Includes 3-seater, and two single-seater chairs crafted from Sheesham wood.',
            features: [
                'Solid Sheesham Wood Frame',
                'Removable & Washable Cushion Covers',
                'Comfortable Spring Support',
                'Elegant Carved Armrests',
                'EMI Option Also Available'
            ],
            finishes: [
                { name: 'Teak', color: '#8B6914' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Natural', color: '#D2B48C' },
                { name: 'Honey', color: '#EB9605' }
            ],
            _localImages: pickLocal(imageMap, 'sofa_sets', [1, 3]),
        },
        {
            name: 'Modern 4-Seater Recliner Sofa',
            category: 'Sofa Sets',
            price: 59999,
            originalPrice: 120000,
            rating: 4.8,
            description: 'Premium 4-seater recliner sofa with power recline mechanism. Features built-in cup holders and USB charging.',
            features: [
                'Power Recliner Mechanism',
                'Built-in USB Charging',
                'Integrated Cup Holders',
                'Premium Leatherette Upholstery',
                'EMI Option Also Available'
            ],
            finishes: [
                { name: 'Dark Brown', color: '#3B2316' },
                { name: 'Black', color: '#1A1A1A' },
                { name: 'Tan', color: '#C19A6B' }
            ],
            _localImages: pickLocal(imageMap, 'sofa_sets', [0, 1]),
        },

        // ===== WARDROBES =====
        {
            name: 'Sheesham 3-Door Wardrobe with Mirror',
            category: 'Wardrobes',
            price: 32999,
            originalPrice: 65000,
            rating: 4.7,
            description: 'Spacious three-door wardrobe with full-length mirror and multiple shelves. Solid Sheesham construction.',
            features: [
                'Solid Wood Construction',
                'Full-Length Mirror Door',
                'Ample Storage Space',
                'Smooth Sliding Doors',
                'Termite Resistant Treatment'
            ],
            finishes: [
                { name: 'Teak', color: '#8B6914' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Light Walnut', color: '#A0785A' },
                { name: 'Mahogany', color: '#420D09' }
            ],
            _localImages: pickLocal(imageMap, 'wardrobes', [0, 2]),
        },
        {
            name: 'Modern Sliding Door Wardrobe',
            category: 'Wardrobes',
            price: 45000,
            originalPrice: 90000,
            rating: 4.6,
            description: 'Contemporary sliding door wardrobe with soft-close mechanism. Features organized internal compartments and hanging space.',
            features: [
                'Soft-close Sliding Doors',
                'Internal LED Lighting',
                'Multiple Compartments',
                'Full Hanging Space',
                'EMI Option Also Available'
            ],
            finishes: [
                { name: 'Natural', color: '#D2B48C' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Honey', color: '#EB9605' }
            ],
            _localImages: pickLocal(imageMap, 'wardrobes', [1, 2]),
        },

        // ===== DINING =====
        {
            name: 'Sheesham 6-Seater Dining Table Set',
            category: 'Dining',
            price: 35999,
            originalPrice: 70000,
            rating: 4.9,
            description: 'Elegant 6-seater dining set with cushioned chairs. The table features a beautiful grain pattern in natural Sheesham.',
            features: [
                'Solid Wood Table Top',
                'Elegant Handcrafted Design',
                'Seats 6 People Comfortably',
                'Scratch & Stain Resistant Finish',
                'EMI Option Also Available'
            ],
            finishes: [
                { name: 'Teak', color: '#8B6914' },
                { name: 'Honey', color: '#EB9605' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Natural', color: '#D2B48C' }
            ],
            _localImages: pickLocal(imageMap, 'dining', [0, 2]),
        },
        {
            name: 'Round 4-Seater Dining Table',
            category: 'Dining',
            price: 24999,
            originalPrice: 48000,
            rating: 4.5,
            description: 'Compact round dining table perfect for small spaces. Comes with 4 matching chairs with padded seats.',
            features: [
                'Space-Saving Round Design',
                'Solid Wood Construction',
                'Padded Chair Seats',
                'Easy to Clean Surface',
                'EMI Option Also Available'
            ],
            finishes: [
                { name: 'Natural', color: '#D2B48C' },
                { name: 'Honey', color: '#EB9605' },
                { name: 'Teak', color: '#8B6914' }
            ],
            _localImages: pickLocal(imageMap, 'dining', [1, 2]),
        },

        // ===== TV UNITS =====
        {
            name: 'Sheesham TV Unit with Cabinets',
            category: 'TV Units',
            price: 18999,
            originalPrice: 38000,
            rating: 4.4,
            description: 'Functional TV unit with closed cabinets and open shelves. Accommodates TVs up to 65 inches with cable management.',
            features: [
                'Fits TVs up to 65 inches',
                'Built-in Cable Management',
                'Closed Storage Cabinets',
                'Open Display Shelves',
                'Solid Wood Construction'
            ],
            finishes: [
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Teak', color: '#8B6914' },
                { name: 'Honey', color: '#EB9605' },
                { name: 'Natural', color: '#D2B48C' }
            ],
            _localImages: pickLocal(imageMap, 'tv_units', [0, 1]),
        },
        {
            name: 'Wall-Mounted Floating TV Unit',
            category: 'TV Units',
            price: 14999,
            originalPrice: 30000,
            rating: 4.3,
            description: 'Sleek wall-mounted TV unit with floating design. Perfect for modern interiors with hidden storage.',
            features: [
                'Wall-Mounted Floating Design',
                'Hidden Storage Compartments',
                'Fits TVs up to 55 inches',
                'Premium Engineered Wood',
                'Easy Installation Kit Included'
            ],
            finishes: [
                { name: 'Dark Brown', color: '#3B2316' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Natural', color: '#D2B48C' }
            ],
            _localImages: pickLocal(imageMap, 'tv_units', [0]),
        },

        // ===== STUDY TABLES =====
        {
            name: 'Sheesham Study Table with Drawers',
            category: 'Study Tables',
            price: 12999,
            originalPrice: 26000,
            rating: 4.6,
            description: 'Ergonomic study table with multiple drawers and open shelving. Crafted from solid Sheesham wood.',
            features: [
                'Solid Sheesham Wood',
                'Multiple Storage Drawers',
                'Spacious Work Surface',
                'Built-in Bookshelf',
                'Cable Management Hole'
            ],
            finishes: [
                { name: 'Teak', color: '#8B6914' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Natural', color: '#D2B48C' },
                { name: 'Honey', color: '#EB9605' }
            ],
            _localImages: pickLocal(imageMap, 'study_tables', [0]),
        },

        // ===== CENTER TABLES =====
        {
            name: 'Sheesham Center Table with Glass Top',
            category: 'Center Tables',
            price: 9999,
            originalPrice: 20000,
            rating: 4.5,
            description: 'Beautiful center table with tempered glass top and solid Sheesham wood frame. Perfect for living rooms.',
            features: [
                'Tempered Glass Top',
                'Solid Wood Frame',
                'Elegant Design',
                'Lower Storage Shelf',
                'Non-Scratch Rubber Feet'
            ],
            finishes: [
                { name: 'Teak', color: '#8B6914' },
                { name: 'Walnut', color: '#5C4033' },
                { name: 'Natural', color: '#D2B48C' }
            ],
            _localImages: pickLocal(imageMap, 'center_tables', [0, 1]),
        },

        // ===== SHOE RACKS =====
        {
            name: 'Sheesham Shoe Rack with Seat',
            category: 'Shoe Racks',
            price: 7999,
            originalPrice: 16000,
            rating: 4.3,
            description: 'Practical shoe rack with integrated seating bench. Stores up to 12 pairs of shoes.',
            features: [
                'Integrated Seating Bench',
                'Stores 12 Pairs of Shoes',
                'Solid Wood Construction',
                'Open Shelf Design',
                'Easy to Clean'
            ],
            finishes: [
                { name: 'Honey', color: '#EB9605' },
                { name: 'Teak', color: '#8B6914' },
                { name: 'Natural', color: '#D2B48C' }
            ],
            _localImages: pickChair(0, 2),
        },

        // ===== DRESSING TABLES =====
        {
            name: 'Sheesham Dressing Table with Mirror & Stool',
            category: 'Dressing Tables',
            price: 15999,
            originalPrice: 32000,
            rating: 4.7,
            description: 'Elegant dressing table with adjustable mirror and padded stool. Multiple drawers for cosmetics and accessories.',
            features: [
                'Adjustable Full-Size Mirror',
                'Padded Matching Stool',
                'Multiple Storage Drawers',
                'Solid Sheesham Wood',
                'Smooth Finish'
            ],
            finishes: [
                { name: 'Honey', color: '#EB9605' },
                { name: 'Teak', color: '#8B6914' },
                { name: 'Light Walnut', color: '#A0785A' },
                { name: 'Natural', color: '#D2B48C' }
            ],
            _localImages: pickChair(2, 2),
        },

        // ===== TEMPLE UNITS =====
        {
            name: 'Solid Wood Temple Unit with Storage',
            category: 'Temple Units',
            price: 11999,
            originalPrice: 24000,
            rating: 4.9,
            description: 'Beautifully crafted home temple with intricate carvings and lower storage drawer. Made from premium Sheesham.',
            features: [
                'Intricate Handcrafted Carvings',
                'Premium Sheesham Wood',
                'Lower Storage Drawer',
                'Wall-Mountable Design',
                'LED Light Compatible'
            ],
            finishes: [
                { name: 'Natural', color: '#D2B48C' },
                { name: 'Honey', color: '#EB9605' },
                { name: 'Teak', color: '#8B6914' }
            ],
            _localImages: pickChair(4, 2),
        },
    ];
}

// Pick images from product image map
function pickLocal(imageMap, category, indices) {
    const files = imageMap[category] || [];
    return indices.map(i => files[i]).filter(f => f && existsSync(f));
}

// Pick images from Chair folder
function pickChair(startIndex, count) {
    return chairImages.slice(startIndex, startIndex + count).filter(f => existsSync(f));
}

const CATEGORIES = [
    'Beds', 'Sofa Sets', 'Wardrobes', 'Dining',
    'TV Units', 'Center Tables', 'Study Tables',
    'Dressing Tables', 'Shoe Racks', 'Temple Units'
];

// ================================================================
//  UPLOAD HELPER
// ================================================================

async function uploadToStorage(bucket, localPath, destPath) {
    const buffer = readFileSync(localPath);
    const contentType = getContentType(localPath);
    const file = bucket.file(destPath);

    await file.save(buffer, {
        metadata: {
            contentType,
            cacheControl: 'public, max-age=31536000',
        },
    });
    await file.makePublic();
    return `https://storage.googleapis.com/${bucket.name}/${destPath}`;
}

// ================================================================
//  MAIN
// ================================================================

async function main() {
    console.log('\n================================================');
    console.log('  🪑 Furniture Seed Script');
    console.log('  📸 Local Images → Firebase Storage → Firestore');
    console.log('================================================\n');

    // --- Check for service account key ---
    if (!existsSync(SERVICE_ACCOUNT_PATH)) {
        console.error('❌ Service account key not found!');
        console.error('');
        console.error('   Please download it from:');
        console.error('   https://console.firebase.google.com/project/the-urban-karigar-c92b0/settings/serviceaccounts/adminsdk');
        console.error('');
        console.error('   Save the file as:');
        console.error(`   ${SERVICE_ACCOUNT_PATH}`);
        console.error('');
        process.exit(1);
    }

    // --- Init Firebase Admin ---
    const serviceAccount = JSON.parse(readFileSync(SERVICE_ACCOUNT_PATH, 'utf8'));
    const app = initializeApp({
        credential: cert(serviceAccount),
        storageBucket: STORAGE_BUCKET,
    });
    const db = getFirestore(app);
    const bucket = getStorage(app).bucket();

    console.log('🔥 Firebase Project:', serviceAccount.project_id);
    console.log('🪣 Storage Bucket:', STORAGE_BUCKET);

    // --- Show available local images ---
    console.log('\n📸 Local image sources:');
    console.log(`   • public/images/products/ → ${getImageFiles(PRODUCTS_DIR).length} images`);
    console.log(`   • public/images/          → ${getImageFiles(IMAGES_DIR).length} images`);
    console.log(`   • Chair/                  → ${chairImages.length} images`);
    console.log('');

    // --- Step 1: Upload images to Firebase Storage ---
    console.log('📤 Step 1: Uploading local images to Firebase Storage...\n');

    const products = buildProducts(productImages);
    let totalUploaded = 0;
    let totalFailed = 0;

    for (const product of products) {
        const localFiles = product._localImages || [];
        product.images = [];

        if (localFiles.length === 0) {
            console.log(`   ⚠️  ${product.name} — no local images assigned`);
            continue;
        }

        const categorySlug = product.category.toLowerCase().replace(/\s+/g, '-');
        console.log(`   📁 ${product.name}`);

        for (const localPath of localFiles) {
            const fileName = basename(localPath);
            const storagePath = `furniture/${categorySlug}/${fileName}`;

            try {
                process.stdout.write(`      ⬆️  ${fileName}...`);
                const url = await uploadToStorage(bucket, localPath, storagePath);
                product.images.push(url);
                totalUploaded++;
                console.log(' ✅');
            } catch (err) {
                totalFailed++;
                console.log(` ❌ (${err.message})`);
            }
        }
    }

    console.log(`\n   📊 Results: ${totalUploaded} uploaded, ${totalFailed} failed\n`);

    // --- Step 2: Delete old products ---
    console.log('🗑️  Step 2: Deleting all existing products...');
    const furnitureRef = db.collection('furniture');
    const snapshot = await furnitureRef.get();
    const deleteCount = snapshot.docs.length;

    let deleteBatch = db.batch();
    let batchCount = 0;
    for (const docSnap of snapshot.docs) {
        deleteBatch.delete(docSnap.ref);
        batchCount++;
        if (batchCount >= 450) {
            await deleteBatch.commit();
            deleteBatch = db.batch();
            batchCount = 0;
        }
    }
    if (batchCount > 0) await deleteBatch.commit();
    console.log(`   ✅ Deleted ${deleteCount} old products\n`);

    // --- Step 3: Add new products ---
    console.log(`📦 Step 3: Adding ${products.length} new products...`);

    for (const product of products) {
        // Remove internal _localImages field before saving
        const { _localImages, ...productData } = product;
        const docRef = await furnitureRef.add({
            ...productData,
            createdAt: FieldValue.serverTimestamp()
        });
        console.log(`   ✅ ${product.name} (${product.category}) — ${product.images.length} image(s) → ${docRef.id}`);
    }
    console.log('');

    // --- Step 4: Update categories ---
    console.log('📁 Step 4: Updating categories...');
    const settingsRef = db.doc('settings/main');
    const settingsSnap = await settingsRef.get();
    const existingSettings = settingsSnap.exists ? settingsSnap.data() : {};
    await settingsRef.set({
        ...existingSettings,
        categories: CATEGORIES
    }, { merge: true });
    console.log(`   ✅ Set ${CATEGORIES.length} categories\n`);

    // --- Summary ---
    console.log('================================================');
    console.log('  🎉 Seed complete!');
    console.log(`  • ${deleteCount} old products deleted`);
    console.log(`  • ${products.length} new products added`);
    console.log(`  • ${totalUploaded} images uploaded to Firebase Storage`);
    console.log(`  • ${CATEGORIES.length} categories set`);
    console.log('================================================\n');
    console.log('👉 Refresh your app to see the new products!\n');

    process.exit(0);
}

main().catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});
