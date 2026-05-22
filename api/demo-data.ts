export const demoCategories = [
  {
    id: 1,
    name: "Classic",
    slug: "classic",
    image: "/images/cake-blackforest.jpg",
    description: "Chocolate, pineapple, vanilla and red velvet favorites",
    sortOrder: 1,
    createdAt: new Date(),
  },
  {
    id: 2,
    name: "Gourmet",
    slug: "gourmet",
    image: "/images/cake-truffle.jpg",
    description: "Premium truffle, caramel, pistachio and designer cakes",
    sortOrder: 2,
    createdAt: new Date(),
  },
  {
    id: 3,
    name: "Designer",
    slug: "designer",
    image: "/images/cake-floral.jpg",
    description: "Photo, theme, floral and celebration cakes",
    sortOrder: 3,
    createdAt: new Date(),
  },
  {
    id: 4,
    name: "Desserts",
    slug: "desserts",
    image: "/images/cake-cheesecake.jpg",
    description: "Cheesecakes, pastries, brownies and mini treats",
    sortOrder: 4,
    createdAt: new Date(),
  },
];

export const demoProducts = [
  {
    id: 1,
    name: "Rich Chocolate Truffle Cake",
    sku: "BR-CK-TRF-0500",
    slug: "rich-chocolate-truffle-cake",
    description: "Dense chocolate sponge layered with silky truffle ganache.",
    shortDescription: "Bestseller chocolate truffle",
    price: "549.00",
    compareAtPrice: null,
    image: "/images/cake-truffle.jpg",
    images: [] as string[],
    categoryId: 2,
    tags: ["bestseller", "chocolate", "same day"],
    weightKg: "0.5",
    servings: 6,
    stockQuantity: 42,
    isBestseller: true,
    isNew: false,
    rating: "4.9",
    reviewCount: 8500,
    createdAt: new Date("2026-05-01"),
  },
  {
    id: 2,
    name: "Classic Black Forest Cake",
    sku: "BR-CK-BFC-0500",
    slug: "classic-black-forest-cake",
    description: "Chocolate sponge, whipped cream and cherry filling.",
    shortDescription: "Classic cherry chocolate cake",
    price: "549.00",
    compareAtPrice: null,
    image: "/images/cake-blackforest.jpg",
    images: [] as string[],
    categoryId: 1,
    tags: ["classic", "birthday"],
    weightKg: "0.5",
    servings: 6,
    stockQuantity: 38,
    isBestseller: true,
    isNew: false,
    rating: "4.9",
    reviewCount: 1000,
    createdAt: new Date("2026-04-24"),
  },
  {
    id: 3,
    name: "Rose Pistachio Rasmalai Cake",
    sku: "BR-CK-RPM-0500",
    slug: "rose-pistachio-rasmalai-cake",
    description: "Rose cream, pistachio crumbs and rasmalai-inspired layers.",
    shortDescription: "Festive premium fusion cake",
    price: "699.00",
    compareAtPrice: "799.00",
    image: "/images/cake-pistachio.jpg",
    images: [] as string[],
    categoryId: 2,
    tags: ["premium", "festive", "rasmalai"],
    weightKg: "0.5",
    servings: 6,
    stockQuantity: 24,
    isBestseller: true,
    isNew: true,
    rating: "4.8",
    reviewCount: 570,
    createdAt: new Date("2026-05-09"),
  },
  {
    id: 4,
    name: "Blueberry Bliss Cheesecake",
    sku: "BR-DS-BBC-0750",
    slug: "blueberry-bliss-cheesecake",
    description: "Creamy cheesecake topped with a bright blueberry compote.",
    shortDescription: "Creamy blueberry cheesecake",
    price: "779.00",
    compareAtPrice: null,
    image: "/images/cake-cheesecake.jpg",
    images: [] as string[],
    categoryId: 4,
    tags: ["cheesecake", "dessert"],
    weightKg: "0.75",
    servings: 8,
    stockQuantity: 18,
    isBestseller: true,
    isNew: false,
    rating: "4.9",
    reviewCount: 785,
    createdAt: new Date("2026-04-18"),
  },
  {
    id: 5,
    name: "Red Velvet Heart Cake",
    sku: "BR-DS-RVH-0750",
    slug: "red-velvet-heart-cake",
    description: "Red velvet sponge with cream cheese frosting and heart styling.",
    shortDescription: "Heart-shaped celebration cake",
    price: "799.00",
    compareAtPrice: null,
    image: "/images/cake-velvet.jpg",
    images: [] as string[],
    categoryId: 3,
    tags: ["anniversary", "red velvet"],
    weightKg: "0.75",
    servings: 8,
    stockQuantity: 21,
    isBestseller: false,
    isNew: false,
    rating: "4.9",
    reviewCount: 308,
    createdAt: new Date("2026-03-30"),
  },
  {
    id: 6,
    name: "Rich Butterscotch Crunch Cake",
    sku: "BR-CK-BSC-0500",
    slug: "rich-butterscotch-crunch-cake",
    description: "Caramel sponge, butterscotch cream and crunchy praline.",
    shortDescription: "Caramel crunch cake",
    price: "529.00",
    compareAtPrice: "599.00",
    image: "/images/cake-caramel.jpg",
    images: [] as string[],
    categoryId: 1,
    tags: ["butterscotch", "birthday"],
    weightKg: "0.5",
    servings: 6,
    stockQuantity: 33,
    isBestseller: true,
    isNew: false,
    rating: "4.9",
    reviewCount: 2700,
    createdAt: new Date("2026-04-04"),
  },
  {
    id: 7,
    name: "Lemon Drizzle Delight",
    sku: "BR-CK-LMN-0500",
    slug: "lemon-drizzle-delight",
    description: "Soft lemon sponge with citrus glaze and fresh cream.",
    shortDescription: "Fresh citrus tea cake",
    price: "499.00",
    compareAtPrice: null,
    image: "/images/cake-lemon.jpg",
    images: [] as string[],
    categoryId: 1,
    tags: ["fresh", "eggless"],
    weightKg: "0.5",
    servings: 6,
    stockQuantity: 16,
    isBestseller: false,
    isNew: true,
    rating: "4.8",
    reviewCount: 2300,
    createdAt: new Date("2026-05-12"),
  },
  {
    id: 8,
    name: "Wildflower Vanilla Cake",
    sku: "BR-DS-WFV-0750",
    slug: "wildflower-vanilla-cake",
    description: "Vanilla sponge finished with floral cream and berries.",
    shortDescription: "Elegant floral designer cake",
    price: "699.00",
    compareAtPrice: null,
    image: "/images/cake-floral.jpg",
    images: [] as string[],
    categoryId: 3,
    tags: ["designer", "wedding"],
    weightKg: "0.75",
    servings: 8,
    stockQuantity: 11,
    isBestseller: false,
    isNew: false,
    rating: "4.9",
    reviewCount: 3100,
    createdAt: new Date("2026-04-12"),
  },
];

