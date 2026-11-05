import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import { connectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Division } from '../models/Division.js';
import { Equipment } from '../models/Equipment.js';
import { AuditLog } from '../models/AuditLog.js';

dotenv.config();

const INITIAL_DIVISIONS = [
  {
    number: 1,
    slug: 'construction-civil-engineering',
    title: 'Construction & Civil Engineering',
    subtitle: 'Industrial, Municipal & Utility Infrastructure',
    shortDescription:
      'Turnkey heavy civil engineering, complex industrial foundation works, high-tolerance concrete slabs, and municipal infrastructure.',
    fullDescription:
      'TOPEK Construction delivers major civil infrastructure projects with meticulous structural calculations, site supervision, and rigorous HSE adherence. We specialize in deep foundation piling, heavy machinery foundation pads, industrial warehouses, drainage networks, and high-pressure pipeline civil works across Nigeria.',
    capabilities: [
      'Heavy Reinforced Concrete Foundations & Slabs',
      'Industrial Warehouses & Steel Superstructures',
      'Highway, Access Road & Culvert Engineering',
      'Valve Pit & Pipeline Civil Support Structures',
      'Effluent Treatment & Drainage Civil Works',
    ],
    icon: 'Buildings',
    image: '/assets/projects/general/20241221_141500.jpg',
    order: 1,
  },
  {
    number: 2,
    slug: 'architecture-surveying-consultancy',
    title: 'Architecture, Surveying & Consultancy',
    subtitle: '3D BIM Modeling, Geodetic Mapping & Feasibility',
    shortDescription:
      'Comprehensive architectural designs, topographic site surveys, environmental feasibility appraisals, and structural consultancy.',
    fullDescription:
      'We combine architectural ingenuity with technical precision. Using RTK GPS surveying, 3D laser mapping, and Revit/BIM modeling, our consultancy ensures constructibility, zoning compliance, and optimized material usage before breaking ground.',
    capabilities: [
      '3D Architectural Visualization & BIM Modeling',
      'Topographic & Geodetic Boundary Surveys',
      'Structural Integrity & Stress Analysis',
      'Bill of Quantities (BOQ) & Cost Engineering',
      'EIA & Environmental Regulatory Approvals',
    ],
    icon: 'Compass',
    image: '/assets/projects/general/IMG_20231016_094339_663.jpg',
    order: 2,
  },
  {
    number: 3,
    slug: 'skilled-manpower-specialist-trades',
    title: 'Skilled Manpower & Specialist Trades',
    subtitle: 'Certified Engineers, Coded Welders & Technical Crafts',
    shortDescription:
      'Deployment of certified structural, mechanical, and electrical engineers, 6G coded welders, scaffolding experts, and QA/QC inspectors.',
    fullDescription:
      'Human capital is the cornerstone of structural reliability. TOPEK deploys thoroughly vetted, certified technical personnel for complex project execution. From ASME/API certified pipe welders to COREN registered structural engineers, we guarantee technical excellence on every site.',
    capabilities: [
      'COREN Registered Civil & Structural Engineers',
      'ASME Section IX & API 1104 6G Coded Welders',
      'NDT Level II Radiography & Ultrasonic Technicians',
      'CISRS Certified Scaffolding Erection Teams',
      'Dedicated Site HSE Officers & Quality Controllers',
    ],
    icon: 'Users',
    image: '/assets/projects/completed/20201127_092812.jpg',
    order: 3,
  },
  {
    number: 4,
    slug: 'real-estate-property-development',
    title: 'Real Estate & Property Development',
    subtitle: 'Master-Planned Estates & Commercial Assets',
    shortDescription:
      'Strategic real estate development, contemporary residential estates, commercial office hubs, and turnkey facility lifecycle management.',
    fullDescription:
      'We design and construct prime residential gated communities, modern corporate office complexes, and high-yield commercial properties. Our development philosophy integrates sustainable green architecture, premium infrastructure, and maximum ROI for investors.',
    capabilities: [
      'Master-Planned Residential Communities',
      'Grade-A Commercial Office Complexes',
      'Built-to-Suit Industrial Facilities',
      'Turnkey Property Facility Management',
      'Land Banking & Title Regularization',
    ],
    icon: 'HouseLine',
    image: '/assets/projects/lindner-school/WhatsApp Image 2026-10-10 at 11.45.54 AM.jpeg',
    order: 4,
  },
  {
    number: 5,
    slug: 'furniture-interiors-exterior-decor',
    title: 'Furniture, Interiors & Exterior Décor',
    subtitle: 'Bespoke Joinery, Acoustic Partitions & Finishes',
    shortDescription:
      'Custom luxury cabinetry, executive office fit-outs, acoustic wall treatments, premium landscaping, and modern architectural façades.',
    fullDescription:
      'From boardroom luxury outfitting to industrial-grade acoustic dampening, our interior and exterior décor division transforms blank structural shells into aesthetically striking, ergonomic workspaces and premium residences.',
    capabilities: [
      'Executive Office & Boardroom Outfitting',
      'Bespoke Solid Hardwood Joinery & Cabinetry',
      'Acoustic Wall Paneling & Suspended Ceilings',
      'Architectural Cladding & Curtain Wall Façades',
      'Hardscape Paving & Modern Exterior Landscaping',
    ],
    icon: 'Armchair',
    image: '/assets/projects/global-earth/WhatsApp Image 2026-10-09 at 5.25.35 PM.jpeg',
    order: 5,
  },
  {
    number: 6,
    slug: 'general-procurement-supplies',
    title: 'General Procurement & Supplies',
    subtitle: 'OEM Line Pipes, Structural Steel & Heavy Materials',
    shortDescription:
      'Direct-from-manufacturer supply chains for ASTM high-tensile steel, high-pressure piping, industrial fittings, and heavy building commodities.',
    fullDescription:
      'TOPEK maintains direct relationships with ISO-certified global original equipment manufacturers (OEMs). We supply project-critical materials with full mill test certificates (MTC), ensuring uninterrupted material supply schedules and complete traceability.',
    capabilities: [
      'Structural Steel Beams, Rebars & Pre-stressing Wire',
      'API 5L Line Pipes & High-Pressure Fittings',
      'Industrial Ball Valves, Actuators & Metering Skids',
      'Heavy Geotextiles & Geosynthetic Liners',
      'Customized Industrial Fasteners & Flange Insulation',
    ],
    icon: 'Package',
    image: '/assets/projects/general/20201126_110021.jpg',
    order: 6,
  },
  {
    number: 7,
    slug: 'agriculture-agro-allied',
    title: 'Agriculture & Agro-Allied',
    subtitle: 'Commercial Farm Civil Infrastructure & Agro Processing',
    shortDescription:
      'Civil construction for large-scale agricultural processing plants, grain silos, drip irrigation canals, and farm access networks.',
    fullDescription:
      'Supporting Africa’s agricultural industrialization, we build modern agro-processing facilities, mechanized grain silos, refrigerated storage warehouses, and large-scale water management canals that withstand extreme weather and heavy seasonal throughput.',
    capabilities: [
      'Industrial Grain Silo Foundation & Erection',
      'Cold Chain Storage Warehouses & Sheds',
      'Commercial Drip & Pivot Irrigation Systems',
      'Farmland Access Roads, Bridges & Culverts',
      'Agro-Processing Heavy Mechanical Foundations',
    ],
    icon: 'Plant',
    image: '/assets/projects/general/20220716_122757.jpg',
    order: 7,
  },
  {
    number: 8,
    slug: 'heavy-haulage-logistics',
    title: 'Heavy Haulage & Logistics',
    subtitle: 'Overland Abnormal Loads & Plant Equipment Dispatch',
    shortDescription:
      'Specialized lowbed transport, mobile crane rigging, oversized cargo haulage, and site-to-site equipment mobilization across Nigeria.',
    fullDescription:
      'Our dedicated heavy transport fleet handles abnormal, oversized, and ultra-heavy equipment relocations across nationwide industrial corridors. With comprehensive route escorts, certified rigging crews, and lowbed multi-axle trailers, cargo arrives safely and on schedule.',
    capabilities: [
      'Multi-Axle Heavy Lowbed Semi-Trailers',
      'Mobile Crane Tandem Rigging & Loading',
      'Interstate Heavy Machinery Transport Escorts',
      'Bulk Aggregates & Cement Tanker Logistics',
      'Real-Time GPS Fleet Tracking & Route Auditing',
    ],
    icon: 'Truck',
    image: '/assets/projects/general/WhatsApp Image 2026-10-15 at 1.45.38 PM.jpeg',
    order: 8,
  },
];

