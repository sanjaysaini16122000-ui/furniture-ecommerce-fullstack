// Initial data for the furniture website
// All products should be added via Admin Panel - no sample data
export const initialData = {
    settings: {
        businessName: 'The Urban Karigar Furniture & Interiors',
        tagline: 'Where Dreams Meet Craftsmanship',
        whatsappNumber: '917688885688',
        email: 'theurbankarigar@gmail.com',
        phone: '+91 7688885688',
        address: 'The Urban Karigar, NBC Coffee, Ramnagriya south, Jagatpura, Jaipur, Rajasthan 302017',
        theme: 'dark',
        // Social Media Links
        instagramUrl: 'https://www.instagram.com/the.urbankarigar?igsh=MWx4Y2o1a3h4YWg5Nw==',
        facebookUrl: 'https://www.facebook.com/share/1AVcenHahh/',
        linkedinUrl: 'https://www.linkedin.com/company/theurbankarigar/',
        pinterestUrl: 'https://pin.it/NXMQ083I9',
        youtubeUrl: ''
    },
    // Categories for furniture - can be managed from admin
    categories: [
        'Sofa Sets', 'Beds', 'Wardrobes', 'Dining', 'TV Units',
        'Center Tables', 'Study Tables', 'Dressing Tables',
        'Shoe Racks', 'Temple Units', 'Custom'
    ],
    projectCategories: [
        'Hotel Interiors', 'Home Interiors', 'Office Interiors'
    ],
    // Empty arrays - all products should be added via Admin Panel
    furniture: [],
    kitchens: [],
    projects: [],
    // Dashboard carousel images - add via admin
    dashboardImages: [],
    carouselSettings: {
        interval: 5000,
        showIndicators: true,
        pauseOnHover: true
    },
    // Messages from contact form
    messages: []
};