export const demoAdminUser = {
  id: 1,
  unionId: "aman-main-admin",
  name: "Aman Kongari",
  email: "coolscott18@gmail.com",
  avatar: null,
  role: "admin" as const,
  phone: "+91 70078 23163",
  status: "active" as const,
  authProvider: "demo" as const,
  permissions: ["*"],
  notes: "Main owner admin account for Aman Kongari.",
  createdAt: new Date("2026-05-01"),
  updatedAt: new Date("2026-05-16"),
  lastSignInAt: new Date("2026-05-16"),
};

export type DemoManagedUser = {
  id: number;
  unionId: string;
  name: string;
  email: string | null;
  phone: string | null;
  avatar: string | null;
  role: "user" | "admin" | "manager" | "supervisor";
  status: "active" | "inactive" | "blocked";
  authProvider: "mobile" | "google" | "email" | "demo";
  permissions: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  lastSignInAt: Date;
};

export const demoManagedUsers: DemoManagedUser[] = [
  {
    ...demoAdminUser,
  },
  {
    id: 2,
    unionId: "manager-catalog",
    name: "Catalog Manager",
    email: "catalog.manager@bakerush.local",
    phone: "+91 90000 11111",
    role: "manager" as const,
    avatar: null,
    status: "active" as const,
    authProvider: "email" as const,
    permissions: ["dashboard", "products", "collections", "addons", "occasions"],
    notes: "Can manage catalog, collections, add-ons and occasions.",
    createdAt: new Date("2026-05-12"),
    updatedAt: new Date("2026-05-16"),
    lastSignInAt: new Date("2026-05-16T11:20:00"),
  },
  {
    id: 3,
    unionId: "supervisor-ops",
    name: "Ops Supervisor",
    email: "ops.supervisor@bakerush.local",
    phone: "+91 90000 22222",
    role: "supervisor" as const,
    avatar: null,
    status: "active" as const,
    authProvider: "email" as const,
    permissions: ["dashboard", "orders", "locations"],
    notes: "Can monitor orders and delivery pincodes.",
    createdAt: new Date("2026-05-13"),
    updatedAt: new Date("2026-05-16"),
    lastSignInAt: new Date("2026-05-16T12:15:00"),
  },
  {
    id: 4,
    unionId: "mobile-9876543210",
    name: "Aman Kongari",
    email: "aman@example.com",
    phone: "+91 98765 43210",
    role: "user" as const,
    avatar: null,
    status: "active" as const,
    authProvider: "mobile" as const,
    permissions: [],
    notes: "Repeat buyer, birthday cakes and express delivery.",
    createdAt: new Date("2026-04-18"),
    updatedAt: new Date("2026-05-16"),
    lastSignInAt: new Date("2026-05-16T08:20:00"),
  },
  {
    id: 5,
    unionId: "google-priya",
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 91234 56780",
    role: "user" as const,
    avatar: null,
    status: "active" as const,
    authProvider: "google" as const,
    permissions: [],
    notes: "Prefers desserts and scheduled deliveries.",
    createdAt: new Date("2026-04-25"),
    updatedAt: new Date("2026-05-14"),
    lastSignInAt: new Date("2026-05-15T14:30:00"),
  },
  {
    id: 6,
    unionId: "mobile-9988776655",
    name: "Rahul Mehta",
    email: "rahul@example.com",
    phone: "+91 99887 76655",
    role: "user" as const,
    avatar: null,
    status: "inactive" as const,
    authProvider: "mobile" as const,
    permissions: [],
    notes: "Low activity account retained for testing filters.",
    createdAt: new Date("2026-05-05"),
    updatedAt: new Date("2026-05-08"),
    lastSignInAt: new Date("2026-05-08T10:10:00"),
  },
];