const INITIAL_PROJECTS = [
  {
    title: 'Ardagh Nigeria Warehouse & Generator Upgrade',
    client: 'Ardagh Glass Packaging Nigeria Ltd.',
    scope:
      'Turnkey civil foundation expansion, structural steel warehousing, and heavy diesel generator foundation pads with reinforced acoustic baffles.',
    location: 'Ikeja Industrial Estate, Lagos',
    year: '2025 - Present',
    status: 'Ongoing',
    category: 'industrial-commercial',
    division: 'Construction & Civil Engineering',
    featured: true,
    mainImage: '/assets/projects/general/20241221_141500.jpg',
    galleryImages: [
      '/assets/projects/general/20241221_141500.jpg',
      '/assets/projects/general/20241228_150025.jpg',
      '/assets/projects/general/20241228_150029.jpg',
    ],
    order: 1,
  },
  {
    title: 'EPC of Civil/Structural for Gas Supply Pipeline to Mangal Cement Plant',
    client: 'NNPC/NGML & Mangal Industries Ltd.',
    scope:
      'Engineering, procurement, and heavy civil construction for cross-country natural gas pipeline river crossings, thrust blocks, valve pits, and PRMS foundations.',
    location: 'Iluagba, Kogi State',
    year: '2024 - Present',
    status: 'Ongoing',
    category: 'gas-energy',
    division: 'Construction & Civil Engineering',
    featured: true,
    mainImage: '/assets/projects/mangal-cement/WhatsApp Image 2026-10-16 at 2.38.19 PM.jpeg',
    galleryImages: [
      '/assets/projects/mangal-cement/WhatsApp Image 2026-10-16 at 2.38.19 PM.jpeg',
      '/assets/projects/mangal-cement/WhatsApp Image 2026-10-09 at 5.24.20 PM (1).jpeg',
      '/assets/projects/mangal-cement/WhatsApp Image 2026-10-09 at 2.35.02 PM (2).jpeg',
    ],
    order: 2,
  },
  {
    title: 'Construction of Lindner Nursery, Primary School and College',
    client: 'Lindner Education Foundation',
    scope:
      'Multi-storey educational institution construction featuring modern classrooms, administrative blocks, multi-sport courts, drainage, and perimeter perimeter civil security structures.',
    location: 'Simawa, Ogun State',
    year: '2024 - Present',
    status: 'Ongoing',
    category: 'civil-infrastructure',
    division: 'Real Estate & Property Development',
    featured: true,
    mainImage: '/assets/projects/lindner-school/WhatsApp Image 2026-10-10 at 11.45.54 AM.jpeg',
    galleryImages: [
      '/assets/projects/lindner-school/WhatsApp Image 2026-10-10 at 11.45.54 AM.jpeg',
      '/assets/projects/lindner-school/WhatsApp Image 2026-10-10 at 11.45.55 AM (1).jpeg',
      '/assets/projects/lindner-school/20260430_183533.jpg',
    ],
    order: 3,
  },
  {
    title: 'Water Supply Civil Infrastructure to Mangal Cement Factory',
    client: 'Mangal Industries Ltd.',
    scope:
      'Turnkey raw water intake civil station, booster pump structural housings, and over 12km high-density pipeline trenching and concrete encasement.',
    location: 'Iluagba, Kogi State',
    year: '2023 - 2024',
    status: 'Completed',
    category: 'civil-infrastructure',
    division: 'Construction & Civil Engineering',
    featured: true,
    mainImage: '/assets/projects/mangal-cement/WhatsApp Image 2026-10-09 at 2.35.02 PM (2).jpeg',
    galleryImages: [
      '/assets/projects/mangal-cement/WhatsApp Image 2026-10-09 at 2.35.02 PM (2).jpeg',
      '/assets/projects/mangal-cement/Designer (1).png',
    ],
    order: 4,
  },
  {
    title: 'Valve Pit Construction, 18" x 10km Pipeline Sapade to Orile Oko',
    client: 'NIPCO Gas Ltd.',
    scope:
      'Deep excavation, high-grade waterproof concrete valve chambers, heavy cover slab casting, and cathodic protection station enclosures along the interstate corridor.',
    location: 'Sapade to Orile Oko Corridor, Ogun State',
    year: '2023',
    status: 'Completed',
    category: 'gas-energy',
    division: 'Construction & Civil Engineering',
    featured: false,
    mainImage: '/assets/projects/completed/20201127_093955.jpg',
    galleryImages: [
      '/assets/projects/completed/20201127_093955.jpg',
      '/assets/projects/completed/20201127_093329.jpg',
    ],
    order: 5,
  },
  {
    title: 'Valve Pit Construction, 12" x 8km Pipeline Lekki-Epe Expressway',
    client: 'NIPCO Gas Ltd.',
    scope:
      'Civil construction of reinforced concrete sectional valve chambers in coastal sandy terrain with sheet-piling shoring and dewatering.',
    location: 'Lekki - Epe Expressway, Lagos State',
    year: '2023',
    status: 'Completed',
    category: 'gas-energy',
    division: 'Construction & Civil Engineering',
    featured: false,
    mainImage: '/assets/projects/completed/20201127_094009.jpg',
    galleryImages: [
      '/assets/projects/completed/20201127_094009.jpg',
      '/assets/projects/completed/20201126_174543.jpg',
    ],
    order: 6,
  },
  {
    title: 'Construction of Heavy Fabrication Yard Workshop',
    client: 'TOPEK Engineering',
    scope:
      'Heavy structural steel workshop framework, overhead gantry crane runway beams (20-ton capacity), precision leveled industrial flooring, and administrative annex.',
    location: 'Ogun / Lagos Industrial Corridor',
    year: '2024 - Present',
    status: 'Ongoing',
    category: 'industrial-commercial',
    division: 'Construction & Civil Engineering',
    featured: true,
    mainImage: '/assets/projects/general/20241228_150025.jpg',
    galleryImages: [
      '/assets/projects/general/20241228_150025.jpg',
      '/assets/projects/general/20241228_150029.jpg',
    ],
    order: 7,
  },
  {
    title: 'Warehouse & Administrative Complex',
    client: 'Global Earth Ltd.',
    scope:
      'Turnkey multi-bay distribution warehouse, 3-floor administrative office block, truck maneuvering concrete apron, and surrounding stormwater drainage.',
    location: 'Agbara Industrial Zone, Ogun State',
    year: '2024 - Present',
    status: 'Ongoing',
    category: 'industrial-commercial',
    division: 'Construction & Civil Engineering',
    featured: true,
    mainImage: '/assets/projects/global-earth/WhatsApp Image 2026-10-09 at 5.25.35 PM.jpeg',
    galleryImages: [
      '/assets/projects/global-earth/WhatsApp Image 2026-10-09 at 5.25.35 PM.jpeg',
      '/assets/projects/global-earth/IMG-20250918-WA0007.jpg',
      '/assets/projects/global-earth/IMG-20250918-WA0010.jpg',
    ],
    order: 8,
  },
  {
    title: 'EPCIC of Civil Works for 60 MMSCFD PRMS BUA Cement Phase 2',
    client: 'BUA Cement Plc',
    scope:
      'Complete civil foundations for high-pressure gas pressure regulating and metering station (PRMS), pipe support sleepers, control room building, and blast-resistant perimeter wall.',
    location: 'Kalambaina Industrial Area, Sokoto State',
    year: '2022 - 2023',
    status: 'Completed',
    category: 'industrial-commercial',
    division: 'Construction & Civil Engineering',
    featured: true,
    mainImage: '/assets/projects/general/GV 7.jpg',
    galleryImages: [
      '/assets/projects/general/GV 7.jpg',
      '/assets/projects/general/GV 8.jpg',
      '/assets/projects/general/GV 9.jpg',
      '/assets/projects/general/GV 10.jpg',
    ],
    order: 9,
  },
  {
    title: 'EPCIC of Civil/Structures for A.A. Rano Ltd. LOBP Plant',
    client: 'A.A. Rano Nigeria Ltd.',
    scope:
      'Lube Oil Blending Plant (LOBP) heavy civil engineering, processing vessel foundation pads, pump houses, secondary containment bund walls, and loading gantry slabs.',
    location: 'Ijegun Egba, Satellite Town, Lagos',
    year: '2022',
    status: 'Completed',
    category: 'industrial-commercial',
    division: 'Construction & Civil Engineering',
    featured: false,
    mainImage: '/assets/projects/general/civil2 (1).jpg',
    galleryImages: [
      '/assets/projects/general/civil2 (1).jpg',
      '/assets/projects/general/20220304_104803(0).jpg',
    ],
    order: 10,
  },
  {
    title: 'Civil & Structural Works of 22 Storage Tanks',
    client: 'A.A. Rano Nigeria Ltd.',
    scope:
      'Geotechnical soil improvement, concrete ring-beam tank foundations for 22 petroleum product storage tanks, impervious asphaltic internal bund paving, and firewater ring main civil routing.',
    location: 'Ijegun Egba, Satellite Town, Lagos',
    year: '2022 - 2023',
    status: 'Completed',
    category: 'specialized',
    division: 'Construction & Civil Engineering',
    featured: true,
    mainImage: '/assets/projects/completed/20201127_093340.jpg',
    galleryImages: [
      '/assets/projects/completed/20201127_093340.jpg',
      '/assets/projects/completed/20201127_093341.jpg',
      '/assets/projects/completed/20201126_110750.jpg',
    ],
    order: 11,
  },
];

