/**
 * 🔧 Seed Script (No Images) — Delete old products & add new ones
 * 
 * ⚠️  This script seeds products WITHOUT images.
 *     For seeding WITH images (Pexels → Firebase Storage), use:
 *     node scripts/seedWithImages.mjs
 * 
 * Usage:
 *   node scripts/seedProducts.mjs
 * 
 * This script:
 *  1. Reads Firebase config from .env
 *  2. Deletes ALL existing products from the 'furniture' collection
 *  3. Adds new sample products with: originalPrice, rating, features, finishes
 *  4. Updates categories in settings
 */

import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, addDoc, deleteDoc, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// --- Load .env manually (no dotenv dependency needed) ---
function loadEnv() {
    try {
        const envPath = resolve(__dirname, '..', '.env');
        const envContent = readFileSync(envPath, 'utf8');
        const vars = {};
        for (const line of envContent.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;
            const eqIdx = trimmed.indexOf('=');
            if (eqIdx === -1) continue;
            const key = trimmed.slice(0, eqIdx).trim();
            const value = trimmed.slice(eqIdx + 1).trim();
            vars[key] = value;
        }
        return vars;
    } catch (e) {
        console.error('❌ Could not read .env file:', e.message);
        process.exit(1);
    }
}

const env = loadEnv();

// --- Firebase Init ---
const firebaseConfig = {
    apiKey: env.VITE_FIREBASE_API_KEY,
    authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.VITE_FIREBASE_APP_ID,
};

console.log('🔥 Firebase Project:', firebaseConfig.projectId);
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ================================================================
//  SAMPLE PRODUCTS — Edit these to your liking!
// ================================================================

const SAMPLE_PRODUCTS = [
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
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
        images: []
    },
];

const CATEGORIES = [
    'Beds', 'Sofa Sets', 'Wardrobes', 'Dining',
    'TV Units', 'Center Tables', 'Study Tables',
    'Dressing Tables', 'Shoe Racks', 'Temple Units'
];

// ================================================================
//  SCRIPT EXECUTION
// ================================================================

async function main() {
    console.log('\n================================================');
    console.log('  🪑 Furniture Seed Script');
    console.log('================================================\n');

    // Step 1: Delete all old products
    console.log('🗑️  Step 1: Deleting all existing products...');
    const furnitureRef = collection(db, 'furniture');
    const snapshot = await getDocs(furnitureRef);
    const deleteCount = snapshot.docs.length;

    for (const docSnap of snapshot.docs) {
        await deleteDoc(doc(db, 'furniture', docSnap.id));
    }
    console.log(`   ✅ Deleted ${deleteCount} old products\n`);

    // Step 2: Add new products
    console.log(`📦 Step 2: Adding ${SAMPLE_PRODUCTS.length} new products...`);
    for (const product of SAMPLE_PRODUCTS) {
        const docRef = await addDoc(collection(db, 'furniture'), {
            ...product,
            createdAt: serverTimestamp()
        });
        console.log(`   ✅ Added: ${product.name} (${product.category}) → ${docRef.id}`);
    }
    console.log('');

    // Step 3: Update categories
    console.log('📁 Step 3: Updating categories...');
    const settingsRef = doc(db, 'settings', 'main');
    const settingsSnap = await getDoc(settingsRef);
    const existingSettings = settingsSnap.exists() ? settingsSnap.data() : {};
    await setDoc(settingsRef, {
        ...existingSettings,
        categories: CATEGORIES
    }, { merge: true });
    console.log(`   ✅ Set ${CATEGORIES.length} categories\n`);

    // Summary
    console.log('================================================');
    console.log('  🎉 Seed complete!');
    console.log(`  • ${deleteCount} old products deleted`);
    console.log(`  • ${SAMPLE_PRODUCTS.length} new products added`);
    console.log(`  • ${CATEGORIES.length} categories set`);
    console.log('================================================\n');
    console.log('👉 Refresh your app to see the new products!\n');

    process.exit(0);
}

main().catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});
