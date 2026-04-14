# Nexus Backend — System Structure

## High-Level Tenant Flow

```
Institute (Tenant)
   │
   ├── Campus (multiple per institute)
   │     └── CampusDepartment (many-to-many join)
   │               │
   ├── Department ─┘
   │
   └── Via CampusDepartment:
         ├── Teacher
         ├── Student
         ├── Subject
         └── Mark
```

---

## Data Model Structure

```
Campus ──┐
         ├── CampusDepartment ──→ Teacher
Department ──┘                ──→ Student
                              ──→ Subject
                              ──→ Mark
```

### Key Design Rule
Campus ↔ Department is **many-to-many** via `CampusDepartment`.
All child models (`Teacher`, `Student`, `Subject`, `Mark`) reference
`campusDepartmentId` — a single FK that carries both campus and department context.

---

## Schema Overview

```
User
  role: PRINCIPAL | HOD | TEACHER | STUDENT | VOLUNTEER
  → teacher? (TeacherUser)
  → student? (StudentUser)
  → createdCampuses[]

Campus
  campusName, campusCode (unique), address?
  createdById → User
  → departments[] (via CampusDepartment)

Department
  name, shortName (unique)
  → campuses[] (via CampusDepartment)

CampusDepartment          ← the join table
  campusId → Campus
  departmentId → Department
  @@unique([campusId, departmentId])
  → teachers[], students[], subjects[], marks[]

Teacher
  userId → User
  campusDepartmentId → CampusDepartment
  employeeId?, designation?, qualification?

Student
  userId → User
  campusDepartmentId → CampusDepartment
  roll, session, semester, shift
  @@unique([campusDepartmentId, roll, session])
  → marks[]

Subject
  campusDepartmentId → CampusDepartment
  name, code (unique), semester, maxMarks, credit
  → marks[]

Mark
  campusDepartmentId → CampusDepartment
  studentId → Student
  subjectId → Subject
  assessmentType, assessmentNo?, marksObtained
  status: PENDING | APPROVED | REJECTED
  submittedById, approvedById?
```

---

## Query Patterns

### Get campusDepartmentId (entry point for all queries)
```ts
const cd = await prisma.campusDepartment.findUnique({
  where: { campusId_departmentId: { campusId, departmentId } }
})
```

### Get all students in a campus+department
```ts
const students = await prisma.student.findMany({
  where: { campusDepartmentId: cd.id }
})
```

### Get all students (inline, no pre-fetch)
```ts
const students = await prisma.student.findMany({
  where: {
    campusDepartment: { campusId, departmentId }
  },
  include: {
    campusDepartment: { include: { campus: true, department: true } }
  }
})
```

### Get all teachers of a campus (across all departments)
```ts
const teachers = await prisma.teacher.findMany({
  where: { campusDepartment: { campusId } },
  include: { campusDepartment: { include: { department: true } } }
})
```

### Get all subjects of a department (across all campuses)
```ts
const subjects = await prisma.subject.findMany({
  where: { campusDepartment: { departmentId } }
})
```

### Get marks for a student in a specific campus+department
```ts
const marks = await prisma.mark.findMany({
  where: {
    studentId,
    campusDepartment: { campusId, departmentId }
  },
  include: { subject: true }
})
```

---

## Enums

```
UserRole      : PRINCIPAL | HOD | TEACHER | STUDENT | VOLUNTEER
MarkStatus    : PENDING | APPROVED | REJECTED
AssessmentType: CLASS_TEST | QUIZ | MIDTERM | ATTENDANCE
Shift         : MORNING | EVENING
CreditType    : ONE | TWO | THREE | FOUR
```