export const demoCustomers = [
  {
    id: 1,
    name: "Aman Kongari",
    email: "aman@example.com",
    phone: "+91 98765 43210",
    role: "user" as const,
    avatar: null,
    createdAt: new Date("2026-04-18"),
    totalOrders: 4,
    totalSpent: 3296,
  },
  {
    id: 2,
    name: "Priya Sharma",
    email: "priya@example.com",
    phone: "+91 91234 56780",
    role: "user" as const,
    avatar: null,
    createdAt: new Date("2026-04-25"),
    totalOrders: 2,
    totalSpent: 1548,
  },
  {
    id: 3,
    name: "Rahul Mehta",
    email: "rahul@example.com",
    phone: "+91 99887 76655",
    role: "user" as const,
    avatar: null,
    createdAt: new Date("2026-05-05"),
    totalOrders: 1,
    totalSpent: 699,
  },
];

export const demoOrders = [
  {
    id: 1,
    userId: 1,
    orderNumber: "BR-10024",
    status: "out_for_delivery" as const,
    paymentStatus: "paid" as const,
    subtotal: "1098.00",
    deliveryFee: "0.00",
    discount: "100.00",
    total: "998.00",
    deliveryName: "Aman Kongari",
    deliveryPhone: "+91 98765 43210",
    deliveryAddress: "Sector 62",
    deliveryCity: "Noida",
    deliveryPincode: "201309",
    deliveryDate: new Date("2026-05-16"),
    deliveryTime: "fixed",
    specialInstructions: "Call before delivery",
    createdAt: new Date("2026-05-16T09:15:00"),
    updatedAt: new Date("2026-05-16T10:05:00"),
  },
  {
    id: 2,
    userId: 2,
    orderNumber: "BR-10023",
    status: "baking" as const,
    paymentStatus: "paid" as const,
    subtotal: "779.00",
    deliveryFee: "49.00",
    discount: "0.00",
    total: "828.00",
    deliveryName: "Priya Sharma",
    deliveryPhone: "+91 91234 56780",
    deliveryAddress: "Indiranagar",
    deliveryCity: "Bangalore",
    deliveryPincode: "560038",
    deliveryDate: new Date("2026-05-16"),
    deliveryTime: "standard",
    specialInstructions: null,
    createdAt: new Date("2026-05-16T08:40:00"),
    updatedAt: new Date("2026-05-16T09:20:00"),
  },
  {
    id: 3,
    userId: 1,
    orderNumber: "BR-10022",
    status: "delivered" as const,
    paymentStatus: "paid" as const,
    subtotal: "699.00",
    deliveryFee: "0.00",
    discount: "0.00",
    total: "699.00",
    deliveryName: "Aman Kongari",
    deliveryPhone: "+91 98765 43210",
    deliveryAddress: "Sector 62",
    deliveryCity: "Noida",
    deliveryPincode: "201309",
    deliveryDate: new Date("2026-05-15"),
    deliveryTime: "standard",
    specialInstructions: null,
    createdAt: new Date("2026-05-15T17:10:00"),
    updatedAt: new Date("2026-05-15T20:05:00"),
  },
];

