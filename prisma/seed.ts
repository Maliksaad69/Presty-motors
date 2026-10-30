import { PrismaClient, UserRole, VehicleType, ProductStatus, AddressType, InventoryMovementType } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/presty_motors?schema=public";
const pool = new pg.Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Starting Presty Motors database seeding...");

  // 1. Clean existing records (in dependency order)
  await prisma.inventoryMovement.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.shipment.deleteMany();
  await prisma.shippingQuote.deleteMany();
  await prisma.order.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();
  await prisma.address.deleteMany();
  await prisma.user.deleteMany();
  await prisma.promotion.deleteMany();
  await prisma.siteSetting.deleteMany();

  console.log("Cleared existing data.");

  // 2. Site Settings
  const settings = [
    { key: "site_name", value: "Presty Motors", group: "general", description: "Store brand name" },
    { key: "contact_email", value: "contact@presty-motors.com", group: "contact", description: "Public contact email" },
    { key: "contact_phone", value: "+33 1 45 67 89 00", group: "contact", description: "Customer service telephone" },
    { key: "contact_whatsapp", value: "+33 6 12 34 56 78", group: "contact", description: "WhatsApp showroom inquiries" },
    { key: "showroom_address", value: "128 Avenue des Sports Motorisés, 75016 Paris, France", group: "showroom", description: "Physical showroom location" },
    { key: "showroom_hours_fr", value: "Du Mardi au Samedi: 9h00 - 19h00", group: "showroom", description: "Showroom opening hours" },
    { key: "announcement_fr", value: "Livraison offerte dès 500€ d'achats d'équipement | Essais showroom sur rendez-vous", group: "announcement", description: "Top banner announcement" },
    { key: "announcement_en", value: "Free delivery on gear orders over €500 | Showroom test rides by appointment", group: "announcement", description: "Top banner announcement EN" },
    { key: "announcement_es", value: "Envío gratis en equipos a partir de 500€ | Pruebas en showroom con cita previa", group: "announcement", description: "Top banner announcement ES" },
    { key: "announcement_ar", value: "توصيل مجاني لطلبات المعدات التي تتجاوز 500 يورو | تجارب القيادة في المعرض بحجز مسبق", group: "announcement", description: "Top banner announcement AR" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.create({ data: s });
  }
  console.log("Created site settings.");

  // 3. Admin & Test Users
  const adminUser = await prisma.user.create({
    data: {
      email: "admin@presty-motors.com",
      name: "Presty Motors Admin",
      phone: "+33 6 12 34 56 78",
      role: UserRole.ADMIN,
    },
  });

  const testCustomer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "Marc Dupont",
      phone: "+33 6 98 76 54 32",
      role: UserRole.CUSTOMER,
      addresses: {
        create: {
          fullName: "Marc Dupont",
          streetLine1: "42 Rue du Circuit",
          city: "Lyon",
          postalCode: "69002",
          country: "France",
          phone: "+33 6 98 76 54 32",
          isDefault: true,
          type: AddressType.SHIPPING,
        },
      },
    },
  });
  console.log(`Created admin (${adminUser.email}) and customer (${testCustomer.email}).`);

  // 4. Categories & Multilingual Translations
  const categoriesData = [
    {
      slug: "kids-motorcycles",
      displayOrder: 1,
      imageUrl: "/images/categories/kids-bikes.jpg",
      translations: {
        fr: { name: "Motos Enfants", description: "Motos d'initiation et de compétition adaptées de 4 à 14 ans, alliant sécurité maximale et maniabilité." },
        en: { name: "Kids' Motorcycles", description: "Youth competition and beginner motorcycles tailored for ages 4 to 14 with premium safety features." },
        es: { name: "Motos para Niños", description: "Motos infantiles y juveniles de iniciación y competición de 4 a 14 años con total seguridad." },
        ar: { name: "دراجات نارية للأطفال", description: "دراجات نارية آمنة وتدريبية مخصصة للناشئين والأطفال من سن 4 إلى 14 سنة بأعلى معايير الأمان." },
      },
    },
    {
      slug: "adult-motorcycles",
      displayOrder: 2,
      imageUrl: "/images/categories/adult-bikes.jpg",
      translations: {
        fr: { name: "Motos Adultes", description: "Motos de motocross, enduro et supermotard haute performance pour pilotes et compétiteurs." },
        en: { name: "Adult Motorcycles", description: "Championship-grade motocross, enduro, and cross-country competition motorcycles." },
        es: { name: "Motos para Adultos", description: "Motos de motocross y enduro de alto rendimiento para competición y circuito." },
        ar: { name: "دراجات نارية للكبار", description: "دراجات نارية احترافية للموتوكروس والإندورو لسباقات البطولات والمسارات الوعرة." },
      },
    },
    {
      slug: "quad-bikes",
      displayOrder: 3,
      imageUrl: "/images/categories/quads.jpg",
      translations: {
        fr: { name: "Quads Tout-Terrain", description: "Quads sportifs et baroudeurs 4x4 puissants pour le franchissement et le loisir dynamique." },
        en: { name: "Quad Bikes & ATVs", description: "Sport and heavy-duty 4x4 all-terrain quads engineered for demanding wilderness exploration." },
        es: { name: "Quads Todoterreno", description: "Cuatrimotos y quads deportivos y utilitarios 4x4 para conquistar cualquier terreno." },
        ar: { name: "دراجات الدفع الرباعي (كواد)", description: "مركبات كواد رياضية ودفع رباعي 4x4 جبارة لتسلق الكثبان والمسارات الصحراوية والجبلية." },
      },
    },
    {
      slug: "cars-buggies",
      displayOrder: 4,
      imageUrl: "/images/categories/cars.jpg",
      translations: {
        fr: { name: "Voitures & Buggies", description: "Buggies SSV de compétition tout-terrain, crosskarts FIA et supercars tout-terrain." },
        en: { name: "Cars & Buggies", description: "High-horsepower side-by-side buggies, FIA crosskarts, and high-performance racing machines." },
        es: { name: "Coches y Buggies", description: "Buggies side-by-side extremos, crosskarts FIA y vehículos deportivos de circuito." },
        ar: { name: "سيارات وبوجي", description: "عربات بوجي SSV فائقة القوة للراليات، سيارات كروس كارت FIA، ومركبات السباقات المتطورة." },
      },
    },
    {
      slug: "riding-equipment",
      displayOrder: 5,
      imageUrl: "/images/categories/equipment.jpg",
      translations: {
        fr: { name: "Équipements & Protections", description: "Casques homologués, bottes rigides, pare-pierres, gants et tenues de course officielles." },
        en: { name: "Riding Equipment & Gear", description: "Certified racing helmets, articulated boots, body armor, and professional race wear." },
        es: { name: "Equipamiento y Protección", description: "Cascos homologados, botas articuladas, petos integrales y ropa técnica oficial." },
        ar: { name: "معدات وتجهيزات السلامة", description: "خوذات معتمدة، أحذية مدرعة، دروع لحماية الصدر والظهر، وبدلات سباق احترافية." },
      },
    },
  ];

  const categoryMap = new Map<string, string>();

  for (const cat of categoriesData) {
    const createdCat = await prisma.category.create({
      data: {
        slug: cat.slug,
        displayOrder: cat.displayOrder,
        imageUrl: cat.imageUrl,
        translations: {
          create: Object.entries(cat.translations).map(([locale, t]) => ({
            locale,
            name: t.name,
            description: t.description,
          })),
        },
      },
    });
    categoryMap.set(cat.slug, createdCat.id);
  }
  console.log("Created 5 core categories with 4-language translations.");

  // 5. Rich Products across ALL Categories
  const productsData = [
    // ----------------------------------------------------
    // CATEGORY: KIDS MOTORCYCLES
    // ----------------------------------------------------
    {
      slug: "ktm-50-sx-mini-2025",
      sku: "KTM-50SX-MINI",
      categorySlug: "kids-motorcycles",
      price: 4390.0,
      salePrice: 4190.0,
      vehicleType: VehicleType.MOTORCYCLE_KIDS,
      ageGroup: "4-8 years",
      engineCapacity: "50cc",
      isFeatured: true,
      stock: 6,
      images: [
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80", altText: "KTM 50 SX Mini side profile", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80", altText: "KTM 50 SX Mini workshop inspection", isPrimary: false, sortOrder: 1 },
      ],
      translations: {
        fr: {
          title: "KTM 50 SX Mini (2025)",
          shortDescription: "La véritable moto de compétition pour débuter dès le plus jeune âge.",
          description: "La KTM 50 SX Mini est conçue pour les jeunes champions de 4 à 8 ans. Dotée d'un moteur 2-temps automatique puissant et progressif, d'une suspension WP XACT de qualité supérieure et de freins à disque hydrauliques ultra-précis.",
          specifications: {
            "Moteur": "Monocylindre 2-temps 49 cc",
            "Refroidissement": "Liquide",
            "Embrayage": "Centrifuge automatique réglable",
            "Suspension avant": "Fourche inversée WP XACT AER 35 mm",
            "Hauteur de selle": "558 mm",
            "Capacité réservoir": "2.1 L",
            "Poids à sec": "40 kg",
          },
        },
        en: {
          title: "KTM 50 SX Mini (2025)",
          shortDescription: "A true competition motocross machine tailored for youngest racers.",
          description: "The KTM 50 SX Mini is built for rising stars aged 4 to 8. Featuring an automatic 2-stroke engine with smooth and controllable power delivery, premium WP XACT suspension, and hydraulic disc brakes.",
          specifications: {
            "Engine": "Single-cylinder 2-stroke 49 cc",
            "Cooling": "Liquid-cooled",
            "Clutch": "Adjustable automatic centrifugal",
            "Front Suspension": "WP XACT AER 35 mm upside-down fork",
            "Seat Height": "558 mm",
            "Fuel Capacity": "2.1 L",
            "Dry Weight": "40 kg",
          },
        },
        es: {
          title: "KTM 50 SX Mini (2025)",
          shortDescription: "Auténtica moto de competición para iniciarse desde temprana edad.",
          description: "La KTM 50 SX Mini está pensada para jóvenes pilotos de 4 a 8 años. Con un motor 2 tiempos automático de potencia progresiva y suspensiones WP XACT de primera categoría.",
          specifications: {
            "Motor": "Monocilíndrico 2 tiempos 49 cc",
            "Refrigeración": "Líquida",
            "Embrague": "Centrífugo automático regulable",
            "Suspensión delantera": "Horquilla invertida WP XACT AER 35 mm",
            "Altura de asiento": "558 mm",
            "Capacidad de combustible": "2.1 L",
            "Peso en seco": "40 kg",
          },
        },
        ar: {
          title: "كي تي إم 50 إس إكس ميني (2025)",
          shortDescription: "دراجة سباق حقيقية مصممة للمبتدئين الصغار.",
          description: "صُممت كي تي إم 50 إس إكس ميني للأبطال الصغار من 4 إلى 8 سنوات، بمحرك ثنائي الأشواط أوتوماتيكي ومساعدات WP XACT المتطورة وفرامل قرصية هيدروليكية لأقصى درجات الأمان والتحكم.",
          specifications: {
            "المحرك": "أسطوانة واحدة ثنائي الأشواط 49 سي سي",
            "التبريد": "تبريد سائل",
            "القابض": "طرد مركزي أوتوماتيكي قابل للتعديل",
            "المساعدات الأمامية": "WP XACT مقلوبة 35 مم",
            "ارتفاع المقعد": "558 مم",
            "سعة خزان الوقود": "2.1 لتر",
            "الوزن الجاف": "40 كجم",
          },
        },
      },
    },
    {
      slug: "yamaha-pw50-youth-trainer",
      sku: "YAM-PW50-2025",
      categorySlug: "kids-motorcycles",
      price: 2490.0,
      salePrice: 2349.0,
      vehicleType: VehicleType.MOTORCYCLE_KIDS,
      ageGroup: "3-6 years",
      engineCapacity: "50cc",
      isFeatured: false,
      stock: 8,
      images: [
        { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80", altText: "Yamaha PW50 Youth Dirt Bike", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Yamaha PW50 Youth Edition",
          shortDescription: "La moto d'initiation légendaire avec transmission par cardan sans chaîne.",
          description: "Depuis plus de 40 ans, la PW50 est le modèle de référence pour les tout-petits. Dotée d'un limiteur de vitesse par vis sur la poignée des gaz et d'un entraînement par arbre scellé ne nécessitant aucun entretien de chaîne.",
          specifications: {
            "Moteur": "2-temps 49 cc à injection d'huile séparée",
            "Transmission": "Par cardan sans chaîne (sécurisée)",
            "Boîte": "Automatique sans vitesses",
            "Hauteur de selle": "475 mm (ultra basse)",
            "Poids tous pleins faits": "41 kg",
            "Sécurité": "Vis de bridage parental d'accélérateur",
          },
        },
        en: {
          title: "Yamaha PW50 Youth Edition",
          shortDescription: "The iconic starter mini bike featuring maintenance-free shaft drive.",
          description: "For four decades, the PW50 has initiated world champions. Features an adjustable throttle stop screw, low 475mm seat height, and enclosed shaft drive eliminating exposed chains.",
          specifications: {
            "Engine": "49cc 2-stroke with autolube oil injection",
            "Final Drive": "Enclosed shaft (zero chain maintenance)",
            "Transmission": "Automatic single-speed",
            "Seat Height": "475 mm",
            "Wet Weight": "41 kg",
            "Safety": "Parental throttle limiter screw",
          },
        },
        es: {
          title: "Yamaha PW50 Youth Edition",
          shortDescription: "La mítica moto infantil con transmisión cardán sin mantenimiento.",
          description: "La preferida de generaciones para aprender a rodar. Altura de asiento accesible, embrague automático y transmisión por eje cardánico totalmente carenada para total seguridad.",
          specifications: {
            "Motor": "2 tiempos 49 cc con inyección de aceite automática",
            "Transmisión": "Cardán cerrado sin cadena",
            "Caja": "Automática",
            "Altura de asiento": "475 mm",
            "Peso en orden de marcha": "41 kg",
            "Seguridad": "Tornillo limitador de aceleración",
          },
        },
        ar: {
          title: "ياماها بي دبليو 50 التدريبية للناشئين",
          shortDescription: "الدراجة التدريبية الأسطورية مع عمود نقل حركة مغلق بالكامل.",
          description: "الخيار الأول في العالم لتعليم الأطفال ركوب الدراجات منذ عمر 3 سنوات، بدون سلاسل مكشوفة وبنظام تحديد سرعة قابل للتعديل بسهولة من قبل الوالدين.",
          specifications: {
            "المحرك": "49 سي سي ثنائي الأشواط بحقن زيت منفصل",
            "الدفع": "عمود كردان مغلق بالكامل",
            "ناقل الحركة": "أوتوماتيكي بالكامل",
            "ارتفاع المقعد": "475 مم",
            "الوزن": "41 كجم",
            "السلامة": "محدد سرعة للوالدين",
          },
        },
      },
    },
    {
      slug: "husqvarna-tc-65-junior",
      sku: "HUSQ-TC65-2025",
      categorySlug: "kids-motorcycles",
      price: 5490.0,
      salePrice: null,
      vehicleType: VehicleType.MOTORCYCLE_KIDS,
      ageGroup: "7-11 years",
      engineCapacity: "65cc",
      isFeatured: false,
      stock: 4,
      images: [
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=80", altText: "Husqvarna TC 65 Junior Competition", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Husqvarna TC 65 Junior Racing",
          shortDescription: "Moto de cross junior 6 rapports avec embrayage hydraulique Formula.",
          description: "Étape intermédiaire essentielle vers les grandes cylindrées, la TC 65 dispose d'une boîte mécanique à 6 rapports et d'un embrayage hydraulique souple. Cadre en acier au chrome-molybdène et suspensions WP XACT réglables.",
          specifications: {
            "Moteur": "2-temps 64.9 cc à valve d'échappement PCEV",
            "Boîte de vitesses": "6 rapports manuels",
            "Embrayage": "Hydraulique Formula",
            "Suspension": "Fourche inversée WP XACT 35 mm (course 215 mm)",
            "Hauteur de selle": "750 mm",
            "Poids à sec": "53 kg",
          },
        },
        en: {
          title: "Husqvarna TC 65 Junior Racing",
          shortDescription: "6-speed junior motocross machine with Formula hydraulic clutch.",
          description: "The next step up in youth motocross. Features a 6-speed manual gearbox, Formula hydraulic clutch, pressure-controlled exhaust valve (PCEV), and race-proven WP XACT suspension.",
          specifications: {
            "Engine": "64.9cc 2-stroke with PCEV exhaust valve",
            "Transmission": "6-speed manual",
            "Clutch": "Formula hydraulic",
            "Suspension": "WP XACT 35mm upside down fork",
            "Seat Height": "750 mm",
            "Dry Weight": "53 kg",
          },
        },
        es: {
          title: "Husqvarna TC 65 Junior Racing",
          shortDescription: "Moto de cross juvenil de 6 marchas con embrague hidráulico Formula.",
          description: "El salto natural para los jóvenes pilotos antes de las motos grandes. Con caja de cambios de 6 velocidades y amortiguación WP XACT de calidad profesional.",
          specifications: {
            "Motor": "2 tiempos 64.9 cc con válvula de escape PCEV",
            "Cambio": "6 velocidades manual",
            "Embrague": "Hidráulico Formula",
            "Suspensiones": "WP XACT 35 mm",
            "Altura asiento": "750 mm",
            "Peso en seco": "53 kg",
          },
        },
        ar: {
          title: "هوسكفارنا تي سي 65 جونيور ريسينغ",
          shortDescription: "دراجة كروس للناشئين بـ 6 سرعات وكلتش هيدروليكي فائق الدقة.",
          description: "المركبة المثالية للناشئين من 7 إلى 11 سنة الراغبين في خوض بطولات الموتوكروس الاحترافية، مزودة بناقل حركة 6 سرعات ومساعدات WP XACT.",
          specifications: {
            "المحرك": "64.9 سي سي ثنائي الأشواط مع صمام عادم PCEV",
            "ناقل الحركة": "يدوي 6 سرعات",
            "القابض": "هيدروليكي Formula",
            "المساعدات": "WP XACT مقلوبة 35 مم",
            "ارتفاع المقعد": "750 مم",
            "الوزن الجاف": "53 كجم",
          },
        },
      },
    },

    // ----------------------------------------------------
    // CATEGORY: ADULT MOTORCYCLES
    // ----------------------------------------------------
    {
      slug: "yamaha-yz125-monster-edition",
      sku: "YAM-YZ125-ME",
      categorySlug: "adult-motorcycles",
      price: 8699.0,
      salePrice: 8299.0,
      vehicleType: VehicleType.MOTORCYCLE_ADULT,
      ageGroup: "Adult",
      engineCapacity: "125cc",
      isFeatured: true,
      stock: 4,
      images: [
        { url: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=1200&q=80", altText: "Yamaha YZ125 Racing Action", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1558980664-769d59546b3d?auto=format&fit=crop&w=1200&q=80", altText: "Yamaha YZ125 Front View", isPrimary: false, sortOrder: 1 },
      ],
      translations: {
        fr: {
          title: "Yamaha YZ125 Monster Energy Edition",
          shortDescription: "Le 2-temps de référence dans sa livrée d'usine exclusive.",
          description: "La Yamaha YZ125 Monster Energy Racing Edition allie un châssis en aluminium hyper maniable à un moteur 2-temps de 125 cc rageur. Son freinage haute puissance et ses suspensions KYB en font une arme redoutable en compétition.",
          specifications: {
            "Moteur": "Monocylindre 2-temps 125 cc avec YPVS",
            "Boîte de vitesses": "6 rapports manuels",
            "Cadre": "Aluminium à berceau semi-dédoublé",
            "Suspension": "Fourche inversée KYB Ø 48 mm",
            "Poids tous pleins faits": "95 kg",
            "Hauteur de selle": "975 mm",
          },
        },
        en: {
          title: "Yamaha YZ125 Monster Energy Edition",
          shortDescription: "The definitive 2-stroke motocross bike in exclusive factory livery.",
          description: "The Yamaha YZ125 Monster Energy Racing Edition pairs an ultra-agile aluminum chassis with a ferocious 125cc 2-stroke powerplant and industry-leading KYB suspension.",
          specifications: {
            "Engine": "125cc liquid-cooled 2-stroke with YPVS",
            "Transmission": "Constant-mesh 6-speed manual",
            "Frame": "Aluminum semi-double cradle",
            "Suspension": "KYB 48mm inverted fork",
            "Wet Weight": "95 kg",
            "Seat Height": "975 mm",
          },
        },
        es: {
          title: "Yamaha YZ125 Monster Energy Edition",
          shortDescription: "La referencia del 2 tiempos con decoración oficial de fábrica.",
          description: "La Yamaha YZ125 edición Monster Energy destaca por su chasis de aluminio ligero, motor de 125cc con válvula YPVS y suspensión KYB de alto nivel.",
          specifications: {
            "Motor": "Monocilíndrico 2 tiempos 125 cc con YPVS",
            "Transmisión": "6 velocidades manual",
            "Chasis": "Aluminio de semi-doble cuna",
            "Suspensión": "Horquilla invertida KYB 48 mm",
            "Peso en orden de marcha": "95 kg",
            "Altura del asiento": "975 mm",
          },
        },
        ar: {
          title: "ياماها واي زد 125 نسخة مونستر إنرجي",
          shortDescription: "المرجع العالمي لدراجات الموتوكروس ثنائية الأشواط بهوية السباقات الرسمية.",
          description: "تجمع ياماها واي زد 125 بين هيكل الألمنيوم فائق الخفة ومحرك 125 سي سي فائق الاستجابة ومساعدات KYB الرياضية، لتمنحك أداء السباقات الاحترافي.",
          specifications: {
            "المحرك": "125 سي سي تبريد سائل بصمام YPVS",
            "ناقل الحركة": "يدوي 6 سرعات",
            "الهيكل": "ألمنيوم متطور",
            "المساعدات": "KYB مقلوبة 48 مم",
            "الوزن بكامل السوائل": "95 كجم",
            "ارتفاع المقعد": "975 مم",
          },
        },
      },
    },
    {
      slug: "ktm-450-sxf-factory-edition",
      sku: "KTM-450SXF-FE",
      categorySlug: "adult-motorcycles",
      price: 13200.0,
      salePrice: 12850.0,
      vehicleType: VehicleType.MOTORCYCLE_ADULT,
      ageGroup: "Adult",
      engineCapacity: "450cc",
      isFeatured: true,
      stock: 3,
      images: [
        { url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80", altText: "KTM 450 SX-F Factory Edition", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "KTM 450 SX-F Factory Edition (63 ch)",
          shortDescription: "La machine championne du monde MXGP avec Quickshifter et connectivité GPS.",
          description: "Dotée du moteur 450 cc le plus puissant de sa catégorie produisant 63 chevaux, d'un silencieux Akrapovič en titane, de tés de fourche usinés CNC et de l'unité de connectivité hors route (CUO) pour réglage moteur via smartphone.",
          specifications: {
            "Puissance": "63 chevaux à 9 500 tr/min",
            "Moteur": "Monocylindre 4-temps 449.9 cc SACT",
            "Échappement": "Silencieux Akrapovič Titane usine",
            "Électronique": "Quickshifter, Launch Control & Contrôle de traction",
            "Poids à sec": "102.6 kg",
            "Suspension": "WP XACT AER 48 mm à valve centrale",
          },
        },
        en: {
          title: "KTM 450 SX-F Factory Edition (63 HP)",
          shortDescription: "Championship-winning 450cc weapon with Quickshifter and telemetry module.",
          description: "Pumps out a blistering 63 horsepower through a single overhead camshaft engine. Features Akrapovič slip-on titanium exhaust, Factory CNC triple clamps, and Connectivity Unit Offroad with LitPro telemetry.",
          specifications: {
            "Power": "63 HP @ 9,500 RPM",
            "Engine": "449.9cc SOHC 4-stroke",
            "Exhaust": "Factory Akrapovič Titanium silencer",
            "Electronics": "Quickshifter, Launch Control & Traction Control",
            "Dry Weight": "102.6 kg",
            "Suspension": "WP XACT 48mm split air fork",
          },
        },
        es: {
          title: "KTM 450 SX-F Factory Edition (63 CV)",
          shortDescription: "La moto campeona del mundo con Quickshifter y escape Akrapovič de titanio.",
          description: "63 caballos directos al neumático trasero. Incluye telemetría GPS integrada, tijas mecanizadas CNC anodizadas en naranja y suspensiones WP XACT de competición.",
          specifications: {
            "Potencia": "63 CV a 9.500 RPM",
            "Motor": "Monocilíndrico 4 tiempos 449.9 cc",
            "Escape": "Akrapovič de titanio oficial",
            "Electrónica": "Quickshifter, control de salida y tracción",
            "Peso en seco": "102.6 kg",
            "Suspensiones": "WP XACT AER 48 mm",
          },
        },
        ar: {
          title: "كي تي إم 450 إس إكس-إف نسخة المصنع (63 حصان)",
          shortDescription: "دراجة بطولات العالم للموتوكروس بنظام كويك شيفتر وعادم أكرابوفيتش تيتانيوم.",
          description: "تولد قوة هائلة تبلغ 63 حصاناً بفضل محرك 450 سي سي فائق التطور. تشمل نظام إطلاق وتحكم في الجر ووحدة اتصال إلكترونية لضبط الخرائط عبر الهاتف الذكي.",
          specifications: {
            "القوة القصوى": "63 حصان عند 9500 دورة/دقيقة",
            "المحرك": "449.9 سي سي 4 أشواط عمود كامة مفرد",
            "العادم": "أكرابوفيتش تيتانيوم رسمي",
            "الإلكترونيات": "كويك شيفتر، تحكم بالانطلاق، وتحكم بالجر",
            "الوزن الجاف": "102.6 كجم",
            "المساعدات": "WP XACT AER 48 مم الهوائية",
          },
        },
      },
    },
    {
      slug: "beta-rr-300-racing-2t-enduro",
      sku: "BETA-RR300-RC",
      categorySlug: "adult-motorcycles",
      price: 10490.0,
      salePrice: 9990.0,
      vehicleType: VehicleType.MOTORCYCLE_ADULT,
      ageGroup: "Adult",
      engineCapacity: "300cc",
      isFeatured: false,
      stock: 3,
      images: [
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80", altText: "Beta RR 300 Racing Enduro", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Beta RR 300 Racing 2T Enduro",
          shortDescription: "L'arme absolue du Hard-Enduro avec fourche KYB à cartouche fermée.",
          description: "La reine des franchissements extrêmes. Moteur 2-temps 300 cc équipé d'un arbre d'équilibrage pour neutraliser les vibrations, culasse double bougie et suspensions KYB Racing préparées en usine.",
          specifications: {
            "Moteur": "Monocylindre 2-temps 292.6 cc à équilibreur",
            "Suspension avant": "Fourche KYB AOS Ø 48 mm cartouche fermée",
            "Embrayage": "Multidisque en bain d'huile à commande hydraulique",
            "Réservoir": "9.5 Litres",
            "Poids à sec": "103.5 kg",
          },
        },
        en: {
          title: "Beta RR 300 Racing 2T Enduro",
          shortDescription: "The pure hard-enduro weapon with KYB closed-cartridge suspension.",
          description: "Engineered to conquer vertical rock faces and treacherous mud. Features a counterbalancer to cancel vibrations, twin-spark ignition, and factory-tuned KYB 48mm closed-cartridge forks.",
          specifications: {
            "Engine": "292.6cc 2-stroke with counterbalancer",
            "Front Fork": "KYB AOS 48mm closed cartridge",
            "Clutch": "Hydraulically operated wet multi-disc",
            "Fuel Tank": "9.5 Liters",
            "Dry Weight": "103.5 kg",
          },
        },
        es: {
          title: "Beta RR 300 Racing 2T Enduro",
          shortDescription: "La reina del Hard Enduro con horquilla KYB de cartucho cerrado.",
          description: "Tracción constante en las trialeras más empinadas. Motor de 300cc con eje de equilibrado, culata de doble bujía y chasis de cromo-molibdeno ultra estrecho.",
          specifications: {
            "Motor": "Monocilíndrico 2 tiempos 292.6 cc con eje de balance",
            "Horquilla": "KYB AOS 48 mm de cartucho cerrado",
            "Embrague": "Hidráulico",
            "Depósito": "9.5 Litros",
            "Peso en seco": "103.5 kg",
          },
        },
        ar: {
          title: "بيتا آر آر 300 ريسينغ إندورو ثنائية الأشواط",
          shortDescription: "سيدة سباقات الهارد إندورو وتحديات التضاريس الجبلية القاسية.",
          description: "صُممت لتسلق الصخور والطرق الجبلية الوعرة بمحرك 300 سي سي ذو عزم دوران جبار ومساعدات KYB بنظام الكبسولة المغلقة.",
          specifications: {
            "المحرك": "292.6 سي سي ثنائي الأشواط بعمود موازنة",
            "المساعدات": "KYB AOS كبسولة مغلقة 48 مم",
            "القابض": "هيدروليكي متعدد الأقراص",
            "خزان الوقود": "9.5 لتر",
            "الوزن الجاف": "103.5 كجم",
          },
        },
      },
    },

    // ----------------------------------------------------
    // CATEGORY: QUAD BIKES
    // ----------------------------------------------------
    {
      slug: "can-am-renegade-1000r-xxc",
      sku: "CANAM-REN-1000R",
      categorySlug: "quad-bikes",
      price: 17290.0,
      salePrice: null,
      vehicleType: VehicleType.QUAD,
      ageGroup: "Adult",
      engineCapacity: "1000cc",
      isFeatured: true,
      stock: 2,
      images: [
        { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80", altText: "Can-Am Renegade Quad Bike", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Can-Am Renegade 1000R X xc (2025)",
          shortDescription: "Le quad sportif le plus puissant du marché pour franchir tous les obstacles.",
          description: "Le Renegade 1000R X xc délivre 91 chevaux grâce à son moteur Rotax bicylindre en V de 976 cc. Amortisseurs FOX 1.5 PODIUM RC2, transmission 2x4 / 4x4 avec blocage Visco-4Lok.",
          specifications: {
            "Moteur": "Bicylindre en V Rotax 976 cc de 91 ch",
            "Transmission": "CVT avec sélecteur 2RM / 4RM et Visco-4Lok",
            "Amortisseurs": "FOX 1.5 PODIUM RC2 ajustables",
            "Direction": "Assistée dynamique tri-mode (DPS)",
            "Garde au sol": "267 mm",
            "Capacité de remorquage": "590 kg",
          },
        },
        en: {
          title: "Can-Am Renegade 1000R X xc (2025)",
          shortDescription: "The most potent high-performance sport quad built for tough terrain.",
          description: "The Renegade 1000R X xc pushes 91 horsepower through a 976cc Rotax V-Twin. Equipped with FOX 1.5 PODIUM RC2 shocks and Visco-4Lok front differential lock.",
          specifications: {
            "Engine": "976cc Rotax V-Twin producing 91 HP",
            "Drivetrain": "Selectable 2WD / 4WD with Visco-4Lok differential",
            "Shocks": "FOX 1.5 PODIUM RC2 adjustable",
            "Power Steering": "Tri-Mode Dynamic Power Steering (DPS)",
            "Ground Clearance": "267 mm",
            "Towing Capacity": "590 kg",
          },
        },
        es: {
          title: "Can-Am Renegade 1000R X xc (2025)",
          shortDescription: "El quad deportivo más potente para superar cualquier desafío extremo.",
          description: "Con 91 caballos de fuerza procedentes de su motor Rotax V-Twin de 976 cc, suspensión FOX PODIUM y bloqueo Visco-4Lok.",
          specifications: {
            "Motor": "Bicilíndrico en V Rotax 976 cc de 91 CV",
            "Tracción": "2x4 / 4x4 seleccionable con Visco-4Lok",
            "Amortiguación": "FOX 1.5 PODIUM RC2",
            "Dirección": "Asistida dinámica en tres modos (DPS)",
            "Despeje al suelo": "267 mm",
            "Capacidad de remolque": "590 kg",
          },
        },
        ar: {
          title: "كان-آم رينيجيد 1000 آر إكس إكس سي (2025)",
          shortDescription: "أقوى دراجة دفع رباعي رياضية مصممة لقهر أقسى التضاريس.",
          description: "تولد رينيجيد 1000 آر قوة 91 حصاناً عبر محرك Rotax V-Twin سعة 976 سي سي، مع نظام تعليق FOX المتكيف وقفل تفاضلي أمامي Visco-4Lok.",
          specifications: {
            "المحرك": "Rotax V-Twin سعة 976 سي سي بقوة 91 حصان",
            "نظام الدفع": "قابل للتحويل 2x4 / 4x4 مع Visco-4Lok",
            "المساعدات": "FOX 1.5 PODIUM RC2 الرياضية",
            "التوجيه": "توجيه كهربائي ديناميكي ثلاثي الأوضاع",
            "الخلوص الأرضي": "267 مم",
            "قدرة القطر": "590 كجم",
          },
        },
      },
    },
    {
      slug: "yamaha-yfz450r-special-edition",
      sku: "YAM-YFZ450R-SE",
      categorySlug: "quad-bikes",
      price: 12990.0,
      salePrice: 12499.0,
      vehicleType: VehicleType.QUAD,
      ageGroup: "Adult",
      engineCapacity: "450cc",
      isFeatured: true,
      stock: 3,
      images: [
        { url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80", altText: "Yamaha YFZ450R Special Edition", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Yamaha YFZ450R Special Edition",
          shortDescription: "Le quad de course sur piste et de sable champion de France et d'Europe.",
          description: "Conçu pour les courses de cross et les endurances sur sable (Enduropale). Châssis hybride aluminium/acier, moteur 450 cc 5 soupapes à injection et embrayage assisté anti-dribble.",
          specifications: {
            "Moteur": "Monocylindre 4-temps 449 cc à 5 soupapes en titane",
            "Alimentation": "Injection électronique Mikuni Ø 42 mm",
            "Châssis": "Hybride aluminium coulé et acier tubulaire",
            "Embrayage": "Assisté anti-dribble à glissement limité",
            "Suspension": "KYB à double réservoir séparé (débattement 250 mm)",
            "Poids tous pleins faits": "184 kg",
          },
        },
        en: {
          title: "Yamaha YFZ450R Special Edition",
          shortDescription: "Championship-proven sport quad engineered for track motocross and dune racing.",
          description: "Dominates MX tracks and deep sand. Features a 5-titanium-valve 449cc race engine, assist & slipper clutch for ultra-light lever pull, and fully adjustable piggyback KYB shocks.",
          specifications: {
            "Engine": "449cc liquid-cooled 5-titanium-valve DOHC",
            "Fuel Delivery": "Mikuni 42mm electronic fuel injection",
            "Frame": "Hybrid aluminum and steel tube construction",
            "Clutch": "Assist and slipper clutch",
            "Suspension": "Independent double wishbone KYB piggyback",
            "Wet Weight": "184 kg",
          },
        },
        es: {
          title: "Yamaha YFZ450R Edición Especial",
          shortDescription: "El quad deportivo de referencia en pistas de carreras y dunas de arena.",
          description: "Chasis híbrido ultraligero de aluminio, motor de 5 válvulas de titanio y embrague antirrebote que reduce drásticamente la fatiga del piloto.",
          specifications: {
            "Motor": "4 tiempos 449 cc con 5 válvulas de titanio",
            "Inyección": "Electrónica Mikuni 42 mm",
            "Chasis": "Estructura híbrida de aluminio y acero",
            "Embrague": "Antirrebote y asistido",
            "Amortiguación": "KYB de doble depósito",
            "Peso en orden de marcha": "184 kg",
          },
        },
        ar: {
          title: "ياماها واي إف زد 450 آر الإصدار الخاص",
          shortDescription: "كواد السباقات الاحترافي لحلبات الموتوكروس وتحديات الكثبان الرملية.",
          description: "يسيطر على سباقات السرعة والراليات الرملية بفضل محرك 449 سي سي بـ 5 صمامات تيتانيوم وهيكل ألمنيوم هجين خفيف الوزن وكلتش انزلاقي ضد الارتداد.",
          specifications: {
            "المحرك": "449 سي سي تبريد سائل بـ 5 صمامات تيتانيوم",
            "نظام الوقود": "حقن وقود إلكتروني Mikuni 42 مم",
            "الهيكل": "هجين من الألمنيوم المسبوك وأنابيب الصلب",
            "القابض": "انزلاقي مدعوم بتقنية مانع الارتداد",
            "المساعدات": "KYB مزدوجة قابلة للتعديل بالكامل",
            "الوزن": "184 كجم",
          },
        },
      },
    },
    {
      slug: "polaris-outlaw-70-efi",
      sku: "POL-OUTLAW-70",
      categorySlug: "quad-bikes",
      price: 3690.0,
      salePrice: 3490.0,
      vehicleType: VehicleType.QUAD,
      ageGroup: "6-11 years",
      engineCapacity: "70cc",
      isFeatured: false,
      stock: 5,
      images: [
        { url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80", altText: "Polaris Outlaw 70 Kids Quad", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Polaris Outlaw 70 EFI (Jeunesse)",
          shortDescription: "Sécurité maximale et injection électronique pour jeunes pilotes.",
          description: "Le Polaris Outlaw 70 EFI est parfait pour initier les jeunes de 6 à 11 ans en toute confiance. Moteur 70 cc à injection électronique avec démarreur électrique et limiteur de vitesse ajustable par les parents.",
          specifications: {
            "Moteur": "4-temps monocylindre 70 cc à injection (EFI)",
            "Démarrage": "Électrique",
            "Sécurité": "Coupe-circuit à cordon et limiteur de vitesse",
            "Éclairage": "Feux avant à LED",
            "Transmission": "Automatique PVT (Marche avant simple)",
          },
        },
        en: {
          title: "Polaris Outlaw 70 EFI (Youth)",
          shortDescription: "Electronic fuel injection and parent-adjustable safety for kids.",
          description: "The Polaris Outlaw 70 EFI provides confidence for riders ages 6 to 11. Powered by a 70cc EFI engine with electric start and parental speed control limiter.",
          specifications: {
            "Engine": "70cc 4-stroke single cylinder with EFI",
            "Starting": "Electric start with backup kick",
            "Safety": "Safety tether and parent-adjustable speed limiter",
            "Lighting": "Bright LED headlights",
            "Drivetrain": "Automatic PVT (Forward only)",
          },
        },
        es: {
          title: "Polaris Outlaw 70 EFI (Infantil)",
          shortDescription: "Seguridad electrónica e inyección directa para jóvenes aventureros.",
          description: "Ideal para niños de 6 a 11 años con limitador parental de velocidad, arranque eléctrico y sistema de seguridad con cordón.",
          specifications: {
            "Motor": "Monocilíndrico 4 tiempos 70 cc con inyección electrónica",
            "Arranque": "Eléctrico",
            "Seguridad": "Cordón cortacorriente y limitador de velocidad",
            "Iluminación": "Faros LED de alta visibilidad",
            "Transmisión": "Automática PVT",
          },
        },
        ar: {
          title: "بولاريس أوتلو 70 إي إف آي (للصغار)",
          shortDescription: "أمان متكامل ونظام حقن وقود إلكتروني للفرسان الصغار.",
          description: "الدراجة المثالية لتعليم الأطفال من سن 6 إلى 11 سنة القيادة الآمنة، مزودة بمحدد سرعة يتحكم به أولياء الأمور وحبل أمان لإيقاف المحرك تلقائياً.",
          specifications: {
            "المحرك": "4 أشواط 70 سي سي بحقن وقود إلكتروني (EFI)",
            "التشغيل": "تشغيل كهربائي بضغطة زر",
            "السلامة": "حبل أمان ومحدد سرعة للوالدين",
            "الإضاءة": "مصابيح LED أمامية ساطعة",
            "ناقل الحركة": "أوتوماتيكي PVT",
          },
        },
      },
    },

    // ----------------------------------------------------
    // CATEGORY: CARS & BUGGIES (NEW & DISTINCTIVE DATA)
    // ----------------------------------------------------
    {
      slug: "can-am-maverick-r-rs-turbo-rr",
      sku: "CANAM-MAV-R-240",
      categorySlug: "cars-buggies",
      price: 45900.0,
      salePrice: 44990.0,
      vehicleType: VehicleType.CAR,
      ageGroup: "Adult",
      engineCapacity: "1000cc Turbo",
      isFeatured: true,
      stock: 2,
      images: [
        { url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80", altText: "Can-Am Maverick R RS Turbo Buggy", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80", altText: "Maverick R Cockpit Dual Screen", isPrimary: false, sortOrder: 1 },
      ],
      translations: {
        fr: {
          title: "Can-Am Maverick R RS Turbo (240 ch)",
          shortDescription: "Le SSV le plus extrême du monde avec boîte séquentielle double embrayage 7 rapports.",
          description: "Véritable monstre des dunes et des pistes de Baja, le Maverick R développe 240 chevaux grâce à son moteur 3-cylindres Rotax 999 cc turbocompressé. Suspensions semi-actives Smart-Shox de 66 cm de débattement et écran tactile 10.25 pouces avec navigation embarquée.",
          specifications: {
            "Puissance": "240 chevaux à 9 100 tr/min",
            "Moteur": "Rotax 999 cc 3-cylindres Turbo avec échangeur d'air",
            "Transmission": "Boîte Rotax DCT 7 rapports à double embrayage avec palettes au volant",
            "Suspension": "FOX 3.0 PODIUM Piggyback avec Smart-Shox (660 mm débattement)",
            "Châssis": "Cage d'arceau intégrale en acier double phase haute résistance",
            "Écran": "Tactile 10.25 pouces avec caméras avant/arrière",
          },
        },
        en: {
          title: "Can-Am Maverick R RS Turbo (240 HP)",
          shortDescription: "The world's most powerful side-by-side buggy with 7-speed dual-clutch transmission.",
          description: "Dominating desert rallies worldwide, the Maverick R pushes 240 horsepower from a turbocharged 999cc Rotax inline-triple. Features paddle-shift 7-speed DCT and Fox Smart-Shox semi-active suspension with 26 inches of travel.",
          specifications: {
            "Power": "240 Horsepower @ 9,100 RPM",
            "Engine": "Rotax 999cc Turbocharged inline 3-cylinder",
            "Transmission": "7-speed Dual Clutch Transmission (DCT) with paddle shifters",
            "Suspension": "FOX 3.0 PODIUM with Smart-Shox (26 in travel)",
            "Frame": "Dual-phase high-strength steel full rollcage",
            "Display": "10.25-inch high-resolution touchscreen with telemetry",
          },
        },
        es: {
          title: "Can-Am Maverick R RS Turbo (240 CV)",
          shortDescription: "El buggy SSV más potente del planeta con cambio secuencial de 7 velocidades DCT.",
          description: "Diseñado para reinar en las dunas y en las bajas más salvajes. Motor de 3 cilindros turboalimentado de 240 CV, levas de cambio en el volante y amortiguación inteligente FOX Smart-Shox.",
          specifications: {
            "Potencia": "240 CV a 9.100 RPM",
            "Motor": "Rotax 999 cc 3 cilindros Turbo con intercooler",
            "Transmisión": "Doble embrague DCT de 7 marchas con levas",
            "Amortiguación": "FOX 3.0 PODIUM con Smart-Shox (660 mm de recorrido)",
            "Chasis": "Jaula de seguridad integral en acero de alta resistencia",
            "Pantalla": "Digital táctil de 10.25 pulgadas",
          },
        },
        ar: {
          title: "كان-آم مافريك آر آر إس تيربو (240 حصان)",
          shortDescription: "أقوى عربة بوجي SSV في العالم بناقل حركة مزدوج القابض بـ 7 سرعات.",
          description: "الأسطورة الحية لسباقات الرالي الصحراوية ورالي داكار، تولد 240 حصاناً من محرك روتكس ثلاثي الأسطوانات تيربو، مع نظام تعليق FOX الذكي وشاشة ملاحة وتحكم 10.25 بوصة.",
          specifications: {
            "القوة القصوى": "240 حصان عند 9100 دورة/دقيقة",
            "المحرك": "Rotax 999 سي سي تيربو ثلاثي الأسطوانات",
            "ناقل الحركة": "أوتوماتيكي رياضي DCT ثنائي القابض 7 سرعات مع بدالات مقود",
            "المساعدات": "FOX 3.0 PODIUM الذكية بمدى حركة 660 مم",
            "هيكل الأمان": "قفص حماية متكامل من الصلب المعالج فائق القوة",
            "الشاشة": "شاشة لمس 10.25 بوصة مع كاميرات أمامية وخلفية",
          },
        },
      },
    },
    {
      slug: "polaris-rzr-pro-r-ultimate-4-seater",
      sku: "POL-RZR-PROR-4",
      categorySlug: "cars-buggies",
      price: 49500.0,
      salePrice: 48500.0,
      vehicleType: VehicleType.CAR,
      ageGroup: "Adult",
      engineCapacity: "2000cc",
      isFeatured: true,
      stock: 2,
      images: [
        { url: "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=1200&q=80", altText: "Polaris RZR Pro R 4-Seater Extreme Buggy", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Polaris RZR Pro R Ultimate 4 Places (225 ch)",
          shortDescription: "Buggy tout-terrain 4 places avec moteur atmosphérique 2.0L et suspension DYNAMIX DV.",
          description: "Le summum du véhicule tout-terrain familial et d'expédition. Moteur ProStar Fury 4-cylindres de 2,0 litres atmosphérique délivrant 225 ch. Système de suspension active DYNAMIX DV ajustant la dureté des amortisseurs 200 fois par seconde.",
          specifications: {
            "Moteur": "ProStar Fury 2.0L 4-cylindres atmosphérique (225 ch)",
            "Châssis": "4 places grand confort avec harnais de sécurité 6 points",
            "Suspension": "DYNAMIX DV avec amortisseurs FOX 3.0 Live Valve X2",
            "Direction": "Assistée électronique assistée haute vitesse",
            "Largeur": "188 cm (voie extra-large pour stabilité ultime)",
            "Garde au sol": "406 mm",
          },
        },
        en: {
          title: "Polaris RZR Pro R Ultimate 4-Seater (225 HP)",
          shortDescription: "Extreme 4-passenger desert buggy powered by 2.0L ProStar Fury naturally aspirated engine.",
          description: "Unrivaled power and passenger capacity for cross-country expeditions. Features a 225-horsepower 2.0L four-cylinder engine, DYNAMIX DV active suspension, and Ride Command 7-inch GPS touchscreen.",
          specifications: {
            "Engine": "2.0L naturally-aspirated 4-cylinder ProStar Fury (225 HP)",
            "Seating": "4 adult seats with retractable 6-point harnesses",
            "Suspension": "DYNAMIX DV with FOX 3.0 Live Valve X2 shocks",
            "Vehicle Width": "74 inches for rock-solid stability",
            "Ground Clearance": "16 inches (406 mm)",
            "Audio & Nav": "Rockford Fosgate Stage 4 audio with Ride Command GPS",
          },
        },
        es: {
          title: "Polaris RZR Pro R Ultimate 4 Plazas (225 CV)",
          shortDescription: "Buggy extremo de 4 plazas con motor 2.0L atmosférico y suspensión DYNAMIX.",
          description: "La máquina definitiva para travesías y desierto con toda la familia o equipo. 225 caballos atmosféricos y suspensión FOX Live Valve controlada por ordenador en tiempo real.",
          specifications: {
            "Motor": "2.0L 4 cilindros atmosférico de 225 CV",
            "Capacidad": "4 plazas con arneses de competición",
            "Suspensión": "DYNAMIX DV con FOX 3.0 Live Valve",
            "Ancho": "188 cm para máxima estabilidad",
            "Despeje": "406 mm",
          },
        },
        ar: {
          title: "بولاريس آر زد آر برو آر التيميت 4 مقاعد (225 حصان)",
          shortDescription: "عربة بوجي صحراوية فائقة بـ 4 مقاعد ومحرك 2.0 لتر تنفس طبيعي جبار.",
          description: "أقوى مركبة رحلات صحراوية عائلية تتسع لـ 4 ركاب مع أحزمة أمان سباقات، ومحرك سعة 2000 سي سي بقوة 225 حصاناً، ونظام تعليق DYNAMIX الذكي.",
          specifications: {
            "المحرك": "سعة 2.0 لتر 4 أسطوانات بقوة 225 حصان",
            "المقاعد": "4 مقاعد مريحة بأحزمة سباقات 6 نقاط",
            "المساعدات": "FOX 3.0 Live Valve بنظام التكيف التلقائي",
            "العرض الكلي": "188 سم لثبات استثنائي في المنعطفات",
            "الخلوص الأرضي": "406 مم",
          },
        },
      },
    },
    {
      slug: "crosskart-yamaha-r6-600cc-fia",
      sku: "CK-R6-600-FIA",
      categorySlug: "cars-buggies",
      price: 25900.0,
      salePrice: 24900.0,
      vehicleType: VehicleType.CAR,
      ageGroup: "Adult",
      engineCapacity: "600cc",
      isFeatured: false,
      stock: 2,
      images: [
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80", altText: "FIA Crosskart 600cc Dirt Track Sprint", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Crosskart Yamaha R6 600cc FIA Sprint",
          shortDescription: "Véhicule de sprint sur terre homologué FFSA/FIA développant 125 ch pour 315 kg.",
          description: "Conçu pour les championnats d'Autocross et de Sprint Car. Propulsé par un moteur de Yamaha YZF-R6 préparé avec boîte séquentielle 6 vitesses à commande au volant. Un rapport poids/puissance spectaculaire (0 à 100 km/h en 3.1 secondes).",
          specifications: {
            "Moteur": "Yamaha YZF-R6 599 cc 4-cylindres préparé (125 ch à 14 500 tr/min)",
            "Poids": "315 kg en ordre de marche",
            "Transmission": "Boîte séquentielle 6 vitesses avec levier court au volant",
            "Châssis": "Tubulaire acier 25CrMo4 homologué FIA",
            "Suspension": "Ohlins TTX ou Reiger réglables 3 voies",
            "Accélération": "0 à 100 km/h en 3.1 secondes",
          },
        },
        en: {
          title: "Crosskart Yamaha R6 600cc FIA Sprint",
          shortDescription: "FIA-homologated dirt sprint racer producing 125 HP for only 315 kg.",
          description: "Built for Autocross and European Sprint Car championships. Powered by a high-revving Yamaha YZF-R6 supersport engine with sequential shift, rocketing from 0 to 100 km/h in 3.1 seconds.",
          specifications: {
            "Engine": "Yamaha YZF-R6 599cc inline-4 race tuned (125 HP @ 14,500 RPM)",
            "Weight": "315 kg race ready",
            "Transmission": "6-speed sequential with quickshift",
            "Chassis": "FIA certified 25CrMo4 seamless tubular steel",
            "Suspension": "Ohlins TTX 3-way adjustable shocks",
            "Acceleration": "0-100 km/h in 3.1 seconds",
          },
        },
        es: {
          title: "Crosskart Yamaha R6 600cc FIA Sprint",
          shortDescription: "Monoplaza de autocross homologado por la FIA con 125 CV y solo 315 kg.",
          description: "Pura aceleración en circuitos de tierra y asfalto. Motor de Yamaha R6 con cambio secuencial que alcanza las 14.500 RPM.",
          specifications: {
            "Motor": "Yamaha YZF-R6 599 cc de 125 CV",
            "Peso": "315 kg",
            "Cambio": "Secuencial de 6 marchas",
            "Chasis": "Tubular 25CrMo4 con homologación FIA",
            "Amortiguación": "Ohlins TTX regulable en 3 vías",
            "Aceleración": "0 a 100 km/h en 3.1 segundos",
          },
        },
        ar: {
          title: "كروس كارت ياماها آر 6 سعة 600 سي سي FIA",
          shortDescription: "سيارة سباقات ترابية معتمدة من الاتحاد الدولي للسيارات FIA بقوة 125 حصان ووزن 315 كجم.",
          description: "الآلة المثالية لسباقات الحلبات الترابية والأوتوكروس، تعتمد على محرك دراجة ياماها R6 الخارق مع ناقل حركة تتابعي سريع، وتسارع من 0 إلى 100 كم/س في 3.1 ثانية فقط.",
          specifications: {
            "المحرك": "ياماها R6 سعة 599 سي سي بقوة 125 حصان عند 14500 دورة/دقيقة",
            "الوزن": "315 كجم فقط",
            "ناقل الحركة": "تتابعي 6 سرعات",
            "الهيكل": "أنابيب صلب 25CrMo4 معتمدة من FIA",
            "المساعدات": "أولينز Ohlins TTX قابلة للتعديل ثلاثي الأبعاد",
            "التسارع": "من 0 إلى 100 كم/ساعة في 3.1 ثانية",
          },
        },
      },
    },

    // ----------------------------------------------------
    // CATEGORY: RIDING EQUIPMENT & PROTECTIVE GEAR
    // ----------------------------------------------------
    {
      slug: "alpinestars-tech-7-enduro-boots",
      sku: "ALP-TECH7-END",
      categorySlug: "riding-equipment",
      price: 429.95,
      salePrice: null,
      vehicleType: VehicleType.EQUIPMENT,
      ageGroup: "Adult",
      engineCapacity: null,
      isFeatured: true,
      stock: 12,
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80", altText: "Alpinestars Tech 7 Enduro Boots", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Bottes Alpinestars Tech 7 Enduro",
          shortDescription: "Protection tout-terrain d'élite avec semelle spéciale enduro.",
          description: "Les bottes Tech 7 Enduro intègrent une semelle sculptée brevetée offrant une adhérence supérieure lors des franchissements. Système de pivot biomécanique protégeant la cheville.",
          specifications: {
            "Homologation": "Certifiée CE EN 13634:2017",
            "Protection": "Plaque tibiale en TPU injecté haute résistance",
            "Fermeture": "4 boucles en aluminium micrométriques",
            "Semelle": "Double composé vulcanisé à forte adhérence",
          },
        },
        en: {
          title: "Alpinestars Tech 7 Enduro Boots",
          shortDescription: "Benchmark off-road protection featuring specialized enduro compound sole.",
          description: "The revolutionized Tech 7 Enduro boots incorporate innovative materials and technology in a completely new design for a lighter, more anatomically profiled performer.",
          specifications: {
            "Certification": "CE certified to EN 13634:2017",
            "Protection": "Contoured TPU shin plate protector",
            "Closure": "4 aluminum buckle system with memory lock",
            "Sole": "Specially engineered enduro dual-compound sole",
          },
        },
        es: {
          title: "Botas Alpinestars Tech 7 Enduro",
          shortDescription: "Máxima protección off-road con suela especializada de enduro.",
          description: "Las Tech 7 Enduro ofrecen una ergonomía superior, sistema de pivote biomecánico y suela antideslizante para agarre óptimo en terrenos difíciles.",
          specifications: {
            "Certificación": "Certificación CE EN 13634:2017",
            "Protección": "Placa de espinilla de TPU inyectado",
            "Cierres": "4 hebillas de aluminio con memoria",
            "Suela": "Compuesto dual específico para enduro",
          },
        },
        ar: {
          title: "أحذية ألبينستارز تيك 7 إندورو",
          shortDescription: "حماية احترافية للطرق الوعرة بنعل خاص لمسارات الإندورو الصعبة.",
          description: "توفر أحذية تيك 7 إندورو أقصى درجات الثبات والحماية للكاحل والساق بفضل نظام المفصل الميكانيكي الحيوي والمواد المقاومة للصدمات.",
          specifications: {
            "شهادة الأمان": "معتمدة أوروبياً CE EN 13634:2017",
            "الحماية": "درع قصبة الساق من مادة TPU الممتصة للصدمات",
            "نظام الإغلاق": "4 مشابك ألمنيوم دقيقة بذاكرة ضبط",
            "النعل": "مركب مزدوج عالي التماسك للطين والصخور",
          },
        },
      },
    },
    {
      slug: "arai-vx-pro4-motocross-helmet",
      sku: "ARAI-VX-PRO4",
      categorySlug: "riding-equipment",
      price: 749.0,
      salePrice: 699.0,
      vehicleType: VehicleType.EQUIPMENT,
      ageGroup: "Adult",
      engineCapacity: null,
      isFeatured: true,
      stock: 8,
      images: [
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80", altText: "Arai VX-Pro4 Motocross Helmet", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Casque Arai VX-Pro4 Solid White",
          shortDescription: "Le casque de motocross le plus sûr au monde, fabriqué à la main au Japon.",
          description: "Coque en fibres composites cLc (Complex Laminate Construction) conçue selon le concept R75 Glancing Off pour faire ricocher l'énergie d'impact. Système de retrait d'urgence des joues (ERS) et ventilation haute pression.",
          specifications: {
            "Norme": "Double homologation ECE 22.06 et SNELL M2025",
            "Coque": "Super fibres composites cLc fabriquées main",
            "Intérieur": "Dry-Cool démontable et lavable antibactérien",
            "Sécurité": "Système d'extraction d'urgence ERS",
            "Poids": "1 450 g (+/- 50 g)",
          },
        },
        en: {
          title: "Arai VX-Pro4 Solid Helmet",
          shortDescription: "The world's benchmark motocross helmet, handcrafted in Japan.",
          description: "The VX-Pro4 features Arai's proprietary cLc shell with the continuous R75 curve concept to glance off impact forces. Equipped with the Emergency Release Cheek Pad System and multi-stage ventilation.",
          specifications: {
            "Certifications": "ECE 22.06 and Snell M2025 certified",
            "Shell": "Handcrafted Complex Laminate Construction (cLc)",
            "Liner": "Dry-Cool antibacterial fully removable interior",
            "Emergency System": "Emergency Release Cheek Pads (ERS)",
            "Weight": "1,450 g (+/- 50 g)",
          },
        },
        es: {
          title: "Casco Arai VX-Pro4 Solid",
          shortDescription: "El casco de motocross más seguro, fabricado a mano en Japón.",
          description: "Calota en fibras complejas cLc diseñada para disipar la energía de los impactos. Con sistema de extracción rápida en caso de emergencia e interior lavable Dry-Cool.",
          specifications: {
            "Homologación": "ECE 22.06 y Snell M2025",
            "Calota": "Super fibras compuestas cLc",
            "Interior": "Desmontable y lavable Dry-Cool",
            "Seguridad": "Sistema de extracción de emergencia ERS",
            "Peso": "1.450 g",
          },
        },
        ar: {
          title: "خوذة أراي في إكس-برو 4 الاحترافية",
          shortDescription: "خوذة الموتوكروس الأكثر أماناً في العالم، مصنوعة يدوياً في اليابان.",
          description: "تعتمد على هيكل الألياف المركبة cLc لتشتيت قوة الصدمات بفاعلية. مزودة بنظام الإزالة السريعة للخدود في حالات الطوارئ وبطانة داخلية مضادة للبكتيريا.",
          specifications: {
            "معايير الأمان": "شهادات ECE 22.06 وSnell M2025 المزدوجة",
            "الهيكل الخارجي": "ألياف مركبة مصنوعة يدوياً في اليابان",
            "البطانة الداخلية": "Dry-Cool قابلة للفك والغسيل بالكامل",
            "نظام الطوارئ": "إزالة وسائد الخد السريعة ERS",
            "الوزن": "1450 جرام",
          },
        },
      },
    },
    {
      slug: "leatt-45-pro-chest-protector",
      sku: "LEATT-45-PRO",
      categorySlug: "riding-equipment",
      price: 229.0,
      salePrice: 209.0,
      vehicleType: VehicleType.EQUIPMENT,
      ageGroup: "Adult",
      engineCapacity: null,
      isFeatured: false,
      stock: 15,
      images: [
        { url: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1200&q=80", altText: "Leatt 4.5 Pro Chest and Back Protector", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Gilet Pare-Pierres Leatt 4.5 Pro",
          shortDescription: "Protection intégrale thorax, dos et côtes certifiée CE niveau 2.",
          description: "Coque rigide en polyéthylène haute densité associée à la mousse d'impact 3DF AirFit ventilée. Compatible avec les minerves Leatt Brace sans aucune gêne.",
          specifications: {
            "Homologation Thorax": "EN1621-3 Niveau 2",
            "Homologation Dos": "EN1621-2 Niveau 2",
            "Homologation Épaules": "EN1621-1",
            "Flancs": "Protection des côtes intégrée",
            "Ventilation": "Canaux d'air multi-fentes 3DF AirFit",
          },
        },
        en: {
          title: "Leatt 4.5 Pro Chest & Back Protector",
          shortDescription: "CE Level 2 hard shell chest and back protection with flank rib guards.",
          description: "Combines a tough hard-shell exterior with 3DF AirFit impact foam underneath. Multi-plate articulating design ensures natural rider mobility and full neck brace compatibility.",
          specifications: {
            "Chest Certification": "EN1621-3 Level 2",
            "Back Certification": "EN1621-2 Level 2",
            "Shoulder Certification": "EN1621-1",
            "Rib Guards": "Multi-layer flank protection panels",
            "Neck Brace Integration": "BraceOn neck brace fitting system",
          },
        },
        es: {
          title: "Peto Protector Leatt 4.5 Pro",
          shortDescription: "Protección integral para pecho, espalda y costillas con certificado CE Nivel 2.",
          description: "Estructura exterior rígida con espuma de impacto 3DF AirFit. Compatible con collarines cervicales y con amplias ranuras de ventilación.",
          specifications: {
            "Certificación Pecho": "EN1621-3 Nivel 2",
            "Certificación Espalda": "EN1621-2 Nivel 2",
            "Hombros": "EN1621-1",
            "Costillas": "Paneles laterales envolventes",
          },
        },
        ar: {
          title: "درع الصدر والظهر لييت 4.5 برو",
          shortDescription: "حماية شاملة للصدر والظهر والأضلاع معتمدة أوروبياً بمستوى الأمان الثاني CE Level 2.",
          description: "درع صلب مصفح مدعوم بطبقات فوم 3DF AirFit لامتصاص الصدمات وتهوية فائقة أثناء القيادة الحارة، متوافق مع دعامات الرقبة الرياضية.",
          specifications: {
            "حماية الصدر": "معتمدة EN1621-3 المستوى الثاني",
            "حماية الظهر": "معتمدة EN1621-2 المستوى الثاني",
            "حماية الأكتاف": "معتمدة EN1621-1",
            "حماية الأضلاع": "دروع جانبية لحماية الأضلاع",
            "التوافق": "متوافق مع مثبت الرقبة Leatt Brace",
          },
        },
      },
    },
    {
      slug: "fox-racing-180-gear-combo",
      sku: "FOX-180-COMBO",
      categorySlug: "riding-equipment",
      price: 199.90,
      salePrice: 179.90,
      vehicleType: VehicleType.EQUIPMENT,
      ageGroup: "Adult",
      engineCapacity: null,
      isFeatured: false,
      stock: 20,
      images: [
        { url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=1200&q=80", altText: "Fox Racing 180 Motocross Jersey & Pants Combo", isPrimary: true, sortOrder: 0 },
      ],
      translations: {
        fr: {
          title: "Ensemble Maillot & Pantalon Fox Racing 180",
          shortDescription: "La tenue motocross la plus populaire, alliant résistance et liberté de mouvement.",
          description: "Tissu TruDri anti-humidité pour rester au sec, panneaux extensibles TruMotion et renforts en cuir pleine fleur aux genoux résistant à la chaleur des échappements.",
          specifications: {
            "Maillot": "Tissu TruDri évacuant la transpiration avec col athlétique",
            "Pantalon": "Polyester 600D renforcé avec panneaux extensibles TruMotion",
            "Genoux": "Empiècements en cuir résistant à l'abrasion et à la chaleur",
            "Tailles": "Du S au XXL / 28 au 38 US",
          },
        },
        en: {
          title: "Fox Racing 180 Jersey & Pants Combo",
          shortDescription: "The world's most popular motocross gear set combining durability and mobility.",
          description: "Features moisture-wicking TruDri fabric to keep you cool and dry, TruMotion directional stretch panels for unrestricted rider mobility, and heat-resistant leather knee panels.",
          specifications: {
            "Jersey": "Moisture-wicking TruDri main body with athletic fit",
            "Pants": "Robust 600D polyester with TruMotion stretch zones",
            "Knee Panels": "Heat and abrasion-resistant leather knee guards",
            "Sizing": "Sizes S to XXL / 28 to 38 Waist",
          },
        },
        es: {
          title: "Conjunto Camiseta y Pantalón Fox Racing 180",
          shortDescription: "La equipación de motocross de referencia con tejido transpirable TruDri.",
          description: "Tejido que absorbe la humedad, paneles elásticos TruMotion para libertad total sobre la moto y paneles de cuero en las rodillas para proteger del calor del escape.",
          specifications: {
            "Camiseta": "Tejido TruDri de secado rápido",
            "Pantalón": "Poliéster 600D resistente al desgaste",
            "Rodillas": "Cuero resistente a la abrasión y temperatura",
            "Tallas": "S a XXL / 28 a 38",
          },
        },
        ar: {
          title: "طقم بدلة وقميص فوكس ريسينغ 180",
          shortDescription: "طقم ملابس الموتوكروس الأكثر شهرة في العالم بخامات TruDri المقاومة للحرارة.",
          description: "خامات مضادة للتعرق تحافظ على برودة الجسم، مع مناطق مرنة لسهولة الحركة والتحكم بالدراجة ودروع جلدية على الركبة لحماية الساق من حرارة أنظمة العادم.",
          specifications: {
            "القميص": "نسيج TruDri طارد للعرق ومقاوم للتمزق",
            "البنطال": "بوليستر 600D متين مع شرائح TruMotion المرنة",
            "الركبة": "ألواح جلدية طبيعية عازلة لحرارة المحرك",
            "المقاسات": "من S إلى XXL",
          },
        },
      },
    },
  ];

  for (const p of productsData) {
    const categoryId = categoryMap.get(p.categorySlug)!;

    const createdProduct = await prisma.product.create({
      data: {
        slug: p.slug,
        sku: p.sku,
        price: p.price,
        salePrice: p.salePrice,
        categoryId,
        vehicleType: p.vehicleType,
        ageGroup: p.ageGroup,
        engineCapacity: p.engineCapacity,
        isFeatured: p.isFeatured,
        status: ProductStatus.PUBLISHED,
        images: {
          create: p.images.map((img) => ({
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder,
            isPrimary: img.isPrimary,
          })),
        },
        translations: {
          create: Object.entries(p.translations).map(([locale, t]) => ({
            locale,
            title: t.title,
            shortDescription: t.shortDescription,
            description: t.description,
            specifications: t.specifications,
          })),
        },
        inventory: {
          create: {
            quantity: p.stock,
            reservedQuantity: 0,
            lowStockThreshold: 2,
            movements: {
              create: {
                type: InventoryMovementType.RESTOCK,
                quantityChange: p.stock,
                previousQuantity: 0,
                newQuantity: p.stock,
                reason: "Initial showroom inventory seed",
                createdById: adminUser.id,
              },
            },
          },
        },
      },
    });

    console.log(`Created product: ${createdProduct.slug} in ${p.categorySlug} (Stock: ${p.stock})`);
  }

  // 6. Promotions
  await prisma.promotion.create({
    data: {
      code: "WELCOME10",
      description: "10% off for new customers on riding gear",
      discountValue: 10.0,
      minOrderAmount: 100.0,
      isActive: true,
    },
  });
  console.log("Created WELCOME10 promotion code.");

  console.log("✅ Presty Motors database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
