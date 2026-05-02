const VendorTypes = {
    DESIGN: 'design',
    PHOTOGRAPHER: 'photographer',
    DJ: 'dj',
    CATERING: 'catering',
    VENUE: 'venue',
    ATTRACTIONS: 'attractions',
    SUITS: 'suits',
    DRESSES: 'dresses',
    MAKEUP: 'makeup',
    ALCOHOL: 'alcohol',

    isValid: (type) => {
        return Object.values(VendorTypes).includes(type);
    }
};

export default VendorTypes;
