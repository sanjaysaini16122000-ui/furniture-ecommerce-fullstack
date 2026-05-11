/**
 * 🔧 Seed Script — Read CSVs + Upload LOCAL images to Firebase Storage & seed Firestore
 * 
 * Data sources:
 *   • solidwood_beds.csv         (17 bed products)
 *   • solidwood_all_products.csv (85 products: Bar cabinet, Chairs, Dining, Coffee tables, etc.)
 *   • downloaded_images/         (local image files)
 * 
 * What this script does:
 *   1. Parses both CSV files
 *   2. Uploads local images to Firebase Storage
 *   3. Deletes ALL existing products from Firestore 'furniture' collection
 *   4. Adds all new products with images, price, description, features, finishes
 *   5. Updates categories in Firestore settings
 * 
 * Prerequisites:
 *   1. Download your Firebase service account key:
 *      - Go to: https://console.firebase.google.com/project/the-urban-karigar-c92b0/settings/serviceaccounts/adminsdk
 *      - Click "Generate new private key"
 *      - Save the JSON file as: scripts/serviceAccountKey.json
 * 
 *   2. Run: node scripts/seedFromCSV.mjs
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname, join, basename, extname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// ================================================================
//  CONFIGURATION
// ================================================================

const SERVICE_ACCOUNT_PATH = resolve(__dirname, 'serviceAccountKey.json');
const STORAGE_BUCKET = 'the-urban-karigar-c92b0.firebasestorage.app';

// CSV file paths
const BEDS_CSV = join(ROOT, 'solidwood_beds.csv');
const PRODUCTS_CSV = join(ROOT, 'solidwood_all_products.csv');

// Downloaded images root directory
const IMAGES_ROOT = join(ROOT, 'downloaded_images');

// ================================================================
//  HELPERS
// ================================================================

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

// Simple CSV parser that handles quoted fields with commas
function parseCSV(csvText) {
    const lines = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
    if (lines.length < 2) return [];

    const headers = parseCSVLine(lines[0]);
    const results = [];

    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;

        const values = parseCSVLine(line);
        const row = {};
        headers.forEach((header, index) => {
            row[header.trim()] = (values[index] || '').trim();
        });
        results.push(row);
    }

    return results;
}

// Parse a single CSV line, handling quoted fields
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];

        if (char === '"') {
            if (inQuotes && i + 1 < line.length && line[i + 1] === '"') {
                current += '"';
                i++; // skip escaped quote
            } else {
                inQuotes = !inQuotes;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current);
    return result;
}

// Parse the downloaded_images field from CSV (comma-separated paths with backslashes)
function parseImagePaths(imagesField) {
    if (!imagesField) return [];
    return imagesField
        .split(',')
        .map(p => p.trim())
        .filter(p => p.length > 0)
        .map(p => p.replace(/\\\\/g, '/').replace(/\\/g, '/')) // normalize path separators
        .map(p => join(ROOT, ...p.split('/'))); // build absolute path
}

// Generate a slug from a string
function slugify(text) {
    return text
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

// Generate description based on product title and category
function generateDescription(title, category) {
    const descriptions = {
        'Beds': `Premium ${title} crafted from solid Sheesham wood. Features expert craftsmanship with a rich honey finish that adds warmth and elegance to your bedroom. Built to last with termite-resistant treatment.`,
        'Bar cabinet': `Elegant ${title} made from premium Sheesham wood. Perfect for entertaining guests with ample storage for bottles and glassware. Features a beautiful honey finish.`,
        'Chairs': `Comfortable ${title} handcrafted from solid Sheesham wood. Features ergonomic design with a beautiful honey finish. Perfect blend of style and comfort.`,
        'Dining': `Stunning ${title} crafted from solid Sheesham wood with expert craftsmanship. The honey finish adds warmth and elegance to your dining space. Built for durability and style.`,
        'Coffee tables': `Beautiful ${title} made from premium Sheesham wood. Features a stunning honey finish with expert craftsmanship. A perfect centerpiece for your living room.`,
        'Shoe rack': `Practical and stylish ${title} crafted from solid Sheesham wood. Features a honey finish with ample storage space. Keeps your entryway organized and elegant.`,
        'Sofa': `Luxurious ${title} crafted from premium Sheesham wood with high-quality cushions. The honey finish adds warmth to any living room. Designed for ultimate comfort.`,
        'Study tables': `Functional ${title} made from solid Sheesham wood. Features a honey finish with ample workspace. Perfect for your home office or study room.`,
        'Wall bracket': `Decorative ${title} handcrafted from solid Sheesham wood. Features a honey finish that complements any wall decor. Easy to install and built to last.`,
    };
    return descriptions[category] || `Premium quality ${title} crafted from solid Sheesham wood with a beautiful honey finish. Expert craftsmanship ensures durability and elegance.`;
}

// Generate features based on category
function generateFeatures(category) {
    const featureMap = {
        'Beds': [
            'Premium Quality Sheesham Wood',
            'Elegant Handcrafted Design',
            'Long-Lasting & Termite Resistant',
            'Smooth Finish with Natural Polish',
            'EMI Option Also Available'
        ],
        'Bar cabinet': [
            'Premium Sheesham Wood Construction',
            'Ample Storage for Bottles & Glasses',
            'Beautiful Honey Finish',
            'Sturdy & Durable Build',
            'EMI Option Also Available'
        ],
        'Chairs': [
            'Solid Sheesham Wood Frame',
            'Ergonomic Comfortable Design',
            'Handcrafted with Precision',
            'Termite & Borer Resistant',
            'EMI Option Also Available'
        ],
        'Dining': [
            'Solid Wood Table Top',
            'Elegant Handcrafted Design',
            'Scratch & Stain Resistant Finish',
            'Long-Lasting & Termite Resistant',
            'EMI Option Also Available'
        ],
        'Coffee tables': [
            'Premium Sheesham Wood',
            'Beautiful Honey Finish',
            'Sturdy & Durable Construction',
            'Perfect Living Room Centerpiece',
            'EMI Option Also Available'
        ],
        'Shoe rack': [
            'Solid Sheesham Wood Construction',
            'Ample Storage Space',
            'Honey Finish Polish',
            'Easy to Assemble',
            'EMI Option Also Available'
        ],
        'Sofa': [
            'Premium Quality Sheesham Wood Frame',
            'High-Density Foam Cushions',
            'Durable & Long-Lasting Construction',
            'Easy to Clean & Maintain',
            'EMI Option Also Available'
        ],
        'Study tables': [
            'Solid Sheesham Wood',
            'Spacious Work Surface',
            'Smooth Honey Finish',
            'Sturdy & Stable Design',
            'EMI Option Also Available'
        ],
        'Wall bracket': [
            'Handcrafted Sheesham Wood',
            'Beautiful Wall-Mount Design',
            'Easy Installation',
            'Durable & Long-Lasting',
            'Honey Finish Polish'
        ],
    };
    return featureMap[category] || [
        'Premium Quality Sheesham Wood',
        'Elegant Handcrafted Design',
        'Long-Lasting & Termite Resistant',
        'Smooth Finish with Natural Polish',
        'EMI Option Also Available'
    ];
}

// Generate finishes
function generateFinishes() {
    return [
        { name: 'Teak', color: '#8B6914' },
        { name: 'Light Walnut', color: '#A0785A' },
        { name: 'Walnut', color: '#5C4033' },
        { name: 'Natural', color: '#D2B48C' },
        { name: 'Honey', color: '#EB9605' },
        { name: 'Mahogany', color: '#420D09' }
    ];
}

// Generate a random rating between 4.2 and 5.0
function generateRating() {
    return Math.round((4.2 + Math.random() * 0.8) * 10) / 10;
}

// Generate original price (1.5x to 2.2x of actual price)
function generateOriginalPrice(price) {
    const multiplier = 1.5 + Math.random() * 0.7;
    return Math.round(price * multiplier / 100) * 100; // round to nearest 100
}

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
    console.log('\n====================================================');
    console.log('  🪑 SolidWood CSV Seed Script');
    console.log('  📸 CSV + Local Images → Firebase Storage → Firestore');
    console.log('====================================================\n');

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

    // ================================================================
    //  Step 1: Parse CSV files
    // ================================================================
    console.log('\n📄 Step 1: Parsing CSV files...\n');

    // Parse beds CSV
    const bedsCSVData = readFileSync(BEDS_CSV, 'utf8');
    const bedsRows = parseCSV(bedsCSVData);
    console.log(`   📋 Beds CSV: ${bedsRows.length} products`);

    // Parse all products CSV
    const productsCSVData = readFileSync(PRODUCTS_CSV, 'utf8');
    const productsRows = parseCSV(productsCSVData);
    console.log(`   📋 Products CSV: ${productsRows.length} products`);

    // Build products array from beds CSV
    const bedProducts = bedsRows.map(row => ({
        name: row.title,
        category: 'Beds',
        price: parseFloat(row.price),
        originalPrice: generateOriginalPrice(parseFloat(row.price)),
        rating: generateRating(),
        description: generateDescription(row.title, 'Beds'),
        features: generateFeatures('Beds'),
        finishes: generateFinishes(),
        productUrl: row.product_url || '',
        _localImages: parseImagePaths(row.downloaded_images),
    }));

    // Build products array from all products CSV
    const otherProducts = productsRows.map(row => ({
        name: row.title,
        category: row.category,
        price: parseFloat(row.price),
        originalPrice: generateOriginalPrice(parseFloat(row.price)),
        rating: generateRating(),
        description: generateDescription(row.title, row.category),
        features: generateFeatures(row.category),
        finishes: generateFinishes(),
        productUrl: row.product_url || '',
        _localImages: parseImagePaths(row.downloaded_images),
    }));

    const allProducts = [...bedProducts, ...otherProducts];
    console.log(`\n   ✅ Total products to seed: ${allProducts.length}`);

    // Collect unique categories
    const categories = [...new Set(allProducts.map(p => p.category))].sort();
    console.log(`   📁 Categories: ${categories.join(', ')}`);

    // ================================================================
    //  Step 2: Upload images to Firebase Storage
    // ================================================================
    console.log('\n📤 Step 2: Uploading local images to Firebase Storage...\n');

    let totalUploaded = 0;
    let totalFailed = 0;
    let totalSkipped = 0;

    for (let i = 0; i < allProducts.length; i++) {
        const product = allProducts[i];
        const localFiles = product._localImages || [];
        product.images = [];

        if (localFiles.length === 0) {
            console.log(`   ⚠️  [${i + 1}/${allProducts.length}] ${product.name} — no local images found`);
            totalSkipped++;
            continue;
        }

        const categorySlug = slugify(product.category);
        const productSlug = slugify(product.name);
        console.log(`   📁 [${i + 1}/${allProducts.length}] ${product.name} (${localFiles.length} images)`);

        // Upload max 5 images per product to save storage and time
        const filesToUpload = localFiles.slice(0, 5);

        for (const localPath of filesToUpload) {
            if (!existsSync(localPath)) {
                console.log(`      ⚠️  File not found: ${basename(localPath)}`);
                totalSkipped++;
                continue;
            }

            const fileName = basename(localPath);
            const storagePath = `furniture/${categorySlug}/${productSlug}/${fileName}`;

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

    console.log(`\n   📊 Upload Results:`);
    console.log(`      ✅ ${totalUploaded} uploaded`);
    console.log(`      ❌ ${totalFailed} failed`);
    console.log(`      ⚠️  ${totalSkipped} skipped\n`);

    // ================================================================
    //  Step 3: Delete ALL existing products
    // ================================================================
    console.log('🗑️  Step 3: Deleting all existing products...');
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

    // ================================================================
    //  Step 4: Add new products to Firestore
    // ================================================================
    console.log(`📦 Step 4: Adding ${allProducts.length} new products...\n`);

    let addedCount = 0;
    for (const product of allProducts) {
        // Remove internal fields before saving
        const { _localImages, ...productData } = product;

        const docRef = await furnitureRef.add({
            ...productData,
            createdAt: FieldValue.serverTimestamp()
        });
        addedCount++;
        console.log(`   ✅ [${addedCount}/${allProducts.length}] ${product.name} (${product.category}) — ${product.images.length} image(s) → ${docRef.id}`);
    }
    console.log('');

    // ================================================================
    //  Step 5: Update categories
    // ================================================================
    console.log('📁 Step 5: Updating categories...');
    const settingsRef = db.doc('settings/main');
    const settingsSnap = await settingsRef.get();
    const existingSettings = settingsSnap.exists ? settingsSnap.data() : {};
    await settingsRef.set({
        ...existingSettings,
        categories: categories,
    }, { merge: true });
    console.log(`   ✅ Set ${categories.length} categories: ${categories.join(', ')}\n`);

    // ================================================================
    //  Summary
    // ================================================================
    console.log('====================================================');
    console.log('  🎉 Seed complete!');
    console.log(`  • ${deleteCount} old products deleted`);
    console.log(`  • ${allProducts.length} new products added`);
    console.log(`    - ${bedProducts.length} beds (from solidwood_beds.csv)`);
    console.log(`    - ${otherProducts.length} other products (from solidwood_all_products.csv)`);
    console.log(`  • ${totalUploaded} images uploaded to Firebase Storage`);
    console.log(`  • ${categories.length} categories set`);
    console.log('====================================================\n');
    console.log('👉 Refresh your app to see the new products!\n');

    process.exit(0);
}

main().catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});
