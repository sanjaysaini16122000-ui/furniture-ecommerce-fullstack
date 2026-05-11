/**
 * 🧹 Clean scraped furniture data
 * 
 * Fixes the over-captured fields (material, warranty, shipping, size)
 * by properly truncating at the next key-value boundary.
 * 
 * Also adds common fields like description, rating, features, finishes.
 * 
 * Usage: node scripts/cleanScrapedData.mjs
 */

import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const inputPath = resolve(__dirname, '..', 'scraped-all-furniture.json');
const rawData = JSON.parse(readFileSync(inputPath, 'utf8'));

// ================================================================
//  CLEANING FUNCTIONS
// ================================================================

/** Extract just the value before the next key (e.g., "Warranty :", "Shipping :") */
function cleanField(value) {
    if (!value) return value;
    // Truncate at the next known section header
    const stopPatterns = [
        /\s*Warranty\s*:/i,
        /\s*Shipping\s*:/i,
        /\s*Shipping Time\s*:/i,
        /\s*Size\s*:?\s*\d/i,
        /\s*Sizes?\s*\(/i,
        /\s*Assembly\s*:/i,
        /\s*Free Assembly\s*:/i,
        /\s*Care\s+Premium/i,
        /\s*Other Cities/i,
        /\s*Quality\s+The wood/i,
        /\s*Returns\s+If you/i,
    ];

    let result = value;
    for (const pattern of stopPatterns) {
        const match = result.match(pattern);
        if (match && match.index > 0) {
            result = result.substring(0, match.index);
        }
    }
    return result.trim();
}

/** Extract dimension string like "78 x 72" or "18*15*45 inches" */
function extractSize(sizeRaw) {
    if (!sizeRaw) return null;
    // Match patterns like: "18*15*45 inches", "78 x Width 72", "L 78 x W 72"
    const patterns = [
        /(\d+\s*[*x×]\s*\d+\s*[*x×]\s*\d+\s*(?:inches?|inch|in)?)/i,
        /(\d+\s*[*x×]\s*\d+\s*(?:inches?|inch|in)?)/i,
        /((?:Mattress\s+)?Length\s+\d+\s*x\s*Width\s+\d+(?:,\s*Box ply \d+mm)?)/i,
        /(L\s*\d+\s*[*x×]\s*W\s*\d+\s*[*x×]\s*H\s*\d+)/i,
    ];
    for (const p of patterns) {
        const m = sizeRaw.match(p);
        if (m) return m[1].trim();
    }
    return cleanField(sizeRaw);
}

/** Extract clean material */
function extractMaterial(mat) {
    if (!mat) return 'Solid Sheesham Wood (Rosewood)';
    const cleaned = cleanField(mat);
    if (cleaned.length > 80) return 'Solid Sheesham Wood (Rosewood)';
    return cleaned || 'Solid Sheesham Wood (Rosewood)';
}

/** Extract clean warranty */
function extractWarranty(war) {
    if (!war) return 'Lifetime Warranty for Termite Resistance';
    const cleaned = cleanField(war);
    if (cleaned.length > 100) return 'Lifetime Warranty for Termite Resistance';
    return cleaned || 'Lifetime Warranty for Termite Resistance';
}

/** Extract clean shipping */
function extractShipping(ship) {
    if (!ship) return 'All India, 10-12 Days';
    const cleaned = cleanField(ship);
    if (cleaned.length > 60) return 'All India, 10-12 Days';
    return cleaned || 'All India, 10-12 Days';
}

/** Generate a clean description from the product name */
function generateDescription(product) {
    const name = product.name;
    const cat = product.category;
    const mat = product.material || 'Sheesham Wood';

    return `${name} — crafted from premium ${mat}. This ${cat.toLowerCase()} combines elegance with durability, featuring a hand-applied finish and termite-resistant build. Perfect for modern Indian homes.`;
}

/** Standard features for all products */
function standardFeatures() {
    return [
        'Premium Quality Sheesham Wood',
        'Elegant Handcrafted Design',
        'Long-Lasting & Termite Resistant',
        'Smooth Finish with Natural Polish',
        'EMI Option Also Available'
    ];
}

/** Standard finishes for all products */
function standardFinishes() {
    return [
        { name: 'Teak', color: '#8B6914' },
        { name: 'Light Walnut', color: '#A0785A' },
        { name: 'Walnut', color: '#5C4033' },
        { name: 'Natural', color: '#D2B48C' },
        { name: 'Honey', color: '#EB9605' },
        { name: 'Mahogany', color: '#420D09' }
    ];
}

/** Generate a rating between 4.3 and 5.0 based on product name hash */
function generateRating(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = ((hash << 5) - hash) + name.charCodeAt(i);
        hash |= 0;
    }
    // Deterministic rating between 4.3 and 5.0
    return Math.round((4.3 + (Math.abs(hash) % 8) * 0.1) * 10) / 10;
}