export const demoSegments = [
  {
    id: 1,
    name: "Birthday buyers",
    description: "Customers who ordered birthday cakes",
    criteria: { occasion: "birthday" },
    color: "#e5522d",
    createdAt: new Date("2026-05-01"),
    memberCount: 18,
  },
  {
    id: 2,
    name: "Premium repeaters",
    description: "High-value repeat customers",
    criteria: { minOrders: 2, minSpend: 1500 },
    color: "#168451",
    createdAt: new Date("2026-05-02"),
    memberCount: 7,
  },
];

export const demoCampaigns = [
  {
    id: 1,
    name: "Weekend Chocolate Offer",
    segmentId: 1,
    type: "email" as const,
    subject: "20% off on truffle cakes",
    content: "Celebrate this weekend with fresh chocolate cakes.",
    scheduledAt: new Date("2026-05-17T10:00:00"),
    sentAt: null,
    status: "scheduled" as const,
    openRate: "0.00",
    clickRate: "0.00",
    createdAt: new Date("2026-05-15"),
  },
  {
    id: 2,
    name: "Abandoned Cart Reminder",
    segmentId: null,
    type: "whatsapp" as const,
    subject: "Your cake is waiting",
    content: "Complete your order today and get same-day delivery.",
    scheduledAt: null,
    sentAt: new Date("2026-05-14T12:30:00"),
    status: "sent" as const,
    openRate: "63.00",
    clickRate: "18.00",
    createdAt: new Date("2026-05-14"),
  },
];

export const demoLocations = [
  {
    id: 5,
    city: "Lucknow",
    pincode: "226017",
    area: "Rajaji Puram",
    sameDay: true,
    expressMinutes: 120,
    midnightDelivery: true,
    deliveryFee: "0.00",
    isActive: true,
  },
  {
    id: 6,
    city: "Lucknow",
    pincode: "226017",
    area: "Alam Nagar",
    sameDay: true,
    expressMinutes: 120,
    midnightDelivery: true,
    deliveryFee: "0.00",
    isActive: true,
  },
  {
    id: 1,
    city: "Delhi NCR",
    pincode: "110001",
    area: "Connaught Place",
    sameDay: true,
    expressMinutes: 60,
    midnightDelivery: true,
    deliveryFee: "0.00",
    isActive: true,
  },
  {
    id: 2,
    city: "Bangalore",
    pincode: "560038",
    area: "Indiranagar",
    sameDay: true,
    expressMinutes: 120,
    midnightDelivery: true,
    deliveryFee: "49.00",
    isActive: true,
  },
  {
    id: 3,
    city: "Mumbai",
    pincode: "400050",
    area: "Bandra West",
    sameDay: true,
    expressMinutes: 90,
    midnightDelivery: false,
    deliveryFee: "39.00",
    isActive: true,
  },
  {
    id: 4,
    city: "Pune",
    pincode: "411001",
    area: "Camp",
    sameDay: false,
    expressMinutes: 240,
    midnightDelivery: false,
    deliveryFee: "59.00",
    isActive: false,
  },
];

export type DemoHeroSlide = {
  id: number;
  title: string;
  highlight: string;
  text: string;
  product: string;
  image: string;
  price: string;
  accent: string;
  mood: string;
  wash: string;
  searchPlaceholder: string;
  badgeOne: string;
  badgeTwo: string;
  badgeThree: string;
  isActive: boolean;
  sortOrder: number;
};