const INITIAL_EQUIPMENT = [
  {
    name: 'CAT 320D & 330D Hydraulic Excavators',
    category: 'Earthmoving',
    quantity: '6 Units',
    specifications: 'Heavy crawler excavators with 1.4m³ - 2.0m³ heavy rock buckets, hydraulic breaker attachments.',
    status: 'Operational',
    order: 1,
  },
  {
    name: 'CAT D6R & Komatsu D85 Bulldozers',
    category: 'Earthmoving',
    quantity: '4 Units',
    specifications: 'Heavy semi-U tilt blades with multi-shank rippers for site clearing and rock levelling.',
    status: 'Operational',
    order: 2,
  },
  {
    name: 'Caterpillar 140K Motor Graders',
    category: 'Earthmoving',
    quantity: '3 Units',
    specifications: '14ft moldboard with precision laser slope control for roadbed subgrade compaction.',
    status: 'Operational',
    order: 3,
  },
  {
    name: 'Tadano & Sany All-Terrain Hydraulic Cranes (30T - 100T)',
    category: 'Lifting & Cranes',
    quantity: '5 Units',
    specifications: 'Telescopic booms up to 58m, continuous load moment indicator, 360-degree lift rating.',
    status: 'Operational',
    order: 4,
  },
  {
    name: 'Zoomlion 50m Jib Tower Cranes',
    category: 'Lifting & Cranes',
    quantity: '2 Units',
    specifications: 'Max hoisting capacity 8 Tons, tip load 1.3 Tons at 50m, anti-collision radar systems.',
    status: 'Mobilized',
    order: 5,
  },
  {
    name: 'Heavy Ready-Mix Concrete Truck Mixers (10m³)',
    category: 'Concrete & Paving',
    quantity: '12 Units',
    specifications: 'Mercedes Actros / Sinotruk 8x4 chassis with high-wear resistant drum and hydraulic discharge chute.',
    status: 'Operational',
    order: 6,
  },
  {
    name: 'Mobile Planetary Concrete Batching Plants (60m³/h)',
    category: 'Concrete & Paving',
    quantity: '2 Units',
    specifications: 'Automated aggregate weighing hoppers, dual 100-ton cement silos, computerized slump control.',
    status: 'Operational',
    order: 7,
  },
  {
    name: 'Heavy Dump Trucks (30T Howo/Sinotruk 6x4 & 8x4)',
    category: 'Haulage & Logistics',
    quantity: '18 Units',
    specifications: 'Hardox reinforced tipper bodies for mass earthmoving, ballast, and granite haulage.',
    status: 'Operational',
    order: 8,
  },
  {
    name: 'Multi-Axle Lowbed Semi-Trailers & Heavy Prime Movers',
    category: 'Haulage & Logistics',
    quantity: '8 Units',
    specifications: 'Up to 100-ton carrying capacity with hydraulic ramps for heavy construction equipment mobilization.',
    status: 'Operational',
    order: 9,
  },
  {
    name: 'Dynapac Asphalt Pavers & Pneumatic Tired Rollers',
    category: 'Concrete & Paving',
    quantity: '4 Units',
    specifications: 'High-compaction screeds with automatic grade and slope sensors for highway pavement.',
    status: 'Operational',
    order: 10,
  },
  {
    name: 'Leica TS07 Total Stations & RTK GNSS GPS Sets',
    category: 'Survey & Testing',
    quantity: '8 Sets',
    specifications: 'Sub-millimeter EDM accuracy, real-time geodetic kinematic mapping, and digital leveling.',
    status: 'Operational',
    order: 11,
  },
  {
    name: 'Industrial Soundproof Diesel Generators (100kVA - 1000kVA)',
    category: 'Power & Welding',
    quantity: '16 Units',
    specifications: 'Cummins & Perkins turbo-charged prime power generators with automatic transfer switches.',
    status: 'Operational',
    order: 12,
  },
  {
    name: 'High-Pressure Hydrostatic Test Pumps (up to 15,000 PSI)',
    category: 'Survey & Testing',
    quantity: '6 Sets',
    specifications: 'Pneumatic reciprocating test rigs with dual calibrated digital chart pressure recorders.',
    status: 'Operational',
    order: 13,
  },
];

