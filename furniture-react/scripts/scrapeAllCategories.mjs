/**
 * 🕷️ Scrape ALL furniture categories from solidwooddecor.com
 * 
 * Uses the Shopify JSON API (product-url.json) to get structured data
 * including prices, images, and product details.
 * 
 * Usage: node scripts/scrapeAllCategories.mjs
 * Output: scraped-all-furniture.json (in project root)
 */

import { writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// ================================================================
//  ALL CATEGORIES & PRODUCT URLS
// ================================================================

const CATEGORIES = {
    "Bar Cabinet": [
        "swd-bar-trolly",
        "bottle-bar-cabinet",
        "swd-python-bar-cabinet",
        "swd-rustic-bar-cabinet-1",
        "swd-tile-bar-cabinet"
    ],
    "Bed": [
        "tie-king-size-bed-in-honey-finish-without-storage",
        "bad-beige-1",
        "bad-dynamic",
        "bad-wooden-jar-8",
        "bad-carvin-3",
        "wooden-moon",
        "bad-dimond",
        "bad-bloom-2",
        "bad-geomatic",
        "lt-king-size-bed-with-box-storage-in-honey-finish",
        "round-cushion-bed",
        "bad-shape-7",
        "shape-cushion-king-size-bed-in-honey-finish-without-storage",
        "single-bed",
        "supreme-queen-size-bed-with-hydraulic-storage-in-honey-finish",
        "bed-25-08",
        "bad-wovan-9"
    ],
    "Bed Side Table": [
        "bloom-bed-side-table",
        "bottle-bed-side-table",
        "carvin-bed-side-table",
        "swd-cube-bed-side-table",
        "diamond-bed-side-table",
        "swd-grid-bed-side-table",
        "lt-bed-side-table",
        "shape-bed-side-table",
        "woven-bed-side-table"
    ],
    "Book Rack": [
        "magazine-rack",
        "folding-corner-big",
        "swd-glass-wardrobe",
        "magazine-rack-2",
        "1",
        "12",
        "13",
        "2"
    ],
    "Chairs": [
        "swd-doubling-chair",
        "26",
        "cane-dining-chair-in-honey-finish",
        "swd-capsule-dining-chair",
        "swd-coaster-dining-chair",
        "swd-data-dining-chair",
        "swd-grill-chair",
        "swd-grid-chair-set",
        "cushion-dining-chair",
        "swd-rocking-chair",
        "swd-row-dining-chair",
        "rustic-dining-chair-with-cushion-in-honey-finish"
    ],
    "Temple": [
        "swd-bright-temple",
        "round-chowki-25-08",
        "swd-daivik-temple",
        "mandir-jhula",
        "temple-25-08",
        "swd-precious-temple",
        "satkon-chowki",
        "7"
    ],
    "Coffee Tables": [
        "18",
        "22",
        "19",
        "swd-grid-coffee-table",
        "hestia-wood-coffee-table-with-four-stools",
        "swd-puzzle-coffee-table",
        "round-magazine-table",
        "swd-peek-coffee-table",
        "round-coffee-table-with-stool",
        "21",
        "swd-tile-top-coffee-table"
    ],
    "Dining": [
        "kuber-4-seater-dining-seater",
        "kuber-4-seater-dining",
        "kuber-6-seater-dining-set",
        "kuber-6-seater-dining",
        "swd-apex-6-seater-dining-set",
        "swd-brass-plate-6-seater-dining-set",
        "brass-plate-6-seater-dining-table-in-honey-finish",
        "walnut-coffee-color-dining-set",
        "cnc-4-seater-dinining",
        "cnc-4-seater-dinning",
        "extendable-4-seater-dining-set",
        "swd-extendable-6-seater-dining-set",
        // Page 2
        "swd-marine-6-seater-dining-set",
        "grov-6-seater-dining-table",
        "imperial-4-seater-dining-set-in-honey-finish",
        "swd-puzzle-4-seater-dining-set",
        "jika-4-seater-dining-table-in-honey-finish",
        "jiksa-dining-table-set",
        "jiksa-single-dining-table",
        "23",
        "rustic-brass-wali-4-seater-dining-table",
        "16",
        "rustic-6-seater-dining-table-in-honey-finish",
        "17"
    ],
    "Dressor": [
        "lt-dresser",
        "carvin-dresser-with-drawer-storage-in-honey-finish",
        "swd-diamond-dressor",
        "tile-dressor",
        "woven-dressor"
    ],
    "Shoe Rack": [
        "shoe-rack-1",
        "shoe-rack-3",
        "shoe-rack-2"
    ],
    "Sofa Set": [
        "brass-carvin-sofa-set",
        "cozy-dark-5-seater-sofa-set",
        "26-1",
        "sofa-cum-bed",
        "swd-elena-5-seater-sofa-set",
        "swd-royal-brass-5-seater-sofa-set",
        "l-shape-sofa-in-honey-finish",
        "swd-urban-matt-5-seater-sofa-set",
        "swd-majestic-5-seater-sofa-set",
        "peacock-diwan-sofa-with-mattress",
        "sofa-5-seater",
        "swd-silica-5-seater-sofa-set"
    ],
    "End Table": [
        "15",
        "opium-stool-set-in-honey-finish",
        "14"
    ],
    "Study Table": [
        "dinner-table",
        "study-tables",
        "study-table-with-drawer"
    ],
    "Table": [
        "round-table-8-legs",
        "9",
        "moon-half-round-console-table-with-drawer-in-honey-finish",
        "round-folding-table",
        "square-folding-table",
        "tile-console-table-with-drawer-in-honey-finish"
    ],
    "Wall Shelf": [
        "30",
        "moon-wall-shelf",
        "3",
        "4"
    ]
};

// ================================================================
//  HELPER FUNCTIONS  
// ================================================================

function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
}