export const demoHeroSlides: DemoHeroSlide[] = [
  {
    id: 1,
    title: "Fresh cakes delivered today",
    highlight: "delivered today",
    text: "Browse premium celebration cakes, pick your delivery slot, and track every order from bakery bench to doorstep.",
    product: "Signature Truffle",
    image: "/images/cake-truffle.jpg",
    price: "549",
    accent: "#ffcf62",
    mood: "rgba(255, 198, 86, 0.62)",
    wash: "linear-gradient(135deg, #351308 0%, #6f2f10 43%, #c76a22 100%)",
    searchPlaceholder: "Search chocolate, rasmalai, photo cakes...",
    badgeOne: "Scroll hero",
    badgeTwo: "Scene changes",
    badgeThree: "Same day delivery",
    isActive: true,
    sortOrder: 1,
  },
  {
    id: 2,
    title: "Rasmalai, rose, pistachio, celebration-ready",
    highlight: "pistachio",
    text: "Premium Indian fusion cakes with same-day city slots and gift-ready packaging.",
    product: "Rose Pistachio Rasmalai",
    image: "/images/cake-pistachio.jpg",
    price: "699",
    accent: "#b9f6ca",
    mood: "rgba(160, 255, 191, 0.64)",
    wash: "linear-gradient(135deg, #10291c 0%, #28643b 44%, #b28a3c 100%)",
    searchPlaceholder: "Search rasmalai, pistachio, festive cakes...",
    badgeOne: "Fusion cakes",
    badgeTwo: "Premium packaging",
    badgeThree: "Fresh dispatch",
    isActive: true,
    sortOrder: 2,
  },
  {
    id: 3,
    title: "Cheesecake and dessert boxes for every mood",
    highlight: "every mood",
    text: "Switch from birthday cakes to dessert hampers without losing delivery speed.",
    product: "Blueberry Bliss Cheesecake",
    image: "/images/cake-cheesecake.jpg",
    price: "779",
    accent: "#b7d8ff",
    mood: "rgba(160, 207, 255, 0.68)",
    wash: "linear-gradient(135deg, #101a3a 0%, #304b91 44%, #7e4fa6 100%)",
    searchPlaceholder: "Search cheesecake, brownies, dessert boxes...",
    badgeOne: "Dessert boxes",
    badgeTwo: "Gift ready",
    badgeThree: "Fast checkout",
    isActive: true,
    sortOrder: 3,
  },
];

export type DemoCollectionItem = {
  id: number;
  navName: string;
  navPath: string;
  columnTitle: string;
  name: string;
  slug: string;
  path: string;
  badge: string | null;
  promoImage: string | null;
  occasionSlug: string | null;
  active: boolean;
  sortOrder: number;
};

