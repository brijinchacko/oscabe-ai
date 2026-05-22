/**
 * Static engineer profiles for the OSCABE Remote Engineer Portal.
 *
 * These are mock profiles for MVP. They power /engineers and /engineers/[slug].
 * Real profiles will be added by the founder per TODO-JBC.md.
 * Last initial only per privacy requirement.
 *
 * Categories covered (per spec Section 11):
 *   4x PLC (2x Siemens, 2x Rockwell)
 *   4x SCADA (2x Ignition, 2x WinCC)
 *   3x HMI / Controls
 *   3x ML / AI
 *   2x DCS / EC&I
 *   2x Robotics
 *   2x Digital Twin / IoT
 *
 * Location split: 14 India, 6 Middle East.
 * Featured: 6 flagged for homepage.
 */

export type Availability = "available" | "2-weeks" | "part-time";
export type RoleCategory =
  | "PLC / DCS"
  | "SCADA"
  | "HMI"
  | "Robotics"
  | "AI / ML"
  | "Digital Twin"
  | "EC&I";

export interface PlatformProficiency {
  name: string;
  level: "Expert" | "Advanced" | "Intermediate";
  years: number;
}

export interface IndustryExperience {
  name: string;
  years: number;
}

export interface PortfolioProject {
  title: string;
  tech: string[];
  outcome: string;
}

export interface EngineerProfile {
  slug: string;
  name: string; // First name + last initial only
  title: string;
  category: RoleCategory;
  seniority: string; // "9 years"
  seniorityBucket: "3-5" | "5-8" | "8+" | "lead";
  location: string; // "Bangalore, India"
  bio: string;
  platforms: string[]; // Quick chip list for card
  platformDetail: PlatformProficiency[]; // For profile page
  industries: string[];
  industryDetail: IndustryExperience[];
  availability: Availability;
  availableFrom: string; // Display string e.g. "Immediately" or "From 2 June 2026"
  monthlyRate: string; // "£5,200-6,000/month"
  monthlyRateLow: number; // For filtering, GBP
  monthlyRateHigh: number;
  dailyRateShortTerm: string; // "£280/day"
  monthlyRateLongTerm: string; // "£5,500/month"
  monthlyRatePartTime: string; // "£3,400/month (3 days/wk)"
  ukOverlap: string; // "9am-2pm UK daily"
  timezone: string; // "IST (GMT+5:30)"
  verified: boolean;
  featured: boolean;
  isPublished: boolean;
  avatarInitials: string;
  photoUrl?: string;
  videoUrl?: string;
  portfolio: PortfolioProject[];
}