function stripHtml(html) {
    if (!html) return '';
    return html
        .replace(/<br\s*\/?>/gi, '\n')
        .replace(/<[^>]+>/g, '')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, ' ')
        .trim();
}

function parseFeatures(bodyHtml) {
    if (!bodyHtml) return {};
    const text = stripHtml(bodyHtml);
    const result = {};

    // Extract key-value pairs like "Wood : Solid Sheesham Wood"
    const patterns = [
        { key: 'material', regex: /Wood\s*:\s*([^\n]+)/i },
        { key: 'warranty', regex: /Warranty\s*:\s*([^\n]+)/i },
        { key: 'shipping', regex: /Shipping\s*:\s*([^\n]+?)(?:\s*Shipping Time|$)/i },
        { key: 'shippingTime', regex: /Shipping Time\s*:\s*([^\n]+)/i },
        { key: 'size', regex: /Size\s*:?\s*([0-9][^\n]+)/i },
        { key: 'assembly', regex: /Assembly\s*:\s*((?:Not\s+)?Required)/i },
        { key: 'seating', regex: /Seating Capacity\s*:\s*([^\n]+)/i },
    ];

    for (const { key, regex } of patterns) {
        const match = text.match(regex);
        if (match) {
            result[key] = match[1].trim();
        }
    }

    return result;
}

function calcDiscount(price, originalPrice) {
    if (!originalPrice || originalPrice <= price) return null;
    const pct = Math.round(((originalPrice - price) / originalPrice) * 100);
    return `${pct}% OFF`;
}