export const demoCollectionItems: DemoCollectionItem[] = [
  { id: 1, navName: "Cakes", navPath: "/shop", columnTitle: "Trending Cakes", name: "Mango Cakes", slug: "mango-cakes", path: "/shop?collection=mango-cakes", badge: null, promoImage: "/images/cake-truffle.jpg", occasionSlug: null, active: true, sortOrder: 1 },
  { id: 2, navName: "Cakes", navPath: "/shop", columnTitle: "Trending Cakes", name: "Fire Cakes", slug: "fire-cakes", path: "/shop?collection=fire-cakes", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 2 },
  { id: 3, navName: "Cakes", navPath: "/shop", columnTitle: "Trending Cakes", name: "Photo Cakes", slug: "photo-cakes", path: "/shop?collection=photo-cakes", badge: "New", promoImage: null, occasionSlug: null, active: true, sortOrder: 3 },
  { id: 4, navName: "Cakes", navPath: "/shop", columnTitle: "By Type", name: "Bestsellers", slug: "bestsellers", path: "/shop?collection=bestsellers&sort=bestsellers", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 4 },
  { id: 5, navName: "Cakes", navPath: "/shop", columnTitle: "By Type", name: "Eggless Cakes", slug: "eggless-cakes", path: "/shop?collection=eggless-cakes", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 5 },
  { id: 6, navName: "Cakes", navPath: "/shop", columnTitle: "By Type", name: "Half Cakes", slug: "half-cakes", path: "/shop?collection=half-cakes", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 6 },
  { id: 7, navName: "Cakes", navPath: "/shop", columnTitle: "By Flavours", name: "Chocolate Cakes", slug: "chocolate-cakes", path: "/shop?collection=chocolate-cakes", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 7 },
  { id: 8, navName: "Cakes", navPath: "/shop", columnTitle: "By Flavours", name: "Butterscotch Cakes", slug: "butterscotch-cakes", path: "/shop?collection=butterscotch-cakes", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 8 },
  { id: 9, navName: "Cakes", navPath: "/shop", columnTitle: "Delivery Cities", name: "Cakes To Delhi", slug: "cakes-delhi", path: "/shop?collection=cakes-delhi&city=delhi", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 9 },
  { id: 10, navName: "Cakes", navPath: "/shop", columnTitle: "Delivery Cities", name: "Cakes To Bangalore", slug: "cakes-bangalore", path: "/shop?collection=cakes-bangalore&city=bangalore", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 10 },
  { id: 11, navName: "Theme Cakes", navPath: "/shop?category=designer", columnTitle: "Kids Cakes", name: "1st Birthday Cakes", slug: "first-birthday-cakes", path: "/shop?collection=first-birthday-cakes&occasion=birthday-special", badge: null, promoImage: "/images/cake-floral.jpg", occasionSlug: "birthday-special", active: true, sortOrder: 1 },
  { id: 12, navName: "Theme Cakes", navPath: "/shop?category=designer", columnTitle: "Kids Cakes", name: "Princess Cakes", slug: "princess-cakes", path: "/shop?collection=princess-cakes&occasion=birthday-special", badge: null, promoImage: null, occasionSlug: "birthday-special", active: true, sortOrder: 2 },
  { id: 13, navName: "Theme Cakes", navPath: "/shop?category=designer", columnTitle: "Character Cakes", name: "Spiderman Cakes", slug: "spiderman-cakes", path: "/shop?collection=spiderman-cakes", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 3 },
  { id: 14, navName: "Theme Cakes", navPath: "/shop?category=designer", columnTitle: "Character Cakes", name: "Unicorn Cakes", slug: "unicorn-cakes", path: "/shop?collection=unicorn-cakes", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 4 },
  { id: 15, navName: "Theme Cakes", navPath: "/shop?category=designer", columnTitle: "Grown Up Cakes", name: "Wedding Cakes", slug: "wedding-cakes", path: "/shop?collection=wedding-cakes", badge: null, promoImage: null, occasionSlug: null, active: true, sortOrder: 5 },
  { id: 16, navName: "Birthday", navPath: "/shop?occasion=birthday-special", columnTitle: "Must Haves", name: "Gifts in 60 mins", slug: "gifts-60-mins", path: "/shop?collection=gifts-60-mins&occasion=birthday-special", badge: "New", promoImage: "/images/cake-blackforest.jpg", occasionSlug: "birthday-special", active: true, sortOrder: 1 },
  { id: 17, navName: "Birthday", navPath: "/shop?occasion=birthday-special", columnTitle: "Must Haves", name: "Cakes", slug: "birthday-cakes", path: "/shop?collection=birthday-cakes&occasion=birthday-special", badge: null, promoImage: null, occasionSlug: "birthday-special", active: true, sortOrder: 2 },
  { id: 18, navName: "Birthday", navPath: "/shop?occasion=birthday-special", columnTitle: "Prime Picks", name: "Bestsellers", slug: "birthday-bestsellers", path: "/shop?collection=birthday-bestsellers&occasion=birthday-special&sort=bestsellers", badge: null, promoImage: null, occasionSlug: "birthday-special", active: true, sortOrder: 3 },
  { id: 19, navName: "Birthday", navPath: "/shop?occasion=birthday-special", columnTitle: "Birthday Gifts For", name: "Her", slug: "birthday-her", path: "/shop?collection=birthday-her&occasion=birthday-special", badge: null, promoImage: null, occasionSlug: "birthday-special", active: true, sortOrder: 4 },
  { id: 20, navName: "Birthday", navPath: "/shop?occasion=birthday-special", columnTitle: "Price Wise Gifts", name: "Below Rs 500", slug: "below-500", path: "/shop?collection=below-500&occasion=birthday-special", badge: null, promoImage: null, occasionSlug: "birthday-special", active: true, sortOrder: 5 },
];