export const ENGINEERS: EngineerProfile[] = [
  // ============ PLC / DCS (4) ============
  {
    slug: "rajesh-m-plc-siemens-senior",
    name: "Rajesh M.",
    title: "Senior PLC & SCADA Engineer (Siemens)",
    category: "PLC / DCS",
    seniority: "9 years",
    seniorityBucket: "8+",
    location: "Bangalore, India",
    bio: "Senior Siemens PLC and SCADA engineer with 9 years on TIA Portal V14 to V19, ranging from greenfield FMCG lines to brownfield migrations. Comfortable owning the controls scope of a project from FDS through SAT.",
    platforms: ["Siemens TIA Portal", "WinCC", "Ignition SCADA", "Profinet"],
    platformDetail: [
      { name: "Siemens TIA Portal", level: "Expert", years: 9 },
      { name: "WinCC Advanced", level: "Expert", years: 7 },
      { name: "WinCC Unified", level: "Advanced", years: 3 },
      { name: "Ignition SCADA", level: "Advanced", years: 4 },
      { name: "PROFINET / PROFIBUS", level: "Expert", years: 8 },
    ],
    industries: ["Manufacturing", "Food & Beverage", "Automotive"],
    industryDetail: [
      { name: "Manufacturing", years: 6 },
      { name: "Food & Beverage", years: 5 },
      { name: "Automotive", years: 3 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£5,200-6,000",
    monthlyRateLow: 5200,
    monthlyRateHigh: 6000,
    dailyRateShortTerm: "£300/day",
    monthlyRateLongTerm: "£5,600/month",
    monthlyRatePartTime: "£3,500/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "RM",
    portfolio: [
      {
        title: "Bottling line PLC migration",
        tech: ["Siemens S7-1500", "TIA Portal V18", "WinCC Advanced"],
        outcome: "Migrated 14 stations from S7-300 to S7-1500 with zero downtime",
      },
      {
        title: "MES-PLC integration for dairy plant",
        tech: ["TIA Portal", "OPC UA", "SQL Server"],
        outcome: "Shop-floor traceability for 24 SKU lines",
      },
    ],
  },
  {
    slug: "priya-s-plc-siemens-mid",
    name: "Priya S.",
    title: "PLC Engineer (Siemens)",
    category: "PLC / DCS",
    seniority: "5 years",
    seniorityBucket: "5-8",
    location: "Chennai, India",
    bio: "Siemens PLC engineer who specialises in pharmaceutical packaging lines. GAMP 5 documentation second nature. Strong on TIA Portal Safety Integrated.",
    platforms: ["Siemens TIA Portal", "Safety Integrated", "WinCC", "SQL"],
    platformDetail: [
      { name: "Siemens TIA Portal", level: "Advanced", years: 5 },
      { name: "TIA Portal Safety Integrated", level: "Advanced", years: 3 },
      { name: "WinCC Comfort", level: "Advanced", years: 4 },
    ],
    industries: ["Pharmaceutical", "Packaging"],
    industryDetail: [
      { name: "Pharmaceutical", years: 4 },
      { name: "Packaging", years: 5 },
    ],
    availability: "2-weeks",
    availableFrom: "From 5 June 2026",
    monthlyRate: "£4,400-5,000",
    monthlyRateLow: 4400,
    monthlyRateHigh: 5000,
    dailyRateShortTerm: "£250/day",
    monthlyRateLongTerm: "£4,700/month",
    monthlyRatePartTime: "£2,900/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "PS",
    portfolio: [
      {
        title: "Vial filling line for sterile pharma",
        tech: ["S7-1500F", "WinCC", "GAMP 5 documentation"],
        outcome: "Passed FDA pre-approval inspection",
      },
    ],
  },
  {
    slug: "arjun-k-rockwell-senior",
    name: "Arjun K.",
    title: "Senior PLC Engineer (Rockwell)",
    category: "PLC / DCS",
    seniority: "10 years",
    seniorityBucket: "8+",
    location: "Pune, India",
    bio: "Rockwell specialist with deep experience in automotive welding lines and FMCG packaging. ControlLogix and CompactLogix migrations a particular strength.",
    platforms: ["Studio 5000", "ControlLogix", "FactoryTalk View SE", "EtherNet/IP"],
    platformDetail: [
      { name: "Studio 5000 Logix Designer", level: "Expert", years: 10 },
      { name: "ControlLogix", level: "Expert", years: 9 },
      { name: "CompactLogix", level: "Expert", years: 7 },
      { name: "FactoryTalk View SE", level: "Advanced", years: 5 },
      { name: "FactoryTalk View ME", level: "Expert", years: 8 },
      { name: "EtherNet/IP", level: "Expert", years: 9 },
    ],
    industries: ["Automotive", "FMCG", "Food & Beverage"],
    industryDetail: [
      { name: "Automotive", years: 7 },
      { name: "FMCG", years: 5 },
      { name: "Food & Beverage", years: 3 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£6,000-7,000",
    monthlyRateLow: 6000,
    monthlyRateHigh: 7000,
    dailyRateShortTerm: "£350/day",
    monthlyRateLongTerm: "£6,500/month",
    monthlyRatePartTime: "£4,000/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "AK",
    portfolio: [
      {
        title: "Body shop welding cell rollout",
        tech: ["ControlLogix L8", "FactoryTalk View SE", "FANUC R-30iB"],
        outcome: "12 cells delivered for tier 1 automotive OEM",
      },
      {
        title: "ControlLogix to CompactLogix migration",
        tech: ["Studio 5000", "Add-On Instructions", "AOI library"],
        outcome: "Preserved 220 AOIs and 80 UDTs across migration",
      },
    ],
  },
  {
    slug: "khalid-r-rockwell-uae",
    name: "Khalid R.",
    title: "PLC Engineer (Rockwell)",
    category: "PLC / DCS",
    seniority: "6 years",
    seniorityBucket: "5-8",
    location: "Dubai, UAE",
    bio: "Rockwell engineer with strong oil and gas exposure across the GCC. Studio 5000 and PlantPAx hands-on, plus GuardLogix safety for SIL-rated process work.",
    platforms: ["Studio 5000", "PlantPAx", "GuardLogix", "FactoryTalk Historian"],
    platformDetail: [
      { name: "Studio 5000 Logix Designer", level: "Expert", years: 6 },
      { name: "PlantPAx", level: "Advanced", years: 4 },
      { name: "GuardLogix Safety", level: "Advanced", years: 3 },
      { name: "FactoryTalk Historian", level: "Advanced", years: 4 },
    ],
    industries: ["Oil & Gas", "Petrochemical"],
    industryDetail: [
      { name: "Oil & Gas", years: 6 },
      { name: "Petrochemical", years: 4 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£5,800-6,600",
    monthlyRateLow: 5800,
    monthlyRateHigh: 6600,
    dailyRateShortTerm: "£330/day",
    monthlyRateLongTerm: "£6,200/month",
    monthlyRatePartTime: "£3,900/month (3 days/wk)",
    ukOverlap: "8am-5pm UK daily",
    timezone: "GST (GMT+4)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "KR",
    portfolio: [
      {
        title: "PlantPAx upgrade for gas processing facility",
        tech: ["PlantPAx 5.0", "ControlLogix Redundant", "FactoryTalk Historian"],
        outcome: "Migration completed during 14-day turnaround",
      },
    ],
  },

  // ============ SCADA (4) ============
  {
    slug: "vikram-d-ignition-senior",
    name: "Vikram D.",
    title: "Senior SCADA Engineer (Ignition)",
    category: "SCADA",
    seniority: "8 years",
    seniorityBucket: "8+",
    location: "Hyderabad, India",
    bio: "Ignition specialist who has architected redundant gateways for water utilities, breweries, and pharmaceutical clients. Sparkplug B and Perspective expert.",
    platforms: ["Ignition SCADA", "Ignition Perspective", "Sparkplug B", "PostgreSQL"],
    platformDetail: [
      { name: "Ignition 8.1", level: "Expert", years: 6 },
      { name: "Ignition Perspective", level: "Expert", years: 4 },
      { name: "Sparkplug B / MQTT", level: "Expert", years: 4 },
      { name: "PostgreSQL", level: "Advanced", years: 6 },
      { name: "OPC UA", level: "Expert", years: 7 },
    ],
    industries: ["Water Utilities", "Brewing", "Pharmaceutical"],
    industryDetail: [
      { name: "Water Utilities", years: 5 },
      { name: "Brewing", years: 3 },
      { name: "Pharmaceutical", years: 4 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£6,000-7,000",
    monthlyRateLow: 6000,
    monthlyRateHigh: 7000,
    dailyRateShortTerm: "£350/day",
    monthlyRateLongTerm: "£6,400/month",
    monthlyRatePartTime: "£4,100/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "VD",
    portfolio: [
      {
        title: "Multi-site brewery Sparkplug B rollout",
        tech: ["Ignition 8.1", "Sparkplug B", "AWS IoT"],
        outcome: "Connected 4 breweries to a single unified namespace",
      },
      {
        title: "Water treatment redundant gateway design",
        tech: ["Ignition Edge", "Redundant gateways", "PostgreSQL"],
        outcome: "99.99% uptime over 18 months",
      },
    ],
  },
  {
    slug: "anjali-r-ignition-mid",
    name: "Anjali R.",
    title: "SCADA Engineer (Ignition)",
    category: "SCADA",
    seniority: "5 years",
    seniorityBucket: "5-8",
    location: "Bangalore, India",
    bio: "Ignition developer with a strong scripting background. Perspective UI and Jython scripting are particular strengths.",
    platforms: ["Ignition SCADA", "Ignition Perspective", "Jython", "REST APIs"],
    platformDetail: [
      { name: "Ignition 8.1", level: "Advanced", years: 5 },
      { name: "Ignition Perspective", level: "Advanced", years: 4 },
      { name: "Jython scripting", level: "Expert", years: 5 },
      { name: "MySQL", level: "Advanced", years: 4 },
    ],
    industries: ["Manufacturing", "Logistics"],
    industryDetail: [
      { name: "Manufacturing", years: 4 },
      { name: "Logistics", years: 3 },
    ],
    availability: "2-weeks",
    availableFrom: "From 10 June 2026",
    monthlyRate: "£4,800-5,400",
    monthlyRateLow: 4800,
    monthlyRateHigh: 5400,
    dailyRateShortTerm: "£280/day",
    monthlyRateLongTerm: "£5,100/month",
    monthlyRatePartTime: "£3,200/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "AR",
    portfolio: [
      {
        title: "Mobile-first Perspective dashboards",
        tech: ["Ignition Perspective", "Jython", "REST"],
        outcome: "Replaced legacy tablet kiosks across 9 sites",
      },
    ],
  },
  {
    slug: "suresh-p-wincc-senior",
    name: "Suresh P.",
    title: "Senior SCADA Engineer (WinCC)",
    category: "SCADA",
    seniority: "11 years",
    seniorityBucket: "8+",
    location: "Mumbai, India",
    bio: "WinCC specialist across Comfort, Advanced, Professional, and OA. Heavy process industry background including pharmaceutical and chemicals.",
    platforms: ["WinCC OA", "WinCC Professional", "Siemens TIA Portal", "PCS 7"],
    platformDetail: [
      { name: "WinCC OA", level: "Expert", years: 9 },
      { name: "WinCC Professional", level: "Expert", years: 7 },
      { name: "WinCC Advanced", level: "Expert", years: 10 },
      { name: "PCS 7", level: "Advanced", years: 6 },
    ],
    industries: ["Pharmaceutical", "Chemicals", "Energy"],
    industryDetail: [
      { name: "Pharmaceutical", years: 6 },
      { name: "Chemicals", years: 5 },
      { name: "Energy", years: 4 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£6,400-7,600",
    monthlyRateLow: 6400,
    monthlyRateHigh: 7600,
    dailyRateShortTerm: "£380/day",
    monthlyRateLongTerm: "£7,000/month",
    monthlyRatePartTime: "£4,400/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "SP",
    portfolio: [
      {
        title: "PCS 7 process upgrade for bulk chemicals",
        tech: ["PCS 7", "WinCC OA", "OS Server redundancy"],
        outcome: "Throughput increase 11% post-commissioning",
      },
    ],
  },
  {
    slug: "fatima-z-wincc-uae",
    name: "Fatima Z.",
    title: "SCADA Engineer (WinCC)",
    category: "SCADA",
    seniority: "6 years",
    seniorityBucket: "5-8",
    location: "Abu Dhabi, UAE",
    bio: "WinCC engineer with utilities and energy sector focus. Strong on IEC 61850 protocols for substation work.",
    platforms: ["WinCC OA", "WinCC Advanced", "IEC 61850", "Siemens DIGSI"],
    platformDetail: [
      { name: "WinCC OA", level: "Advanced", years: 5 },
      { name: "WinCC Advanced", level: "Advanced", years: 6 },
      { name: "IEC 61850", level: "Advanced", years: 4 },
      { name: "Siemens DIGSI", level: "Advanced", years: 3 },
    ],
    industries: ["Energy & Utilities", "Power Generation"],
    industryDetail: [
      { name: "Energy & Utilities", years: 5 },
      { name: "Power Generation", years: 4 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£5,400-6,200",
    monthlyRateLow: 5400,
    monthlyRateHigh: 6200,
    dailyRateShortTerm: "£310/day",
    monthlyRateLongTerm: "£5,800/month",
    monthlyRatePartTime: "£3,700/month (3 days/wk)",
    ukOverlap: "8am-5pm UK daily",
    timezone: "GST (GMT+4)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "FZ",
    portfolio: [
      {
        title: "132kV substation IEC 61850 retrofit",
        tech: ["WinCC OA", "IEC 61850", "DIGSI 5"],
        outcome: "Commissioned within tight 6-week outage window",
      },
    ],
  },

  // ============ HMI / Controls (3) ============
  {
    slug: "naveen-t-hmi-codesys",
    name: "Naveen T.",
    title: "HMI & Controls Engineer (Codesys)",
    category: "HMI",
    seniority: "7 years",
    seniorityBucket: "5-8",
    location: "Coimbatore, India",
    bio: "HMI and motion control specialist working primarily on Beckhoff and Codesys platforms. High-speed packaging and printing experience.",
    platforms: ["Beckhoff TwinCAT 3", "Codesys", "WAGO", "OPC UA"],
    platformDetail: [
      { name: "Beckhoff TwinCAT 3", level: "Expert", years: 6 },
      { name: "Codesys V3", level: "Advanced", years: 7 },
      { name: "WAGO Pro", level: "Advanced", years: 4 },
      { name: "OPC UA", level: "Advanced", years: 5 },
    ],
    industries: ["Packaging", "Printing", "Machine Building"],
    industryDetail: [
      { name: "Packaging", years: 5 },
      { name: "Printing", years: 3 },
      { name: "Machine Building", years: 6 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£5,200-6,000",
    monthlyRateLow: 5200,
    monthlyRateHigh: 6000,
    dailyRateShortTerm: "£300/day",
    monthlyRateLongTerm: "£5,600/month",
    monthlyRatePartTime: "£3,500/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "NT",
    portfolio: [
      {
        title: "High-speed flow wrapper retrofit",
        tech: ["TwinCAT 3", "EtherCAT", "AX5000 servo drives"],
        outcome: "Line speed lifted from 220 to 320 ppm",
      },
    ],
  },
  {
    slug: "deepa-v-hmi-schneider",
    name: "Deepa V.",
    title: "Controls Engineer (Schneider)",
    category: "HMI",
    seniority: "4 years",
    seniorityBucket: "3-5",
    location: "Bangalore, India",
    bio: "Schneider EcoStruxure and Unity Pro engineer with building management and water utility experience.",
    platforms: ["Schneider EcoStruxure", "Unity Pro", "Vijeo Designer", "Modbus TCP"],
    platformDetail: [
      { name: "Schneider EcoStruxure Machine Expert", level: "Advanced", years: 3 },
      { name: "Schneider Unity Pro", level: "Advanced", years: 4 },
      { name: "Vijeo Designer", level: "Advanced", years: 4 },
      { name: "Modbus TCP", level: "Advanced", years: 4 },
    ],
    industries: ["Building Management", "Water Utilities"],
    industryDetail: [
      { name: "Building Management", years: 3 },
      { name: "Water Utilities", years: 3 },
    ],
    availability: "part-time",
    availableFrom: "Part-time, 3 days/wk",
    monthlyRate: "£3,400-3,800",
    monthlyRateLow: 3400,
    monthlyRateHigh: 3800,
    dailyRateShortTerm: "£250/day",
    monthlyRateLongTerm: "£4,800/month (full-time)",
    monthlyRatePartTime: "£3,600/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "DV",
    portfolio: [
      {
        title: "Municipal water pumping station upgrade",
        tech: ["M340", "Vijeo Designer", "Modbus TCP"],
        outcome: "12 pumping stations migrated from Premium to M340",
      },
    ],
  },
  {
    slug: "yusuf-b-controls-saudi",
    name: "Yusuf B.",
    title: "Senior Controls Engineer",
    category: "HMI",
    seniority: "9 years",
    seniorityBucket: "8+",
    location: "Riyadh, Saudi Arabia",
    bio: "Multi-platform controls engineer with deep desalination and water treatment background. Comfortable across Siemens, Rockwell, and Schneider.",
    platforms: ["Siemens TIA Portal", "Studio 5000", "Schneider EcoStruxure", "WinCC"],
    platformDetail: [
      { name: "Siemens TIA Portal", level: "Expert", years: 8 },
      { name: "Studio 5000", level: "Advanced", years: 6 },
      { name: "Schneider EcoStruxure", level: "Advanced", years: 5 },
      { name: "WinCC Advanced", level: "Expert", years: 7 },
    ],
    industries: ["Desalination", "Water Utilities", "Power Generation"],
    industryDetail: [
      { name: "Desalination", years: 6 },
      { name: "Water Utilities", years: 7 },
      { name: "Power Generation", years: 3 },
    ],
    availability: "2-weeks",
    availableFrom: "From 5 June 2026",
    monthlyRate: "£6,400-7,200",
    monthlyRateLow: 6400,
    monthlyRateHigh: 7200,
    dailyRateShortTerm: "£370/day",
    monthlyRateLongTerm: "£6,800/month",
    monthlyRatePartTime: "£4,300/month (3 days/wk)",
    ukOverlap: "8am-5pm UK daily",
    timezone: "AST (GMT+3)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "YB",
    portfolio: [
      {
        title: "RO desalination control system upgrade",
        tech: ["S7-1500", "WinCC", "PROFINET", "EtherNet/IP"],
        outcome: "350 MLD plant retrofit, zero water-cut for end users",
      },
    ],
  },

  // ============ AI / ML (3) ============
  {
    slug: "shreya-n-ml-cv-senior",
    name: "Shreya N.",
    title: "Senior ML Engineer (Computer Vision)",
    category: "AI / ML",
    seniority: "8 years",
    seniorityBucket: "8+",
    location: "Bangalore, India",
    bio: "Computer vision engineer who has shipped 30-plus inspection systems into UK and EU factories. Strong on PyTorch, ONNX, and NVIDIA Jetson deployment.",
    platforms: ["PyTorch", "ONNX", "OpenCV", "NVIDIA Jetson", "Triton"],
    platformDetail: [
      { name: "PyTorch", level: "Expert", years: 7 },
      { name: "Computer Vision (OpenCV, MMDetection)", level: "Expert", years: 8 },
      { name: "NVIDIA Jetson / TensorRT", level: "Expert", years: 5 },
      { name: "ONNX / Triton", level: "Advanced", years: 4 },
    ],
    industries: ["FMCG Quality", "Pharmaceutical", "Automotive"],
    industryDetail: [
      { name: "FMCG Quality", years: 6 },
      { name: "Pharmaceutical", years: 4 },
      { name: "Automotive", years: 3 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£7,200-8,400",
    monthlyRateLow: 7200,
    monthlyRateHigh: 8400,
    dailyRateShortTerm: "£420/day",
    monthlyRateLongTerm: "£7,800/month",
    monthlyRatePartTime: "£4,900/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "SN",
    portfolio: [
      {
        title: "Pharma vial inspection vision system",
        tech: ["PyTorch", "MMDetection", "NVIDIA Jetson Orin"],
        outcome: "99.6% defect recall, sub-50ms inference per vial",
      },
      {
        title: "Bottle label OCR for FMCG",
        tech: ["PaddleOCR", "TensorRT", "Cognex In-Sight"],
        outcome: "Replaced manual QC for 6 lines",
      },
    ],
  },
  {
    slug: "amir-h-ml-predictive-uae",
    name: "Amir H.",
    title: "ML Engineer (Predictive Maintenance)",
    category: "AI / ML",
    seniority: "5 years",
    seniorityBucket: "5-8",
    location: "Dubai, UAE",
    bio: "Predictive maintenance and anomaly detection specialist. Time-series ML for industrial machines, plus AVEVA Insight and OSIsoft PI integrations.",
    platforms: ["Python", "TensorFlow", "AVEVA Insight", "OSIsoft PI", "Spark"],
    platformDetail: [
      { name: "Python (scikit-learn, TensorFlow)", level: "Expert", years: 5 },
      { name: "AVEVA Insight / PI", level: "Advanced", years: 4 },
      { name: "Time-series ML", level: "Expert", years: 5 },
      { name: "Apache Spark", level: "Advanced", years: 3 },
    ],
    industries: ["Oil & Gas", "Energy", "Manufacturing"],
    industryDetail: [
      { name: "Oil & Gas", years: 4 },
      { name: "Energy", years: 3 },
      { name: "Manufacturing", years: 3 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£6,200-7,200",
    monthlyRateLow: 6200,
    monthlyRateHigh: 7200,
    dailyRateShortTerm: "£360/day",
    monthlyRateLongTerm: "£6,800/month",
    monthlyRatePartTime: "£4,300/month (3 days/wk)",
    ukOverlap: "8am-5pm UK daily",
    timezone: "GST (GMT+4)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "AH",
    portfolio: [
      {
        title: "Compressor predictive maintenance model",
        tech: ["LSTM autoencoder", "AVEVA PI", "Airflow"],
        outcome: "Detected 4 incipient bearing faults across 12 months",
      },
    ],
  },
  {
    slug: "kavya-p-mlops-mid",
    name: "Kavya P.",
    title: "MLOps Engineer",
    category: "AI / ML",
    seniority: "4 years",
    seniorityBucket: "3-5",
    location: "Hyderabad, India",
    bio: "MLOps and ML platform engineer. Specialises in productionising vision and time-series models on edge and cloud.",
    platforms: ["Kubernetes", "Airflow", "MLflow", "AWS SageMaker", "Docker"],
    platformDetail: [
      { name: "Kubernetes", level: "Advanced", years: 4 },
      { name: "MLflow / Airflow", level: "Advanced", years: 4 },
      { name: "AWS SageMaker", level: "Advanced", years: 3 },
      { name: "Docker", level: "Expert", years: 4 },
    ],
    industries: ["FMCG Quality", "Manufacturing"],
    industryDetail: [
      { name: "FMCG Quality", years: 3 },
      { name: "Manufacturing", years: 4 },
    ],
    availability: "2-weeks",
    availableFrom: "From 5 June 2026",
    monthlyRate: "£5,400-6,200",
    monthlyRateLow: 5400,
    monthlyRateHigh: 6200,
    dailyRateShortTerm: "£310/day",
    monthlyRateLongTerm: "£5,800/month",
    monthlyRatePartTime: "£3,700/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "KP",
    portfolio: [
      {
        title: "Vision model edge deployment pipeline",
        tech: ["MLflow", "Triton", "K3s on Jetson"],
        outcome: "Reduced model rollout time from 3 days to 20 minutes",
      },
    ],
  },

  // ============ DCS / EC&I (2) ============
  {
    slug: "rohit-j-dcs-honeywell",
    name: "Rohit J.",
    title: "Senior DCS Engineer (Honeywell Experion)",
    category: "EC&I",
    seniority: "12 years",
    seniorityBucket: "8+",
    location: "Mumbai, India",
    bio: "Honeywell Experion PKS and TPS specialist, heavy oil and gas background. Lead engineer experience for greenfield process plant projects.",
    platforms: ["Honeywell Experion PKS", "TPS", "Safety Manager", "Foundation Fieldbus"],
    platformDetail: [
      { name: "Experion PKS", level: "Expert", years: 11 },
      { name: "TPS", level: "Expert", years: 9 },
      { name: "Safety Manager", level: "Advanced", years: 6 },
      { name: "Foundation Fieldbus", level: "Expert", years: 8 },
    ],
    industries: ["Oil & Gas", "Refining", "Petrochemical"],
    industryDetail: [
      { name: "Oil & Gas", years: 10 },
      { name: "Refining", years: 6 },
      { name: "Petrochemical", years: 5 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£7,800-9,200",
    monthlyRateLow: 7800,
    monthlyRateHigh: 9200,
    dailyRateShortTerm: "£440/day",
    monthlyRateLongTerm: "£8,400/month",
    monthlyRatePartTime: "£5,300/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "RJ",
    portfolio: [
      {
        title: "Greenfield refinery DCS configuration",
        tech: ["Experion PKS R520", "Safety Manager", "Foundation Fieldbus"],
        outcome: "Lead engineer for 4,800 I/O scope, on-budget commissioning",
      },
    ],
  },
  {
    slug: "harish-g-dcs-yokogawa",
    name: "Harish G.",
    title: "DCS Engineer (Yokogawa CENTUM)",
    category: "EC&I",
    seniority: "8 years",
    seniorityBucket: "8+",
    location: "Chennai, India",
    bio: "Yokogawa CENTUM VP and ProSafe-RS specialist. Pharmaceutical and bulk chemicals process automation experience.",
    platforms: ["Yokogawa CENTUM VP", "ProSafe-RS", "FAST/TOOLS", "FCS"],
    platformDetail: [
      { name: "CENTUM VP", level: "Expert", years: 8 },
      { name: "ProSafe-RS", level: "Advanced", years: 5 },
      { name: "FAST/TOOLS", level: "Advanced", years: 4 },
    ],
    industries: ["Pharmaceutical", "Chemicals", "Food & Beverage"],
    industryDetail: [
      { name: "Pharmaceutical", years: 5 },
      { name: "Chemicals", years: 6 },
      { name: "Food & Beverage", years: 3 },
    ],
    availability: "2-weeks",
    availableFrom: "From 12 June 2026",
    monthlyRate: "£6,600-7,800",
    monthlyRateLow: 6600,
    monthlyRateHigh: 7800,
    dailyRateShortTerm: "£380/day",
    monthlyRateLongTerm: "£7,200/month",
    monthlyRatePartTime: "£4,500/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "HG",
    portfolio: [
      {
        title: "API bulk chemicals CENTUM upgrade",
        tech: ["CENTUM VP R6", "ProSafe-RS", "Exaopc OPC server"],
        outcome: "FAT passed without major findings",
      },
    ],
  },

  // ============ Robotics (2) ============
  {
    slug: "aditya-l-robotics-fanuc",
    name: "Aditya L.",
    title: "Senior Robotics Engineer (FANUC)",
    category: "Robotics",
    seniority: "9 years",
    seniorityBucket: "8+",
    location: "Pune, India",
    bio: "FANUC robotics specialist with welding, palletising, and material handling experience. Roboguide offline programming a particular strength.",
    platforms: ["FANUC TP", "KAREL", "Roboguide", "iRVision", "PLC integration"],
    platformDetail: [
      { name: "FANUC TP / KAREL", level: "Expert", years: 9 },
      { name: "Roboguide", level: "Expert", years: 7 },
      { name: "iRVision", level: "Advanced", years: 5 },
      { name: "ControlLogix integration", level: "Advanced", years: 6 },
    ],
    industries: ["Automotive", "Fabrication", "Logistics"],
    industryDetail: [
      { name: "Automotive", years: 7 },
      { name: "Fabrication", years: 5 },
      { name: "Logistics", years: 3 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£6,400-7,400",
    monthlyRateLow: 6400,
    monthlyRateHigh: 7400,
    dailyRateShortTerm: "£370/day",
    monthlyRateLongTerm: "£6,800/month",
    monthlyRatePartTime: "£4,300/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "AL",
    portfolio: [
      {
        title: "Tier 1 automotive spot weld cell",
        tech: ["FANUC R-30iB Plus", "Roboguide", "iRVision"],
        outcome: "Programmed and simulated 14 cells, 2-week on-site SAT",
      },
    ],
  },
  {
    slug: "tara-w-robotics-abb",
    name: "Tara W.",
    title: "Robotics Engineer (ABB)",
    category: "Robotics",
    seniority: "6 years",
    seniorityBucket: "5-8",
    location: "Bangalore, India",
    bio: "ABB robotics engineer with packaging and food and beverage focus. RobotStudio simulation expert.",
    platforms: ["ABB RAPID", "RobotStudio", "PickMaster", "PLC integration"],
    platformDetail: [
      { name: "ABB RAPID", level: "Expert", years: 6 },
      { name: "RobotStudio", level: "Expert", years: 6 },
      { name: "PickMaster", level: "Advanced", years: 4 },
    ],
    industries: ["Food & Beverage", "Packaging", "Logistics"],
    industryDetail: [
      { name: "Food & Beverage", years: 5 },
      { name: "Packaging", years: 6 },
      { name: "Logistics", years: 2 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£5,400-6,200",
    monthlyRateLow: 5400,
    monthlyRateHigh: 6200,
    dailyRateShortTerm: "£310/day",
    monthlyRateLongTerm: "£5,800/month",
    monthlyRatePartTime: "£3,700/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "TW",
    portfolio: [
      {
        title: "End-of-line palletising cell",
        tech: ["ABB IRB 660", "RobotStudio", "PickMaster"],
        outcome: "8 cells across 3 sites, throughput +18%",
      },
    ],
  },

  // ============ Digital Twin / IoT (2) ============
  {
    slug: "varun-s-digital-twin",
    name: "Varun S.",
    title: "Digital Twin & IoT Engineer",
    category: "Digital Twin",
    seniority: "7 years",
    seniorityBucket: "5-8",
    location: "Bangalore, India",
    bio: "Digital twin and IoT platform engineer. Specialises in linking process simulation models to live SCADA via OPC UA and MQTT.",
    platforms: ["Siemens Process Simulate", "AVEVA System Platform", "AWS IoT", "OPC UA"],
    platformDetail: [
      { name: "Siemens Process Simulate", level: "Expert", years: 5 },
      { name: "AVEVA System Platform", level: "Advanced", years: 4 },
      { name: "AWS IoT", level: "Advanced", years: 4 },
      { name: "OPC UA", level: "Expert", years: 6 },
    ],
    industries: ["Manufacturing", "Automotive", "Energy"],
    industryDetail: [
      { name: "Manufacturing", years: 6 },
      { name: "Automotive", years: 4 },
      { name: "Energy", years: 3 },
    ],
    availability: "2-weeks",
    availableFrom: "From 5 June 2026",
    monthlyRate: "£6,200-7,200",
    monthlyRateLow: 6200,
    monthlyRateHigh: 7200,
    dailyRateShortTerm: "£360/day",
    monthlyRateLongTerm: "£6,700/month",
    monthlyRatePartTime: "£4,200/month (3 days/wk)",
    ukOverlap: "9am-2pm UK daily",
    timezone: "IST (GMT+5:30)",
    verified: true,
    featured: true,
    isPublished: true,
    avatarInitials: "VS",
    portfolio: [
      {
        title: "Plant-wide digital twin for FMCG site",
        tech: ["Process Simulate", "OPC UA", "AWS IoT SiteWise"],
        outcome: "Identified two bottlenecks, redesigned scheduling logic",
      },
    ],
  },
  {
    slug: "leila-m-iot-saudi",
    name: "Leila M.",
    title: "IoT Solutions Engineer",
    category: "Digital Twin",
    seniority: "5 years",
    seniorityBucket: "5-8",
    location: "Jeddah, Saudi Arabia",
    bio: "IoT solutions engineer focused on connecting industrial assets to cloud analytics. Strong on edge gateways and MQTT brokers.",
    platforms: ["Azure IoT", "AWS IoT", "MQTT", "Node-RED", "Sparkplug B"],
    platformDetail: [
      { name: "Azure IoT", level: "Expert", years: 4 },
      { name: "AWS IoT Core", level: "Advanced", years: 4 },
      { name: "MQTT / Sparkplug B", level: "Expert", years: 5 },
      { name: "Node-RED", level: "Advanced", years: 5 },
    ],
    industries: ["Energy", "Oil & Gas", "Smart Buildings"],
    industryDetail: [
      { name: "Energy", years: 4 },
      { name: "Oil & Gas", years: 3 },
      { name: "Smart Buildings", years: 3 },
    ],
    availability: "available",
    availableFrom: "Immediately",
    monthlyRate: "£5,200-6,000",
    monthlyRateLow: 5200,
    monthlyRateHigh: 6000,
    dailyRateShortTerm: "£300/day",
    monthlyRateLongTerm: "£5,600/month",
    monthlyRatePartTime: "£3,500/month (3 days/wk)",
    ukOverlap: "8am-5pm UK daily",
    timezone: "AST (GMT+3)",
    verified: true,
    featured: false,
    isPublished: true,
    avatarInitials: "LM",
    portfolio: [
      {
        title: "Pipeline pressure telemetry rollout",
        tech: ["Azure IoT Edge", "MQTT", "Power BI"],
        outcome: "Connected 220 wellheads to central dashboard",
      },
    ],
  },
];

/* -------------------- Helpers -------------------- */

export function getFeaturedEngineers(): EngineerProfile[] {
  return ENGINEERS.filter((e) => e.featured && e.isPublished);
}

export function getPublishedEngineers(): EngineerProfile[] {
  return ENGINEERS.filter((e) => e.isPublished);
}

export function getEngineerBySlug(slug: string): EngineerProfile | undefined {
  return ENGINEERS.find((e) => e.slug === slug);
}

export function getRelatedEngineers(
  current: EngineerProfile,
  limit = 3,
): EngineerProfile[] {
  return ENGINEERS.filter(
    (e) => e.slug !== current.slug && e.category === current.category && e.isPublished,
  ).slice(0, limit);
}

export function getAllSlugs(): string[] {
  return ENGINEERS.filter((e) => e.isPublished).map((e) => e.slug);
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  "PLC / DCS",
  "SCADA",
  "HMI",
  "Robotics",
  "AI / ML",
  "Digital Twin",
  "EC&I",
];

export const PLATFORM_OPTIONS = [
  "Siemens TIA Portal",
  "Rockwell Studio 5000",
  "Schneider EcoStruxure",
  "Ignition SCADA",
  "WinCC",
  "Codesys",
  "Beckhoff TwinCAT",
  "ABB RAPID",
  "FANUC",
  "Honeywell Experion",
  "Yokogawa CENTUM",
  "PyTorch",
  "AVEVA",
];

export const SENIORITY_OPTIONS = [
  { value: "3-5", label: "3-5 years" },
  { value: "5-8", label: "5-8 years" },
  { value: "8+", label: "8+ years Senior" },
  { value: "lead", label: "Lead / Architect" },
] as const;

export const AVAILABILITY_OPTIONS: { value: Availability; label: string }[] = [
  { value: "available", label: "Available now" },
  { value: "2-weeks", label: "Available in 2 weeks" },
  { value: "part-time", label: "Part-time only" },
];

export const RATE_BANDS = [
  { value: "under-4k", label: "Under £4K/mo", min: 0, max: 3999 },
  { value: "4k-6k", label: "£4K-6K/mo", min: 4000, max: 5999 },
  { value: "6k-8k", label: "£6K-8K/mo", min: 6000, max: 7999 },
  { value: "8k-plus", label: "£8K+/mo", min: 8000, max: 99999 },
] as const;