async function seed() {
  await connectDB();
  console.log('[Seed] Seeding TOPEK Construction database...');

  // 1. Seed Superadmin
  const adminEmail = process.env.ADMIN_DEFAULT_EMAIL || 'admin@topekconstruction.com';
  const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD || 'TopekAdmin2026!Secure';

  const existingAdmin = await User.findOne({ email: adminEmail.toLowerCase() });
  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(adminPassword, salt);
    await User.create({
      name: 'TOPEK Executive Administrator',
      email: adminEmail.toLowerCase(),
      passwordHash,
      role: 'superadmin',
    });
    console.log(`[Seed] Created Superadmin: ${adminEmail}`);
  } else {
    console.log(`[Seed] Superadmin already exists: ${adminEmail}`);
  }

  // 2. Seed Divisions
  for (const div of INITIAL_DIVISIONS) {
    await Division.findOneAndUpdate({ number: div.number }, div, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${INITIAL_DIVISIONS.length} Integrated Divisions`);

  // 3. Seed Projects
  for (const proj of INITIAL_PROJECTS) {
    await Project.findOneAndUpdate({ title: proj.title }, proj, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${INITIAL_PROJECTS.length} Verified Projects`);

  // 4. Seed Equipment
  for (const eq of INITIAL_EQUIPMENT) {
    await Equipment.findOneAndUpdate({ name: eq.name }, eq, { upsert: true, new: true });
  }
  console.log(`[Seed] Seeded ${INITIAL_EQUIPMENT.length} Equipment Fleet Items`);

  // 5. Initial Audit Log
  await AuditLog.create({
    userEmail: adminEmail,
    action: 'DATABASE_SEEDED',
    resource: 'System',
    details: {
      divisions: INITIAL_DIVISIONS.length,
      projects: INITIAL_PROJECTS.length,
      equipment: INITIAL_EQUIPMENT.length,
    },
  });

  console.log('[Seed] Database initialization completed successfully.');
  process.exit(0);
}

seed().catch((err) => {
  console.error('[Seed Error]', err);
  process.exit(1);
});
