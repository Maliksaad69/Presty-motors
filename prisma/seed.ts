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
        fr: { name: "Motos Enfants", description: "Motos adaptées pour enfants de 4 à 14 ans, alliant sécurité et plaisir d'initiation." },
        en: { name: "Kids' Motorcycles", description: "Bikes built for kids aged 4 to 14, combining safety and early riding excitement." },
        es: { name: "Motos para Niños", description: "Motos diseñadas para niños de 4 a 14 años, combinando seguridad y diversión." },
        ar: { name: "دراجات نارية للأطفال", description: "دراجات نارية مخصصة للأطفال من 4 إلى 14 سنة تجمع بين الأمان وتجربة قيادة ممتعة." },
      },
    },
    {
      slug: "adult-motorcycles",
      displayOrder: 2,
      imageUrl: "/images/categories/adult-bikes.jpg",
      translations: {
        fr: { name: "Motos Adultes", description: "Motos de cross, enduro et tout-terrain haute performance pour pilotes avertis." },
        en: { name: "Adult Motorcycles", description: "High-performance motocross, enduro, and all-terrain motorcycles for enthusiasts." },
        es: { name: "Motos para Adultos", description: "Motos de motocross, enduro y todoterreno de alto rendimiento para adultos." },
        ar: { name: "دراجات نارية للكبار", description: "دراجات نارية عالية الأداء للموتوكروس والطرق الوعرة لعشاق السرعة والمغامرة." },
      },
    },
    {
      slug: "quad-bikes",
      displayOrder: 3,
      imageUrl: "/images/categories/quads.jpg",
      translations: {
        fr: { name: "Quads & Buggies", description: "Quads utilitaires et sportifs pour adolescents et adultes, parfaits pour tous terrains." },
        en: { name: "Quad Bikes", description: "Sport and utility quad bikes for teens and adults, conquering every terrain with power." },
        es: { name: "Quads y Cuatrimotos", description: "Quads deportivos y utilitarios para jóvenes y adultos en cualquier tipo de terreno." },
        ar: { name: "دراجات الدفع الرباعي (كواد)", description: "كواد ودراجات دفع رباعي رياضية وعملية لجميع التضاريس والمسارات الوعرة." },
      },
    },
    {
      slug: "riding-equipment",
      displayOrder: 4,
      imageUrl: "/images/categories/equipment.jpg",
      translations: {
        fr: { name: "Équipements & Protections", description: "Casques, gants, bottes, gilets pare-pierres et tenues complètes de protection." },
        en: { name: "Riding Equipment & Gear", description: "Helmets, boots, body armour, gloves, and protective apparel from premier brands." },
        es: { name: "Equipamiento y Protección", description: "Cascos, botas, chalecos protectores, guantes y ropa especializada para pilotos." },
        ar: { name: "معدات وتجهيزات السلامة", description: "خوذات، أحذية، دروع واقية، قفازات وملابس قيادة متخصصة ومعتمدة." },
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
  console.log("Created 4 core categories with 4-language translations.");

  // 5. Products, Translations, Specs, Inventory & Audit Movements
  const productsData = [
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
      stock: 5,
      images: [
        { url: "https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80", altText: "KTM 50 SX Mini side profile", isPrimary: true, sortOrder: 0 },
        { url: "https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80", altText: "KTM 50 SX Mini cockpit view", isPrimary: false, sortOrder: 1 },
      ],
      translations: {
        fr: {
          title: "KTM 50 SX Mini (2025)",
          shortDescription: "La véritable moto de compétition pour débuter dès le plus jeune âge.",
          description: "La KTM 50 SX Mini est conçue pour les jeunes champions en herbe de 4 à 8 ans. Dotée d'un moteur 2-temps automatique puissant et progressif, d'une suspension WP XACT de qualité supérieure et de freins à disque hydrauliques ultra-précis.",
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
      slug: "yamaha-yz125-monster-edition",
      sku: "YAM-YZ125-ME",
      categorySlug: "adult-motorcycles",
      price: 8699.0,
      salePrice: 8299.0,
      vehicleType: VehicleType.MOTORCYCLE_ADULT,
      ageGroup: "Adult",
      engineCapacity: "125cc",
      isFeatured: true,
      stock: 3,
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
      slug: "polaris-outlaw-70-efi",
      sku: "POL-OUTLAW-70",
      categorySlug: "quad-bikes",
      price: 3690.0,
      salePrice: 3490.0,
      vehicleType: VehicleType.QUAD,
      ageGroup: "6-11 years",
      engineCapacity: "70cc",
      isFeatured: false,
      stock: 4,
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

    console.log(`Created product: ${createdProduct.slug} (Stock: ${p.stock})`);
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