// ================================================================
//  PROCESS ALL PRODUCTS
// ================================================================

const cleanedData = {};
let totalCleaned = 0;

for (const [category, products] of Object.entries(rawData)) {
    cleanedData[category] = [];

    for (const p of products) {
        const cleanMat = extractMaterial(p.material);
        const cleaned = {
            name: p.name,
            category: p.category,
            price: p.price,
            originalPrice: p.originalPrice,
            discount: p.discount,
            rating: generateRating(p.name),
            material: cleanMat,
            finish: p.finish || 'Honey',
            warranty: extractWarranty(p.warranty),
            shipping: extractShipping(p.shipping),
            description: `${p.name} — crafted from premium ${cleanMat}. This ${p.category.toLowerCase()} combines elegance with durability, featuring a hand-applied finish and termite-resistant build. Perfect for modern Indian homes.`,
            features: standardFeatures(),
            finishes: standardFinishes(),
            url: p.url,
            images: p.images,
            available: p.available,
        };

        // Add optional fields with cleaned values
        if (p.size) {
            const cleanSize = extractSize(p.size);
            if (cleanSize && cleanSize.length < 80) {
                cleaned.size = cleanSize;
            }
        }
        if (p.assembly) cleaned.assembly = p.assembly;
        if (p.seating) cleaned.seating = p.seating;

        cleanedData[category].push(cleaned);
        totalCleaned++;
    }
}

// Write cleaned category-grouped output
const outputPath = resolve(__dirname, '..', 'scraped-all-furniture.json');
writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2), 'utf8');

// Write cleaned flat array
const flatProducts = [];
for (const products of Object.values(cleanedData)) {
    flatProducts.push(...products);
}
const flatOutputPath = resolve(__dirname, '..', 'scraped-all-furniture-flat.json');
writeFileSync(flatOutputPath, JSON.stringify(flatProducts, null, 2), 'utf8');

// Summary
console.log('\n====================================================');
console.log('  🧹 Data Cleaning Complete!');
console.log('====================================================');
console.log(`  ✅ Products cleaned: ${totalCleaned}`);
console.log('');
console.log('  Per category:');
for (const [cat, products] of Object.entries(cleanedData)) {
    console.log(`    • ${cat}: ${products.length} products`);
}
console.log('');

// Show a sample product
const sample = cleanedData['Bar Cabinet'][0];
console.log('  📦 Sample cleaned product:');
console.log(`    Name: ${sample.name}`);
console.log(`    Price: ₹${sample.price} (was ₹${sample.originalPrice})`);
console.log(`    Discount: ${sample.discount}`);
console.log(`    Rating: ${sample.rating}`);
console.log(`    Material: ${sample.material}`);
console.log(`    Warranty: ${sample.warranty}`);
console.log(`    Shipping: ${sample.shipping}`);
console.log(`    Size: ${sample.size || 'N/A'}`);
console.log(`    Images: ${sample.images.length}`);
console.log(`    Features: ${sample.features.length}`);
console.log(`    Finishes: ${sample.finishes.length}`);
console.log('');
console.log(`  📄 Output: ${outputPath}`);
console.log(`  📄 Flat:   ${flatOutputPath}`);
console.log('====================================================\n');
