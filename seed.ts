import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./src/generated/prisma/client.js";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL!, max: 1 });
const prisma = new PrismaClient({ adapter });

async function main() {
  const depts = await prisma.campusDepartment.findMany({
    include: { department: true },
  });

  if (depts.length === 0) {
    console.log("No campus departments found. Add departments first.");
    return;
  }

  console.log("Found campus departments:");
  depts.forEach((d) => console.log(`  ${d.id}  →  ${d.department.name} (${d.department.shortName})`));

  // Subjects per department shortName — add/adjust as needed
  const subjectMap: Record<string, { name: string; code: string; semester: number; maxMarks: number; credit: "ONE" | "TWO" | "THREE" | "FOUR" }[]> = {
    CSE: [
      { name: "Introduction to Programming",      code: "CSE101", semester: 1, maxMarks: 100, credit: "THREE" },
      { name: "Discrete Mathematics",             code: "CSE102", semester: 1, maxMarks: 100, credit: "THREE" },
      { name: "Data Structures",                  code: "CSE201", semester: 2, maxMarks: 100, credit: "THREE" },
      { name: "Object Oriented Programming",      code: "CSE202", semester: 2, maxMarks: 100, credit: "THREE" },
      { name: "Digital Logic Design",             code: "CSE203", semester: 2, maxMarks: 100, credit: "TWO"   },
      { name: "Algorithms",                       code: "CSE301", semester: 3, maxMarks: 100, credit: "THREE" },
      { name: "Database Management Systems",      code: "CSE302", semester: 3, maxMarks: 100, credit: "THREE" },
      { name: "Computer Architecture",            code: "CSE303", semester: 3, maxMarks: 100, credit: "TWO"   },
      { name: "Operating Systems",                code: "CSE401", semester: 4, maxMarks: 100, credit: "THREE" },
      { name: "Computer Networks",                code: "CSE402", semester: 4, maxMarks: 100, credit: "THREE" },
      { name: "Theory of Computation",            code: "CSE403", semester: 4, maxMarks: 100, credit: "TWO"   },
      { name: "Software Engineering",             code: "CSE501", semester: 5, maxMarks: 100, credit: "THREE" },
      { name: "Web Technologies",                 code: "CSE502", semester: 5, maxMarks: 100, credit: "TWO"   },
      { name: "Compiler Design",                  code: "CSE503", semester: 5, maxMarks: 100, credit: "THREE" },
      { name: "Machine Learning",                 code: "CSE601", semester: 6, maxMarks: 100, credit: "THREE" },
      { name: "Cloud Computing",                  code: "CSE602", semester: 6, maxMarks: 100, credit: "TWO"   },
      { name: "Information Security",             code: "CSE603", semester: 6, maxMarks: 100, credit: "THREE" },
      { name: "Distributed Systems",              code: "CSE701", semester: 7, maxMarks: 100, credit: "THREE" },
      { name: "Deep Learning",                    code: "CSE702", semester: 7, maxMarks: 100, credit: "THREE" },
      { name: "Project & Thesis",                 code: "CSE703", semester: 7, maxMarks: 100, credit: "FOUR"  },
    ],
    EEE: [
      { name: "Circuit Theory",                   code: "EEE101", semester: 1, maxMarks: 100, credit: "THREE" },
      { name: "Engineering Mathematics",          code: "EEE102", semester: 1, maxMarks: 100, credit: "THREE" },
      { name: "Electrical Machines",              code: "EEE201", semester: 2, maxMarks: 100, credit: "THREE" },
      { name: "Electronics",                      code: "EEE202", semester: 2, maxMarks: 100, credit: "THREE" },
      { name: "Signals & Systems",                code: "EEE203", semester: 2, maxMarks: 100, credit: "TWO"   },
      { name: "Power Systems",                    code: "EEE301", semester: 3, maxMarks: 100, credit: "THREE" },
      { name: "Control Systems",                  code: "EEE302", semester: 3, maxMarks: 100, credit: "THREE" },
      { name: "Electromagnetic Fields",           code: "EEE303", semester: 3, maxMarks: 100, credit: "TWO"   },
      { name: "Digital Electronics",              code: "EEE401", semester: 4, maxMarks: 100, credit: "THREE" },
      { name: "Microprocessors",                  code: "EEE402", semester: 4, maxMarks: 100, credit: "THREE" },
      { name: "Power Electronics",                code: "EEE403", semester: 4, maxMarks: 100, credit: "TWO"   },
      { name: "Communication Systems",            code: "EEE501", semester: 5, maxMarks: 100, credit: "THREE" },
      { name: "Renewable Energy Systems",         code: "EEE502", semester: 5, maxMarks: 100, credit: "THREE" },
      { name: "Instrumentation",                  code: "EEE503", semester: 5, maxMarks: 100, credit: "TWO"   },
      { name: "VLSI Design",                      code: "EEE601", semester: 6, maxMarks: 100, credit: "THREE" },
      { name: "Wireless Communications",          code: "EEE602", semester: 6, maxMarks: 100, credit: "THREE" },
      { name: "Embedded Systems",                 code: "EEE603", semester: 6, maxMarks: 100, credit: "TWO"   },
      { name: "Smart Grid Technology",            code: "EEE701", semester: 7, maxMarks: 100, credit: "THREE" },
      { name: "Industrial Automation",            code: "EEE702", semester: 7, maxMarks: 100, credit: "THREE" },
      { name: "Project & Thesis",                 code: "EEE703", semester: 7, maxMarks: 100, credit: "FOUR"  },
    ],
    BBA: [
      { name: "Principles of Management",         code: "BBA101", semester: 1, maxMarks: 100, credit: "THREE" },
      { name: "Business Communication",           code: "BBA102", semester: 1, maxMarks: 100, credit: "TWO"   },
      { name: "Financial Accounting",             code: "BBA201", semester: 2, maxMarks: 100, credit: "THREE" },
      { name: "Marketing Management",             code: "BBA202", semester: 2, maxMarks: 100, credit: "THREE" },
      { name: "Microeconomics",                   code: "BBA203", semester: 2, maxMarks: 100, credit: "TWO"   },
      { name: "Human Resource Management",        code: "BBA301", semester: 3, maxMarks: 100, credit: "THREE" },
      { name: "Business Statistics",              code: "BBA302", semester: 3, maxMarks: 100, credit: "THREE" },
      { name: "Organizational Behavior",          code: "BBA303", semester: 3, maxMarks: 100, credit: "TWO"   },
      { name: "Corporate Finance",                code: "BBA401", semester: 4, maxMarks: 100, credit: "THREE" },
      { name: "Operations Management",            code: "BBA402", semester: 4, maxMarks: 100, credit: "THREE" },
      { name: "Business Law",                     code: "BBA403", semester: 4, maxMarks: 100, credit: "TWO"   },
      { name: "Strategic Management",             code: "BBA501", semester: 5, maxMarks: 100, credit: "THREE" },
      { name: "Entrepreneurship",                 code: "BBA502", semester: 5, maxMarks: 100, credit: "THREE" },
      { name: "International Business",           code: "BBA503", semester: 5, maxMarks: 100, credit: "TWO"   },
      { name: "Investment & Portfolio Management",code: "BBA601", semester: 6, maxMarks: 100, credit: "THREE" },
      { name: "Supply Chain Management",          code: "BBA602", semester: 6, maxMarks: 100, credit: "THREE" },
      { name: "E-Commerce",                       code: "BBA603", semester: 6, maxMarks: 100, credit: "TWO"   },
      { name: "Business Research Methods",        code: "BBA701", semester: 7, maxMarks: 100, credit: "THREE" },
      { name: "Corporate Governance",             code: "BBA702", semester: 7, maxMarks: 100, credit: "THREE" },
      { name: "Project & Internship",             code: "BBA703", semester: 7, maxMarks: 100, credit: "FOUR"  },
    ],
    ENG: [
      { name: "English Grammar & Composition",    code: "ENG101", semester: 1, maxMarks: 100, credit: "THREE" },
      { name: "Literature Survey",                code: "ENG102", semester: 1, maxMarks: 100, credit: "THREE" },
      { name: "Linguistics",                      code: "ENG201", semester: 2, maxMarks: 100, credit: "THREE" },
      { name: "Creative Writing",                 code: "ENG202", semester: 2, maxMarks: 100, credit: "TWO"   },
      { name: "Phonetics & Phonology",            code: "ENG203", semester: 2, maxMarks: 100, credit: "TWO"   },
      { name: "British Literature",               code: "ENG301", semester: 3, maxMarks: 100, credit: "THREE" },
      { name: "American Literature",              code: "ENG302", semester: 3, maxMarks: 100, credit: "THREE" },
      { name: "Syntax & Semantics",               code: "ENG303", semester: 3, maxMarks: 100, credit: "TWO"   },
      { name: "Post-Colonial Literature",         code: "ENG401", semester: 4, maxMarks: 100, credit: "THREE" },
      { name: "Translation Studies",              code: "ENG402", semester: 4, maxMarks: 100, credit: "THREE" },
      { name: "Academic Writing",                 code: "ENG403", semester: 4, maxMarks: 100, credit: "TWO"   },
      { name: "Discourse Analysis",               code: "ENG501", semester: 5, maxMarks: 100, credit: "THREE" },
      { name: "Modern Drama",                     code: "ENG502", semester: 5, maxMarks: 100, credit: "THREE" },
      { name: "Language Teaching Methods",        code: "ENG503", semester: 5, maxMarks: 100, credit: "TWO"   },
      { name: "Sociolinguistics",                 code: "ENG601", semester: 6, maxMarks: 100, credit: "THREE" },
      { name: "Contemporary Fiction",             code: "ENG602", semester: 6, maxMarks: 100, credit: "THREE" },
      { name: "Research in Literature",           code: "ENG603", semester: 6, maxMarks: 100, credit: "TWO"   },
      { name: "Applied Linguistics",              code: "ENG701", semester: 7, maxMarks: 100, credit: "THREE" },
      { name: "World Literature",                 code: "ENG702", semester: 7, maxMarks: 100, credit: "THREE" },
      { name: "Dissertation",                     code: "ENG703", semester: 7, maxMarks: 100, credit: "FOUR"  },
    ],
  };

  let created = 0;
  let skipped = 0;

  for (const dept of depts) {
    const shortName = dept.department.shortName;
    const subjects = subjectMap[shortName];

    if (!subjects) {
      console.log(`  ⚠  No subjects defined for ${shortName}, skipping.`);
      continue;
    }

    for (const s of subjects) {
      try {
        await prisma.subject.upsert({
          where: { code: s.code },
          update: {},
          create: { ...s, campusDepartmentId: dept.id },
        });
        created++;
      } catch {
        skipped++;
      }
    }
    console.log(`  ✓  Seeded subjects for ${shortName}`);
  }

  console.log(`\nDone. ${created} subjects upserted, ${skipped} skipped.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
