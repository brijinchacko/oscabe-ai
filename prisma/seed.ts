import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "dev.db");
const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
const prisma = new PrismaClient({ adapter });

const skills = [
  // PLC - Siemens
  { name: "Siemens TIA Portal", shortName: "TIA Portal", category: "PLC" as const, platform: "Siemens" },
  { name: "Siemens S7-1500", shortName: "S7-1500", category: "PLC" as const, platform: "Siemens" },
  { name: "Siemens S7-1200", shortName: "S7-1200", category: "PLC" as const, platform: "Siemens" },
  { name: "Siemens S7-300/400", shortName: "S7-300/400", category: "PLC" as const, platform: "Siemens" },
  { name: "Siemens STEP 7", shortName: "STEP 7", category: "PLC" as const, platform: "Siemens" },
  { name: "Siemens WinCC", shortName: "WinCC", category: "SCADA" as const, platform: "Siemens" },
  { name: "Siemens WinCC OA", shortName: "WinCC OA", category: "SCADA" as const, platform: "Siemens" },
  // PLC - Rockwell
  { name: "Rockwell Studio 5000", shortName: "Studio 5000", category: "PLC" as const, platform: "Rockwell" },
  { name: "Rockwell ControlLogix", shortName: "ControlLogix", category: "PLC" as const, platform: "Rockwell" },
  { name: "Rockwell CompactLogix", shortName: "CompactLogix", category: "PLC" as const, platform: "Rockwell" },
  { name: "Rockwell RSLogix 5000", shortName: "RSLogix 5000", category: "PLC" as const, platform: "Rockwell" },
  { name: "Rockwell RSLogix 500", shortName: "RSLogix 500", category: "PLC" as const, platform: "Rockwell" },
  { name: "Allen-Bradley PLC-5", shortName: "PLC-5", category: "PLC" as const, platform: "Rockwell" },
  { name: "Allen-Bradley SLC 500", shortName: "SLC 500", category: "PLC" as const, platform: "Rockwell" },
  { name: "FactoryTalk View", shortName: "FT View", category: "SCADA" as const, platform: "Rockwell" },
  { name: "FactoryTalk Historian", shortName: "FT Historian", category: "SCADA" as const, platform: "Rockwell" },
  // PLC - Schneider
  { name: "Schneider EcoStruxure Control Expert", shortName: "Control Expert", category: "PLC" as const, platform: "Schneider" },
  { name: "Schneider M340", shortName: "M340", category: "PLC" as const, platform: "Schneider" },
  { name: "Schneider M580", shortName: "M580", category: "PLC" as const, platform: "Schneider" },
  { name: "Schneider Quantum", shortName: "Quantum", category: "PLC" as const, platform: "Schneider" },
  { name: "Schneider Unity Pro", shortName: "Unity Pro", category: "PLC" as const, platform: "Schneider" },
  { name: "Schneider Citect SCADA", shortName: "Citect", category: "SCADA" as const, platform: "Schneider" },
  // PLC - Mitsubishi
  { name: "Mitsubishi GX Works3", shortName: "GX Works3", category: "PLC" as const, platform: "Mitsubishi" },
  { name: "Mitsubishi GX Works2", shortName: "GX Works2", category: "PLC" as const, platform: "Mitsubishi" },
  { name: "Mitsubishi iQ-R Series", shortName: "iQ-R", category: "PLC" as const, platform: "Mitsubishi" },
  { name: "Mitsubishi FX Series", shortName: "FX Series", category: "PLC" as const, platform: "Mitsubishi" },
  { name: "Mitsubishi GOT HMI", shortName: "GOT HMI", category: "SCADA" as const, platform: "Mitsubishi" },
  // PLC - ABB
  { name: "ABB Automation Builder", shortName: "Automation Builder", category: "PLC" as const, platform: "ABB" },
  { name: "ABB AC500", shortName: "AC500", category: "PLC" as const, platform: "ABB" },
  { name: "ABB 800xA", shortName: "800xA", category: "SCADA" as const, platform: "ABB" },
  { name: "ABB Ability Symphony Plus", shortName: "Symphony Plus", category: "SCADA" as const, platform: "ABB" },
  // PLC - Omron
  { name: "Omron Sysmac Studio", shortName: "Sysmac Studio", category: "PLC" as const, platform: "Omron" },
  { name: "Omron NJ/NX Series", shortName: "NJ/NX", category: "PLC" as const, platform: "Omron" },
  { name: "Omron CX-Programmer", shortName: "CX-Programmer", category: "PLC" as const, platform: "Omron" },
  { name: "Omron CP/CJ Series", shortName: "CP/CJ", category: "PLC" as const, platform: "Omron" },
  // PLC - Beckhoff
  { name: "Beckhoff TwinCAT 3", shortName: "TwinCAT 3", category: "PLC" as const, platform: "Beckhoff" },
  { name: "Beckhoff TwinCAT 2", shortName: "TwinCAT 2", category: "PLC" as const, platform: "Beckhoff" },
  // SCADA
  { name: "Ignition SCADA", shortName: "Ignition", category: "SCADA" as const, platform: null },
  { name: "AVEVA System Platform", shortName: "System Platform", category: "SCADA" as const, platform: null },
  { name: "AVEVA InTouch", shortName: "InTouch", category: "SCADA" as const, platform: null },
  { name: "GE iFIX", shortName: "iFIX", category: "SCADA" as const, platform: null },
  { name: "GE CIMPLICITY", shortName: "CIMPLICITY", category: "SCADA" as const, platform: null },
  { name: "VTScada", shortName: "VTScada", category: "SCADA" as const, platform: null },
  { name: "COPA-DATA zenon", shortName: "zenon", category: "SCADA" as const, platform: null },
  { name: "HMI Design", shortName: "HMI", category: "SCADA" as const, platform: null },
  { name: "OPC UA", shortName: "OPC UA", category: "SCADA" as const, platform: null },
  { name: "OPC DA", shortName: "OPC DA", category: "SCADA" as const, platform: null },
  { name: "Historian / Data Logging", shortName: "Historian", category: "SCADA" as const, platform: null },
  // Robotics
  { name: "Fanuc Robot Programming", shortName: "Fanuc", category: "ROBOTICS" as const, platform: "Fanuc" },
  { name: "KUKA Robot Programming", shortName: "KUKA", category: "ROBOTICS" as const, platform: "KUKA" },
  { name: "ABB Robot Programming", shortName: "ABB Robotics", category: "ROBOTICS" as const, platform: "ABB" },
  { name: "Universal Robots (Cobots)", shortName: "UR Cobots", category: "ROBOTICS" as const, platform: "Universal Robots" },
  { name: "Yaskawa Motoman", shortName: "Motoman", category: "ROBOTICS" as const, platform: "Yaskawa" },
  { name: "Robot Simulation", shortName: "Robot Sim", category: "ROBOTICS" as const, platform: null },
  { name: "Machine Vision", shortName: "Vision", category: "ROBOTICS" as const, platform: null },
  { name: "Cognex Vision Systems", shortName: "Cognex", category: "ROBOTICS" as const, platform: null },
  { name: "Keyence Vision", shortName: "Keyence", category: "ROBOTICS" as const, platform: null },
  // Safety
  { name: "Functional Safety (IEC 61508)", shortName: "IEC 61508", category: "SAFETY" as const, platform: null },
  { name: "Machinery Safety (IEC 62061)", shortName: "IEC 62061", category: "SAFETY" as const, platform: null },
  { name: "SIL Assessment", shortName: "SIL", category: "SAFETY" as const, platform: null },
  { name: "Safety PLC Programming", shortName: "Safety PLC", category: "SAFETY" as const, platform: null },
  { name: "Pilz Safety Systems", shortName: "Pilz", category: "SAFETY" as const, platform: null },
  { name: "Sick Safety Systems", shortName: "Sick", category: "SAFETY" as const, platform: null },
  { name: "TUV Certification", shortName: "TUV", category: "SAFETY" as const, platform: null },
  { name: "ATEX / Hazardous Areas", shortName: "ATEX", category: "SAFETY" as const, platform: null },
  // Protocols
  { name: "PROFINET", shortName: "PROFINET", category: "PROTOCOLS" as const, platform: null },
  { name: "PROFIBUS", shortName: "PROFIBUS", category: "PROTOCOLS" as const, platform: null },
  { name: "EtherNet/IP", shortName: "EtherNet/IP", category: "PROTOCOLS" as const, platform: null },
  { name: "EtherCAT", shortName: "EtherCAT", category: "PROTOCOLS" as const, platform: null },
  { name: "Modbus TCP/RTU", shortName: "Modbus", category: "PROTOCOLS" as const, platform: null },
  { name: "DeviceNet", shortName: "DeviceNet", category: "PROTOCOLS" as const, platform: null },
  { name: "CANopen", shortName: "CANopen", category: "PROTOCOLS" as const, platform: null },
  { name: "MQTT", shortName: "MQTT", category: "PROTOCOLS" as const, platform: null },
  { name: "BACnet", shortName: "BACnet", category: "PROTOCOLS" as const, platform: null },
  { name: "DNP3", shortName: "DNP3", category: "PROTOCOLS" as const, platform: null },
  { name: "IEC 61850", shortName: "IEC 61850", category: "PROTOCOLS" as const, platform: null },
  // Industry/General
  { name: "Control Panel Design", shortName: "Panel Design", category: "GENERAL" as const, platform: null },
  { name: "Electrical Design (EPLAN)", shortName: "EPLAN", category: "GENERAL" as const, platform: null },
  { name: "AutoCAD Electrical", shortName: "AutoCAD Elec", category: "GENERAL" as const, platform: null },
  { name: "P&ID", shortName: "P&ID", category: "GENERAL" as const, platform: null },
  { name: "DCS Systems", shortName: "DCS", category: "GENERAL" as const, platform: null },
  { name: "Motion Control", shortName: "Motion", category: "GENERAL" as const, platform: null },
  { name: "Variable Speed Drives", shortName: "VSD", category: "GENERAL" as const, platform: null },
  { name: "Servo Systems", shortName: "Servo", category: "GENERAL" as const, platform: null },
  { name: "Instrumentation & Calibration", shortName: "I&C", category: "GENERAL" as const, platform: null },
  { name: "Commissioning", shortName: "Commissioning", category: "GENERAL" as const, platform: null },
  { name: "FAT / SAT Testing", shortName: "FAT/SAT", category: "GENERAL" as const, platform: null },
  { name: "ISA-88 Batch Control", shortName: "ISA-88", category: "GENERAL" as const, platform: null },
  { name: "ISA-95 Integration", shortName: "ISA-95", category: "GENERAL" as const, platform: null },
  { name: "MES Integration", shortName: "MES", category: "GENERAL" as const, platform: null },
  { name: "Industry 4.0 / IIoT", shortName: "IIoT", category: "INDUSTRY" as const, platform: null },
  { name: "Water Treatment Systems", shortName: "Water", category: "INDUSTRY" as const, platform: null },
  { name: "Food & Beverage Automation", shortName: "F&B", category: "INDUSTRY" as const, platform: null },
  { name: "Pharmaceutical Automation (GAMP)", shortName: "Pharma/GAMP", category: "INDUSTRY" as const, platform: null },
  { name: "Oil & Gas Automation", shortName: "O&G", category: "INDUSTRY" as const, platform: null },
  { name: "Building Management Systems (BMS)", shortName: "BMS", category: "INDUSTRY" as const, platform: null },
  { name: "Power Generation & Distribution", shortName: "Power Gen", category: "INDUSTRY" as const, platform: null },
];