export type DemoAddOn = {
  id: number;
  name: string;
  slug: string;
  description: string;
  price: string;
  image: string;
  type: "topper" | "candle" | "flower" | "dessert" | "gift" | "custom";
  active: boolean;
  sortOrder: number;
  productSlugs: string[];
};

export const demoAddOns: DemoAddOn[] = [
  { id: 1, name: "Happy Birthday Topper", slug: "happy-birthday-topper", description: "Gold acrylic topper", price: "149.00", image: "/images/cake-floral.jpg", type: "topper", active: true, sortOrder: 1, productSlugs: [] },
  { id: 2, name: "Magic Candles", slug: "magic-candles", description: "Pack of 10 candles", price: "79.00", image: "/images/cake-velvet.jpg", type: "candle", active: true, sortOrder: 2, productSlugs: [] },
  { id: 3, name: "Mini Rose Bouquet", slug: "mini-rose-bouquet", description: "Fresh flower add-on", price: "299.00", image: "/images/cake-pistachio.jpg", type: "flower", active: true, sortOrder: 3, productSlugs: ["rich-chocolate-truffle-cake", "rose-pistachio-rasmalai-cake"] },
  { id: 4, name: "Brownie Bites Box", slug: "brownie-bites-box", description: "6 bite-size desserts", price: "249.00", image: "/images/cake-caramel.jpg", type: "dessert", active: true, sortOrder: 4, productSlugs: [] },
];

export type DemoOccasionSection = {
  id: number;
  title: string;
  slug: string;
  type: "occasion" | "festival" | "category" | "recipient";
  event: string;
  image: string;
  description: string;
  active: boolean;
  sortOrder: number;
  startsAt: string | null;
  endsAt: string | null;
  productSlugs: string[];
};

export const demoOccasionSections: DemoOccasionSection[] = [
  {
    id: 1,
    title: "Birthdays Made Special",
    slug: "birthday-special",
    type: "occasion" as const,
    event: "Birthday",
    image: "/images/cake-blackforest.jpg",
    description: "Cakes, flowers, gift sets and balloon decor for birthdays.",
    active: true,
    sortOrder: 1,
    startsAt: null,
    endsAt: null,
    productSlugs: [
      "classic-black-forest-cake",
      "rich-chocolate-truffle-cake",
      "wildflower-vanilla-cake",
    ],
  },
  {
    id: 2,
    title: "Anniversary Gifts",
    slug: "anniversary-gifts",
    type: "occasion" as const,
    event: "Anniversary",
    image: "/images/cake-velvet.jpg",
    description: "Heart cakes, premium flowers and couple gift hampers.",
    active: true,
    sortOrder: 2,
    startsAt: null,
    endsAt: null,
    productSlugs: ["red-velvet-heart-cake", "rose-pistachio-rasmalai-cake"],
  },
  {
    id: 3,
    title: "Holi Special",
    slug: "holi-special",
    type: "festival" as const,
    event: "Holi",
    image: "/images/cake-floral.jpg",
    description: "Colorful cakes and festive dessert boxes for Holi.",
    active: true,
    sortOrder: 3,
    startsAt: "2026-02-20",
    endsAt: "2026-03-05",
    productSlugs: ["wildflower-vanilla-cake", "lemon-drizzle-delight"],
  },
  {
    id: 4,
    title: "Diwali Luxe Hampers",
    slug: "diwali-luxe-hampers",
    type: "festival" as const,
    event: "Diwali",
    image: "/images/cake-pistachio.jpg",
    description: "Premium mithai-inspired cakes and corporate hampers.",
    active: true,
    sortOrder: 4,
    startsAt: "2026-10-20",
    endsAt: "2026-11-15",
    productSlugs: ["rose-pistachio-rasmalai-cake", "rich-butterscotch-crunch-cake"],
  },
  {
    id: 5,
    title: "Christmas Cakes",
    slug: "christmas-cakes",
    type: "festival" as const,
    event: "Christmas",
    image: "/images/cake-truffle.jpg",
    description: "Chocolate, plum-style and winter celebration cakes.",
    active: true,
    sortOrder: 5,
    startsAt: "2026-12-01",
    endsAt: "2026-12-26",
    productSlugs: ["rich-chocolate-truffle-cake", "blueberry-bliss-cheesecake"],
  },
];
