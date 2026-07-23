const fs = require('fs');
const path = require('path');

const VENDORS_PATH = path.join(__dirname, '..', 'data', 'vendors.json');

const unsplashPool = {
    'dj': ['1516280440614-37939bbacd41', '1571266028243-3716f02d2d2e', '1470229722913-7c090be05e7f', '1598387181032-a3103a2db5b3', '1514525253161-7a46d19cd819'],
    'photographer': ['1511285560929-80b456fea0bc', '1520854221256-17451cc331bf', '1537151608828-ea2b11777ee8', '1519741497674-611481863552', '1581456495146-65a71b2c8e52'],
    'venue': ['1519167758481-83f550bb49b3', '1464366400600-7168b8af9bc3', '1469334031218-e382a71b716b', '1511795409834-ef04bbd61622', '1519225421980-715cb0215aed'],
    'catering': ['1555244162-803834f70033', '1414235077428-338989a2e8c0', '1533777857889-4be7c70b33f7', '1467453678174-768ec283a940', '1481931098730-146b005e8e81'],
    'alcohol': ['1514362545857-3bc16c4c7d1b', '1551538827-9c037cb4f32a', '1536935338788-846bb9981813', '1470337458703-415120a41f67', '1513558161293-cdaf765ed2fd'],
    'dresses': ['1594553939328-14936d6f5f3e', '1546803073-67894a4aefa6', '1549416878-b99b533e46bc', '1606214589252-9f636cb077d8'],
    'suits': ['1594932224015-610b8116ce9f', '1507679799987-c7377ec48696', '1555066931-4365d14bab8c', '1593032412254-88380d412961'],
    'makeup': ['1487412947147-5cebf100ffc2', '1522335789203-aabd1fc54bc9', '1512496015851-a90fb38ba796', '1596462502278-27bfdc403348'],
    'hair': ['1560869713-7d0a29430803', '1522337302742-8efbd3a3e729', '1519340330288-25501c0b7ec3', '1492106087820-71f1f00da24c']
};

const defaultPool = [
    '1519741497674-611481863552', '1537151608828-ea2b11777ee8', '1522413452208-9969062f7a94', 
    '1519167758481-83f550bb49b3', '1464366400600-7168b8af9bc3', '1469334031218-e382a71b716b'
];

try {
    const data = JSON.parse(fs.readFileSync(VENDORS_PATH, 'utf8'));
    const categoryUsage = {};

    const updatedData = data.map(vendor => {
        const type = vendor.type || 'other';
        const pool = unsplashPool[type] || defaultPool;
        
        if (!categoryUsage[type]) categoryUsage[type] = 0;
        const imgId = pool[categoryUsage[type] % pool.length];
        categoryUsage[type]++;

        vendor.image = `https://images.unsplash.com/photo-${imgId}?auto=format&fit=crop&w=800&q=80`;
        
        // Also update portfolio items if they exist
        if (vendor.portfolio && Array.isArray(vendor.portfolio)) {
            vendor.portfolio = vendor.portfolio.map((item, idx) => {
                const pImgId = pool[(categoryUsage[type] + idx) % pool.length];
                return {
                    ...item,
                    image: `https://images.unsplash.com/photo-${pImgId}?auto=format&fit=crop&w=800&q=80`
                };
            });
            categoryUsage[type] += vendor.portfolio.length;
        }

        return vendor;
    });

    fs.writeFileSync(VENDORS_PATH, JSON.stringify(updatedData, null, 2));
    console.log(`Successfully updated ${updatedData.length} vendors with unique images.`);
} catch (error) {
    console.error('Error:', error.message);
}
