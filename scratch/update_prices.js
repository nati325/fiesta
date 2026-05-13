const fs = require('fs');
const path = require('path');

const vendorsPath = path.join(__dirname, 'data', 'vendors.json');
const vendors = JSON.parse(fs.readFileSync(vendorsPath, 'utf8'));

const PRICE_RANGES = {
    'venue': { min: 25000, max: 75000, unit: '₪' },
    'catering': { min: 180, max: 400, unit: '₪ למנה' },
    'dj': { min: 3500, max: 9500, unit: '₪' },
    'photographer': { min: 5500, max: 14000, unit: '₪' },
    'alcohol': { min: 2500, max: 5500, unit: '₪' },
    'design': { min: 3000, max: 8500, unit: '₪' },
    'attractions': { min: 1200, max: 4500, unit: '₪' },
    'makeup': { min: 600, max: 2200, unit: '₪' },
    'hair': { min: 500, max: 1800, unit: '₪' },
    'dresses': { min: 6000, max: 18000, unit: '₪' },
    'suits': { min: 2500, max: 6500, unit: '₪' },
    'invitations': { min: 5, max: 15, unit: '₪ ליחידה' },
    'hotels': { min: 1200, max: 3500, unit: '₪' },
    'event-production': { min: 5000, max: 20000, unit: '₪' },
    'rings': { min: 1500, max: 6000, unit: '₪' },
    'bride-shoes': { min: 300, max: 1200, unit: '₪' },
    'groom-shoes': { min: 400, max: 1500, unit: '₪' },
    'rabbi': { min: 800, max: 2500, unit: '₪' },
    'cantors': { min: 1200, max: 3500, unit: '₪' },
    'personal-training': { min: 150, max: 350, unit: '₪ לאימון' },
    'dietitians': { min: 250, max: 600, unit: '₪ לייעוץ' },
    'cars': { min: 1500, max: 4500, unit: '₪' }
};

const getRandomPrice = (type) => {
    const range = PRICE_RANGES[type] || { min: 1000, max: 5000, unit: '₪' };
    const price = Math.floor(Math.random() * (range.max - range.min + 1) + range.min);
    // Round to nearest 50 or 100
    return Math.round(price / 50) * 50;
};

const updatedVendors = vendors.map(vendor => {
    // If vendor already has portfolio with prices, skip or supplement
    const hasPrices = vendor.portfolio && vendor.portfolio.some(p => p.price);
    const hasPrice = vendor.price;

    if (hasPrices || hasPrice) return vendor;

    const range = PRICE_RANGES[vendor.type] || { min: 1000, max: 5000, unit: '₪' };
    const basePrice = getRandomPrice(vendor.type);
    
    vendor.price = `${basePrice.toLocaleString()} ${range.unit}`;
    
    // Add portfolio if missing
    if (!vendor.portfolio || vendor.portfolio.length === 0) {
        vendor.portfolio = [
            {
                id: 1,
                title: "חבילת בסיס",
                image: vendor.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
                price: `${basePrice.toLocaleString()} ${range.unit}`
            },
            {
                id: 2,
                title: "חבילת פרימיום משודרגת",
                image: vendor.image || "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=800&q=80",
                price: `${Math.round(basePrice * 1.4 / 100) * 100.toLocaleString()} ${range.unit}`
            }
        ];
    }

    return vendor;
});

fs.writeFileSync(vendorsPath, JSON.stringify(updatedVendors, null, 2), 'utf8');
console.log(`Updated ${updatedVendors.length} vendors with fictitious prices.`);
