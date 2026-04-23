export const APP_NAME = "OSCABE";
export const COMPANY_NAME = "Oscabe Ltd";
export const COMPANY_NUMBER = "15913493";
export const COMPANY_ADDRESS = "Unit 8, Lyon Road, Milton Keynes, MK1 1EX";
export const COMPANY_EMAIL = "info@oscabe.com";
export const COMPANY_PHONE = "+44 7442 87 57 87";

export const SOCIAL_LINKS = {
  linkedin: "https://www.linkedin.com/company/100270496/",
  instagram: "https://www.instagram.com/oscabeuk/",
  facebook: "https://www.facebook.com/oscabeuk",
  youtube: "https://www.youtube.com/channel/UCtWW7X94v6ji1BPTcUKqDLA",
};

export const AWARDS = [
  { name: "UK Startup Awards, National Winner", image: "/awards/uk-startup-national-winner.png" },
  { name: "UK Startup Awards, Midlands Winner", image: "/awards/uk-startup-midlands-winner.png" },
  { name: "Great British Entrepreneur Award", image: "/awards/great-british-entrepreneur.png" },
  { name: "Business Awards Finalist", image: "/awards/business-awards-finalist.png" },
  { name: "Atal Award", image: "/awards/atal-award.png" },
  { name: "Radio Lemon Award", image: "/awards/radio-lemon-award.png" },
];

export const ROLES_WE_RECRUIT = [
  // Industrial Automation
  "PLC Programmer",
  "Controls Engineer",
  "SCADA Engineer",
  "Automation Engineer",
  "Systems Integrator",
  "Robotics Engineer",
  "Instrumentation Engineer",
  "Electrical Design Engineer",
  "Commissioning Engineer",
  "Project Engineer",
  "Safety Engineer (SIL/SIS)",
  "MES/MOM Engineer",
  "DCS Engineer",
  "Industrial Network Engineer",
  "OT Cybersecurity Engineer",
  "BMS Engineer",
  "Panel Design Engineer",
  "Field Service Engineer",
  // AI & Intelligent Systems
  "ML Engineer",
  "AI Engineer",
  "Data Scientist",
  "Computer Vision Engineer",
  "NLP Engineer",
  "MLOps Engineer",
  "Robotics AI Engineer",
  "IoT Engineer",
  "Digital Twin Engineer",
  "Data Engineer",
  "Automation Architect",
  "AI Research Scientist",
];

export const PLATFORMS = [
  // Automation Platforms
  "Siemens (TIA Portal / S7)",
  "Allen-Bradley (Rockwell / Studio 5000)",
  "Schneider (EcoStruxure / Unity Pro)",
  "Beckhoff (TwinCAT)",
  "Mitsubishi (GX Works / iQ-R)",
  "Omron (Sysmac Studio)",
  "ABB (AC500 / 800xA)",
  "Codesys",
  "B&R Automation",
  "FANUC",
  "KUKA",
  "Universal Robots",
  "Ignition (Inductive Automation)",
  "WinCC / WinCC OA",
  "Wonderware / AVEVA",
  "Citect",
  "FactoryTalk View",
  "GE Proficy / iFIX",
  "Aveva System Platform",
  "EPLAN",
  // AI / ML Technologies
  "Python",
  "TensorFlow",
  "PyTorch",
  "scikit-learn",
  "OpenCV",
  "AWS SageMaker",
  "Azure ML",
  "Databricks",
  "Kubernetes",
];

export const INDUSTRIES = [
  "Manufacturing & Industry 4.0",
  "Automotive & EV",
  "Food & Beverage",
  "Pharmaceuticals & Life Sciences",
  "Water & Wastewater",
  "Oil, Gas & Petrochemical",
  "Energy & Renewables",
  "Mining & Metals",
  "Packaging",
  "FMCG",
  "Logistics & Warehousing",
  "Building Automation",
  "Chemicals",
  "Defence & Aerospace",
  "Semiconductor",
  "Data Centres",
  "Marine & Offshore",
  "Technology & SaaS",
  "Robotics & Autonomous Systems",
];

export const CLIENT_PIPELINE_STAGES = [
  { value: "LEAD", label: "New Lead", color: "bg-gray-200 text-gray-800" },
  { value: "CONTACTED", label: "Contacted", color: "bg-blue-100 text-blue-800" },
  { value: "INTERESTED", label: "Interested", color: "bg-cyan-100 text-cyan-800" },
  { value: "PROPOSAL_SENT", label: "Proposal Sent", color: "bg-purple-100 text-purple-800" },
  { value: "CONTRACT_SIGNED", label: "Contract Signed", color: "bg-green-100 text-green-800" },
  { value: "ACTIVE", label: "Active Client", color: "bg-emerald-100 text-emerald-800" },
  { value: "ON_HOLD", label: "On Hold", color: "bg-yellow-100 text-yellow-800" },
  { value: "LOST", label: "Lost", color: "bg-red-100 text-red-800" },
] as const;

export const APPLICATION_STAGES = [
  { value: "SOURCED", label: "Sourced", color: "bg-gray-200 text-gray-800" },
  { value: "SCREENING", label: "Screening", color: "bg-blue-100 text-blue-800" },
  { value: "SUBMITTED", label: "Submitted", color: "bg-indigo-100 text-indigo-800" },
  { value: "INTERVIEW", label: "Interview", color: "bg-purple-100 text-purple-800" },
  { value: "OFFER", label: "Offer", color: "bg-yellow-100 text-yellow-800" },
  { value: "PLACED", label: "Placed", color: "bg-green-100 text-green-800" },
  { value: "REJECTED", label: "Rejected", color: "bg-red-100 text-red-800" },
  { value: "WITHDRAWN", label: "Withdrawn", color: "bg-gray-100 text-gray-500" },
] as const;

export const JOB_SOURCES = [
  { value: "DIRECT", label: "Direct" },
  { value: "HIRING_HUB", label: "Hiring Hub" },
  { value: "TEAM_NETWORK", label: "Team Network" },
  { value: "SPLITFEE", label: "SplitFee" },
  { value: "GIIG", label: "Giig" },
  { value: "RECXCHANGE", label: "RecXchange" },
  { value: "RECRUITING_HUB", label: "Recruiting Hub" },
  { value: "PARAFORM", label: "Paraform" },
  { value: "OTHER", label: "Other" },
] as const;

export const CRM_NAV_ITEMS = [
  { label: "Dashboard", href: "/crm", icon: "LayoutDashboard" },
  { label: "Clients", href: "/crm/clients", icon: "Building2" },
  { label: "Candidates", href: "/crm/candidates", icon: "Users" },
  { label: "Jobs", href: "/crm/jobs", icon: "Briefcase" },
  { label: "Pipeline", href: "/crm/pipeline", icon: "GitBranch" },
  { label: "Placements", href: "/crm/placements", icon: "Trophy" },
  { label: "Email", href: "/crm/email", icon: "Mail" },
  { label: "Reports", href: "/crm/reports", icon: "BarChart3" },
  { label: "Settings", href: "/crm/settings", icon: "Settings" },
] as const;