async function fetchProduct(handle, category) {
    const url = `https://solidwooddecor.com/products/${handle}.json`;
    try {
        const res = await fetch(url);
        if (!res.ok) {
            console.error(`   ❌ HTTP ${res.status} for ${handle}`);
            return null;
        }
        const data = await res.json();
        const p = data.product;
        const variant = p.variants[0];
        const price = parseFloat(variant.price);
        const compareAt = variant.compare_at_price ? parseFloat(variant.compare_at_price) : null;

        const features = parseFeatures(p.body_html);

        const product = {
            name: p.title,
            category,
            price,
            originalPrice: compareAt,
            discount: calcDiscount(price, compareAt),
            material: features.material || 'Solid Sheesham Wood (Rosewood)',
            finish: 'Honey',
            warranty: features.warranty || 'Lifetime Warranty for Termite Resistance',
            shipping: features.shipping
                ? `${features.shipping}, ${features.shippingTime || '10-12 Days'}`
                : 'All India, 10-12 Days',
            url: `https://solidwooddecor.com/products/${handle}`,
            images: p.images.map(img => img.src),
            available: variant.inventory_management === 'shopify'
                ? true // assume available unless we know otherwise
                : true,
        };

        // Add optional fields
        if (features.size) product.size = features.size;
        if (features.assembly) product.assembly = features.assembly;
        if (features.seating) product.seating = features.seating;

        return product;
    } catch (err) {
        console.error(`   ❌ Error fetching ${handle}:`, err.message);
        return null;
    }
}

// ================================================================
//  MAIN EXECUTION
// ================================================================

async function main() {
    console.log('\n====================================================');
    console.log('  🕷️  Solid Wood Decor — Full Category Scraper');
    console.log('====================================================\n');

    const allProducts = {};
    let totalCount = 0;
    let errorCount = 0;

    const categoryNames = Object.keys(CATEGORIES);
    console.log(`📂 Categories to scrape: ${categoryNames.length}`);
    console.log(`📦 Total products to fetch: ${Object.values(CATEGORIES).reduce((s, a) => s + a.length, 0)}\n`);

    for (const [category, handles] of Object.entries(CATEGORIES)) {
        console.log(`\n━━━ ${category} (${handles.length} products) ━━━`);
        allProducts[category] = [];

        for (let i = 0; i < handles.length; i++) {
            const handle = handles[i];
            process.stdout.write(`   [${i + 1}/${handles.length}] ${handle}... `);

            const product = await fetchProduct(handle, category);
            if (product) {
                allProducts[category].push(product);
                totalCount++;
                console.log(`✅ ₹${product.price}`);
            } else {
                errorCount++;
                console.log('❌ FAILED');
            }

            // Be polite — delay between requests
            await sleep(300);
        }

        console.log(`   → ${allProducts[category].length}/${handles.length} scraped`);
    }

    // Write combined output
    const outputPath = resolve(__dirname, '..', 'scraped-all-furniture.json');
    writeFileSync(outputPath, JSON.stringify(allProducts, null, 2), 'utf8');

    // Also write a flat array version
    const flatProducts = [];
    for (const [category, products] of Object.entries(allProducts)) {
        for (const p of products) {
            flatProducts.push(p);
        }
    }
    const flatOutputPath = resolve(__dirname, '..', 'scraped-all-furniture-flat.json');
    writeFileSync(flatOutputPath, JSON.stringify(flatProducts, null, 2), 'utf8');

    // Summary
    console.log('\n====================================================');
    console.log('  🎉 Scraping Complete!');
    console.log('====================================================');
    console.log(`  ✅ Total products scraped: ${totalCount}`);
    console.log(`  ❌ Errors: ${errorCount}`);
    console.log(`  📂 Categories: ${categoryNames.length}`);
    console.log('');
    console.log('  Per category:');
    for (const [cat, products] of Object.entries(allProducts)) {
        console.log(`    • ${cat}: ${products.length} products`);
    }
    console.log('');
    console.log(`  📄 Output (by category): ${outputPath}`);
    console.log(`  📄 Output (flat array):  ${flatOutputPath}`);
    console.log('====================================================\n');
}

main().catch(err => {
    console.error('❌ Script failed:', err);
    process.exit(1);
});