async function main() {
  console.log("Seeding skills ontology...");

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: {},
      create: {
        name: skill.name,
        shortName: skill.shortName,
        category: skill.category,
        platform: skill.platform,
      },
    });
  }

  console.log(`Seeded ${skills.length} skills`);

  // Seed email templates
  console.log("Seeding email templates...");

  const templates = [
    {
      name: "Job Alert",
      category: "job_alert",
      subject: "New {{jobType}} role: {{jobTitle}} in {{jobLocation}}",
      body: `<p>Hi {{firstName}},</p>
<p>I came across a <strong>{{jobType}}</strong> opportunity that matches your <strong>{{topSkill}}</strong> experience and wanted to share it with you.</p>
<p><strong>Role:</strong> {{jobTitle}}<br><strong>Location:</strong> {{jobLocation}}<br><strong>Company:</strong> {{jobCompany}}<br><strong>Salary:</strong> {{jobSalary}}</p>
<p>If this sounds interesting, I'd love to have a quick chat to tell you more about it. Would you be available for a 10-minute call this week?</p>
<p>Best regards,<br>{{senderName}}<br>{{senderEmail}}</p>`,
    },
    {
      name: "Candidate Nurture",
      category: "nurture",
      subject: "Quick check-in from OSCABE",
      body: `<p>Hi {{firstName}},</p>
<p>Hope you're doing well. Just wanted to touch base — are you still open to automation roles?</p>
<p>The market has been very active recently, with strong demand for {{topSkill}} professionals. We've had several new positions come in that could be a great match for your experience.</p>
<p>If your situation has changed or you'd like to hear about what's available, feel free to reply to this email or give me a call.</p>
<p>Speak soon,<br>{{senderName}}<br>{{senderEmail}}</p>`,
    },
    {
      name: "Client Outreach",
      category: "client_outreach",
      subject: "Automation recruitment support for {{companyName}}",
      body: `<p>Hi {{contactName}},</p>
<p>I'm reaching out from <strong>OSCABE</strong>. We specialise in placing automation engineers across the UK — PLC, SCADA, Controls, Robotics, and Commissioning professionals.</p>
<p>We work with companies like {{companyName}} to find technically verified candidates quickly. Our AI-powered matching means we can typically present shortlisted candidates within 48 hours.</p>
<p>Would you be open to a brief call to discuss your current or upcoming hiring needs?</p>
<p>Best regards,<br>{{senderName}}<br>{{senderEmail}}</p>`,
    },
    {
      name: "Re-engagement",
      category: "re_engagement",
      subject: "We haven't spoken in a while, {{firstName}}",
      body: `<p>Hi {{firstName}},</p>
<p>It's been a while since we last connected. The automation job market has been very active recently, and I wanted to check in.</p>
<p>Whether you're actively looking, passively open, or just want to keep your finger on the pulse — I'd be happy to give you an update on what's happening in the market.</p>
<p>A quick reply or a 5-minute call is all it takes to get you back on our radar for the best opportunities.</p>
<p>Hope to hear from you,<br>{{senderName}}<br>{{senderEmail}}</p>`,
    },
    {
      name: "Candidate Submission to Client",
      category: "submission",
      subject: "Candidate submission: {{fullName}} for {{jobTitle}}",
      body: `<p>Hi {{contactName}},</p>
<p>I'm pleased to submit <strong>{{fullName}}</strong> for the <strong>{{jobTitle}}</strong> position at {{companyName}}.</p>
<p><strong>Key highlights:</strong></p>
<ul>
<li>Relevant skills: {{skills}}</li>
<li>Location: {{location}}</li>
<li>Availability: Available to start</li>
</ul>
<p>I've attached their CV for your review. I believe they would be an excellent fit based on the requirements we discussed.</p>
<p>Please let me know if you'd like to arrange an interview or if you need any additional information.</p>
<p>Kind regards,<br>{{senderName}}<br>{{senderEmail}}</p>`,
    },
  ];

  for (const template of templates) {
    const existing = await prisma.emailTemplate.findFirst({
      where: { name: template.name },
    });
    if (!existing) {
      await prisma.emailTemplate.create({ data: template });
    }
  }

  console.log(`Seeded ${templates.length} email templates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
