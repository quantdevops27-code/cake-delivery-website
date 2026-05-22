import { getDb } from "../api/queries/connection";
import { categories, products, customerSegments } from "./schema";

async function seed() {
  const db = getDb();
  console.log("Seeding database...");

  // Seed categories
  const categoryData = [
    {
      name: "Classic Cakes",
      slug: "classic",
      image: "/images/hero-cake.jpg",
      description: "Timeless favorites crafted with traditional recipes",
      sortOrder: 1,
    },
    {
      name: "Gourmet Cakes",
      slug: "gourmet",
      image: "/images/cake-caramel.jpg",
      description: "Exquisite creations for the discerning palate",
      sortOrder: 2,
    },
    {
      name: "Designer Cakes",
      slug: "designer",
      image: "/images/cake-floral.jpg",
      description: "Custom masterpieces that tell your story",
      sortOrder: 3,
    },
    {
      name: "Cheesecakes",
      slug: "cheesecakes",
      image: "/images/cake-cheesecake.jpg",
      description: "Creamy, velvety, and utterly irresistible",
      sortOrder: 4,
    },
  ];

  for (const cat of categoryData) {
    const existing = await db.query.categories.findFirst({
      where: (c, { eq }) => eq(c.slug, cat.slug),
    });
    if (!existing) {
      await db.insert(categories).values(cat);
      console.log(`Created category: ${cat.name}`);
    }
  }

  // Get category IDs
  const allCategories = await db.query.categories.findMany();
  const categoryMap = new Map(allCategories.map((c) => [c.slug, c.id]));

  // Seed products
  const productData = [
    {
      name: "Velvet Dream",
      sku: "BR-CK-VLD-0500",
      slug: "velvet-dream",
      description:
        "Our signature red velvet cake features layers of moist, cocoa-kissed sponge paired with silky cream cheese frosting. Each slice reveals perfect crimson layers that melt in your mouth, finished with a delicate dusting of red velvet crumbs.",
      shortDescription: "Classic red velvet with cream cheese frosting",
      price: "549.00",
      compareAtPrice: "649.00",
      image: "/images/cake-velvet.jpg",
      images: JSON.stringify([]),
      categoryId: categoryMap.get("classic"),
      tags: JSON.stringify(["bestseller", "birthday", "eggless"]),
      weightKg: "0.5",
      servings: 6,
      isBestseller: true,
      isNew: false,
      rating: "4.9",
      reviewCount: 8400,
    },
    {
      name: "Lemon Drizzle Delight",
      sku: "BR-CK-LMN-0500",
      slug: "lemon-drizzle-delight",
      description:
        "A bright and zesty lemon cake with a tangy citrus glaze that seeps into every pore of the soft sponge. Decorated with candied lemon slices and a whisper of powdered sugar, this cake is sunshine on a plate.",
      shortDescription: "Zesty lemon cake with citrus glaze",
      price: "499.00",
      compareAtPrice: null,
      image: "/images/cake-lemon.jpg",
      images: JSON.stringify([]),
      categoryId: categoryMap.get("classic"),
      tags: JSON.stringify(["refreshing", "summer"]),
      weightKg: "0.5",
      servings: 6,
      isBestseller: false,
      isNew: true,
      rating: "4.8",
      reviewCount: 2300,
    },
    {
      name: "Salted Caramel Crunch",
      sku: "BR-CK-SCC-1000",
      slug: "salted-caramel-crunch",
      description:
        "An indulgent tower of caramel sponge layers interspersed with salted caramel buttercream and crunchy praline pieces. Topped with a cascade of homemade caramel sauce, gold-dusted macarons, and delicate gold leaf.",
      shortDescription: "Layered caramel cake with praline crunch",
      price: "749.00",
      compareAtPrice: "899.00",
      image: "/images/cake-caramel.jpg",
      images: JSON.stringify([]),
      categoryId: categoryMap.get("gourmet"),
      tags: JSON.stringify(["premium", "caramel", "best seller"]),
      weightKg: "1.0",
      servings: 10,
      isBestseller: true,
      isNew: false,
      rating: "4.9",
      reviewCount: 5600,
    },
    {
      name: "Wildflower Vanilla",
      sku: "BR-DS-WFV-0750",
      slug: "wildflower-vanilla",
      description:
        "A delicate vanilla sponge cake adorned with hand-picked edible wildflowers and fresh seasonal berries. Light as air and naturally sweetened, this cake brings the beauty of an English garden to your celebration.",
      shortDescription: "Vanilla sponge with edible flowers",
      price: "699.00",
      compareAtPrice: null,
      image: "/images/cake-floral.jpg",
      images: JSON.stringify([]),
      categoryId: categoryMap.get("designer"),
      tags: JSON.stringify(["wedding", "elegant", "floral"]),
      weightKg: "0.75",
      servings: 8,
      isBestseller: true,
      isNew: false,
      rating: "4.9",
      reviewCount: 3100,
    },
    {
      name: "Midnight Chocolate Truffle",
      sku: "BR-CK-MCT-0750",
      slug: "midnight-chocolate-truffle",
      description:
        "A decadent dark chocolate cake with layers of rich chocolate ganache and truffle cream. Coated in glossy chocolate mirror glaze and crowned with hand-rolled chocolate truffles for the ultimate chocolate experience.",
      shortDescription: "Dark chocolate with truffle ganache",
      price: "649.00",
      compareAtPrice: "799.00",
      image: "/images/cake-truffle.jpg",
      images: JSON.stringify([]),
      categoryId: categoryMap.get("gourmet"),
      tags: JSON.stringify(["chocolate", "premium", "bestseller"]),
      weightKg: "0.75",
      servings: 8,
      isBestseller: true,
      isNew: false,
      rating: "4.9",
      reviewCount: 7200,
    },
    {
      name: "Black Forest Classic",
      sku: "BR-CK-BFC-0750",
      slug: "black-forest-classic",
      description:
        "The timeless German favorite with moist chocolate sponge, whipped cream, and Morello cherries. Topped with chocolate shavings and plump, glossy cherries that add the perfect tart contrast to every bite.",
      shortDescription: "Classic Black Forest with cherries",
      price: "599.00",
      compareAtPrice: null,
      image: "/images/cake-blackforest.jpg",
      images: JSON.stringify([]),
      categoryId: categoryMap.get("classic"),
      tags: JSON.stringify(["classic", "cherry", "german"]),
      weightKg: "0.75",
      servings: 8,
      isBestseller: false,
      isNew: false,
      rating: "4.8",
      reviewCount: 4500,
    },
    {
      name: "Blueberry Bliss Cheesecake",
      sku: "BR-DS-BBC-0750",
      slug: "blueberry-bliss-cheesecake",
      description:
        "A creamy New York-style cheesecake on a buttery graham cracker crust, topped with a luscious blueberry compote. Each slice is velvety smooth with bursts of fresh blueberry flavor in every bite.",
      shortDescription: "Creamy cheesecake with blueberry compote",
      price: "649.00",
      compareAtPrice: "749.00",
      image: "/images/cake-cheesecake.jpg",
      images: JSON.stringify([]),
      categoryId: categoryMap.get("cheesecakes"),
      tags: JSON.stringify(["cheesecake", "blueberry", "creamy"]),
      weightKg: "0.75",
      servings: 8,
      isBestseller: true,
      isNew: false,
      rating: "4.9",
      reviewCount: 3800,
    },
    {
      name: "Pistachio Rose Garden",
      sku: "BR-CK-PRG-0750",
      slug: "pistachio-rose-garden",
      description:
        "An enchanting fusion of Middle Eastern flavors featuring pistachio sponge layers, rose water buttercream, and crushed pistachio coating. Adorned with crystallized rose petals, it's a fragrant masterpiece.",
      shortDescription: "Pistachio and rose water creation",
      price: "799.00",
      compareAtPrice: null,
      image: "/images/cake-pistachio.jpg",
      images: JSON.stringify([]),
      categoryId: categoryMap.get("gourmet"),
      tags: JSON.stringify(["premium", "pistachio", "rose", "unique"]),
      weightKg: "0.75",
      servings: 8,
      isBestseller: false,
      isNew: true,
      rating: "4.8",
      reviewCount: 1200,
    },
  ];

  for (const prod of productData) {
    const existing = await db.query.products.findFirst({
      where: (p, { eq }) => eq(p.slug, prod.slug),
    });
    if (!existing) {
      await db.insert(products).values(prod);
      console.log(`Created product: ${prod.name}`);
    }
  }

  // Seed default customer segments
  const segmentData = [
    {
      name: "VIP Customers",
      description: "Customers with 3+ orders or total spend over 2000",
      criteria: JSON.stringify({ minOrders: 3, minSpend: 2000 }),
      color: "#D4A373",
    },
    {
      name: "New Customers",
      description: "Customers who joined in the last 30 days",
      criteria: JSON.stringify({ daysSinceJoin: 30 }),
      color: "#6B3A3A",
    },
    {
      name: "At Risk",
      description: "Customers who haven't ordered in 90+ days",
      criteria: JSON.stringify({ daysSinceLastOrder: 90 }),
      color: "#E85D4A",
    },
    {
      name: "Champions",
      description: "Top 10% customers by order frequency and value",
      criteria: JSON.stringify({ topPercent: 10 }),
      color: "#2D8A4E",
    },
  ];

  for (const seg of segmentData) {
    const existing = await db.query.customerSegments.findFirst({
      where: (s, { eq }) => eq(s.name, seg.name),
    });
    if (!existing) {
      await db.insert(customerSegments).values(seg);
      console.log(`Created segment: ${seg.name}`);
    }
  }

  console.log("Seeding complete!");
}

seed().catch(console.error);
