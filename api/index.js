// src/app.ts
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";

// src/lib/stripe.ts
import Stripe from "stripe";

// src/config/env.ts
import "dotenv/config";
var envVars = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: process.env.PORT ?? "5000",
  DATABASE_URL: process.env.DATABASE_URL,
  CLIENT_URL: process.env.CLIENT_URL ?? "http://localhost:3000",
  STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
  STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
  CAMPUS_REGISTRATION_FEE: Number(process.env.CAMPUS_REGISTRATION_FEE ?? 5e3),
  BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  BETTER_AUTH_URL: process.env.BETTER_AUTH_URL ?? "http://localhost:5000",
  ACCESS_TOKEN_SECRET: process.env.ACCESS_TOKEN_SECRET ?? "access_secret",
  ACCESS_TOKEN_EXPIRES_IN: process.env.ACCESS_TOKEN_EXPIRES_IN ?? "1d",
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET ?? "refresh_secret",
  REFRESH_TOKEN_EXPIRES_IN: process.env.REFRESH_TOKEN_EXPIRES_IN ?? "7d"
};

// src/lib/stripe.ts
var stripe = new Stripe(envVars.STRIPE_SECRET_KEY);

// src/lib/prisma.ts
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";

// src/generated/prisma/client.ts
import * as path from "path";
import { fileURLToPath } from "url";

// src/generated/prisma/internal/class.ts
import * as runtime from "@prisma/client/runtime/client";
var config = {
  "previewFeatures": [],
  "clientVersion": "7.7.0",
  "engineVersion": "75cbdc1eb7150937890ad5465d861175c6624711",
  "activeProvider": "postgresql",
  "inlineSchema": 'model User {\n  id            String    @id\n  name          String\n  email         String\n  emailVerified Boolean   @default(false)\n  image         String?\n  createdAt     DateTime  @default(now())\n  updatedAt     DateTime  @updatedAt\n  sessions      Session[]\n  accounts      Account[]\n\n  role     UserRole\n  isActive Boolean  @default(true)\n  phone    String?\n  address  String?\n\n  teacher Teacher? @relation("TeacherUser")\n  student Student? @relation("StudentUser")\n\n  principalCampus     Campus?              @relation("CampusPrincipal")\n  hodDepartment       CampusDepartment?    @relation("DepartmentHOD")\n  campusRegistrations CampusRegistration[] @relation("CampusRegistrationCreatedBy")\n\n  @@unique([email])\n  @@index([role])\n  @@index([isActive])\n  @@map("user")\n}\n\nmodel Session {\n  id        String   @id\n  expiresAt DateTime\n  token     String\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n  ipAddress String?\n  userAgent String?\n  userId    String\n  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)\n\n  @@unique([token])\n  @@index([userId])\n  @@map("session")\n}\n\nmodel Account {\n  id                    String    @id\n  accountId             String\n  providerId            String\n  userId                String\n  user                  User      @relation(fields: [userId], references: [id], onDelete: Cascade)\n  accessToken           String?\n  refreshToken          String?\n  idToken               String?\n  accessTokenExpiresAt  DateTime?\n  refreshTokenExpiresAt DateTime?\n  scope                 String?\n  password              String?\n  createdAt             DateTime  @default(now())\n  updatedAt             DateTime  @updatedAt\n\n  @@index([userId])\n  @@map("account")\n}\n\nmodel Verification {\n  id         String   @id\n  identifier String\n  value      String\n  expiresAt  DateTime\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  @@index([identifier])\n  @@map("verification")\n}\n\nmodel CampusDepartment {\n  id           String   @id @default(cuid())\n  campusId     String\n  departmentId String\n  hodId        String?  @unique\n  createdAt    DateTime @default(now())\n  updatedAt    DateTime @updatedAt\n\n  campus     Campus     @relation(fields: [campusId], references: [id])\n  department Department @relation(fields: [departmentId], references: [id])\n  hod        User?      @relation("DepartmentHOD", fields: [hodId], references: [id])\n\n  teachers Teacher[]\n  students Student[]\n  subjects Subject[]\n  marks    Mark[]\n\n  @@unique([campusId, departmentId])\n}\n\nmodel CampusRegistration {\n  id         String  @id @default(cuid())\n  campusName String\n  campusCode String\n  address    String?\n\n  createdById String\n\n  principalName     String\n  principalEmail    String\n  principalPassword String\n\n  stripeSessionId String?  @unique\n  amount          Float\n  createdAt       DateTime @default(now())\n  expiresAt       DateTime\n\n  createdBy User     @relation("CampusRegistrationCreatedBy", fields: [createdById], references: [id])\n  payment   Payment?\n\n  @@map("campus_registrations")\n}\n\nmodel Campus {\n  id         String   @id @default(cuid())\n  campusName String\n  campusCode String   @unique\n  address    String?\n  createdAt  DateTime @default(now())\n  updatedAt  DateTime @updatedAt\n\n  principalId String @unique\n\n  principal User @relation("CampusPrincipal", fields: [principalId], references: [id])\n\n  departments CampusDepartment[]\n  payments    Payment[]\n}\n\nmodel Department {\n  id        String   @id @default(cuid())\n  name      String\n  shortName String   @unique\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  campuses CampusDepartment[]\n}\n\nenum UserRole {\n  PRINCIPAL\n  HOD\n  TEACHER\n  STUDENT\n  VOLUNTEER\n}\n\nenum MarkStatus {\n  PENDING\n  APPROVED\n  REJECTED\n}\n\nenum AssessmentType {\n  CLASS_TEST\n  QUIZ\n  MIDTERM\n  ATTENDANCE\n}\n\nenum Shift {\n  MORNING\n  EVENING\n}\n\nenum CreditType {\n  ONE\n  TWO\n  THREE\n  FOUR\n}\n\nenum PaymentStatus {\n  UNPAID\n  PAID\n  FAILED\n  REFUNDED\n}\n\nmodel Mark {\n  id                 String         @id @default(cuid())\n  campusDepartmentId String\n  studentId          String\n  subjectId          String\n  assessmentType     AssessmentType\n  assessmentNo       Int\n  marksObtained      Float\n  status             MarkStatus     @default(PENDING)\n  submittedById      String\n  approvedById       String?\n  submittedAt        DateTime       @default(now())\n  approvedAt         DateTime?\n  createdAt          DateTime       @default(now())\n  updatedAt          DateTime       @updatedAt\n\n  campusDepartment CampusDepartment @relation(fields: [campusDepartmentId], references: [id])\n  student          Student          @relation(fields: [studentId], references: [id])\n  subject          Subject          @relation(fields: [subjectId], references: [id])\n\n  @@unique([studentId, subjectId, assessmentType, assessmentNo])\n  @@index([studentId])\n  @@index([subjectId])\n  @@index([status])\n}\n\nmodel Payment {\n  id                 String        @id @default(cuid())\n  amount             Float\n  transactionId      String        @unique\n  stripeEventId      String?       @unique\n  status             PaymentStatus @default(UNPAID)\n  paymentGatewayData Json?\n  createdAt          DateTime      @default(now())\n  updatedAt          DateTime      @updatedAt\n\n  campusId       String?\n  registrationId String? @unique\n\n  campus       Campus?             @relation(fields: [campusId], references: [id], onDelete: Cascade)\n  registration CampusRegistration? @relation(fields: [registrationId], references: [id], onDelete: SetNull)\n\n  @@index([campusId])\n  @@index([transactionId])\n  @@map("payments")\n}\n\ngenerator client {\n  provider = "prisma-client"\n  output   = "../../src/generated/prisma"\n}\n\ndatasource db {\n  provider = "postgresql"\n}\n\nmodel Student {\n  id                 String @id @default(cuid())\n  userId             String @unique\n  campusDepartmentId String\n  roll               String\n  session            String\n  semester           Int\n  shift              Shift\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user             User             @relation("StudentUser", fields: [userId], references: [id])\n  campusDepartment CampusDepartment @relation(fields: [campusDepartmentId], references: [id])\n\n  marks Mark[]\n\n  @@unique([campusDepartmentId, roll, session])\n  @@index([campusDepartmentId])\n}\n\nmodel Subject {\n  id                 String     @id @default(cuid())\n  campusDepartmentId String\n  name               String\n  code               String     @unique\n  semester           Int\n  maxMarks           Float\n  credit             CreditType\n\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  campusDepartment CampusDepartment @relation(fields: [campusDepartmentId], references: [id])\n  marks            Mark[]\n\n  @@index([campusDepartmentId])\n}\n\nmodel Teacher {\n  id                 String @id @default(cuid())\n  userId             String @unique\n  campusDepartmentId String\n\n  employeeId    String? @unique\n  designation   String?\n  qualification String?\n\n  joinedAt  DateTime @default(now())\n  createdAt DateTime @default(now())\n  updatedAt DateTime @updatedAt\n\n  user             User             @relation("TeacherUser", fields: [userId], references: [id])\n  campusDepartment CampusDepartment @relation(fields: [campusDepartmentId], references: [id])\n\n  @@index([campusDepartmentId])\n}\n',
  "runtimeDataModel": {
    "models": {},
    "enums": {},
    "types": {}
  },
  "parameterizationSchema": {
    "strings": [],
    "graph": ""
  }
};
config.runtimeDataModel = JSON.parse('{"models":{"User":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"email","kind":"scalar","type":"String"},{"name":"emailVerified","kind":"scalar","type":"Boolean"},{"name":"image","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"sessions","kind":"object","type":"Session","relationName":"SessionToUser"},{"name":"accounts","kind":"object","type":"Account","relationName":"AccountToUser"},{"name":"role","kind":"enum","type":"UserRole"},{"name":"isActive","kind":"scalar","type":"Boolean"},{"name":"phone","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"teacher","kind":"object","type":"Teacher","relationName":"TeacherUser"},{"name":"student","kind":"object","type":"Student","relationName":"StudentUser"},{"name":"principalCampus","kind":"object","type":"Campus","relationName":"CampusPrincipal"},{"name":"hodDepartment","kind":"object","type":"CampusDepartment","relationName":"DepartmentHOD"},{"name":"campusRegistrations","kind":"object","type":"CampusRegistration","relationName":"CampusRegistrationCreatedBy"}],"dbName":"user"},"Session":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"token","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"ipAddress","kind":"scalar","type":"String"},{"name":"userAgent","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"SessionToUser"}],"dbName":"session"},"Account":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"accountId","kind":"scalar","type":"String"},{"name":"providerId","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"user","kind":"object","type":"User","relationName":"AccountToUser"},{"name":"accessToken","kind":"scalar","type":"String"},{"name":"refreshToken","kind":"scalar","type":"String"},{"name":"idToken","kind":"scalar","type":"String"},{"name":"accessTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"refreshTokenExpiresAt","kind":"scalar","type":"DateTime"},{"name":"scope","kind":"scalar","type":"String"},{"name":"password","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"account"},"Verification":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"identifier","kind":"scalar","type":"String"},{"name":"value","kind":"scalar","type":"String"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"}],"dbName":"verification"},"CampusDepartment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"campusId","kind":"scalar","type":"String"},{"name":"departmentId","kind":"scalar","type":"String"},{"name":"hodId","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"campus","kind":"object","type":"Campus","relationName":"CampusToCampusDepartment"},{"name":"department","kind":"object","type":"Department","relationName":"CampusDepartmentToDepartment"},{"name":"hod","kind":"object","type":"User","relationName":"DepartmentHOD"},{"name":"teachers","kind":"object","type":"Teacher","relationName":"CampusDepartmentToTeacher"},{"name":"students","kind":"object","type":"Student","relationName":"CampusDepartmentToStudent"},{"name":"subjects","kind":"object","type":"Subject","relationName":"CampusDepartmentToSubject"},{"name":"marks","kind":"object","type":"Mark","relationName":"CampusDepartmentToMark"}],"dbName":null},"CampusRegistration":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"campusName","kind":"scalar","type":"String"},{"name":"campusCode","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"createdById","kind":"scalar","type":"String"},{"name":"principalName","kind":"scalar","type":"String"},{"name":"principalEmail","kind":"scalar","type":"String"},{"name":"principalPassword","kind":"scalar","type":"String"},{"name":"stripeSessionId","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"expiresAt","kind":"scalar","type":"DateTime"},{"name":"createdBy","kind":"object","type":"User","relationName":"CampusRegistrationCreatedBy"},{"name":"payment","kind":"object","type":"Payment","relationName":"CampusRegistrationToPayment"}],"dbName":"campus_registrations"},"Campus":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"campusName","kind":"scalar","type":"String"},{"name":"campusCode","kind":"scalar","type":"String"},{"name":"address","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"principalId","kind":"scalar","type":"String"},{"name":"principal","kind":"object","type":"User","relationName":"CampusPrincipal"},{"name":"departments","kind":"object","type":"CampusDepartment","relationName":"CampusToCampusDepartment"},{"name":"payments","kind":"object","type":"Payment","relationName":"CampusToPayment"}],"dbName":null},"Department":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"shortName","kind":"scalar","type":"String"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"campuses","kind":"object","type":"CampusDepartment","relationName":"CampusDepartmentToDepartment"}],"dbName":null},"Mark":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"campusDepartmentId","kind":"scalar","type":"String"},{"name":"studentId","kind":"scalar","type":"String"},{"name":"subjectId","kind":"scalar","type":"String"},{"name":"assessmentType","kind":"enum","type":"AssessmentType"},{"name":"assessmentNo","kind":"scalar","type":"Int"},{"name":"marksObtained","kind":"scalar","type":"Float"},{"name":"status","kind":"enum","type":"MarkStatus"},{"name":"submittedById","kind":"scalar","type":"String"},{"name":"approvedById","kind":"scalar","type":"String"},{"name":"submittedAt","kind":"scalar","type":"DateTime"},{"name":"approvedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"campusDepartment","kind":"object","type":"CampusDepartment","relationName":"CampusDepartmentToMark"},{"name":"student","kind":"object","type":"Student","relationName":"MarkToStudent"},{"name":"subject","kind":"object","type":"Subject","relationName":"MarkToSubject"}],"dbName":null},"Payment":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"amount","kind":"scalar","type":"Float"},{"name":"transactionId","kind":"scalar","type":"String"},{"name":"stripeEventId","kind":"scalar","type":"String"},{"name":"status","kind":"enum","type":"PaymentStatus"},{"name":"paymentGatewayData","kind":"scalar","type":"Json"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"campusId","kind":"scalar","type":"String"},{"name":"registrationId","kind":"scalar","type":"String"},{"name":"campus","kind":"object","type":"Campus","relationName":"CampusToPayment"},{"name":"registration","kind":"object","type":"CampusRegistration","relationName":"CampusRegistrationToPayment"}],"dbName":"payments"},"Student":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"campusDepartmentId","kind":"scalar","type":"String"},{"name":"roll","kind":"scalar","type":"String"},{"name":"session","kind":"scalar","type":"String"},{"name":"semester","kind":"scalar","type":"Int"},{"name":"shift","kind":"enum","type":"Shift"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"StudentUser"},{"name":"campusDepartment","kind":"object","type":"CampusDepartment","relationName":"CampusDepartmentToStudent"},{"name":"marks","kind":"object","type":"Mark","relationName":"MarkToStudent"}],"dbName":null},"Subject":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"campusDepartmentId","kind":"scalar","type":"String"},{"name":"name","kind":"scalar","type":"String"},{"name":"code","kind":"scalar","type":"String"},{"name":"semester","kind":"scalar","type":"Int"},{"name":"maxMarks","kind":"scalar","type":"Float"},{"name":"credit","kind":"enum","type":"CreditType"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"campusDepartment","kind":"object","type":"CampusDepartment","relationName":"CampusDepartmentToSubject"},{"name":"marks","kind":"object","type":"Mark","relationName":"MarkToSubject"}],"dbName":null},"Teacher":{"fields":[{"name":"id","kind":"scalar","type":"String"},{"name":"userId","kind":"scalar","type":"String"},{"name":"campusDepartmentId","kind":"scalar","type":"String"},{"name":"employeeId","kind":"scalar","type":"String"},{"name":"designation","kind":"scalar","type":"String"},{"name":"qualification","kind":"scalar","type":"String"},{"name":"joinedAt","kind":"scalar","type":"DateTime"},{"name":"createdAt","kind":"scalar","type":"DateTime"},{"name":"updatedAt","kind":"scalar","type":"DateTime"},{"name":"user","kind":"object","type":"User","relationName":"TeacherUser"},{"name":"campusDepartment","kind":"object","type":"CampusDepartment","relationName":"CampusDepartmentToTeacher"}],"dbName":null}},"enums":{},"types":{}}');
config.parameterizationSchema = {
  strings: JSON.parse('["where","orderBy","cursor","user","sessions","accounts","principal","departments","campus","createdBy","payment","registration","payments","_count","campuses","department","hod","teachers","campusDepartment","student","marks","subject","students","subjects","teacher","principalCampus","hodDepartment","campusRegistrations","User.findUnique","User.findUniqueOrThrow","User.findFirst","User.findFirstOrThrow","User.findMany","data","User.createOne","User.createMany","User.createManyAndReturn","User.updateOne","User.updateMany","User.updateManyAndReturn","create","update","User.upsertOne","User.deleteOne","User.deleteMany","having","_min","_max","User.groupBy","User.aggregate","Session.findUnique","Session.findUniqueOrThrow","Session.findFirst","Session.findFirstOrThrow","Session.findMany","Session.createOne","Session.createMany","Session.createManyAndReturn","Session.updateOne","Session.updateMany","Session.updateManyAndReturn","Session.upsertOne","Session.deleteOne","Session.deleteMany","Session.groupBy","Session.aggregate","Account.findUnique","Account.findUniqueOrThrow","Account.findFirst","Account.findFirstOrThrow","Account.findMany","Account.createOne","Account.createMany","Account.createManyAndReturn","Account.updateOne","Account.updateMany","Account.updateManyAndReturn","Account.upsertOne","Account.deleteOne","Account.deleteMany","Account.groupBy","Account.aggregate","Verification.findUnique","Verification.findUniqueOrThrow","Verification.findFirst","Verification.findFirstOrThrow","Verification.findMany","Verification.createOne","Verification.createMany","Verification.createManyAndReturn","Verification.updateOne","Verification.updateMany","Verification.updateManyAndReturn","Verification.upsertOne","Verification.deleteOne","Verification.deleteMany","Verification.groupBy","Verification.aggregate","CampusDepartment.findUnique","CampusDepartment.findUniqueOrThrow","CampusDepartment.findFirst","CampusDepartment.findFirstOrThrow","CampusDepartment.findMany","CampusDepartment.createOne","CampusDepartment.createMany","CampusDepartment.createManyAndReturn","CampusDepartment.updateOne","CampusDepartment.updateMany","CampusDepartment.updateManyAndReturn","CampusDepartment.upsertOne","CampusDepartment.deleteOne","CampusDepartment.deleteMany","CampusDepartment.groupBy","CampusDepartment.aggregate","CampusRegistration.findUnique","CampusRegistration.findUniqueOrThrow","CampusRegistration.findFirst","CampusRegistration.findFirstOrThrow","CampusRegistration.findMany","CampusRegistration.createOne","CampusRegistration.createMany","CampusRegistration.createManyAndReturn","CampusRegistration.updateOne","CampusRegistration.updateMany","CampusRegistration.updateManyAndReturn","CampusRegistration.upsertOne","CampusRegistration.deleteOne","CampusRegistration.deleteMany","_avg","_sum","CampusRegistration.groupBy","CampusRegistration.aggregate","Campus.findUnique","Campus.findUniqueOrThrow","Campus.findFirst","Campus.findFirstOrThrow","Campus.findMany","Campus.createOne","Campus.createMany","Campus.createManyAndReturn","Campus.updateOne","Campus.updateMany","Campus.updateManyAndReturn","Campus.upsertOne","Campus.deleteOne","Campus.deleteMany","Campus.groupBy","Campus.aggregate","Department.findUnique","Department.findUniqueOrThrow","Department.findFirst","Department.findFirstOrThrow","Department.findMany","Department.createOne","Department.createMany","Department.createManyAndReturn","Department.updateOne","Department.updateMany","Department.updateManyAndReturn","Department.upsertOne","Department.deleteOne","Department.deleteMany","Department.groupBy","Department.aggregate","Mark.findUnique","Mark.findUniqueOrThrow","Mark.findFirst","Mark.findFirstOrThrow","Mark.findMany","Mark.createOne","Mark.createMany","Mark.createManyAndReturn","Mark.updateOne","Mark.updateMany","Mark.updateManyAndReturn","Mark.upsertOne","Mark.deleteOne","Mark.deleteMany","Mark.groupBy","Mark.aggregate","Payment.findUnique","Payment.findUniqueOrThrow","Payment.findFirst","Payment.findFirstOrThrow","Payment.findMany","Payment.createOne","Payment.createMany","Payment.createManyAndReturn","Payment.updateOne","Payment.updateMany","Payment.updateManyAndReturn","Payment.upsertOne","Payment.deleteOne","Payment.deleteMany","Payment.groupBy","Payment.aggregate","Student.findUnique","Student.findUniqueOrThrow","Student.findFirst","Student.findFirstOrThrow","Student.findMany","Student.createOne","Student.createMany","Student.createManyAndReturn","Student.updateOne","Student.updateMany","Student.updateManyAndReturn","Student.upsertOne","Student.deleteOne","Student.deleteMany","Student.groupBy","Student.aggregate","Subject.findUnique","Subject.findUniqueOrThrow","Subject.findFirst","Subject.findFirstOrThrow","Subject.findMany","Subject.createOne","Subject.createMany","Subject.createManyAndReturn","Subject.updateOne","Subject.updateMany","Subject.updateManyAndReturn","Subject.upsertOne","Subject.deleteOne","Subject.deleteMany","Subject.groupBy","Subject.aggregate","Teacher.findUnique","Teacher.findUniqueOrThrow","Teacher.findFirst","Teacher.findFirstOrThrow","Teacher.findMany","Teacher.createOne","Teacher.createMany","Teacher.createManyAndReturn","Teacher.updateOne","Teacher.updateMany","Teacher.updateManyAndReturn","Teacher.upsertOne","Teacher.deleteOne","Teacher.deleteMany","Teacher.groupBy","Teacher.aggregate","AND","OR","NOT","id","userId","campusDepartmentId","employeeId","designation","qualification","joinedAt","createdAt","updatedAt","equals","in","notIn","lt","lte","gt","gte","not","contains","startsWith","endsWith","name","code","semester","maxMarks","CreditType","credit","roll","session","Shift","shift","amount","transactionId","stripeEventId","PaymentStatus","status","paymentGatewayData","campusId","registrationId","string_contains","string_starts_with","string_ends_with","array_starts_with","array_ends_with","array_contains","studentId","subjectId","AssessmentType","assessmentType","assessmentNo","marksObtained","MarkStatus","submittedById","approvedById","submittedAt","approvedAt","shortName","every","some","none","campusName","campusCode","address","principalId","createdById","principalName","principalEmail","principalPassword","stripeSessionId","expiresAt","departmentId","hodId","identifier","value","accountId","providerId","accessToken","refreshToken","idToken","accessTokenExpiresAt","refreshTokenExpiresAt","scope","password","token","ipAddress","userAgent","email","emailVerified","image","UserRole","role","isActive","phone","studentId_subjectId_assessmentType_assessmentNo","campusDepartmentId_roll_session","campusId_departmentId","is","isNot","connectOrCreate","upsert","createMany","set","disconnect","delete","connect","updateMany","deleteMany","increment","decrement","multiply","divide"]'),
  graph: "7AZ50AEVBAAAwgMAIAUAAMMDACATAADFAwAgGAAAxAMAIBkAAMYDACAaAADHAwAgGwAAyAMAIPQBAAC_AwAw9QEAAB4AEPYBAAC_AwAw9wEBAAAAAf4BQACYAwAh_wFAAJgDACGLAgEAlwMAIbQCAQCcAwAhzAIBAAAAAc0CIADAAwAhzgIBAJwDACHQAgAAwQPQAiLRAiAAwAMAIdICAQCcAwAhAQAAAAEAIAwDAACdAwAg9AEAANYDADD1AQAAAwAQ9gEAANYDADD3AQEAlwMAIfgBAQCXAwAh_gFAAJgDACH_AUAAmAMAIbsCQACYAwAhyQIBAJcDACHKAgEAnAMAIcsCAQCcAwAhAwMAAJIFACDKAgAA1wMAIMsCAADXAwAgDAMAAJ0DACD0AQAA1gMAMPUBAAADABD2AQAA1gMAMPcBAQAAAAH4AQEAlwMAIf4BQACYAwAh_wFAAJgDACG7AkAAmAMAIckCAQAAAAHKAgEAnAMAIcsCAQCcAwAhAwAAAAMAIAEAAAQAMAIAAAUAIBEDAACdAwAg9AEAANUDADD1AQAABwAQ9gEAANUDADD3AQEAlwMAIfgBAQCXAwAh_gFAAJgDACH_AUAAmAMAIcACAQCXAwAhwQIBAJcDACHCAgEAnAMAIcMCAQCcAwAhxAIBAJwDACHFAkAAuAMAIcYCQAC4AwAhxwIBAJwDACHIAgEAnAMAIQgDAACSBQAgwgIAANcDACDDAgAA1wMAIMQCAADXAwAgxQIAANcDACDGAgAA1wMAIMcCAADXAwAgyAIAANcDACARAwAAnQMAIPQBAADVAwAw9QEAAAcAEPYBAADVAwAw9wEBAAAAAfgBAQCXAwAh_gFAAJgDACH_AUAAmAMAIcACAQCXAwAhwQIBAJcDACHCAgEAnAMAIcMCAQCcAwAhxAIBAJwDACHFAkAAuAMAIcYCQAC4AwAhxwIBAJwDACHIAgEAnAMAIQMAAAAHACABAAAIADACAAAJACAOAwAAnQMAIBIAALIDACD0AQAAvgMAMPUBAAALABD2AQAAvgMAMPcBAQCXAwAh-AEBAJcDACH5AQEAlwMAIfoBAQCcAwAh-wEBAJwDACH8AQEAnAMAIf0BQACYAwAh_gFAAJgDACH_AUAAmAMAIQEAAAALACAQCAAAzwMAIA8AANADACAQAADRAwAgEQAA0gMAIBQAALMDACAWAADTAwAgFwAA1AMAIPQBAADOAwAw9QEAAA0AEPYBAADOAwAw9wEBAJcDACH-AUAAmAMAIf8BQACYAwAhmwIBAJcDACG8AgEAlwMAIb0CAQCcAwAhCAgAAIEGACAPAACIBgAgEAAAkgUAIBEAAIkGACAUAACFBgAgFgAAigYAIBcAAIsGACC9AgAA1wMAIBEIAADPAwAgDwAA0AMAIBAAANEDACARAADSAwAgFAAAswMAIBYAANMDACAXAADUAwAg9AEAAM4DADD1AQAADQAQ9gEAAM4DADD3AQEAAAAB_gFAAJgDACH_AUAAmAMAIZsCAQCXAwAhvAIBAJcDACG9AgEAAAAB1QIAAM0DACADAAAADQAgAQAADgAwAgAADwAgDwgAAMYDACALAADMAwAg9AEAAMkDADD1AQAAEQAQ9gEAAMkDADD3AQEAlwMAIf4BQACYAwAh_wFAAJgDACGVAggArQMAIZYCAQCXAwAhlwIBAJwDACGZAgAAygOZAiKaAgAAywMAIJsCAQCcAwAhnAIBAJwDACEGCAAAgQYAIAsAAIcGACCXAgAA1wMAIJoCAADXAwAgmwIAANcDACCcAgAA1wMAIA8IAADGAwAgCwAAzAMAIPQBAADJAwAw9QEAABEAEPYBAADJAwAw9wEBAAAAAf4BQACYAwAh_wFAAJgDACGVAggArQMAIZYCAQAAAAGXAgEAAAABmQIAAMoDmQIimgIAAMsDACCbAgEAnAMAIZwCAQAAAAEDAAAAEQAgAQAAEgAwAgAAEwAgDQYAAJ0DACAHAACZAwAgDAAAngMAIPQBAACbAwAw9QEAABUAEPYBAACbAwAw9wEBAJcDACH-AUAAmAMAIf8BQACYAwAhsgIBAJcDACGzAgEAlwMAIbQCAQCcAwAhtQIBAJcDACEBAAAAFQAgEQkAAJ0DACAKAACuAwAg9AEAAKwDADD1AQAAFwAQ9gEAAKwDADD3AQEAlwMAIf4BQACYAwAhlQIIAK0DACGyAgEAlwMAIbMCAQCXAwAhtAIBAJwDACG2AgEAlwMAIbcCAQCXAwAhuAIBAJcDACG5AgEAlwMAIboCAQCcAwAhuwJAAJgDACEBAAAAFwAgAQAAABEAIAEAAAANACABAAAAEQAgAwAAAA0AIAEAAA4AMAIAAA8AIAEAAAANACAVBAAAwgMAIAUAAMMDACATAADFAwAgGAAAxAMAIBkAAMYDACAaAADHAwAgGwAAyAMAIPQBAAC_AwAw9QEAAB4AEPYBAAC_AwAw9wEBAJcDACH-AUAAmAMAIf8BQACYAwAhiwIBAJcDACG0AgEAnAMAIcwCAQCXAwAhzQIgAMADACHOAgEAnAMAIdACAADBA9ACItECIADAAwAh0gIBAJwDACEBAAAAHgAgBQMAAJIFACASAACCBgAg-gEAANcDACD7AQAA1wMAIPwBAADXAwAgDgMAAJ0DACASAACyAwAg9AEAAL4DADD1AQAACwAQ9gEAAL4DADD3AQEAAAAB-AEBAAAAAfkBAQCXAwAh-gEBAAAAAfsBAQCcAwAh_AEBAJwDACH9AUAAmAMAIf4BQACYAwAh_wFAAJgDACEDAAAACwAgAQAAIAAwAgAAIQAgDwMAAJ0DACASAACyAwAgFAAAswMAIPQBAAC8AwAw9QEAACMAEPYBAAC8AwAw9wEBAJcDACH4AQEAlwMAIfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIY0CAgCwAwAhkQIBAJcDACGSAgEAlwMAIZQCAAC9A5QCIgMDAACSBQAgEgAAggYAIBQAAIUGACAQAwAAnQMAIBIAALIDACAUAACzAwAg9AEAALwDADD1AQAAIwAQ9gEAALwDADD3AQEAAAAB-AEBAAAAAfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIY0CAgCwAwAhkQIBAJcDACGSAgEAlwMAIZQCAAC9A5QCItQCAAC7AwAgAwAAACMAIAEAACQAMAIAACUAIBQSAACyAwAgEwAAuQMAIBUAALoDACD0AQAAtQMAMPUBAAAnABD2AQAAtQMAMPcBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhmQIAALcDqgIiowIBAJcDACGkAgEAlwMAIaYCAAC2A6YCIqcCAgCwAwAhqAIIAK0DACGqAgEAlwMAIasCAQCcAwAhrAJAAJgDACGtAkAAuAMAIQUSAACCBgAgEwAAgAYAIBUAAIYGACCrAgAA1wMAIK0CAADXAwAgFRIAALIDACATAAC5AwAgFQAAugMAIPQBAAC1AwAw9QEAACcAEPYBAAC1AwAw9wEBAAAAAfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIZkCAAC3A6oCIqMCAQCXAwAhpAIBAJcDACGmAgAAtgOmAiKnAgIAsAMAIagCCACtAwAhqgIBAJcDACGrAgEAnAMAIawCQACYAwAhrQJAALgDACHTAgAAtAMAIAMAAAAnACABAAAoADACAAApACADAAAAJwAgAQAAKAAwAgAAKQAgAQAAACcAIAEAAAAnACAOEgAAsgMAIBQAALMDACD0AQAArwMAMPUBAAAuABD2AQAArwMAMPcBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhiwIBAJcDACGMAgEAlwMAIY0CAgCwAwAhjgIIAK0DACGQAgAAsQOQAiICEgAAggYAIBQAAIUGACAOEgAAsgMAIBQAALMDACD0AQAArwMAMPUBAAAuABD2AQAArwMAMPcBAQAAAAH5AQEAlwMAIf4BQACYAwAh_wFAAJgDACGLAgEAlwMAIYwCAQAAAAGNAgIAsAMAIY4CCACtAwAhkAIAALEDkAIiAwAAAC4AIAEAAC8AMAIAADAAIAMAAAAnACABAAAoADACAAApACABAAAACwAgAQAAACMAIAEAAAAuACABAAAAJwAgAQAAACMAIAEAAAAVACABAAAADQAgBAkAAJIFACAKAACEBgAgtAIAANcDACC6AgAA1wMAIBEJAACdAwAgCgAArgMAIPQBAACsAwAw9QEAABcAEPYBAACsAwAw9wEBAAAAAf4BQACYAwAhlQIIAK0DACGyAgEAlwMAIbMCAQCXAwAhtAIBAJwDACG2AgEAlwMAIbcCAQCXAwAhuAIBAJcDACG5AgEAlwMAIboCAQAAAAG7AkAAmAMAIQMAAAAXACABAAA6ADACAAA7ACABAAAAAwAgAQAAAAcAIAEAAAAXACABAAAAAQAgCgQAAP0FACAFAAD-BQAgEwAAgAYAIBgAAP8FACAZAACBBgAgGgAAggYAIBsAAIMGACC0AgAA1wMAIM4CAADXAwAg0gIAANcDACADAAAAHgAgAQAAQQAwAgAAAQAgAwAAAB4AIAEAAEEAMAIAAAEAIAMAAAAeACABAABBADACAAABACASBAAA9gUAIAUAAPcFACATAAD5BQAgGAAA-AUAIBkAAPoFACAaAAD7BQAgGwAA_AUAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAYsCAQAAAAG0AgEAAAABzAIBAAAAAc0CIAAAAAHOAgEAAAAB0AIAAADQAgLRAiAAAAAB0gIBAAAAAQEhAABFACAL9wEBAAAAAf4BQAAAAAH_AUAAAAABiwIBAAAAAbQCAQAAAAHMAgEAAAABzQIgAAAAAc4CAQAAAAHQAgAAANACAtECIAAAAAHSAgEAAAABASEAAEcAMAEhAABHADASBAAAtwUAIAUAALgFACATAAC6BQAgGAAAuQUAIBkAALsFACAaAAC8BQAgGwAAvQUAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhtAIBANwDACHMAgEA2wMAIc0CIAC1BQAhzgIBANwDACHQAgAAtgXQAiLRAiAAtQUAIdICAQDcAwAhAgAAAAEAICEAAEoAIAv3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIbQCAQDcAwAhzAIBANsDACHNAiAAtQUAIc4CAQDcAwAh0AIAALYF0AIi0QIgALUFACHSAgEA3AMAIQIAAAAeACAhAABMACACAAAAHgAgIQAATAAgAwAAAAEAICgAAEUAICkAAEoAIAEAAAABACABAAAAHgAgBg0AALIFACAuAAC0BQAgLwAAswUAILQCAADXAwAgzgIAANcDACDSAgAA1wMAIA70AQAApQMAMPUBAABTABD2AQAApQMAMPcBAQDtAgAh_gFAAO8CACH_AUAA7wIAIYsCAQDtAgAhtAIBAO4CACHMAgEA7QIAIc0CIACmAwAhzgIBAO4CACHQAgAApwPQAiLRAiAApgMAIdICAQDuAgAhAwAAAB4AIAEAAFIAMC0AAFMAIAMAAAAeACABAABBADACAAABACABAAAABQAgAQAAAAUAIAMAAAADACABAAAEADACAAAFACADAAAAAwAgAQAABAAwAgAABQAgAwAAAAMAIAEAAAQAMAIAAAUAIAkDAACxBQAg9wEBAAAAAfgBAQAAAAH-AUAAAAAB_wFAAAAAAbsCQAAAAAHJAgEAAAABygIBAAAAAcsCAQAAAAEBIQAAWwAgCPcBAQAAAAH4AQEAAAAB_gFAAAAAAf8BQAAAAAG7AkAAAAAByQIBAAAAAcoCAQAAAAHLAgEAAAABASEAAF0AMAEhAABdADAJAwAAsAUAIPcBAQDbAwAh-AEBANsDACH-AUAA3QMAIf8BQADdAwAhuwJAAN0DACHJAgEA2wMAIcoCAQDcAwAhywIBANwDACECAAAABQAgIQAAYAAgCPcBAQDbAwAh-AEBANsDACH-AUAA3QMAIf8BQADdAwAhuwJAAN0DACHJAgEA2wMAIcoCAQDcAwAhywIBANwDACECAAAAAwAgIQAAYgAgAgAAAAMAICEAAGIAIAMAAAAFACAoAABbACApAABgACABAAAABQAgAQAAAAMAIAUNAACtBQAgLgAArwUAIC8AAK4FACDKAgAA1wMAIMsCAADXAwAgC_QBAACkAwAw9QEAAGkAEPYBAACkAwAw9wEBAO0CACH4AQEA7QIAIf4BQADvAgAh_wFAAO8CACG7AkAA7wIAIckCAQDtAgAhygIBAO4CACHLAgEA7gIAIQMAAAADACABAABoADAtAABpACADAAAAAwAgAQAABAAwAgAABQAgAQAAAAkAIAEAAAAJACADAAAABwAgAQAACAAwAgAACQAgAwAAAAcAIAEAAAgAMAIAAAkAIAMAAAAHACABAAAIADACAAAJACAOAwAArAUAIPcBAQAAAAH4AQEAAAAB_gFAAAAAAf8BQAAAAAHAAgEAAAABwQIBAAAAAcICAQAAAAHDAgEAAAABxAIBAAAAAcUCQAAAAAHGAkAAAAABxwIBAAAAAcgCAQAAAAEBIQAAcQAgDfcBAQAAAAH4AQEAAAAB_gFAAAAAAf8BQAAAAAHAAgEAAAABwQIBAAAAAcICAQAAAAHDAgEAAAABxAIBAAAAAcUCQAAAAAHGAkAAAAABxwIBAAAAAcgCAQAAAAEBIQAAcwAwASEAAHMAMA4DAACrBQAg9wEBANsDACH4AQEA2wMAIf4BQADdAwAh_wFAAN0DACHAAgEA2wMAIcECAQDbAwAhwgIBANwDACHDAgEA3AMAIcQCAQDcAwAhxQJAAPgDACHGAkAA-AMAIccCAQDcAwAhyAIBANwDACECAAAACQAgIQAAdgAgDfcBAQDbAwAh-AEBANsDACH-AUAA3QMAIf8BQADdAwAhwAIBANsDACHBAgEA2wMAIcICAQDcAwAhwwIBANwDACHEAgEA3AMAIcUCQAD4AwAhxgJAAPgDACHHAgEA3AMAIcgCAQDcAwAhAgAAAAcAICEAAHgAIAIAAAAHACAhAAB4ACADAAAACQAgKAAAcQAgKQAAdgAgAQAAAAkAIAEAAAAHACAKDQAAqAUAIC4AAKoFACAvAACpBQAgwgIAANcDACDDAgAA1wMAIMQCAADXAwAgxQIAANcDACDGAgAA1wMAIMcCAADXAwAgyAIAANcDACAQ9AEAAKMDADD1AQAAfwAQ9gEAAKMDADD3AQEA7QIAIfgBAQDtAgAh_gFAAO8CACH_AUAA7wIAIcACAQDtAgAhwQIBAO0CACHCAgEA7gIAIcMCAQDuAgAhxAIBAO4CACHFAkAAjgMAIcYCQACOAwAhxwIBAO4CACHIAgEA7gIAIQMAAAAHACABAAB-ADAtAAB_ACADAAAABwAgAQAACAAwAgAACQAgCfQBAACiAwAw9QEAAIUBABD2AQAAogMAMPcBAQAAAAH-AUAAmAMAIf8BQACYAwAhuwJAAJgDACG-AgEAlwMAIb8CAQCXAwAhAQAAAIIBACABAAAAggEAIAn0AQAAogMAMPUBAACFAQAQ9gEAAKIDADD3AQEAlwMAIf4BQACYAwAh_wFAAJgDACG7AkAAmAMAIb4CAQCXAwAhvwIBAJcDACEAAwAAAIUBACABAACGAQAwAgAAggEAIAMAAACFAQAgAQAAhgEAMAIAAIIBACADAAAAhQEAIAEAAIYBADACAACCAQAgBvcBAQAAAAH-AUAAAAAB_wFAAAAAAbsCQAAAAAG-AgEAAAABvwIBAAAAAQEhAACKAQAgBvcBAQAAAAH-AUAAAAAB_wFAAAAAAbsCQAAAAAG-AgEAAAABvwIBAAAAAQEhAACMAQAwASEAAIwBADAG9wEBANsDACH-AUAA3QMAIf8BQADdAwAhuwJAAN0DACG-AgEA2wMAIb8CAQDbAwAhAgAAAIIBACAhAACPAQAgBvcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIbsCQADdAwAhvgIBANsDACG_AgEA2wMAIQIAAACFAQAgIQAAkQEAIAIAAACFAQAgIQAAkQEAIAMAAACCAQAgKAAAigEAICkAAI8BACABAAAAggEAIAEAAACFAQAgAw0AAKUFACAuAACnBQAgLwAApgUAIAn0AQAAoQMAMPUBAACYAQAQ9gEAAKEDADD3AQEA7QIAIf4BQADvAgAh_wFAAO8CACG7AkAA7wIAIb4CAQDtAgAhvwIBAO0CACEDAAAAhQEAIAEAAJcBADAtAACYAQAgAwAAAIUBACABAACGAQAwAgAAggEAIAEAAAAPACABAAAADwAgAwAAAA0AIAEAAA4AMAIAAA8AIAMAAAANACABAAAOADACAAAPACADAAAADQAgAQAADgAwAgAADwAgDQgAAOoEACAPAACOBQAgEAAA6wQAIBEAAOwEACAUAADvBAAgFgAA7QQAIBcAAO4EACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGbAgEAAAABvAIBAAAAAb0CAQAAAAEBIQAAoAEAIAb3AQEAAAAB_gFAAAAAAf8BQAAAAAGbAgEAAAABvAIBAAAAAb0CAQAAAAEBIQAAogEAMAEhAACiAQAwAQAAAB4AIA0IAAC2BAAgDwAAjAUAIBAAALcEACARAAC4BAAgFAAAuwQAIBYAALkEACAXAAC6BAAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhmwIBANsDACG8AgEA2wMAIb0CAQDcAwAhAgAAAA8AICEAAKYBACAG9wEBANsDACH-AUAA3QMAIf8BQADdAwAhmwIBANsDACG8AgEA2wMAIb0CAQDcAwAhAgAAAA0AICEAAKgBACACAAAADQAgIQAAqAEAIAEAAAAeACADAAAADwAgKAAAoAEAICkAAKYBACABAAAADwAgAQAAAA0AIAQNAACiBQAgLgAApAUAIC8AAKMFACC9AgAA1wMAIAn0AQAAoAMAMPUBAACwAQAQ9gEAAKADADD3AQEA7QIAIf4BQADvAgAh_wFAAO8CACGbAgEA7QIAIbwCAQDtAgAhvQIBAO4CACEDAAAADQAgAQAArwEAMC0AALABACADAAAADQAgAQAADgAwAgAADwAgAQAAADsAIAEAAAA7ACADAAAAFwAgAQAAOgAwAgAAOwAgAwAAABcAIAEAADoAMAIAADsAIAMAAAAXACABAAA6ADACAAA7ACAOCQAAoAUAIAoAAKEFACD3AQEAAAAB_gFAAAAAAZUCCAAAAAGyAgEAAAABswIBAAAAAbQCAQAAAAG2AgEAAAABtwIBAAAAAbgCAQAAAAG5AgEAAAABugIBAAAAAbsCQAAAAAEBIQAAuAEAIAz3AQEAAAAB_gFAAAAAAZUCCAAAAAGyAgEAAAABswIBAAAAAbQCAQAAAAG2AgEAAAABtwIBAAAAAbgCAQAAAAG5AgEAAAABugIBAAAAAbsCQAAAAAEBIQAAugEAMAEhAAC6AQAwDgkAAJkFACAKAACaBQAg9wEBANsDACH-AUAA3QMAIZUCCADoAwAhsgIBANsDACGzAgEA2wMAIbQCAQDcAwAhtgIBANsDACG3AgEA2wMAIbgCAQDbAwAhuQIBANsDACG6AgEA3AMAIbsCQADdAwAhAgAAADsAICEAAL0BACAM9wEBANsDACH-AUAA3QMAIZUCCADoAwAhsgIBANsDACGzAgEA2wMAIbQCAQDcAwAhtgIBANsDACG3AgEA2wMAIbgCAQDbAwAhuQIBANsDACG6AgEA3AMAIbsCQADdAwAhAgAAABcAICEAAL8BACACAAAAFwAgIQAAvwEAIAMAAAA7ACAoAAC4AQAgKQAAvQEAIAEAAAA7ACABAAAAFwAgBw0AAJQFACAuAACXBQAgLwAAlgUAIIABAACVBQAggQEAAJgFACC0AgAA1wMAILoCAADXAwAgD_QBAACfAwAw9QEAAMYBABD2AQAAnwMAMPcBAQDtAgAh_gFAAO8CACGVAggA-gIAIbICAQDtAgAhswIBAO0CACG0AgEA7gIAIbYCAQDtAgAhtwIBAO0CACG4AgEA7QIAIbkCAQDtAgAhugIBAO4CACG7AkAA7wIAIQMAAAAXACABAADFAQAwLQAAxgEAIAMAAAAXACABAAA6ADACAAA7ACANBgAAnQMAIAcAAJkDACAMAACeAwAg9AEAAJsDADD1AQAAFQAQ9gEAAJsDADD3AQEAAAAB_gFAAJgDACH_AUAAmAMAIbICAQCXAwAhswIBAAAAAbQCAQCcAwAhtQIBAAAAAQEAAADJAQAgAQAAAMkBACAEBgAAkgUAIAcAAPEEACAMAACTBQAgtAIAANcDACADAAAAFQAgAQAAzAEAMAIAAMkBACADAAAAFQAgAQAAzAEAMAIAAMkBACADAAAAFQAgAQAAzAEAMAIAAMkBACAKBgAAjwUAIAcAAJAFACAMAACRBQAg9wEBAAAAAf4BQAAAAAH_AUAAAAABsgIBAAAAAbMCAQAAAAG0AgEAAAABtQIBAAAAAQEhAADQAQAgB_cBAQAAAAH-AUAAAAAB_wFAAAAAAbICAQAAAAGzAgEAAAABtAIBAAAAAbUCAQAAAAEBIQAA0gEAMAEhAADSAQAwCgYAAPUEACAHAAD2BAAgDAAA9wQAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIbICAQDbAwAhswIBANsDACG0AgEA3AMAIbUCAQDbAwAhAgAAAMkBACAhAADVAQAgB_cBAQDbAwAh_gFAAN0DACH_AUAA3QMAIbICAQDbAwAhswIBANsDACG0AgEA3AMAIbUCAQDbAwAhAgAAABUAICEAANcBACACAAAAFQAgIQAA1wEAIAMAAADJAQAgKAAA0AEAICkAANUBACABAAAAyQEAIAEAAAAVACAEDQAA8gQAIC4AAPQEACAvAADzBAAgtAIAANcDACAK9AEAAJoDADD1AQAA3gEAEPYBAACaAwAw9wEBAO0CACH-AUAA7wIAIf8BQADvAgAhsgIBAO0CACGzAgEA7QIAIbQCAQDuAgAhtQIBAO0CACEDAAAAFQAgAQAA3QEAMC0AAN4BACADAAAAFQAgAQAAzAEAMAIAAMkBACAJDgAAmQMAIPQBAACWAwAw9QEAAOQBABD2AQAAlgMAMPcBAQAAAAH-AUAAmAMAIf8BQACYAwAhiwIBAJcDACGuAgEAAAABAQAAAOEBACABAAAA4QEAIAkOAACZAwAg9AEAAJYDADD1AQAA5AEAEPYBAACWAwAw9wEBAJcDACH-AUAAmAMAIf8BQACYAwAhiwIBAJcDACGuAgEAlwMAIQEOAADxBAAgAwAAAOQBACABAADlAQAwAgAA4QEAIAMAAADkAQAgAQAA5QEAMAIAAOEBACADAAAA5AEAIAEAAOUBADACAADhAQAgBg4AAPAEACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGLAgEAAAABrgIBAAAAAQEhAADpAQAgBfcBAQAAAAH-AUAAAAAB_wFAAAAAAYsCAQAAAAGuAgEAAAABASEAAOsBADABIQAA6wEAMAYOAACqBAAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhiwIBANsDACGuAgEA2wMAIQIAAADhAQAgIQAA7gEAIAX3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIa4CAQDbAwAhAgAAAOQBACAhAADwAQAgAgAAAOQBACAhAADwAQAgAwAAAOEBACAoAADpAQAgKQAA7gEAIAEAAADhAQAgAQAAAOQBACADDQAApwQAIC4AAKkEACAvAACoBAAgCPQBAACVAwAw9QEAAPcBABD2AQAAlQMAMPcBAQDtAgAh_gFAAO8CACH_AUAA7wIAIYsCAQDtAgAhrgIBAO0CACEDAAAA5AEAIAEAAPYBADAtAAD3AQAgAwAAAOQBACABAADlAQAwAgAA4QEAIAEAAAApACABAAAAKQAgAwAAACcAIAEAACgAMAIAACkAIAMAAAAnACABAAAoADACAAApACADAAAAJwAgAQAAKAAwAgAAKQAgERIAAP0DACATAAD-AwAgFQAAlAQAIPcBAQAAAAH5AQEAAAAB_gFAAAAAAf8BQAAAAAGZAgAAAKoCAqMCAQAAAAGkAgEAAAABpgIAAACmAgKnAgIAAAABqAIIAAAAAaoCAQAAAAGrAgEAAAABrAJAAAAAAa0CQAAAAAEBIQAA_wEAIA73AQEAAAAB-QEBAAAAAf4BQAAAAAH_AUAAAAABmQIAAACqAgKjAgEAAAABpAIBAAAAAaYCAAAApgICpwICAAAAAagCCAAAAAGqAgEAAAABqwIBAAAAAawCQAAAAAGtAkAAAAABASEAAIECADABIQAAgQIAMBESAAD6AwAgEwAA-wMAIBUAAJIEACD3AQEA2wMAIfkBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZkCAAD3A6oCIqMCAQDbAwAhpAIBANsDACGmAgAA9gOmAiKnAgIA5wMAIagCCADoAwAhqgIBANsDACGrAgEA3AMAIawCQADdAwAhrQJAAPgDACECAAAAKQAgIQAAhAIAIA73AQEA2wMAIfkBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZkCAAD3A6oCIqMCAQDbAwAhpAIBANsDACGmAgAA9gOmAiKnAgIA5wMAIagCCADoAwAhqgIBANsDACGrAgEA3AMAIawCQADdAwAhrQJAAPgDACECAAAAJwAgIQAAhgIAIAIAAAAnACAhAACGAgAgAwAAACkAICgAAP8BACApAACEAgAgAQAAACkAIAEAAAAnACAHDQAAogQAIC4AAKUEACAvAACkBAAggAEAAKMEACCBAQAApgQAIKsCAADXAwAgrQIAANcDACAR9AEAAIsDADD1AQAAjQIAEPYBAACLAwAw9wEBAO0CACH5AQEA7QIAIf4BQADvAgAh_wFAAO8CACGZAgAAjQOqAiKjAgEA7QIAIaQCAQDtAgAhpgIAAIwDpgIipwICAPkCACGoAggA-gIAIaoCAQDtAgAhqwIBAO4CACGsAkAA7wIAIa0CQACOAwAhAwAAACcAIAEAAIwCADAtAACNAgAgAwAAACcAIAEAACgAMAIAACkAIAEAAAATACABAAAAEwAgAwAAABEAIAEAABIAMAIAABMAIAMAAAARACABAAASADACAAATACADAAAAEQAgAQAAEgAwAgAAEwAgDAgAAKAEACALAAChBAAg9wEBAAAAAf4BQAAAAAH_AUAAAAABlQIIAAAAAZYCAQAAAAGXAgEAAAABmQIAAACZAgKaAoAAAAABmwIBAAAAAZwCAQAAAAEBIQAAlQIAIAr3AQEAAAAB_gFAAAAAAf8BQAAAAAGVAggAAAABlgIBAAAAAZcCAQAAAAGZAgAAAJkCApoCgAAAAAGbAgEAAAABnAIBAAAAAQEhAACXAgAwASEAAJcCADABAAAAFQAgAQAAABcAIAwIAACeBAAgCwAAnwQAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZUCCADoAwAhlgIBANsDACGXAgEA3AMAIZkCAACdBJkCIpoCgAAAAAGbAgEA3AMAIZwCAQDcAwAhAgAAABMAICEAAJwCACAK9wEBANsDACH-AUAA3QMAIf8BQADdAwAhlQIIAOgDACGWAgEA2wMAIZcCAQDcAwAhmQIAAJ0EmQIimgKAAAAAAZsCAQDcAwAhnAIBANwDACECAAAAEQAgIQAAngIAIAIAAAARACAhAACeAgAgAQAAABUAIAEAAAAXACADAAAAEwAgKAAAlQIAICkAAJwCACABAAAAEwAgAQAAABEAIAkNAACYBAAgLgAAmwQAIC8AAJoEACCAAQAAmQQAIIEBAACcBAAglwIAANcDACCaAgAA1wMAIJsCAADXAwAgnAIAANcDACAN9AEAAIUDADD1AQAApwIAEPYBAACFAwAw9wEBAO0CACH-AUAA7wIAIf8BQADvAgAhlQIIAPoCACGWAgEA7QIAIZcCAQDuAgAhmQIAAIYDmQIimgIAAIcDACCbAgEA7gIAIZwCAQDuAgAhAwAAABEAIAEAAKYCADAtAACnAgAgAwAAABEAIAEAABIAMAIAABMAIAEAAAAlACABAAAAJQAgAwAAACMAIAEAACQAMAIAACUAIAMAAAAjACABAAAkADACAAAlACADAAAAIwAgAQAAJAAwAgAAJQAgDAMAAJUEACASAACWBAAgFAAAlwQAIPcBAQAAAAH4AQEAAAAB-QEBAAAAAf4BQAAAAAH_AUAAAAABjQICAAAAAZECAQAAAAGSAgEAAAABlAIAAACUAgIBIQAArwIAIAn3AQEAAAAB-AEBAAAAAfkBAQAAAAH-AUAAAAAB_wFAAAAAAY0CAgAAAAGRAgEAAAABkgIBAAAAAZQCAAAAlAICASEAALECADABIQAAsQIAMAwDAACHBAAgEgAAiAQAIBQAAIkEACD3AQEA2wMAIfgBAQDbAwAh-QEBANsDACH-AUAA3QMAIf8BQADdAwAhjQICAOcDACGRAgEA2wMAIZICAQDbAwAhlAIAAIYElAIiAgAAACUAICEAALQCACAJ9wEBANsDACH4AQEA2wMAIfkBAQDbAwAh_gFAAN0DACH_AUAA3QMAIY0CAgDnAwAhkQIBANsDACGSAgEA2wMAIZQCAACGBJQCIgIAAAAjACAhAAC2AgAgAgAAACMAICEAALYCACADAAAAJQAgKAAArwIAICkAALQCACABAAAAJQAgAQAAACMAIAUNAACBBAAgLgAAhAQAIC8AAIMEACCAAQAAggQAIIEBAACFBAAgDPQBAACBAwAw9QEAAL0CABD2AQAAgQMAMPcBAQDtAgAh-AEBAO0CACH5AQEA7QIAIf4BQADvAgAh_wFAAO8CACGNAgIA-QIAIZECAQDtAgAhkgIBAO0CACGUAgAAggOUAiIDAAAAIwAgAQAAvAIAMC0AAL0CACADAAAAIwAgAQAAJAAwAgAAJQAgAQAAADAAIAEAAAAwACADAAAALgAgAQAALwAwAgAAMAAgAwAAAC4AIAEAAC8AMAIAADAAIAMAAAAuACABAAAvADACAAAwACALEgAA_wMAIBQAAIAEACD3AQEAAAAB-QEBAAAAAf4BQAAAAAH_AUAAAAABiwIBAAAAAYwCAQAAAAGNAgIAAAABjgIIAAAAAZACAAAAkAICASEAAMUCACAJ9wEBAAAAAfkBAQAAAAH-AUAAAAAB_wFAAAAAAYsCAQAAAAGMAgEAAAABjQICAAAAAY4CCAAAAAGQAgAAAJACAgEhAADHAgAwASEAAMcCADALEgAA6gMAIBQAAOsDACD3AQEA2wMAIfkBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhjAIBANsDACGNAgIA5wMAIY4CCADoAwAhkAIAAOkDkAIiAgAAADAAICEAAMoCACAJ9wEBANsDACH5AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIYwCAQDbAwAhjQICAOcDACGOAggA6AMAIZACAADpA5ACIgIAAAAuACAhAADMAgAgAgAAAC4AICEAAMwCACADAAAAMAAgKAAAxQIAICkAAMoCACABAAAAMAAgAQAAAC4AIAUNAADiAwAgLgAA5QMAIC8AAOQDACCAAQAA4wMAIIEBAADmAwAgDPQBAAD4AgAw9QEAANMCABD2AQAA-AIAMPcBAQDtAgAh-QEBAO0CACH-AUAA7wIAIf8BQADvAgAhiwIBAO0CACGMAgEA7QIAIY0CAgD5AgAhjgIIAPoCACGQAgAA-wKQAiIDAAAALgAgAQAA0gIAMC0AANMCACADAAAALgAgAQAALwAwAgAAMAAgAQAAACEAIAEAAAAhACADAAAACwAgAQAAIAAwAgAAIQAgAwAAAAsAIAEAACAAMAIAACEAIAMAAAALACABAAAgADACAAAhACALAwAA4AMAIBIAAOEDACD3AQEAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9AUAAAAAB_gFAAAAAAf8BQAAAAAEBIQAA2wIAIAn3AQEAAAAB-AEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9AUAAAAAB_gFAAAAAAf8BQAAAAAEBIQAA3QIAMAEhAADdAgAwCwMAAN4DACASAADfAwAg9wEBANsDACH4AQEA2wMAIfkBAQDbAwAh-gEBANwDACH7AQEA3AMAIfwBAQDcAwAh_QFAAN0DACH-AUAA3QMAIf8BQADdAwAhAgAAACEAICEAAOACACAJ9wEBANsDACH4AQEA2wMAIfkBAQDbAwAh-gEBANwDACH7AQEA3AMAIfwBAQDcAwAh_QFAAN0DACH-AUAA3QMAIf8BQADdAwAhAgAAAAsAICEAAOICACACAAAACwAgIQAA4gIAIAMAAAAhACAoAADbAgAgKQAA4AIAIAEAAAAhACABAAAACwAgBg0AANgDACAuAADaAwAgLwAA2QMAIPoBAADXAwAg-wEAANcDACD8AQAA1wMAIAz0AQAA7AIAMPUBAADpAgAQ9gEAAOwCADD3AQEA7QIAIfgBAQDtAgAh-QEBAO0CACH6AQEA7gIAIfsBAQDuAgAh_AEBAO4CACH9AUAA7wIAIf4BQADvAgAh_wFAAO8CACEDAAAACwAgAQAA6AIAMC0AAOkCACADAAAACwAgAQAAIAAwAgAAIQAgDPQBAADsAgAw9QEAAOkCABD2AQAA7AIAMPcBAQDtAgAh-AEBAO0CACH5AQEA7QIAIfoBAQDuAgAh-wEBAO4CACH8AQEA7gIAIf0BQADvAgAh_gFAAO8CACH_AUAA7wIAIQ4NAADxAgAgLgAA9wIAIC8AAPcCACCAAgEAAAABgQIBAAAABIICAQAAAASDAgEAAAABhAIBAAAAAYUCAQAAAAGGAgEAAAABhwIBAPYCACGIAgEAAAABiQIBAAAAAYoCAQAAAAEODQAA9AIAIC4AAPUCACAvAAD1AgAggAIBAAAAAYECAQAAAAWCAgEAAAAFgwIBAAAAAYQCAQAAAAGFAgEAAAABhgIBAAAAAYcCAQDzAgAhiAIBAAAAAYkCAQAAAAGKAgEAAAABCw0AAPECACAuAADyAgAgLwAA8gIAIIACQAAAAAGBAkAAAAAEggJAAAAABIMCQAAAAAGEAkAAAAABhQJAAAAAAYYCQAAAAAGHAkAA8AIAIQsNAADxAgAgLgAA8gIAIC8AAPICACCAAkAAAAABgQJAAAAABIICQAAAAASDAkAAAAABhAJAAAAAAYUCQAAAAAGGAkAAAAABhwJAAPACACEIgAICAAAAAYECAgAAAASCAgIAAAAEgwICAAAAAYQCAgAAAAGFAgIAAAABhgICAAAAAYcCAgDxAgAhCIACQAAAAAGBAkAAAAAEggJAAAAABIMCQAAAAAGEAkAAAAABhQJAAAAAAYYCQAAAAAGHAkAA8gIAIQ4NAAD0AgAgLgAA9QIAIC8AAPUCACCAAgEAAAABgQIBAAAABYICAQAAAAWDAgEAAAABhAIBAAAAAYUCAQAAAAGGAgEAAAABhwIBAPMCACGIAgEAAAABiQIBAAAAAYoCAQAAAAEIgAICAAAAAYECAgAAAAWCAgIAAAAFgwICAAAAAYQCAgAAAAGFAgIAAAABhgICAAAAAYcCAgD0AgAhC4ACAQAAAAGBAgEAAAAFggIBAAAABYMCAQAAAAGEAgEAAAABhQIBAAAAAYYCAQAAAAGHAgEA9QIAIYgCAQAAAAGJAgEAAAABigIBAAAAAQ4NAADxAgAgLgAA9wIAIC8AAPcCACCAAgEAAAABgQIBAAAABIICAQAAAASDAgEAAAABhAIBAAAAAYUCAQAAAAGGAgEAAAABhwIBAPYCACGIAgEAAAABiQIBAAAAAYoCAQAAAAELgAIBAAAAAYECAQAAAASCAgEAAAAEgwIBAAAAAYQCAQAAAAGFAgEAAAABhgIBAAAAAYcCAQD3AgAhiAIBAAAAAYkCAQAAAAGKAgEAAAABDPQBAAD4AgAw9QEAANMCABD2AQAA-AIAMPcBAQDtAgAh-QEBAO0CACH-AUAA7wIAIf8BQADvAgAhiwIBAO0CACGMAgEA7QIAIY0CAgD5AgAhjgIIAPoCACGQAgAA-wKQAiINDQAA8QIAIC4AAPECACAvAADxAgAggAEAAP8CACCBAQAA8QIAIIACAgAAAAGBAgIAAAAEggICAAAABIMCAgAAAAGEAgIAAAABhQICAAAAAYYCAgAAAAGHAgIAgAMAIQ0NAADxAgAgLgAA_wIAIC8AAP8CACCAAQAA_wIAIIEBAAD_AgAggAIIAAAAAYECCAAAAASCAggAAAAEgwIIAAAAAYQCCAAAAAGFAggAAAABhgIIAAAAAYcCCAD-AgAhBw0AAPECACAuAAD9AgAgLwAA_QIAIIACAAAAkAICgQIAAACQAgiCAgAAAJACCIcCAAD8ApACIgcNAADxAgAgLgAA_QIAIC8AAP0CACCAAgAAAJACAoECAAAAkAIIggIAAACQAgiHAgAA_AKQAiIEgAIAAACQAgKBAgAAAJACCIICAAAAkAIIhwIAAP0CkAIiDQ0AAPECACAuAAD_AgAgLwAA_wIAIIABAAD_AgAggQEAAP8CACCAAggAAAABgQIIAAAABIICCAAAAASDAggAAAABhAIIAAAAAYUCCAAAAAGGAggAAAABhwIIAP4CACEIgAIIAAAAAYECCAAAAASCAggAAAAEgwIIAAAAAYQCCAAAAAGFAggAAAABhgIIAAAAAYcCCAD_AgAhDQ0AAPECACAuAADxAgAgLwAA8QIAIIABAAD_AgAggQEAAPECACCAAgIAAAABgQICAAAABIICAgAAAASDAgIAAAABhAICAAAAAYUCAgAAAAGGAgIAAAABhwICAIADACEM9AEAAIEDADD1AQAAvQIAEPYBAACBAwAw9wEBAO0CACH4AQEA7QIAIfkBAQDtAgAh_gFAAO8CACH_AUAA7wIAIY0CAgD5AgAhkQIBAO0CACGSAgEA7QIAIZQCAACCA5QCIgcNAADxAgAgLgAAhAMAIC8AAIQDACCAAgAAAJQCAoECAAAAlAIIggIAAACUAgiHAgAAgwOUAiIHDQAA8QIAIC4AAIQDACAvAACEAwAggAIAAACUAgKBAgAAAJQCCIICAAAAlAIIhwIAAIMDlAIiBIACAAAAlAICgQIAAACUAgiCAgAAAJQCCIcCAACEA5QCIg30AQAAhQMAMPUBAACnAgAQ9gEAAIUDADD3AQEA7QIAIf4BQADvAgAh_wFAAO8CACGVAggA-gIAIZYCAQDtAgAhlwIBAO4CACGZAgAAhgOZAiKaAgAAhwMAIJsCAQDuAgAhnAIBAO4CACEHDQAA8QIAIC4AAIoDACAvAACKAwAggAIAAACZAgKBAgAAAJkCCIICAAAAmQIIhwIAAIkDmQIiDw0AAPQCACAuAACIAwAgLwAAiAMAIIACgAAAAAGDAoAAAAABhAKAAAAAAYUCgAAAAAGGAoAAAAABhwKAAAAAAZ0CAQAAAAGeAgEAAAABnwIBAAAAAaACgAAAAAGhAoAAAAABogKAAAAAAQyAAoAAAAABgwKAAAAAAYQCgAAAAAGFAoAAAAABhgKAAAAAAYcCgAAAAAGdAgEAAAABngIBAAAAAZ8CAQAAAAGgAoAAAAABoQKAAAAAAaICgAAAAAEHDQAA8QIAIC4AAIoDACAvAACKAwAggAIAAACZAgKBAgAAAJkCCIICAAAAmQIIhwIAAIkDmQIiBIACAAAAmQICgQIAAACZAgiCAgAAAJkCCIcCAACKA5kCIhH0AQAAiwMAMPUBAACNAgAQ9gEAAIsDADD3AQEA7QIAIfkBAQDtAgAh_gFAAO8CACH_AUAA7wIAIZkCAACNA6oCIqMCAQDtAgAhpAIBAO0CACGmAgAAjAOmAiKnAgIA-QIAIagCCAD6AgAhqgIBAO0CACGrAgEA7gIAIawCQADvAgAhrQJAAI4DACEHDQAA8QIAIC4AAJQDACAvAACUAwAggAIAAACmAgKBAgAAAKYCCIICAAAApgIIhwIAAJMDpgIiBw0AAPECACAuAACSAwAgLwAAkgMAIIACAAAAqgICgQIAAACqAgiCAgAAAKoCCIcCAACRA6oCIgsNAAD0AgAgLgAAkAMAIC8AAJADACCAAkAAAAABgQJAAAAABYICQAAAAAWDAkAAAAABhAJAAAAAAYUCQAAAAAGGAkAAAAABhwJAAI8DACELDQAA9AIAIC4AAJADACAvAACQAwAggAJAAAAAAYECQAAAAAWCAkAAAAAFgwJAAAAAAYQCQAAAAAGFAkAAAAABhgJAAAAAAYcCQACPAwAhCIACQAAAAAGBAkAAAAAFggJAAAAABYMCQAAAAAGEAkAAAAABhQJAAAAAAYYCQAAAAAGHAkAAkAMAIQcNAADxAgAgLgAAkgMAIC8AAJIDACCAAgAAAKoCAoECAAAAqgIIggIAAACqAgiHAgAAkQOqAiIEgAIAAACqAgKBAgAAAKoCCIICAAAAqgIIhwIAAJIDqgIiBw0AAPECACAuAACUAwAgLwAAlAMAIIACAAAApgICgQIAAACmAgiCAgAAAKYCCIcCAACTA6YCIgSAAgAAAKYCAoECAAAApgIIggIAAACmAgiHAgAAlAOmAiII9AEAAJUDADD1AQAA9wEAEPYBAACVAwAw9wEBAO0CACH-AUAA7wIAIf8BQADvAgAhiwIBAO0CACGuAgEA7QIAIQkOAACZAwAg9AEAAJYDADD1AQAA5AEAEPYBAACWAwAw9wEBAJcDACH-AUAAmAMAIf8BQACYAwAhiwIBAJcDACGuAgEAlwMAIQuAAgEAAAABgQIBAAAABIICAQAAAASDAgEAAAABhAIBAAAAAYUCAQAAAAGGAgEAAAABhwIBAPcCACGIAgEAAAABiQIBAAAAAYoCAQAAAAEIgAJAAAAAAYECQAAAAASCAkAAAAAEgwJAAAAAAYQCQAAAAAGFAkAAAAABhgJAAAAAAYcCQADyAgAhA68CAAANACCwAgAADQAgsQIAAA0AIAr0AQAAmgMAMPUBAADeAQAQ9gEAAJoDADD3AQEA7QIAIf4BQADvAgAh_wFAAO8CACGyAgEA7QIAIbMCAQDtAgAhtAIBAO4CACG1AgEA7QIAIQ0GAACdAwAgBwAAmQMAIAwAAJ4DACD0AQAAmwMAMPUBAAAVABD2AQAAmwMAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIbICAQCXAwAhswIBAJcDACG0AgEAnAMAIbUCAQCXAwAhC4ACAQAAAAGBAgEAAAAFggIBAAAABYMCAQAAAAGEAgEAAAABhQIBAAAAAYYCAQAAAAGHAgEA9QIAIYgCAQAAAAGJAgEAAAABigIBAAAAARcEAADCAwAgBQAAwwMAIBMAAMUDACAYAADEAwAgGQAAxgMAIBoAAMcDACAbAADIAwAg9AEAAL8DADD1AQAAHgAQ9gEAAL8DADD3AQEAlwMAIf4BQACYAwAh_wFAAJgDACGLAgEAlwMAIbQCAQCcAwAhzAIBAJcDACHNAiAAwAMAIc4CAQCcAwAh0AIAAMED0AIi0QIgAMADACHSAgEAnAMAIdYCAAAeACDXAgAAHgAgA68CAAARACCwAgAAEQAgsQIAABEAIA_0AQAAnwMAMPUBAADGAQAQ9gEAAJ8DADD3AQEA7QIAIf4BQADvAgAhlQIIAPoCACGyAgEA7QIAIbMCAQDtAgAhtAIBAO4CACG2AgEA7QIAIbcCAQDtAgAhuAIBAO0CACG5AgEA7QIAIboCAQDuAgAhuwJAAO8CACEJ9AEAAKADADD1AQAAsAEAEPYBAACgAwAw9wEBAO0CACH-AUAA7wIAIf8BQADvAgAhmwIBAO0CACG8AgEA7QIAIb0CAQDuAgAhCfQBAAChAwAw9QEAAJgBABD2AQAAoQMAMPcBAQDtAgAh_gFAAO8CACH_AUAA7wIAIbsCQADvAgAhvgIBAO0CACG_AgEA7QIAIQn0AQAAogMAMPUBAACFAQAQ9gEAAKIDADD3AQEAlwMAIf4BQACYAwAh_wFAAJgDACG7AkAAmAMAIb4CAQCXAwAhvwIBAJcDACEQ9AEAAKMDADD1AQAAfwAQ9gEAAKMDADD3AQEA7QIAIfgBAQDtAgAh_gFAAO8CACH_AUAA7wIAIcACAQDtAgAhwQIBAO0CACHCAgEA7gIAIcMCAQDuAgAhxAIBAO4CACHFAkAAjgMAIcYCQACOAwAhxwIBAO4CACHIAgEA7gIAIQv0AQAApAMAMPUBAABpABD2AQAApAMAMPcBAQDtAgAh-AEBAO0CACH-AUAA7wIAIf8BQADvAgAhuwJAAO8CACHJAgEA7QIAIcoCAQDuAgAhywIBAO4CACEO9AEAAKUDADD1AQAAUwAQ9gEAAKUDADD3AQEA7QIAIf4BQADvAgAh_wFAAO8CACGLAgEA7QIAIbQCAQDuAgAhzAIBAO0CACHNAiAApgMAIc4CAQDuAgAh0AIAAKcD0AIi0QIgAKYDACHSAgEA7gIAIQUNAADxAgAgLgAAqwMAIC8AAKsDACCAAiAAAAABhwIgAKoDACEHDQAA8QIAIC4AAKkDACAvAACpAwAggAIAAADQAgKBAgAAANACCIICAAAA0AIIhwIAAKgD0AIiBw0AAPECACAuAACpAwAgLwAAqQMAIIACAAAA0AICgQIAAADQAgiCAgAAANACCIcCAACoA9ACIgSAAgAAANACAoECAAAA0AIIggIAAADQAgiHAgAAqQPQAiIFDQAA8QIAIC4AAKsDACAvAACrAwAggAIgAAAAAYcCIACqAwAhAoACIAAAAAGHAiAAqwMAIREJAACdAwAgCgAArgMAIPQBAACsAwAw9QEAABcAEPYBAACsAwAw9wEBAJcDACH-AUAAmAMAIZUCCACtAwAhsgIBAJcDACGzAgEAlwMAIbQCAQCcAwAhtgIBAJcDACG3AgEAlwMAIbgCAQCXAwAhuQIBAJcDACG6AgEAnAMAIbsCQACYAwAhCIACCAAAAAGBAggAAAAEggIIAAAABIMCCAAAAAGEAggAAAABhQIIAAAAAYYCCAAAAAGHAggA_wIAIREIAADGAwAgCwAAzAMAIPQBAADJAwAw9QEAABEAEPYBAADJAwAw9wEBAJcDACH-AUAAmAMAIf8BQACYAwAhlQIIAK0DACGWAgEAlwMAIZcCAQCcAwAhmQIAAMoDmQIimgIAAMsDACCbAgEAnAMAIZwCAQCcAwAh1gIAABEAINcCAAARACAOEgAAsgMAIBQAALMDACD0AQAArwMAMPUBAAAuABD2AQAArwMAMPcBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhiwIBAJcDACGMAgEAlwMAIY0CAgCwAwAhjgIIAK0DACGQAgAAsQOQAiIIgAICAAAAAYECAgAAAASCAgIAAAAEgwICAAAAAYQCAgAAAAGFAgIAAAABhgICAAAAAYcCAgDxAgAhBIACAAAAkAICgQIAAACQAgiCAgAAAJACCIcCAAD9ApACIhIIAADPAwAgDwAA0AMAIBAAANEDACARAADSAwAgFAAAswMAIBYAANMDACAXAADUAwAg9AEAAM4DADD1AQAADQAQ9gEAAM4DADD3AQEAlwMAIf4BQACYAwAh_wFAAJgDACGbAgEAlwMAIbwCAQCXAwAhvQIBAJwDACHWAgAADQAg1wIAAA0AIAOvAgAAJwAgsAIAACcAILECAAAnACAEowIBAAAAAaQCAQAAAAGmAgAAAKYCAqcCAgAAAAEUEgAAsgMAIBMAALkDACAVAAC6AwAg9AEAALUDADD1AQAAJwAQ9gEAALUDADD3AQEAlwMAIfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIZkCAAC3A6oCIqMCAQCXAwAhpAIBAJcDACGmAgAAtgOmAiKnAgIAsAMAIagCCACtAwAhqgIBAJcDACGrAgEAnAMAIawCQACYAwAhrQJAALgDACEEgAIAAACmAgKBAgAAAKYCCIICAAAApgIIhwIAAJQDpgIiBIACAAAAqgICgQIAAACqAgiCAgAAAKoCCIcCAACSA6oCIgiAAkAAAAABgQJAAAAABYICQAAAAAWDAkAAAAABhAJAAAAAAYUCQAAAAAGGAkAAAAABhwJAAJADACERAwAAnQMAIBIAALIDACAUAACzAwAg9AEAALwDADD1AQAAIwAQ9gEAALwDADD3AQEAlwMAIfgBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhjQICALADACGRAgEAlwMAIZICAQCXAwAhlAIAAL0DlAIi1gIAACMAINcCAAAjACAQEgAAsgMAIBQAALMDACD0AQAArwMAMPUBAAAuABD2AQAArwMAMPcBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhiwIBAJcDACGMAgEAlwMAIY0CAgCwAwAhjgIIAK0DACGQAgAAsQOQAiLWAgAALgAg1wIAAC4AIAP5AQEAAAABkQIBAAAAAZICAQAAAAEPAwAAnQMAIBIAALIDACAUAACzAwAg9AEAALwDADD1AQAAIwAQ9gEAALwDADD3AQEAlwMAIfgBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhjQICALADACGRAgEAlwMAIZICAQCXAwAhlAIAAL0DlAIiBIACAAAAlAICgQIAAACUAgiCAgAAAJQCCIcCAACEA5QCIg4DAACdAwAgEgAAsgMAIPQBAAC-AwAw9QEAAAsAEPYBAAC-AwAw9wEBAJcDACH4AQEAlwMAIfkBAQCXAwAh-gEBAJwDACH7AQEAnAMAIfwBAQCcAwAh_QFAAJgDACH-AUAAmAMAIf8BQACYAwAhFQQAAMIDACAFAADDAwAgEwAAxQMAIBgAAMQDACAZAADGAwAgGgAAxwMAIBsAAMgDACD0AQAAvwMAMPUBAAAeABD2AQAAvwMAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIYsCAQCXAwAhtAIBAJwDACHMAgEAlwMAIc0CIADAAwAhzgIBAJwDACHQAgAAwQPQAiLRAiAAwAMAIdICAQCcAwAhAoACIAAAAAGHAiAAqwMAIQSAAgAAANACAoECAAAA0AIIggIAAADQAgiHAgAAqQPQAiIDrwIAAAMAILACAAADACCxAgAAAwAgA68CAAAHACCwAgAABwAgsQIAAAcAIBADAACdAwAgEgAAsgMAIPQBAAC-AwAw9QEAAAsAEPYBAAC-AwAw9wEBAJcDACH4AQEAlwMAIfkBAQCXAwAh-gEBAJwDACH7AQEAnAMAIfwBAQCcAwAh_QFAAJgDACH-AUAAmAMAIf8BQACYAwAh1gIAAAsAINcCAAALACARAwAAnQMAIBIAALIDACAUAACzAwAg9AEAALwDADD1AQAAIwAQ9gEAALwDADD3AQEAlwMAIfgBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhjQICALADACGRAgEAlwMAIZICAQCXAwAhlAIAAL0DlAIi1gIAACMAINcCAAAjACAPBgAAnQMAIAcAAJkDACAMAACeAwAg9AEAAJsDADD1AQAAFQAQ9gEAAJsDADD3AQEAlwMAIf4BQACYAwAh_wFAAJgDACGyAgEAlwMAIbMCAQCXAwAhtAIBAJwDACG1AgEAlwMAIdYCAAAVACDXAgAAFQAgEggAAM8DACAPAADQAwAgEAAA0QMAIBEAANIDACAUAACzAwAgFgAA0wMAIBcAANQDACD0AQAAzgMAMPUBAAANABD2AQAAzgMAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIZsCAQCXAwAhvAIBAJcDACG9AgEAnAMAIdYCAAANACDXAgAADQAgA68CAAAXACCwAgAAFwAgsQIAABcAIA8IAADGAwAgCwAAzAMAIPQBAADJAwAw9QEAABEAEPYBAADJAwAw9wEBAJcDACH-AUAAmAMAIf8BQACYAwAhlQIIAK0DACGWAgEAlwMAIZcCAQCcAwAhmQIAAMoDmQIimgIAAMsDACCbAgEAnAMAIZwCAQCcAwAhBIACAAAAmQICgQIAAACZAgiCAgAAAJkCCIcCAACKA5kCIgyAAoAAAAABgwKAAAAAAYQCgAAAAAGFAoAAAAABhgKAAAAAAYcCgAAAAAGdAgEAAAABngIBAAAAAZ8CAQAAAAGgAoAAAAABoQKAAAAAAaICgAAAAAETCQAAnQMAIAoAAK4DACD0AQAArAMAMPUBAAAXABD2AQAArAMAMPcBAQCXAwAh_gFAAJgDACGVAggArQMAIbICAQCXAwAhswIBAJcDACG0AgEAnAMAIbYCAQCXAwAhtwIBAJcDACG4AgEAlwMAIbkCAQCXAwAhugIBAJwDACG7AkAAmAMAIdYCAAAXACDXAgAAFwAgApsCAQAAAAG8AgEAAAABEAgAAM8DACAPAADQAwAgEAAA0QMAIBEAANIDACAUAACzAwAgFgAA0wMAIBcAANQDACD0AQAAzgMAMPUBAAANABD2AQAAzgMAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIZsCAQCXAwAhvAIBAJcDACG9AgEAnAMAIQ8GAACdAwAgBwAAmQMAIAwAAJ4DACD0AQAAmwMAMPUBAAAVABD2AQAAmwMAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIbICAQCXAwAhswIBAJcDACG0AgEAnAMAIbUCAQCXAwAh1gIAABUAINcCAAAVACALDgAAmQMAIPQBAACWAwAw9QEAAOQBABD2AQAAlgMAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIYsCAQCXAwAhrgIBAJcDACHWAgAA5AEAINcCAADkAQAgFwQAAMIDACAFAADDAwAgEwAAxQMAIBgAAMQDACAZAADGAwAgGgAAxwMAIBsAAMgDACD0AQAAvwMAMPUBAAAeABD2AQAAvwMAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIYsCAQCXAwAhtAIBAJwDACHMAgEAlwMAIc0CIADAAwAhzgIBAJwDACHQAgAAwQPQAiLRAiAAwAMAIdICAQCcAwAh1gIAAB4AINcCAAAeACADrwIAAAsAILACAAALACCxAgAACwAgA68CAAAjACCwAgAAIwAgsQIAACMAIAOvAgAALgAgsAIAAC4AILECAAAuACARAwAAnQMAIPQBAADVAwAw9QEAAAcAEPYBAADVAwAw9wEBAJcDACH4AQEAlwMAIf4BQACYAwAh_wFAAJgDACHAAgEAlwMAIcECAQCXAwAhwgIBAJwDACHDAgEAnAMAIcQCAQCcAwAhxQJAALgDACHGAkAAuAMAIccCAQCcAwAhyAIBAJwDACEMAwAAnQMAIPQBAADWAwAw9QEAAAMAEPYBAADWAwAw9wEBAJcDACH4AQEAlwMAIf4BQACYAwAh_wFAAJgDACG7AkAAmAMAIckCAQCXAwAhygIBAJwDACHLAgEAnAMAIQAAAAAB2wIBAAAAAQHbAgEAAAABAdsCQAAAAAEFKAAA5QYAICkAAOsGACDYAgAA5gYAINkCAADqBgAg3gIAAAEAIAUoAADjBgAgKQAA6AYAINgCAADkBgAg2QIAAOcGACDeAgAADwAgAygAAOUGACDYAgAA5gYAIN4CAAABACADKAAA4wYAINgCAADkBgAg3gIAAA8AIAAAAAAABdsCAgAAAAHhAgIAAAAB4gICAAAAAeMCAgAAAAHkAgIAAAABBdsCCAAAAAHhAggAAAAB4gIIAAAAAeMCCAAAAAHkAggAAAABAdsCAAAAkAICBSgAANMGACApAADhBgAg2AIAANQGACDZAgAA4AYAIN4CAAAPACALKAAA7AMAMCkAAPEDADDYAgAA7QMAMNkCAADuAwAw2gIAAO8DACDbAgAA8AMAMNwCAADwAwAw3QIAAPADADDeAgAA8AMAMN8CAADyAwAw4AIAAPMDADAPEgAA_QMAIBMAAP4DACD3AQEAAAAB-QEBAAAAAf4BQAAAAAH_AUAAAAABmQIAAACqAgKjAgEAAAABpgIAAACmAgKnAgIAAAABqAIIAAAAAaoCAQAAAAGrAgEAAAABrAJAAAAAAa0CQAAAAAECAAAAKQAgKAAA_AMAIAMAAAApACAoAAD8AwAgKQAA-QMAIAEhAADfBgAwFRIAALIDACATAAC5AwAgFQAAugMAIPQBAAC1AwAw9QEAACcAEPYBAAC1AwAw9wEBAAAAAfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIZkCAAC3A6oCIqMCAQCXAwAhpAIBAJcDACGmAgAAtgOmAiKnAgIAsAMAIagCCACtAwAhqgIBAJcDACGrAgEAnAMAIawCQACYAwAhrQJAALgDACHTAgAAtAMAIAIAAAApACAhAAD5AwAgAgAAAPQDACAhAAD1AwAgEfQBAADzAwAw9QEAAPQDABD2AQAA8wMAMPcBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhmQIAALcDqgIiowIBAJcDACGkAgEAlwMAIaYCAAC2A6YCIqcCAgCwAwAhqAIIAK0DACGqAgEAlwMAIasCAQCcAwAhrAJAAJgDACGtAkAAuAMAIRH0AQAA8wMAMPUBAAD0AwAQ9gEAAPMDADD3AQEAlwMAIfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIZkCAAC3A6oCIqMCAQCXAwAhpAIBAJcDACGmAgAAtgOmAiKnAgIAsAMAIagCCACtAwAhqgIBAJcDACGrAgEAnAMAIawCQACYAwAhrQJAALgDACEN9wEBANsDACH5AQEA2wMAIf4BQADdAwAh_wFAAN0DACGZAgAA9wOqAiKjAgEA2wMAIaYCAAD2A6YCIqcCAgDnAwAhqAIIAOgDACGqAgEA2wMAIasCAQDcAwAhrAJAAN0DACGtAkAA-AMAIQHbAgAAAKYCAgHbAgAAAKoCAgHbAkAAAAABDxIAAPoDACATAAD7AwAg9wEBANsDACH5AQEA2wMAIf4BQADdAwAh_wFAAN0DACGZAgAA9wOqAiKjAgEA2wMAIaYCAAD2A6YCIqcCAgDnAwAhqAIIAOgDACGqAgEA2wMAIasCAQDcAwAhrAJAAN0DACGtAkAA-AMAIQUoAADXBgAgKQAA3QYAINgCAADYBgAg2QIAANwGACDeAgAADwAgBSgAANUGACApAADaBgAg2AIAANYGACDZAgAA2QYAIN4CAAAlACAPEgAA_QMAIBMAAP4DACD3AQEAAAAB-QEBAAAAAf4BQAAAAAH_AUAAAAABmQIAAACqAgKjAgEAAAABpgIAAACmAgKnAgIAAAABqAIIAAAAAaoCAQAAAAGrAgEAAAABrAJAAAAAAa0CQAAAAAEDKAAA1wYAINgCAADYBgAg3gIAAA8AIAMoAADVBgAg2AIAANYGACDeAgAAJQAgAygAANMGACDYAgAA1AYAIN4CAAAPACAEKAAA7AMAMNgCAADtAwAw2gIAAO8DACDeAgAA8AMAMAAAAAAAAdsCAAAAlAICBSgAAMUGACApAADRBgAg2AIAAMYGACDZAgAA0AYAIN4CAAABACAFKAAAwwYAICkAAM4GACDYAgAAxAYAINkCAADNBgAg3gIAAA8AIAsoAACKBAAwKQAAjgQAMNgCAACLBAAw2QIAAIwEADDaAgAAjQQAINsCAADwAwAw3AIAAPADADDdAgAA8AMAMN4CAADwAwAw3wIAAI8EADDgAgAA8wMAMA8SAAD9AwAgFQAAlAQAIPcBAQAAAAH5AQEAAAAB_gFAAAAAAf8BQAAAAAGZAgAAAKoCAqQCAQAAAAGmAgAAAKYCAqcCAgAAAAGoAggAAAABqgIBAAAAAasCAQAAAAGsAkAAAAABrQJAAAAAAQIAAAApACAoAACTBAAgAwAAACkAICgAAJMEACApAACRBAAgASEAAMwGADACAAAAKQAgIQAAkQQAIAIAAAD0AwAgIQAAkAQAIA33AQEA2wMAIfkBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZkCAAD3A6oCIqQCAQDbAwAhpgIAAPYDpgIipwICAOcDACGoAggA6AMAIaoCAQDbAwAhqwIBANwDACGsAkAA3QMAIa0CQAD4AwAhDxIAAPoDACAVAACSBAAg9wEBANsDACH5AQEA2wMAIf4BQADdAwAh_wFAAN0DACGZAgAA9wOqAiKkAgEA2wMAIaYCAAD2A6YCIqcCAgDnAwAhqAIIAOgDACGqAgEA2wMAIasCAQDcAwAhrAJAAN0DACGtAkAA-AMAIQUoAADHBgAgKQAAygYAINgCAADIBgAg2QIAAMkGACDeAgAAMAAgDxIAAP0DACAVAACUBAAg9wEBAAAAAfkBAQAAAAH-AUAAAAAB_wFAAAAAAZkCAAAAqgICpAIBAAAAAaYCAAAApgICpwICAAAAAagCCAAAAAGqAgEAAAABqwIBAAAAAawCQAAAAAGtAkAAAAABAygAAMcGACDYAgAAyAYAIN4CAAAwACADKAAAxQYAINgCAADGBgAg3gIAAAEAIAMoAADDBgAg2AIAAMQGACDeAgAADwAgBCgAAIoEADDYAgAAiwQAMNoCAACNBAAg3gIAAPADADAAAAAAAAHbAgAAAJkCAgcoAAC7BgAgKQAAwQYAINgCAAC8BgAg2QIAAMAGACDcAgAAFQAg3QIAABUAIN4CAADJAQAgBygAALkGACApAAC-BgAg2AIAALoGACDZAgAAvQYAINwCAAAXACDdAgAAFwAg3gIAADsAIAMoAAC7BgAg2AIAALwGACDeAgAAyQEAIAMoAAC5BgAg2AIAALoGACDeAgAAOwAgAAAAAAAAAAALKAAAqwQAMCkAALAEADDYAgAArAQAMNkCAACtBAAw2gIAAK4EACDbAgAArwQAMNwCAACvBAAw3QIAAK8EADDeAgAArwQAMN8CAACxBAAw4AIAALIEADALCAAA6gQAIBAAAOsEACARAADsBAAgFAAA7wQAIBYAAO0EACAXAADuBAAg9wEBAAAAAf4BQAAAAAH_AUAAAAABmwIBAAAAAb0CAQAAAAECAAAADwAgKAAA6QQAIAMAAAAPACAoAADpBAAgKQAAtQQAIAEhAAC4BgAwEQgAAM8DACAPAADQAwAgEAAA0QMAIBEAANIDACAUAACzAwAgFgAA0wMAIBcAANQDACD0AQAAzgMAMPUBAAANABD2AQAAzgMAMPcBAQAAAAH-AUAAmAMAIf8BQACYAwAhmwIBAJcDACG8AgEAlwMAIb0CAQAAAAHVAgAAzQMAIAIAAAAPACAhAAC1BAAgAgAAALMEACAhAAC0BAAgCfQBAACyBAAw9QEAALMEABD2AQAAsgQAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIZsCAQCXAwAhvAIBAJcDACG9AgEAnAMAIQn0AQAAsgQAMPUBAACzBAAQ9gEAALIEADD3AQEAlwMAIf4BQACYAwAh_wFAAJgDACGbAgEAlwMAIbwCAQCXAwAhvQIBAJwDACEF9wEBANsDACH-AUAA3QMAIf8BQADdAwAhmwIBANsDACG9AgEA3AMAIQsIAAC2BAAgEAAAtwQAIBEAALgEACAUAAC7BAAgFgAAuQQAIBcAALoEACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGbAgEA2wMAIb0CAQDcAwAhBSgAAKwGACApAAC2BgAg2AIAAK0GACDZAgAAtQYAIN4CAADJAQAgBygAAKoGACApAACzBgAg2AIAAKsGACDZAgAAsgYAINwCAAAeACDdAgAAHgAg3gIAAAEAIAsoAADdBAAwKQAA4gQAMNgCAADeBAAw2QIAAN8EADDaAgAA4AQAINsCAADhBAAw3AIAAOEEADDdAgAA4QQAMN4CAADhBAAw3wIAAOMEADDgAgAA5AQAMAsoAADRBAAwKQAA1gQAMNgCAADSBAAw2QIAANMEADDaAgAA1AQAINsCAADVBAAw3AIAANUEADDdAgAA1QQAMN4CAADVBAAw3wIAANcEADDgAgAA2AQAMAsoAADFBAAwKQAAygQAMNgCAADGBAAw2QIAAMcEADDaAgAAyAQAINsCAADJBAAw3AIAAMkEADDdAgAAyQQAMN4CAADJBAAw3wIAAMsEADDgAgAAzAQAMAsoAAC8BAAwKQAAwAQAMNgCAAC9BAAw2QIAAL4EADDaAgAAvwQAINsCAADwAwAw3AIAAPADADDdAgAA8AMAMN4CAADwAwAw3wIAAMEEADDgAgAA8wMAMA8TAAD-AwAgFQAAlAQAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAZkCAAAAqgICowIBAAAAAaQCAQAAAAGmAgAAAKYCAqcCAgAAAAGoAggAAAABqgIBAAAAAasCAQAAAAGsAkAAAAABrQJAAAAAAQIAAAApACAoAADEBAAgAwAAACkAICgAAMQEACApAADDBAAgASEAALEGADACAAAAKQAgIQAAwwQAIAIAAAD0AwAgIQAAwgQAIA33AQEA2wMAIf4BQADdAwAh_wFAAN0DACGZAgAA9wOqAiKjAgEA2wMAIaQCAQDbAwAhpgIAAPYDpgIipwICAOcDACGoAggA6AMAIaoCAQDbAwAhqwIBANwDACGsAkAA3QMAIa0CQAD4AwAhDxMAAPsDACAVAACSBAAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhmQIAAPcDqgIiowIBANsDACGkAgEA2wMAIaYCAAD2A6YCIqcCAgDnAwAhqAIIAOgDACGqAgEA2wMAIasCAQDcAwAhrAJAAN0DACGtAkAA-AMAIQ8TAAD-AwAgFQAAlAQAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAZkCAAAAqgICowIBAAAAAaQCAQAAAAGmAgAAAKYCAqcCAgAAAAGoAggAAAABqgIBAAAAAasCAQAAAAGsAkAAAAABrQJAAAAAAQkUAACABAAg9wEBAAAAAf4BQAAAAAH_AUAAAAABiwIBAAAAAYwCAQAAAAGNAgIAAAABjgIIAAAAAZACAAAAkAICAgAAADAAICgAANAEACADAAAAMAAgKAAA0AQAICkAAM8EACABIQAAsAYAMA4SAACyAwAgFAAAswMAIPQBAACvAwAw9QEAAC4AEPYBAACvAwAw9wEBAAAAAfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIYsCAQCXAwAhjAIBAAAAAY0CAgCwAwAhjgIIAK0DACGQAgAAsQOQAiICAAAAMAAgIQAAzwQAIAIAAADNBAAgIQAAzgQAIAz0AQAAzAQAMPUBAADNBAAQ9gEAAMwEADD3AQEAlwMAIfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIYsCAQCXAwAhjAIBAJcDACGNAgIAsAMAIY4CCACtAwAhkAIAALEDkAIiDPQBAADMBAAw9QEAAM0EABD2AQAAzAQAMPcBAQCXAwAh-QEBAJcDACH-AUAAmAMAIf8BQACYAwAhiwIBAJcDACGMAgEAlwMAIY0CAgCwAwAhjgIIAK0DACGQAgAAsQOQAiII9wEBANsDACH-AUAA3QMAIf8BQADdAwAhiwIBANsDACGMAgEA2wMAIY0CAgDnAwAhjgIIAOgDACGQAgAA6QOQAiIJFAAA6wMAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhjAIBANsDACGNAgIA5wMAIY4CCADoAwAhkAIAAOkDkAIiCRQAAIAEACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGLAgEAAAABjAIBAAAAAY0CAgAAAAGOAggAAAABkAIAAACQAgIKAwAAlQQAIBQAAJcEACD3AQEAAAAB-AEBAAAAAf4BQAAAAAH_AUAAAAABjQICAAAAAZECAQAAAAGSAgEAAAABlAIAAACUAgICAAAAJQAgKAAA3AQAIAMAAAAlACAoAADcBAAgKQAA2wQAIAEhAACvBgAwEAMAAJ0DACASAACyAwAgFAAAswMAIPQBAAC8AwAw9QEAACMAEPYBAAC8AwAw9wEBAAAAAfgBAQAAAAH5AQEAlwMAIf4BQACYAwAh_wFAAJgDACGNAgIAsAMAIZECAQCXAwAhkgIBAJcDACGUAgAAvQOUAiLUAgAAuwMAIAIAAAAlACAhAADbBAAgAgAAANkEACAhAADaBAAgDPQBAADYBAAw9QEAANkEABD2AQAA2AQAMPcBAQCXAwAh-AEBAJcDACH5AQEAlwMAIf4BQACYAwAh_wFAAJgDACGNAgIAsAMAIZECAQCXAwAhkgIBAJcDACGUAgAAvQOUAiIM9AEAANgEADD1AQAA2QQAEPYBAADYBAAw9wEBAJcDACH4AQEAlwMAIfkBAQCXAwAh_gFAAJgDACH_AUAAmAMAIY0CAgCwAwAhkQIBAJcDACGSAgEAlwMAIZQCAAC9A5QCIgj3AQEA2wMAIfgBAQDbAwAh_gFAAN0DACH_AUAA3QMAIY0CAgDnAwAhkQIBANsDACGSAgEA2wMAIZQCAACGBJQCIgoDAACHBAAgFAAAiQQAIPcBAQDbAwAh-AEBANsDACH-AUAA3QMAIf8BQADdAwAhjQICAOcDACGRAgEA2wMAIZICAQDbAwAhlAIAAIYElAIiCgMAAJUEACAUAACXBAAg9wEBAAAAAfgBAQAAAAH-AUAAAAAB_wFAAAAAAY0CAgAAAAGRAgEAAAABkgIBAAAAAZQCAAAAlAICCQMAAOADACD3AQEAAAAB-AEBAAAAAfoBAQAAAAH7AQEAAAAB_AEBAAAAAf0BQAAAAAH-AUAAAAAB_wFAAAAAAQIAAAAhACAoAADoBAAgAwAAACEAICgAAOgEACApAADnBAAgASEAAK4GADAOAwAAnQMAIBIAALIDACD0AQAAvgMAMPUBAAALABD2AQAAvgMAMPcBAQAAAAH4AQEAAAAB-QEBAJcDACH6AQEAAAAB-wEBAJwDACH8AQEAnAMAIf0BQACYAwAh_gFAAJgDACH_AUAAmAMAIQIAAAAhACAhAADnBAAgAgAAAOUEACAhAADmBAAgDPQBAADkBAAw9QEAAOUEABD2AQAA5AQAMPcBAQCXAwAh-AEBAJcDACH5AQEAlwMAIfoBAQCcAwAh-wEBAJwDACH8AQEAnAMAIf0BQACYAwAh_gFAAJgDACH_AUAAmAMAIQz0AQAA5AQAMPUBAADlBAAQ9gEAAOQEADD3AQEAlwMAIfgBAQCXAwAh-QEBAJcDACH6AQEAnAMAIfsBAQCcAwAh_AEBAJwDACH9AUAAmAMAIf4BQACYAwAh_wFAAJgDACEI9wEBANsDACH4AQEA2wMAIfoBAQDcAwAh-wEBANwDACH8AQEA3AMAIf0BQADdAwAh_gFAAN0DACH_AUAA3QMAIQkDAADeAwAg9wEBANsDACH4AQEA2wMAIfoBAQDcAwAh-wEBANwDACH8AQEA3AMAIf0BQADdAwAh_gFAAN0DACH_AUAA3QMAIQkDAADgAwAg9wEBAAAAAfgBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9AUAAAAAB_gFAAAAAAf8BQAAAAAELCAAA6gQAIBAAAOsEACARAADsBAAgFAAA7wQAIBYAAO0EACAXAADuBAAg9wEBAAAAAf4BQAAAAAH_AUAAAAABmwIBAAAAAb0CAQAAAAEDKAAArAYAINgCAACtBgAg3gIAAMkBACADKAAAqgYAINgCAACrBgAg3gIAAAEAIAQoAADdBAAw2AIAAN4EADDaAgAA4AQAIN4CAADhBAAwBCgAANEEADDYAgAA0gQAMNoCAADUBAAg3gIAANUEADAEKAAAxQQAMNgCAADGBAAw2gIAAMgEACDeAgAAyQQAMAQoAAC8BAAw2AIAAL0EADDaAgAAvwQAIN4CAADwAwAwBCgAAKsEADDYAgAArAQAMNoCAACuBAAg3gIAAK8EADAAAAAABSgAAJ4GACApAACoBgAg2AIAAJ8GACDZAgAApwYAIN4CAAABACALKAAAhAUAMCkAAIgFADDYAgAAhQUAMNkCAACGBQAw2gIAAIcFACDbAgAArwQAMNwCAACvBAAw3QIAAK8EADDeAgAArwQAMN8CAACJBQAw4AIAALIEADALKAAA-AQAMCkAAP0EADDYAgAA-QQAMNkCAAD6BAAw2gIAAPsEACDbAgAA_AQAMNwCAAD8BAAw3QIAAPwEADDeAgAA_AQAMN8CAAD-BAAw4AIAAP8EADAKCwAAoQQAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAZUCCAAAAAGWAgEAAAABlwIBAAAAAZkCAAAAmQICmgKAAAAAAZwCAQAAAAECAAAAEwAgKAAAgwUAIAMAAAATACAoAACDBQAgKQAAggUAIAEhAACmBgAwDwgAAMYDACALAADMAwAg9AEAAMkDADD1AQAAEQAQ9gEAAMkDADD3AQEAAAAB_gFAAJgDACH_AUAAmAMAIZUCCACtAwAhlgIBAAAAAZcCAQAAAAGZAgAAygOZAiKaAgAAywMAIJsCAQCcAwAhnAIBAAAAAQIAAAATACAhAACCBQAgAgAAAIAFACAhAACBBQAgDfQBAAD_BAAw9QEAAIAFABD2AQAA_wQAMPcBAQCXAwAh_gFAAJgDACH_AUAAmAMAIZUCCACtAwAhlgIBAJcDACGXAgEAnAMAIZkCAADKA5kCIpoCAADLAwAgmwIBAJwDACGcAgEAnAMAIQ30AQAA_wQAMPUBAACABQAQ9gEAAP8EADD3AQEAlwMAIf4BQACYAwAh_wFAAJgDACGVAggArQMAIZYCAQCXAwAhlwIBAJwDACGZAgAAygOZAiKaAgAAywMAIJsCAQCcAwAhnAIBAJwDACEJ9wEBANsDACH-AUAA3QMAIf8BQADdAwAhlQIIAOgDACGWAgEA2wMAIZcCAQDcAwAhmQIAAJ0EmQIimgKAAAAAAZwCAQDcAwAhCgsAAJ8EACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGVAggA6AMAIZYCAQDbAwAhlwIBANwDACGZAgAAnQSZAiKaAoAAAAABnAIBANwDACEKCwAAoQQAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAZUCCAAAAAGWAgEAAAABlwIBAAAAAZkCAAAAmQICmgKAAAAAAZwCAQAAAAELDwAAjgUAIBAAAOsEACARAADsBAAgFAAA7wQAIBYAAO0EACAXAADuBAAg9wEBAAAAAf4BQAAAAAH_AUAAAAABvAIBAAAAAb0CAQAAAAECAAAADwAgKAAAjQUAIAMAAAAPACAoAACNBQAgKQAAiwUAIAEhAAClBgAwAgAAAA8AICEAAIsFACACAAAAswQAICEAAIoFACAF9wEBANsDACH-AUAA3QMAIf8BQADdAwAhvAIBANsDACG9AgEA3AMAIQsPAACMBQAgEAAAtwQAIBEAALgEACAUAAC7BAAgFgAAuQQAIBcAALoEACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACG8AgEA2wMAIb0CAQDcAwAhBSgAAKAGACApAACjBgAg2AIAAKEGACDZAgAAogYAIN4CAADhAQAgCw8AAI4FACAQAADrBAAgEQAA7AQAIBQAAO8EACAWAADtBAAgFwAA7gQAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAbwCAQAAAAG9AgEAAAABAygAAKAGACDYAgAAoQYAIN4CAADhAQAgAygAAJ4GACDYAgAAnwYAIN4CAAABACAEKAAAhAUAMNgCAACFBQAw2gIAAIcFACDeAgAArwQAMAQoAAD4BAAw2AIAAPkEADDaAgAA-wQAIN4CAAD8BAAwCgQAAP0FACAFAAD-BQAgEwAAgAYAIBgAAP8FACAZAACBBgAgGgAAggYAIBsAAIMGACC0AgAA1wMAIM4CAADXAwAg0gIAANcDACAAAAAAAAAFKAAAmQYAICkAAJwGACDYAgAAmgYAINkCAACbBgAg3gIAAAEAIAcoAACbBQAgKQAAngUAINgCAACcBQAg2QIAAJ0FACDcAgAAEQAg3QIAABEAIN4CAAATACAKCAAAoAQAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAZUCCAAAAAGWAgEAAAABlwIBAAAAAZkCAAAAmQICmgKAAAAAAZsCAQAAAAECAAAAEwAgKAAAmwUAIAMAAAARACAoAACbBQAgKQAAnwUAIAwAAAARACAIAACeBAAgIQAAnwUAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZUCCADoAwAhlgIBANsDACGXAgEA3AMAIZkCAACdBJkCIpoCgAAAAAGbAgEA3AMAIQoIAACeBAAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhlQIIAOgDACGWAgEA2wMAIZcCAQDcAwAhmQIAAJ0EmQIimgKAAAAAAZsCAQDcAwAhAygAAJkGACDYAgAAmgYAIN4CAAABACADKAAAmwUAINgCAACcBQAg3gIAABMAIAAAAAAAAAAAAAUoAACUBgAgKQAAlwYAINgCAACVBgAg2QIAAJYGACDeAgAAAQAgAygAAJQGACDYAgAAlQYAIN4CAAABACAAAAAFKAAAjwYAICkAAJIGACDYAgAAkAYAINkCAACRBgAg3gIAAAEAIAMoAACPBgAg2AIAAJAGACDeAgAAAQAgAAAAAdsCIAAAAAEB2wIAAADQAgILKAAA6gUAMCkAAO8FADDYAgAA6wUAMNkCAADsBQAw2gIAAO0FACDbAgAA7gUAMNwCAADuBQAw3QIAAO4FADDeAgAA7gUAMN8CAADwBQAw4AIAAPEFADALKAAA3gUAMCkAAOMFADDYAgAA3wUAMNkCAADgBQAw2gIAAOEFACDbAgAA4gUAMNwCAADiBQAw3QIAAOIFADDeAgAA4gUAMN8CAADkBQAw4AIAAOUFADAHKAAA2QUAICkAANwFACDYAgAA2gUAINkCAADbBQAg3AIAAAsAIN0CAAALACDeAgAAIQAgBygAANQFACApAADXBQAg2AIAANUFACDZAgAA1gUAINwCAAAjACDdAgAAIwAg3gIAACUAIAcoAADPBQAgKQAA0gUAINgCAADQBQAg2QIAANEFACDcAgAAFQAg3QIAABUAIN4CAADJAQAgBygAAMoFACApAADNBQAg2AIAAMsFACDZAgAAzAUAINwCAAANACDdAgAADQAg3gIAAA8AIAsoAAC-BQAwKQAAwwUAMNgCAAC_BQAw2QIAAMAFADDaAgAAwQUAINsCAADCBQAw3AIAAMIFADDdAgAAwgUAMN4CAADCBQAw3wIAAMQFADDgAgAAxQUAMAwKAAChBQAg9wEBAAAAAf4BQAAAAAGVAggAAAABsgIBAAAAAbMCAQAAAAG0AgEAAAABtwIBAAAAAbgCAQAAAAG5AgEAAAABugIBAAAAAbsCQAAAAAECAAAAOwAgKAAAyQUAIAMAAAA7ACAoAADJBQAgKQAAyAUAIAEhAACOBgAwEQkAAJ0DACAKAACuAwAg9AEAAKwDADD1AQAAFwAQ9gEAAKwDADD3AQEAAAAB_gFAAJgDACGVAggArQMAIbICAQCXAwAhswIBAJcDACG0AgEAnAMAIbYCAQCXAwAhtwIBAJcDACG4AgEAlwMAIbkCAQCXAwAhugIBAAAAAbsCQACYAwAhAgAAADsAICEAAMgFACACAAAAxgUAICEAAMcFACAP9AEAAMUFADD1AQAAxgUAEPYBAADFBQAw9wEBAJcDACH-AUAAmAMAIZUCCACtAwAhsgIBAJcDACGzAgEAlwMAIbQCAQCcAwAhtgIBAJcDACG3AgEAlwMAIbgCAQCXAwAhuQIBAJcDACG6AgEAnAMAIbsCQACYAwAhD_QBAADFBQAw9QEAAMYFABD2AQAAxQUAMPcBAQCXAwAh_gFAAJgDACGVAggArQMAIbICAQCXAwAhswIBAJcDACG0AgEAnAMAIbYCAQCXAwAhtwIBAJcDACG4AgEAlwMAIbkCAQCXAwAhugIBAJwDACG7AkAAmAMAIQv3AQEA2wMAIf4BQADdAwAhlQIIAOgDACGyAgEA2wMAIbMCAQDbAwAhtAIBANwDACG3AgEA2wMAIbgCAQDbAwAhuQIBANsDACG6AgEA3AMAIbsCQADdAwAhDAoAAJoFACD3AQEA2wMAIf4BQADdAwAhlQIIAOgDACGyAgEA2wMAIbMCAQDbAwAhtAIBANwDACG3AgEA2wMAIbgCAQDbAwAhuQIBANsDACG6AgEA3AMAIbsCQADdAwAhDAoAAKEFACD3AQEAAAAB_gFAAAAAAZUCCAAAAAGyAgEAAAABswIBAAAAAbQCAQAAAAG3AgEAAAABuAIBAAAAAbkCAQAAAAG6AgEAAAABuwJAAAAAAQsIAADqBAAgDwAAjgUAIBEAAOwEACAUAADvBAAgFgAA7QQAIBcAAO4EACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGbAgEAAAABvAIBAAAAAQIAAAAPACAoAADKBQAgAwAAAA0AICgAAMoFACApAADOBQAgDQAAAA0AIAgAALYEACAPAACMBQAgEQAAuAQAIBQAALsEACAWAAC5BAAgFwAAugQAICEAAM4FACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGbAgEA2wMAIbwCAQDbAwAhCwgAALYEACAPAACMBQAgEQAAuAQAIBQAALsEACAWAAC5BAAgFwAAugQAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZsCAQDbAwAhvAIBANsDACEIBwAAkAUAIAwAAJEFACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGyAgEAAAABswIBAAAAAbQCAQAAAAECAAAAyQEAICgAAM8FACADAAAAFQAgKAAAzwUAICkAANMFACAKAAAAFQAgBwAA9gQAIAwAAPcEACAhAADTBQAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhsgIBANsDACGzAgEA2wMAIbQCAQDcAwAhCAcAAPYEACAMAAD3BAAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhsgIBANsDACGzAgEA2wMAIbQCAQDcAwAhChIAAJYEACAUAACXBAAg9wEBAAAAAfkBAQAAAAH-AUAAAAAB_wFAAAAAAY0CAgAAAAGRAgEAAAABkgIBAAAAAZQCAAAAlAICAgAAACUAICgAANQFACADAAAAIwAgKAAA1AUAICkAANgFACAMAAAAIwAgEgAAiAQAIBQAAIkEACAhAADYBQAg9wEBANsDACH5AQEA2wMAIf4BQADdAwAh_wFAAN0DACGNAgIA5wMAIZECAQDbAwAhkgIBANsDACGUAgAAhgSUAiIKEgAAiAQAIBQAAIkEACD3AQEA2wMAIfkBAQDbAwAh_gFAAN0DACH_AUAA3QMAIY0CAgDnAwAhkQIBANsDACGSAgEA2wMAIZQCAACGBJQCIgkSAADhAwAg9wEBAAAAAfkBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9AUAAAAAB_gFAAAAAAf8BQAAAAAECAAAAIQAgKAAA2QUAIAMAAAALACAoAADZBQAgKQAA3QUAIAsAAAALACASAADfAwAgIQAA3QUAIPcBAQDbAwAh-QEBANsDACH6AQEA3AMAIfsBAQDcAwAh_AEBANwDACH9AUAA3QMAIf4BQADdAwAh_wFAAN0DACEJEgAA3wMAIPcBAQDbAwAh-QEBANsDACH6AQEA3AMAIfsBAQDcAwAh_AEBANwDACH9AUAA3QMAIf4BQADdAwAh_wFAAN0DACEM9wEBAAAAAf4BQAAAAAH_AUAAAAABwAIBAAAAAcECAQAAAAHCAgEAAAABwwIBAAAAAcQCAQAAAAHFAkAAAAABxgJAAAAAAccCAQAAAAHIAgEAAAABAgAAAAkAICgAAOkFACADAAAACQAgKAAA6QUAICkAAOgFACABIQAAjQYAMBEDAACdAwAg9AEAANUDADD1AQAABwAQ9gEAANUDADD3AQEAAAAB-AEBAJcDACH-AUAAmAMAIf8BQACYAwAhwAIBAJcDACHBAgEAlwMAIcICAQCcAwAhwwIBAJwDACHEAgEAnAMAIcUCQAC4AwAhxgJAALgDACHHAgEAnAMAIcgCAQCcAwAhAgAAAAkAICEAAOgFACACAAAA5gUAICEAAOcFACAQ9AEAAOUFADD1AQAA5gUAEPYBAADlBQAw9wEBAJcDACH4AQEAlwMAIf4BQACYAwAh_wFAAJgDACHAAgEAlwMAIcECAQCXAwAhwgIBAJwDACHDAgEAnAMAIcQCAQCcAwAhxQJAALgDACHGAkAAuAMAIccCAQCcAwAhyAIBAJwDACEQ9AEAAOUFADD1AQAA5gUAEPYBAADlBQAw9wEBAJcDACH4AQEAlwMAIf4BQACYAwAh_wFAAJgDACHAAgEAlwMAIcECAQCXAwAhwgIBAJwDACHDAgEAnAMAIcQCAQCcAwAhxQJAALgDACHGAkAAuAMAIccCAQCcAwAhyAIBAJwDACEM9wEBANsDACH-AUAA3QMAIf8BQADdAwAhwAIBANsDACHBAgEA2wMAIcICAQDcAwAhwwIBANwDACHEAgEA3AMAIcUCQAD4AwAhxgJAAPgDACHHAgEA3AMAIcgCAQDcAwAhDPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIcACAQDbAwAhwQIBANsDACHCAgEA3AMAIcMCAQDcAwAhxAIBANwDACHFAkAA-AMAIcYCQAD4AwAhxwIBANwDACHIAgEA3AMAIQz3AQEAAAAB_gFAAAAAAf8BQAAAAAHAAgEAAAABwQIBAAAAAcICAQAAAAHDAgEAAAABxAIBAAAAAcUCQAAAAAHGAkAAAAABxwIBAAAAAcgCAQAAAAEH9wEBAAAAAf4BQAAAAAH_AUAAAAABuwJAAAAAAckCAQAAAAHKAgEAAAABywIBAAAAAQIAAAAFACAoAAD1BQAgAwAAAAUAICgAAPUFACApAAD0BQAgASEAAIwGADAMAwAAnQMAIPQBAADWAwAw9QEAAAMAEPYBAADWAwAw9wEBAAAAAfgBAQCXAwAh_gFAAJgDACH_AUAAmAMAIbsCQACYAwAhyQIBAAAAAcoCAQCcAwAhywIBAJwDACECAAAABQAgIQAA9AUAIAIAAADyBQAgIQAA8wUAIAv0AQAA8QUAMPUBAADyBQAQ9gEAAPEFADD3AQEAlwMAIfgBAQCXAwAh_gFAAJgDACH_AUAAmAMAIbsCQACYAwAhyQIBAJcDACHKAgEAnAMAIcsCAQCcAwAhC_QBAADxBQAw9QEAAPIFABD2AQAA8QUAMPcBAQCXAwAh-AEBAJcDACH-AUAAmAMAIf8BQACYAwAhuwJAAJgDACHJAgEAlwMAIcoCAQCcAwAhywIBAJwDACEH9wEBANsDACH-AUAA3QMAIf8BQADdAwAhuwJAAN0DACHJAgEA2wMAIcoCAQDcAwAhywIBANwDACEH9wEBANsDACH-AUAA3QMAIf8BQADdAwAhuwJAAN0DACHJAgEA2wMAIcoCAQDcAwAhywIBANwDACEH9wEBAAAAAf4BQAAAAAH_AUAAAAABuwJAAAAAAckCAQAAAAHKAgEAAAABywIBAAAAAQQoAADqBQAw2AIAAOsFADDaAgAA7QUAIN4CAADuBQAwBCgAAN4FADDYAgAA3wUAMNoCAADhBQAg3gIAAOIFADADKAAA2QUAINgCAADaBQAg3gIAACEAIAMoAADUBQAg2AIAANUFACDeAgAAJQAgAygAAM8FACDYAgAA0AUAIN4CAADJAQAgAygAAMoFACDYAgAAywUAIN4CAAAPACAEKAAAvgUAMNgCAAC_BQAw2gIAAMEFACDeAgAAwgUAMAAABQMAAJIFACASAACCBgAg-gEAANcDACD7AQAA1wMAIPwBAADXAwAgAwMAAJIFACASAACCBgAgFAAAhQYAIAQGAACSBQAgBwAA8QQAIAwAAJMFACC0AgAA1wMAIAgIAACBBgAgDwAAiAYAIBAAAJIFACARAACJBgAgFAAAhQYAIBYAAIoGACAXAACLBgAgvQIAANcDACAABggAAIEGACALAACHBgAglwIAANcDACCaAgAA1wMAIJsCAADXAwAgnAIAANcDACAAAhIAAIIGACAUAACFBgAgBAkAAJIFACAKAACEBgAgtAIAANcDACC6AgAA1wMAIAEOAADxBAAgAAAAB_cBAQAAAAH-AUAAAAAB_wFAAAAAAbsCQAAAAAHJAgEAAAABygIBAAAAAcsCAQAAAAEM9wEBAAAAAf4BQAAAAAH_AUAAAAABwAIBAAAAAcECAQAAAAHCAgEAAAABwwIBAAAAAcQCAQAAAAHFAkAAAAABxgJAAAAAAccCAQAAAAHIAgEAAAABC_cBAQAAAAH-AUAAAAABlQIIAAAAAbICAQAAAAGzAgEAAAABtAIBAAAAAbcCAQAAAAG4AgEAAAABuQIBAAAAAboCAQAAAAG7AkAAAAABEQUAAPcFACATAAD5BQAgGAAA-AUAIBkAAPoFACAaAAD7BQAgGwAA_AUAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAYsCAQAAAAG0AgEAAAABzAIBAAAAAc0CIAAAAAHOAgEAAAAB0AIAAADQAgLRAiAAAAAB0gIBAAAAAQIAAAABACAoAACPBgAgAwAAAB4AICgAAI8GACApAACTBgAgEwAAAB4AIAUAALgFACATAAC6BQAgGAAAuQUAIBkAALsFACAaAAC8BQAgGwAAvQUAICEAAJMGACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIbQCAQDcAwAhzAIBANsDACHNAiAAtQUAIc4CAQDcAwAh0AIAALYF0AIi0QIgALUFACHSAgEA3AMAIREFAAC4BQAgEwAAugUAIBgAALkFACAZAAC7BQAgGgAAvAUAIBsAAL0FACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIbQCAQDcAwAhzAIBANsDACHNAiAAtQUAIc4CAQDcAwAh0AIAALYF0AIi0QIgALUFACHSAgEA3AMAIREEAAD2BQAgEwAA-QUAIBgAAPgFACAZAAD6BQAgGgAA-wUAIBsAAPwFACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGLAgEAAAABtAIBAAAAAcwCAQAAAAHNAiAAAAABzgIBAAAAAdACAAAA0AIC0QIgAAAAAdICAQAAAAECAAAAAQAgKAAAlAYAIAMAAAAeACAoAACUBgAgKQAAmAYAIBMAAAAeACAEAAC3BQAgEwAAugUAIBgAALkFACAZAAC7BQAgGgAAvAUAIBsAAL0FACAhAACYBgAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhiwIBANsDACG0AgEA3AMAIcwCAQDbAwAhzQIgALUFACHOAgEA3AMAIdACAAC2BdACItECIAC1BQAh0gIBANwDACERBAAAtwUAIBMAALoFACAYAAC5BQAgGQAAuwUAIBoAALwFACAbAAC9BQAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhiwIBANsDACG0AgEA3AMAIcwCAQDbAwAhzQIgALUFACHOAgEA3AMAIdACAAC2BdACItECIAC1BQAh0gIBANwDACERBAAA9gUAIAUAAPcFACATAAD5BQAgGAAA-AUAIBkAAPoFACAaAAD7BQAg9wEBAAAAAf4BQAAAAAH_AUAAAAABiwIBAAAAAbQCAQAAAAHMAgEAAAABzQIgAAAAAc4CAQAAAAHQAgAAANACAtECIAAAAAHSAgEAAAABAgAAAAEAICgAAJkGACADAAAAHgAgKAAAmQYAICkAAJ0GACATAAAAHgAgBAAAtwUAIAUAALgFACATAAC6BQAgGAAAuQUAIBkAALsFACAaAAC8BQAgIQAAnQYAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhtAIBANwDACHMAgEA2wMAIc0CIAC1BQAhzgIBANwDACHQAgAAtgXQAiLRAiAAtQUAIdICAQDcAwAhEQQAALcFACAFAAC4BQAgEwAAugUAIBgAALkFACAZAAC7BQAgGgAAvAUAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhtAIBANwDACHMAgEA2wMAIc0CIAC1BQAhzgIBANwDACHQAgAAtgXQAiLRAiAAtQUAIdICAQDcAwAhEQQAAPYFACAFAAD3BQAgEwAA-QUAIBgAAPgFACAaAAD7BQAgGwAA_AUAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAYsCAQAAAAG0AgEAAAABzAIBAAAAAc0CIAAAAAHOAgEAAAAB0AIAAADQAgLRAiAAAAAB0gIBAAAAAQIAAAABACAoAACeBgAgBfcBAQAAAAH-AUAAAAAB_wFAAAAAAYsCAQAAAAGuAgEAAAABAgAAAOEBACAoAACgBgAgAwAAAOQBACAoAACgBgAgKQAApAYAIAcAAADkAQAgIQAApAYAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhrgIBANsDACEF9wEBANsDACH-AUAA3QMAIf8BQADdAwAhiwIBANsDACGuAgEA2wMAIQX3AQEAAAAB_gFAAAAAAf8BQAAAAAG8AgEAAAABvQIBAAAAAQn3AQEAAAAB_gFAAAAAAf8BQAAAAAGVAggAAAABlgIBAAAAAZcCAQAAAAGZAgAAAJkCApoCgAAAAAGcAgEAAAABAwAAAB4AICgAAJ4GACApAACpBgAgEwAAAB4AIAQAALcFACAFAAC4BQAgEwAAugUAIBgAALkFACAaAAC8BQAgGwAAvQUAICEAAKkGACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIbQCAQDcAwAhzAIBANsDACHNAiAAtQUAIc4CAQDcAwAh0AIAALYF0AIi0QIgALUFACHSAgEA3AMAIREEAAC3BQAgBQAAuAUAIBMAALoFACAYAAC5BQAgGgAAvAUAIBsAAL0FACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIbQCAQDcAwAhzAIBANsDACHNAiAAtQUAIc4CAQDcAwAh0AIAALYF0AIi0QIgALUFACHSAgEA3AMAIREEAAD2BQAgBQAA9wUAIBMAAPkFACAYAAD4BQAgGQAA-gUAIBsAAPwFACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGLAgEAAAABtAIBAAAAAcwCAQAAAAHNAiAAAAABzgIBAAAAAdACAAAA0AIC0QIgAAAAAdICAQAAAAECAAAAAQAgKAAAqgYAIAkGAACPBQAgDAAAkQUAIPcBAQAAAAH-AUAAAAAB_wFAAAAAAbICAQAAAAGzAgEAAAABtAIBAAAAAbUCAQAAAAECAAAAyQEAICgAAKwGACAI9wEBAAAAAfgBAQAAAAH6AQEAAAAB-wEBAAAAAfwBAQAAAAH9AUAAAAAB_gFAAAAAAf8BQAAAAAEI9wEBAAAAAfgBAQAAAAH-AUAAAAAB_wFAAAAAAY0CAgAAAAGRAgEAAAABkgIBAAAAAZQCAAAAlAICCPcBAQAAAAH-AUAAAAAB_wFAAAAAAYsCAQAAAAGMAgEAAAABjQICAAAAAY4CCAAAAAGQAgAAAJACAg33AQEAAAAB_gFAAAAAAf8BQAAAAAGZAgAAAKoCAqMCAQAAAAGkAgEAAAABpgIAAACmAgKnAgIAAAABqAIIAAAAAaoCAQAAAAGrAgEAAAABrAJAAAAAAa0CQAAAAAEDAAAAHgAgKAAAqgYAICkAALQGACATAAAAHgAgBAAAtwUAIAUAALgFACATAAC6BQAgGAAAuQUAIBkAALsFACAbAAC9BQAgIQAAtAYAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhtAIBANwDACHMAgEA2wMAIc0CIAC1BQAhzgIBANwDACHQAgAAtgXQAiLRAiAAtQUAIdICAQDcAwAhEQQAALcFACAFAAC4BQAgEwAAugUAIBgAALkFACAZAAC7BQAgGwAAvQUAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhtAIBANwDACHMAgEA2wMAIc0CIAC1BQAhzgIBANwDACHQAgAAtgXQAiLRAiAAtQUAIdICAQDcAwAhAwAAABUAICgAAKwGACApAAC3BgAgCwAAABUAIAYAAPUEACAMAAD3BAAgIQAAtwYAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIbICAQDbAwAhswIBANsDACG0AgEA3AMAIbUCAQDbAwAhCQYAAPUEACAMAAD3BAAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhsgIBANsDACGzAgEA2wMAIbQCAQDcAwAhtQIBANsDACEF9wEBAAAAAf4BQAAAAAH_AUAAAAABmwIBAAAAAb0CAQAAAAENCQAAoAUAIPcBAQAAAAH-AUAAAAABlQIIAAAAAbICAQAAAAGzAgEAAAABtAIBAAAAAbYCAQAAAAG3AgEAAAABuAIBAAAAAbkCAQAAAAG6AgEAAAABuwJAAAAAAQIAAAA7ACAoAAC5BgAgCQYAAI8FACAHAACQBQAg9wEBAAAAAf4BQAAAAAH_AUAAAAABsgIBAAAAAbMCAQAAAAG0AgEAAAABtQIBAAAAAQIAAADJAQAgKAAAuwYAIAMAAAAXACAoAAC5BgAgKQAAvwYAIA8AAAAXACAJAACZBQAgIQAAvwYAIPcBAQDbAwAh_gFAAN0DACGVAggA6AMAIbICAQDbAwAhswIBANsDACG0AgEA3AMAIbYCAQDbAwAhtwIBANsDACG4AgEA2wMAIbkCAQDbAwAhugIBANwDACG7AkAA3QMAIQ0JAACZBQAg9wEBANsDACH-AUAA3QMAIZUCCADoAwAhsgIBANsDACGzAgEA2wMAIbQCAQDcAwAhtgIBANsDACG3AgEA2wMAIbgCAQDbAwAhuQIBANsDACG6AgEA3AMAIbsCQADdAwAhAwAAABUAICgAALsGACApAADCBgAgCwAAABUAIAYAAPUEACAHAAD2BAAgIQAAwgYAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIbICAQDbAwAhswIBANsDACG0AgEA3AMAIbUCAQDbAwAhCQYAAPUEACAHAAD2BAAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhsgIBANsDACGzAgEA2wMAIbQCAQDcAwAhtQIBANsDACEMCAAA6gQAIA8AAI4FACAQAADrBAAgEQAA7AQAIBQAAO8EACAXAADuBAAg9wEBAAAAAf4BQAAAAAH_AUAAAAABmwIBAAAAAbwCAQAAAAG9AgEAAAABAgAAAA8AICgAAMMGACARBAAA9gUAIAUAAPcFACAYAAD4BQAgGQAA-gUAIBoAAPsFACAbAAD8BQAg9wEBAAAAAf4BQAAAAAH_AUAAAAABiwIBAAAAAbQCAQAAAAHMAgEAAAABzQIgAAAAAc4CAQAAAAHQAgAAANACAtECIAAAAAHSAgEAAAABAgAAAAEAICgAAMUGACAKEgAA_wMAIPcBAQAAAAH5AQEAAAAB_gFAAAAAAf8BQAAAAAGLAgEAAAABjAIBAAAAAY0CAgAAAAGOAggAAAABkAIAAACQAgICAAAAMAAgKAAAxwYAIAMAAAAuACAoAADHBgAgKQAAywYAIAwAAAAuACASAADqAwAgIQAAywYAIPcBAQDbAwAh-QEBANsDACH-AUAA3QMAIf8BQADdAwAhiwIBANsDACGMAgEA2wMAIY0CAgDnAwAhjgIIAOgDACGQAgAA6QOQAiIKEgAA6gMAIPcBAQDbAwAh-QEBANsDACH-AUAA3QMAIf8BQADdAwAhiwIBANsDACGMAgEA2wMAIY0CAgDnAwAhjgIIAOgDACGQAgAA6QOQAiIN9wEBAAAAAfkBAQAAAAH-AUAAAAAB_wFAAAAAAZkCAAAAqgICpAIBAAAAAaYCAAAApgICpwICAAAAAagCCAAAAAGqAgEAAAABqwIBAAAAAawCQAAAAAGtAkAAAAABAwAAAA0AICgAAMMGACApAADPBgAgDgAAAA0AIAgAALYEACAPAACMBQAgEAAAtwQAIBEAALgEACAUAAC7BAAgFwAAugQAICEAAM8GACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGbAgEA2wMAIbwCAQDbAwAhvQIBANwDACEMCAAAtgQAIA8AAIwFACAQAAC3BAAgEQAAuAQAIBQAALsEACAXAAC6BAAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhmwIBANsDACG8AgEA2wMAIb0CAQDcAwAhAwAAAB4AICgAAMUGACApAADSBgAgEwAAAB4AIAQAALcFACAFAAC4BQAgGAAAuQUAIBkAALsFACAaAAC8BQAgGwAAvQUAICEAANIGACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIbQCAQDcAwAhzAIBANsDACHNAiAAtQUAIc4CAQDcAwAh0AIAALYF0AIi0QIgALUFACHSAgEA3AMAIREEAAC3BQAgBQAAuAUAIBgAALkFACAZAAC7BQAgGgAAvAUAIBsAAL0FACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGLAgEA2wMAIbQCAQDcAwAhzAIBANsDACHNAiAAtQUAIc4CAQDcAwAh0AIAALYF0AIi0QIgALUFACHSAgEA3AMAIQwIAADqBAAgDwAAjgUAIBAAAOsEACARAADsBAAgFAAA7wQAIBYAAO0EACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGbAgEAAAABvAIBAAAAAb0CAQAAAAECAAAADwAgKAAA0wYAIAsDAACVBAAgEgAAlgQAIPcBAQAAAAH4AQEAAAAB-QEBAAAAAf4BQAAAAAH_AUAAAAABjQICAAAAAZECAQAAAAGSAgEAAAABlAIAAACUAgICAAAAJQAgKAAA1QYAIAwIAADqBAAgDwAAjgUAIBAAAOsEACARAADsBAAgFgAA7QQAIBcAAO4EACD3AQEAAAAB_gFAAAAAAf8BQAAAAAGbAgEAAAABvAIBAAAAAb0CAQAAAAECAAAADwAgKAAA1wYAIAMAAAAjACAoAADVBgAgKQAA2wYAIA0AAAAjACADAACHBAAgEgAAiAQAICEAANsGACD3AQEA2wMAIfgBAQDbAwAh-QEBANsDACH-AUAA3QMAIf8BQADdAwAhjQICAOcDACGRAgEA2wMAIZICAQDbAwAhlAIAAIYElAIiCwMAAIcEACASAACIBAAg9wEBANsDACH4AQEA2wMAIfkBAQDbAwAh_gFAAN0DACH_AUAA3QMAIY0CAgDnAwAhkQIBANsDACGSAgEA2wMAIZQCAACGBJQCIgMAAAANACAoAADXBgAgKQAA3gYAIA4AAAANACAIAAC2BAAgDwAAjAUAIBAAALcEACARAAC4BAAgFgAAuQQAIBcAALoEACAhAADeBgAg9wEBANsDACH-AUAA3QMAIf8BQADdAwAhmwIBANsDACG8AgEA2wMAIb0CAQDcAwAhDAgAALYEACAPAACMBQAgEAAAtwQAIBEAALgEACAWAAC5BAAgFwAAugQAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZsCAQDbAwAhvAIBANsDACG9AgEA3AMAIQ33AQEAAAAB-QEBAAAAAf4BQAAAAAH_AUAAAAABmQIAAACqAgKjAgEAAAABpgIAAACmAgKnAgIAAAABqAIIAAAAAaoCAQAAAAGrAgEAAAABrAJAAAAAAa0CQAAAAAEDAAAADQAgKAAA0wYAICkAAOIGACAOAAAADQAgCAAAtgQAIA8AAIwFACAQAAC3BAAgEQAAuAQAIBQAALsEACAWAAC5BAAgIQAA4gYAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZsCAQDbAwAhvAIBANsDACG9AgEA3AMAIQwIAAC2BAAgDwAAjAUAIBAAALcEACARAAC4BAAgFAAAuwQAIBYAALkEACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGbAgEA2wMAIbwCAQDbAwAhvQIBANwDACEMCAAA6gQAIA8AAI4FACAQAADrBAAgFAAA7wQAIBYAAO0EACAXAADuBAAg9wEBAAAAAf4BQAAAAAH_AUAAAAABmwIBAAAAAbwCAQAAAAG9AgEAAAABAgAAAA8AICgAAOMGACARBAAA9gUAIAUAAPcFACATAAD5BQAgGQAA-gUAIBoAAPsFACAbAAD8BQAg9wEBAAAAAf4BQAAAAAH_AUAAAAABiwIBAAAAAbQCAQAAAAHMAgEAAAABzQIgAAAAAc4CAQAAAAHQAgAAANACAtECIAAAAAHSAgEAAAABAgAAAAEAICgAAOUGACADAAAADQAgKAAA4wYAICkAAOkGACAOAAAADQAgCAAAtgQAIA8AAIwFACAQAAC3BAAgFAAAuwQAIBYAALkEACAXAAC6BAAgIQAA6QYAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIZsCAQDbAwAhvAIBANsDACG9AgEA3AMAIQwIAAC2BAAgDwAAjAUAIBAAALcEACAUAAC7BAAgFgAAuQQAIBcAALoEACD3AQEA2wMAIf4BQADdAwAh_wFAAN0DACGbAgEA2wMAIbwCAQDbAwAhvQIBANwDACEDAAAAHgAgKAAA5QYAICkAAOwGACATAAAAHgAgBAAAtwUAIAUAALgFACATAAC6BQAgGQAAuwUAIBoAALwFACAbAAC9BQAgIQAA7AYAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhtAIBANwDACHMAgEA2wMAIc0CIAC1BQAhzgIBANwDACHQAgAAtgXQAiLRAiAAtQUAIdICAQDcAwAhEQQAALcFACAFAAC4BQAgEwAAugUAIBkAALsFACAaAAC8BQAgGwAAvQUAIPcBAQDbAwAh_gFAAN0DACH_AUAA3QMAIYsCAQDbAwAhtAIBANwDACHMAgEA2wMAIc0CIAC1BQAhzgIBANwDACHQAgAAtgXQAiLRAiAAtQUAIdICAQDcAwAhCAQGAgUKAw0AEhM3DBgMBBk4Bho5BRs8CAEDAAEBAwABAgMAARIABQgIAAYNABEPAAoQHwERIgQUMg0WJgwXMQ4EBgABBxAFDBQHDQAJAggWBgsYCAIJAAEKGQcCBxoADBsAAg0ACw4cBQEOHQAEAwABDQAQEgAFFCoNAxIABRMADBUADgMNAA8SAAUUKw0BFCwAARQtAAQRMwAUNgAWNAAXNQADBD0ABT4AGz8AAAAAAw0AFy4AGC8AGQAAAAMNABcuABgvABkBAwABAQMAAQMNAB4uAB8vACAAAAADDQAeLgAfLwAgAQMAAQEDAAEDDQAlLgAmLwAnAAAAAw0AJS4AJi8AJwAAAAMNAC0uAC4vAC8AAAADDQAtLgAuLwAvAwgABg8AChClAQEDCAAGDwAKEKsBAQMNADQuADUvADYAAAADDQA0LgA1LwA2AQkAAQEJAAEFDQA7LgA-LwA_gAEAPIEBAD0AAAAAAAUNADsuAD4vAD-AAQA8gQEAPQEGAAEBBgABAw0ARC4ARS8ARgAAAAMNAEQuAEUvAEYAAAMNAEsuAEwvAE0AAAADDQBLLgBMLwBNAxIABRMADBUADgMSAAUTAAwVAA4FDQBSLgBVLwBWgAEAU4EBAFQAAAAAAAUNAFIuAFUvAFaAAQBTgQEAVAIImgIGC5sCCAIIoQIGC6ICCAUNAFsuAF4vAF-AAQBcgQEAXQAAAAAABQ0AWy4AXi8AX4ABAFyBAQBdAgMAARIABQIDAAESAAUFDQBkLgBnLwBogAEAZYEBAGYAAAAAAAUNAGQuAGcvAGiAAQBlgQEAZgESAAUBEgAFBQ0AbS4AcC8AcYABAG6BAQBvAAAAAAAFDQBtLgBwLwBxgAEAboEBAG8CAwABEgAFAgMAARIABQMNAHYuAHcvAHgAAAADDQB2LgB3LwB4HAIBHUABHkIBH0MBIEQBIkYBI0gTJEkUJUsBJk0TJ04VKk8BK1ABLFETMFQWMVUaMlYCM1cCNFgCNVkCNloCN1wCOF4TOV8bOmECO2MTPGQcPWUCPmYCP2cTQGodQWshQmwDQ20DRG4DRW8DRnADR3IDSHQTSXUiSncDS3kTTHojTXsDTnwDT30TUIABJFGBAShSgwEpU4QBKVSHASlViAEpVokBKVeLASlYjQETWY4BKlqQASlbkgETXJMBK12UASlelQEpX5YBE2CZASxhmgEwYpsBBWOcAQVknQEFZZ4BBWafAQVnoQEFaKMBE2mkATFqpwEFa6kBE2yqATJtrAEFbq0BBW-uARNwsQEzcbIBN3KzAQhztAEIdLUBCHW2AQh2twEId7kBCHi7ARN5vAE4er4BCHvAARN8wQE5fcIBCH7DAQh_xAETggHHATqDAcgBQIQBygEGhQHLAQaGAc0BBocBzgEGiAHPAQaJAdEBBooB0wETiwHUAUGMAdYBBo0B2AETjgHZAUKPAdoBBpAB2wEGkQHcAROSAd8BQ5MB4AFHlAHiAQqVAeMBCpYB5gEKlwHnAQqYAegBCpkB6gEKmgHsARObAe0BSJwB7wEKnQHxAROeAfIBSZ8B8wEKoAH0AQqhAfUBE6IB-AFKowH5AU6kAfoBDaUB-wENpgH8AQ2nAf0BDagB_gENqQGAAg2qAYICE6sBgwJPrAGFAg2tAYcCE64BiAJQrwGJAg2wAYoCDbEBiwITsgGOAlGzAY8CV7QBkAIHtQGRAge2AZICB7cBkwIHuAGUAge5AZYCB7oBmAITuwGZAli8AZ0CB70BnwITvgGgAlm_AaMCB8ABpAIHwQGlAhPCAagCWsMBqQJgxAGqAgzFAasCDMYBrAIMxwGtAgzIAa4CDMkBsAIMygGyAhPLAbMCYcwBtQIMzQG3AhPOAbgCYs8BuQIM0AG6AgzRAbsCE9IBvgJj0wG_AmnUAcACDtUBwQIO1gHCAg7XAcMCDtgBxAIO2QHGAg7aAcgCE9sByQJq3AHLAg7dAc0CE94BzgJr3wHPAg7gAdACDuEB0QIT4gHUAmzjAdUCcuQB1gIE5QHXAgTmAdgCBOcB2QIE6AHaAgTpAdwCBOoB3gIT6wHfAnPsAeECBO0B4wIT7gHkAnTvAeUCBPAB5gIE8QHnAhPyAeoCdfMB6wJ5"
};
async function decodeBase64AsWasm(wasmBase64) {
  const { Buffer } = await import("buffer");
  const wasmArray = Buffer.from(wasmBase64, "base64");
  return new WebAssembly.Module(wasmArray);
}
config.compilerWasm = {
  getRuntime: async () => await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.mjs"),
  getQueryCompilerWasmModule: async () => {
    const { wasm } = await import("@prisma/client/runtime/query_compiler_fast_bg.postgresql.wasm-base64.mjs");
    return await decodeBase64AsWasm(wasm);
  },
  importName: "./query_compiler_fast_bg.js"
};
function getPrismaClientClass() {
  return runtime.getPrismaClient(config);
}

// src/generated/prisma/internal/prismaNamespace.ts
import * as runtime2 from "@prisma/client/runtime/client";
var getExtensionContext = runtime2.Extensions.getExtensionContext;
var NullTypes2 = {
  DbNull: runtime2.NullTypes.DbNull,
  JsonNull: runtime2.NullTypes.JsonNull,
  AnyNull: runtime2.NullTypes.AnyNull
};
var TransactionIsolationLevel = runtime2.makeStrictEnum({
  ReadUncommitted: "ReadUncommitted",
  ReadCommitted: "ReadCommitted",
  RepeatableRead: "RepeatableRead",
  Serializable: "Serializable"
});
var defineExtension = runtime2.Extensions.defineExtension;

// src/generated/prisma/enums.ts
var UserRole = {
  PRINCIPAL: "PRINCIPAL",
  HOD: "HOD",
  TEACHER: "TEACHER",
  STUDENT: "STUDENT",
  VOLUNTEER: "VOLUNTEER"
};
var AssessmentType = {
  CLASS_TEST: "CLASS_TEST",
  QUIZ: "QUIZ",
  MIDTERM: "MIDTERM",
  ATTENDANCE: "ATTENDANCE"
};
var PaymentStatus = {
  UNPAID: "UNPAID",
  PAID: "PAID",
  FAILED: "FAILED",
  REFUNDED: "REFUNDED"
};

// src/generated/prisma/client.ts
globalThis["__dirname"] = path.dirname(fileURLToPath(import.meta.url));
var PrismaClient = getPrismaClientClass();

// src/lib/prisma.ts
var connectionString = `${process.env.DATABASE_URL}`;
var adapter = new PrismaPg({ connectionString, max: 10 });
var prisma = new PrismaClient({ adapter });

// src/lib/auth.ts
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
var auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_BASE_URL ?? "http://localhost:5000",
  database: prismaAdapter(prisma, {
    provider: "postgresql"
  }),
  emailAndPassword: {
    enabled: true
  },
  trustedOrigins: [process.env.CLIENT_URL ?? "http://localhost:3000"],
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: true,
        defaultValue: UserRole.STUDENT
      },
      isActive: {
        type: "boolean",
        required: true,
        defaultValue: false
      },
      phone: {
        type: "string",
        required: false
      },
      address: {
        type: "string",
        required: false
      }
    }
  },
  session: {
    expiresIn: 60 * 60 * 60 * 24,
    // 1 day in seconds
    updateAge: 60 * 60 * 60 * 24,
    // 1 day in seconds
    cookieCache: {
      enabled: true,
      maxAge: 60 * 60 * 60 * 24
      // 1 day in seconds
    }
  }
});

// src/errorHelpers/AppError.ts
var AppError = class extends Error {
  statusCode;
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
  }
};
var AppError_default = AppError;

// src/modules/campus/campus.service.ts
import status from "http-status";
var fulfillCampusRegistration = async (registrationId, stripeEventId, stripeSessionData) => {
  const registration = await prisma.campusRegistration.findUnique({ where: { id: registrationId } });
  if (!registration) throw new Error(`Registration ${registrationId} not found`);
  await prisma.$transaction(async (tx) => {
    const campus = await tx.campus.create({
      data: {
        campusName: registration.campusName,
        campusCode: registration.campusCode,
        address: registration.address ?? void 0,
        principalId: registration.createdById
      }
    });
    await tx.payment.create({
      data: {
        amount: registration.amount,
        transactionId: registration.stripeSessionId ?? `direct_${registrationId}`,
        stripeEventId,
        status: PaymentStatus.PAID,
        paymentGatewayData: stripeSessionData,
        campusId: campus.id,
        registrationId: registration.id
      }
    });
    await tx.campusRegistration.delete({ where: { id: registrationId } });
  });
};
var initiateCampusRegistration = async (payload) => {
  const { campusName, campusCode, address, principal } = payload;
  const existing = await prisma.campus.findUnique({ where: { campusCode } });
  if (existing) throw new AppError_default(status.CONFLICT, "Campus code already exists");
  const registered = await auth.api.signUpEmail({
    body: { name: principal.name, email: principal.email, password: principal.password }
  });
  if (!registered.user) throw new AppError_default(status.BAD_REQUEST, "Failed to create principal user");
  await prisma.user.update({
    where: { id: registered.user.id },
    data: { isActive: true, role: UserRole.PRINCIPAL }
  });
  const amount = envVars.CAMPUS_REGISTRATION_FEE;
  try {
    const registration = await prisma.campusRegistration.create({
      data: {
        campusName,
        campusCode,
        address,
        createdById: registered.user.id,
        principalName: principal.name,
        principalEmail: principal.email,
        principalPassword: principal.password,
        amount,
        expiresAt: new Date(Date.now() + 1e3 * 60 * 30)
      }
    });
    await fulfillCampusRegistration(registration.id, `direct_${registration.id}`, { direct: true });
    try {
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        mode: "payment",
        line_items: [{
          price_data: {
            currency: "usd",
            unit_amount: amount * 100,
            product_data: { name: `Campus Registration \u2014 ${campusName}` }
          },
          quantity: 1
        }],
        metadata: { registrationId: registration.id },
        success_url: `${envVars.CLIENT_URL}/campus/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${envVars.CLIENT_URL}/campus/cancel`,
        expires_at: Math.floor(Date.now() / 1e3) + 60 * 30
      });
      return { checkoutUrl: session.url, registrationId: registration.id, fulfilled: true };
    } catch {
      console.warn("Stripe unavailable \u2014 campus already fulfilled directly");
      return { checkoutUrl: null, registrationId: registration.id, fulfilled: true };
    }
  } catch (error) {
    await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
    throw error;
  }
};
var campusService = { initiateCampusRegistration, fulfillCampusRegistration };

// src/modules/webhook/webhook.service.ts
var handleStripeWebhookEvent = async (event) => {
  const existing = await prisma.payment.findFirst({ where: { stripeEventId: event.id } });
  if (existing) {
    console.log(`Event ${event.id} already processed. Skipping.`);
    return { message: `Event ${event.id} already processed.` };
  }
  switch (event.type) {
    case "checkout.session.completed": {
      const session = event.data.object;
      const registrationId = session.metadata?.registrationId;
      if (!registrationId) {
        console.error("Missing registrationId in session metadata");
        return { message: "Missing registrationId in metadata" };
      }
      await campusService.fulfillCampusRegistration(registrationId, event.id, session);
      console.log(`Campus created for registration ${registrationId}`);
      break;
    }
    case "checkout.session.expired": {
      const session = event.data.object;
      const registrationId = session.metadata?.registrationId;
      if (registrationId) {
        const registration = await prisma.campusRegistration.findUnique({ where: { id: registrationId } });
        if (registration) {
          await prisma.user.delete({ where: { id: registration.createdById } }).catch(() => null);
          await prisma.campusRegistration.delete({ where: { id: registrationId } }).catch(() => null);
          console.log(`Registration ${registrationId} expired \u2014 user and registration cleaned up.`);
        }
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const intent = event.data.object;
      console.log(`Payment intent ${intent.id} failed.`);
      break;
    }
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }
  return { message: `Webhook event ${event.id} processed successfully` };
};
var webhookService = { handleStripeWebhookEvent };

// src/modules/webhook/webhook.controller.ts
var stripeWebhook = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, envVars.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error(`Webhook signature error: ${message}`);
    res.status(400).send(`Webhook Error: ${message}`);
    return;
  }
  try {
    const result = await webhookService.handleStripeWebhookEvent(event);
    res.json(result);
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ message: "Webhook processing failed" });
  }
};

// src/routes/index.ts
import { Router as Router8 } from "express";

// src/modules/auth/auth.routes.ts
import { Router } from "express";

// src/modules/auth/auth.controller.ts
import status3 from "http-status";
import { fromNodeHeaders } from "better-auth/node";

// src/modules/auth/auth.service.ts
import status2 from "http-status";

// src/utils/jwt.ts
import jwt from "jsonwebtoken";
var createToken = (payload, secret, { expiresIn }) => {
  const token = jwt.sign(payload, secret, { expiresIn });
  return token;
};
var verifyToken = (token, secret) => {
  try {
    const decoded = jwt.verify(token, secret);
    return {
      success: true,
      data: decoded
    };
  } catch (error) {
    return {
      success: false,
      message: error.message,
      error
    };
  }
};
var decodeToken = (token) => {
  const decoded = jwt.decode(token);
  return decoded;
};
var jwtUtils = {
  createToken,
  verifyToken,
  decodeToken
};

// src/utils/cookie.ts
var setCookie = (res, key, value, options) => {
  res.cookie(key, value, options);
};
var getCookie = (req, key) => {
  return req.cookies[key];
};
var clearCookie = (res, key, options) => {
  res.clearCookie(key, options);
};
var CookieUtils = {
  setCookie,
  getCookie,
  clearCookie
};

// src/utils/token.ts
var getAccessToken = (payload) => {
  return jwtUtils.createToken(
    payload,
    envVars.ACCESS_TOKEN_SECRET,
    { expiresIn: envVars.ACCESS_TOKEN_EXPIRES_IN }
  );
};
var getRefreshToken = (payload) => {
  return jwtUtils.createToken(
    payload,
    envVars.REFRESH_TOKEN_SECRET,
    { expiresIn: envVars.REFRESH_TOKEN_EXPIRES_IN }
  );
};
var setAccessTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "accessToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 1e3
    // 1 day
  });
};
var setRefreshTokenCookie = (res, token) => {
  CookieUtils.setCookie(res, "refreshToken", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7 * 1e3
    // 7 days
  });
};
var setBetterAuthSessionCookie = (res, token) => {
  CookieUtils.setCookie(res, "better-auth.session_token", token, {
    httpOnly: true,
    secure: envVars.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 1e3
    // 1 day
  });
};
var tokenUtils = {
  getAccessToken,
  getRefreshToken,
  setAccessTokenCookie,
  setRefreshTokenCookie,
  setBetterAuthSessionCookie
};

// src/modules/auth/auth.service.ts
var register = async (payload) => {
  const data = await auth.api.signUpEmail({ body: payload });
  if (!data.user) throw new AppError_default(status2.BAD_REQUEST, "Registration failed");
  return data.user;
};
var login = async (payload) => {
  const data = await auth.api.signInEmail({ body: payload });
  if (!data.user) throw new AppError_default(status2.UNAUTHORIZED, "Invalid credentials");
  const jwtPayload = {
    userId: data.user.id,
    email: data.user.email,
    role: data.user.role,
    name: data.user.name
  };
  const accessToken = tokenUtils.getAccessToken(jwtPayload);
  const refreshToken = tokenUtils.getRefreshToken(jwtPayload);
  return { user: data.user, sessionToken: data.token, accessToken, refreshToken };
};
var authService = { register, login };

// src/utils/asyncHandler.ts
var catchAsync = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

// src/utils/sendResponse.ts
var sendResponse = (res, responseData) => {
  const { httpStatusCode, success, message, data, meta } = responseData;
  res.status(httpStatusCode).json({
    success,
    message,
    data,
    meta
  });
};

// src/modules/auth/auth.controller.ts
var register2 = catchAsync(async (req, res) => {
  const user = await authService.register(req.body);
  sendResponse(res, {
    httpStatusCode: status3.CREATED,
    success: true,
    message: "Registered successfully",
    data: user
  });
});
var login2 = catchAsync(async (req, res) => {
  const { user, sessionToken, accessToken, refreshToken } = await authService.login(req.body);
  tokenUtils.setBetterAuthSessionCookie(res, sessionToken);
  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);
  sendResponse(res, {
    httpStatusCode: status3.OK,
    success: true,
    message: "Logged in successfully",
    data: user
  });
});
var logout = catchAsync(async (req, res) => {
  await auth.api.signOut({ headers: fromNodeHeaders(req.headers) });
  res.clearCookie("better-auth.session_token", { path: "/" });
  res.clearCookie("accessToken", { path: "/" });
  res.clearCookie("refreshToken", { path: "/" });
  sendResponse(res, {
    httpStatusCode: status3.OK,
    success: true,
    message: "Logged out successfully"
  });
});
var getMe = catchAsync(async (req, res) => {
  sendResponse(res, {
    httpStatusCode: status3.OK,
    success: true,
    message: "User fetched successfully",
    data: req.user
  });
});

// src/middleware/checkAuth.ts
import status4 from "http-status";
var checkAuth = (...authRoles) => async (req, res, next) => {
  try {
    const sessionToken = CookieUtils.getCookie(req, "better-auth.session_token");
    if (!sessionToken) {
      throw new AppError_default(status4.UNAUTHORIZED, "Unauthorized access! No session token provided.");
    }
    const sessionExists = await prisma.session.findFirst({
      where: {
        token: sessionToken,
        expiresAt: { gt: /* @__PURE__ */ new Date() }
      },
      include: { user: true }
    });
    if (!sessionExists?.user) {
      throw new AppError_default(status4.UNAUTHORIZED, "Unauthorized access! Invalid or expired session.");
    }
    const user = sessionExists.user;
    const sessionLifeTime = sessionExists.expiresAt.getTime() - sessionExists.createdAt.getTime();
    const timeRemaining = sessionExists.expiresAt.getTime() - Date.now();
    const percentRemaining = timeRemaining / sessionLifeTime * 100;
    if (percentRemaining < 20) {
      res.setHeader("X-Session-Refresh", "true");
      res.setHeader("X-Session-Expires-At", sessionExists.expiresAt.toISOString());
      res.setHeader("X-Time-Remaining", timeRemaining.toString());
    }
    if (!user.isActive) {
      console.log(user);
      throw new AppError_default(status4.UNAUTHORIZED, "Unauthorized access! User is not active.");
    }
    if (authRoles.length > 0 && !authRoles.includes(user.role)) {
      throw new AppError_default(status4.FORBIDDEN, "Forbidden! You do not have permission to access this resource.");
    }
    const accessToken = CookieUtils.getCookie(req, "accessToken");
    if (!accessToken) {
      throw new AppError_default(status4.UNAUTHORIZED, "Unauthorized access! No access token provided.");
    }
    const verifiedToken = jwtUtils.verifyToken(accessToken, envVars.ACCESS_TOKEN_SECRET);
    if (!verifiedToken.success) {
      throw new AppError_default(status4.UNAUTHORIZED, "Unauthorized access! Invalid access token.");
    }
    if (authRoles.length > 0 && !authRoles.includes(verifiedToken.data.role)) {
      throw new AppError_default(status4.FORBIDDEN, "Forbidden! You do not have permission to access this resource.");
    }
    req.user = {
      userId: user.id,
      role: user.role,
      email: user.email
    };
    next();
  } catch (error) {
    next(error);
  }
};

// src/modules/auth/auth.routes.ts
var router = Router();
router.post("/login", login2);
router.post("/logout", checkAuth(), logout);
router.get("/me", checkAuth(), getMe);
var auth_routes_default = router;

// src/modules/campus/campus.routes.ts
import { Router as Router2 } from "express";

// src/modules/campus/campus.controller.ts
import status5 from "http-status";
var initiateCampusRegistration2 = catchAsync(async (req, res) => {
  const { campusName, campusCode, address, principal } = req.body;
  if (!campusName || !campusCode) throw new AppError_default(status5.BAD_REQUEST, "campusName and campusCode are required");
  if (!principal?.name || !principal?.email || !principal?.password) throw new AppError_default(status5.BAD_REQUEST, "principal name, email and password are required");
  const data = await campusService.initiateCampusRegistration(req.body);
  sendResponse(res, {
    httpStatusCode: status5.CREATED,
    success: true,
    message: "Campus registration initiated. Complete payment to activate.",
    data
  });
});

// src/modules/campus/campus.routes.ts
var router2 = Router2();
router2.post("/initiate", initiateCampusRegistration2);
var campus_routes_default = router2;

// src/modules/principal/principal.routes.ts
import { Router as Router3 } from "express";

// src/modules/department/department.service.ts
import status6 from "http-status";
var getPrincipalCampus = async (principalId) => {
  const campus = await prisma.campus.findUnique({ where: { principalId } });
  if (!campus) throw new AppError_default(status6.NOT_FOUND, "No campus found for this principal");
  return campus;
};
var assertCampusDeptOwnership = async (principalId, campusDepartmentId) => {
  const campus = await getPrincipalCampus(principalId);
  const campusDept = await prisma.campusDepartment.findFirst({
    where: { id: campusDepartmentId, campusId: campus.id }
  });
  if (!campusDept) throw new AppError_default(status6.NOT_FOUND, "Department not found in your campus");
  return { campus, campusDept };
};
var getAllDepartments = async () => {
  return prisma.department.findMany({ orderBy: { name: "asc" } });
};
var addDepartmentToCampus = async (principalId, departmentId) => {
  const campus = await getPrincipalCampus(principalId);
  const dept = await prisma.department.findUnique({ where: { id: departmentId } });
  if (!dept) throw new AppError_default(status6.NOT_FOUND, "Department not found");
  const existing = await prisma.campusDepartment.findUnique({
    where: { campusId_departmentId: { campusId: campus.id, departmentId } }
  });
  if (existing) throw new AppError_default(status6.CONFLICT, "Department already added to this campus");
  return prisma.campusDepartment.create({
    data: { campusId: campus.id, departmentId },
    include: { department: true }
  });
};
var getCampusDepartments = async (userId, role) => {
  let campusId;
  if (role === UserRole.PRINCIPAL) {
    const campus = await getPrincipalCampus(userId);
    campusId = campus.id;
  } else {
    const teacher = await prisma.teacher.findFirst({
      where: { userId },
      include: { campusDepartment: true }
    });
    if (!teacher) throw new AppError_default(status6.NOT_FOUND, "No campus department found for this user");
    campusId = teacher.campusDepartment.campusId;
  }
  return prisma.campusDepartment.findMany({
    where: { campusId },
    include: {
      department: true,
      hod: { select: { id: true, name: true, email: true } }
    }
  });
};
var removeDepartmentFromCampus = async (principalId, campusDepartmentId) => {
  await assertCampusDeptOwnership(principalId, campusDepartmentId);
  return prisma.campusDepartment.delete({ where: { id: campusDepartmentId } });
};
var assignHOD = async (principalId, campusDepartmentId, hodPayload) => {
  await assertCampusDeptOwnership(principalId, campusDepartmentId);
  const registered = await auth.api.signUpEmail({ body: hodPayload });
  if (!registered.user) throw new AppError_default(status6.BAD_REQUEST, "Failed to create HOD user");
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: registered.user.id },
        data: { role: UserRole.HOD, isActive: true }
      });
      await tx.teacher.create({
        data: { userId: registered.user.id, campusDepartmentId }
      });
      return tx.campusDepartment.update({
        where: { id: campusDepartmentId },
        data: { hodId: registered.user.id },
        include: { department: true, hod: { select: { id: true, name: true, email: true, role: true } } }
      });
    });
  } catch (error) {
    await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
    throw error;
  }
};
var changeHOD = async (principalId, campusDepartmentId, newHodId) => {
  await assertCampusDeptOwnership(principalId, campusDepartmentId);
  const user = await prisma.user.findUnique({ where: { id: newHodId } });
  if (!user) throw new AppError_default(status6.NOT_FOUND, "User not found");
  if (user.role !== UserRole.HOD && user.role !== UserRole.TEACHER) {
    throw new AppError_default(status6.BAD_REQUEST, "User must be a HOD or TEACHER to be assigned as HOD");
  }
  return prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: newHodId }, data: { role: UserRole.HOD } });
    return tx.campusDepartment.update({
      where: { id: campusDepartmentId },
      data: { hodId: newHodId },
      include: { department: true, hod: { select: { id: true, name: true, email: true, role: true } } }
    });
  });
};
var removeHOD = async (principalId, campusDepartmentId) => {
  await assertCampusDeptOwnership(principalId, campusDepartmentId);
  return prisma.campusDepartment.update({
    where: { id: campusDepartmentId },
    data: { hodId: null },
    include: { department: true }
  });
};
var departmentService = {
  getAllDepartments,
  addDepartmentToCampus,
  getCampusDepartments,
  removeDepartmentFromCampus,
  assignHOD,
  changeHOD,
  removeHOD
};

// src/modules/department/department.controller.ts
import status7 from "http-status";
var createDepartmentsBulk = catchAsync(async (req, res) => {
  const departments = req.body;
  if (!Array.isArray(departments) || departments.length === 0)
    throw new AppError_default(status7.BAD_REQUEST, "Provide an array of departments");
  const data = await prisma.department.createMany({
    data: departments.map((d) => ({
      name: d.name,
      shortName: d.shortName
    })),
    skipDuplicates: true
  });
  sendResponse(res, { httpStatusCode: status7.CREATED, success: true, message: `${data.count} departments seeded`, data });
});
var createDepartment = catchAsync(async (req, res) => {
  const { name, shortName } = req.body;
  if (!name || !shortName) throw new AppError_default(status7.BAD_REQUEST, "name and shortName are required");
  const existing = await prisma.department.findUnique({ where: { shortName } });
  if (existing) throw new AppError_default(status7.CONFLICT, "Department with this shortName already exists");
  const data = await prisma.department.create({ data: { name, shortName } });
  sendResponse(res, { httpStatusCode: status7.CREATED, success: true, message: "Department created", data });
});
var getAllDepartments2 = catchAsync(async (_req, res) => {
  const data = await departmentService.getAllDepartments();
  sendResponse(res, { httpStatusCode: status7.OK, success: true, message: "Departments fetched", data });
});
var addDepartmentToCampus2 = catchAsync(async (req, res) => {
  const { departmentId } = req.body;
  if (!departmentId) throw new AppError_default(status7.BAD_REQUEST, "departmentId is required");
  const data = await departmentService.addDepartmentToCampus(req.user.userId, departmentId);
  sendResponse(res, { httpStatusCode: status7.CREATED, success: true, message: "Department added to campus", data });
});
var getCampusDepartments2 = catchAsync(async (req, res) => {
  const data = await departmentService.getCampusDepartments(req.user.userId, req.user.role);
  sendResponse(res, { httpStatusCode: status7.OK, success: true, message: "Campus departments fetched", data });
});
var removeDepartmentFromCampus2 = catchAsync(async (req, res) => {
  await departmentService.removeDepartmentFromCampus(req.user.userId, req.params.id);
  sendResponse(res, { httpStatusCode: status7.OK, success: true, message: "Department removed from campus" });
});
var assignHOD2 = catchAsync(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw new AppError_default(status7.BAD_REQUEST, "name, email and password are required");
  const data = await departmentService.assignHOD(req.user.userId, req.params.id, { name, email, password });
  sendResponse(res, { httpStatusCode: status7.OK, success: true, message: "HOD assigned", data });
});
var changeHOD2 = catchAsync(async (req, res) => {
  const { hodId } = req.body;
  if (!hodId) throw new AppError_default(status7.BAD_REQUEST, "hodId is required");
  const data = await departmentService.changeHOD(req.user.userId, req.params.id, hodId);
  sendResponse(res, { httpStatusCode: status7.OK, success: true, message: "HOD changed", data });
});
var removeHOD2 = catchAsync(async (req, res) => {
  const data = await departmentService.removeHOD(req.user.userId, req.params.id);
  sendResponse(res, { httpStatusCode: status7.OK, success: true, message: "HOD removed", data });
});

// src/modules/teacher/teacher.service.ts
import status8 from "http-status";
var getPrincipalCampus2 = async (principalId) => {
  const campus = await prisma.campus.findUnique({ where: { principalId } });
  if (!campus) throw new AppError_default(status8.NOT_FOUND, "No campus found for this principal");
  return campus;
};
var assertTeacherOwnership = async (principalId, teacherId) => {
  const campus = await getPrincipalCampus2(principalId);
  const teacher = await prisma.teacher.findFirst({
    where: { id: teacherId, campusDepartment: { campusId: campus.id } },
    include: { user: { select: { id: true, name: true, email: true, role: true, isActive: true } }, campusDepartment: { include: { department: true } } }
  });
  if (!teacher) throw new AppError_default(status8.NOT_FOUND, "Teacher not found in your campus");
  return teacher;
};
var createTeacher = async (principalId, payload) => {
  const campus = await getPrincipalCampus2(principalId);
  const campusDept = await prisma.campusDepartment.findFirst({
    where: { id: payload.campusDepartmentId, campusId: campus.id }
  });
  if (!campusDept) throw new AppError_default(status8.NOT_FOUND, "Department not found in your campus");
  const registered = await auth.api.signUpEmail({ body: { name: payload.name, email: payload.email, password: payload.password } });
  if (!registered.user) throw new AppError_default(status8.BAD_REQUEST, "Failed to create teacher user");
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.user.update({ where: { id: registered.user.id }, data: { role: UserRole.TEACHER, isActive: true } });
      return tx.teacher.create({
        data: {
          userId: registered.user.id,
          campusDepartmentId: payload.campusDepartmentId,
          employeeId: payload.employeeId,
          designation: payload.designation,
          qualification: payload.qualification
        },
        include: { user: { select: { id: true, name: true, email: true, role: true } }, campusDepartment: { include: { department: true } } }
      });
    });
  } catch (error) {
    await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
    throw error;
  }
};
var getTeachers = async (userId, role) => {
  let campusId;
  if (role === UserRole.PRINCIPAL) {
    const campus = await getPrincipalCampus2(userId);
    campusId = campus.id;
  } else {
    const teacher = await prisma.teacher.findFirst({
      where: { userId },
      include: { campusDepartment: true }
    });
    if (!teacher) throw new AppError_default(status8.NOT_FOUND, "No campus department found for this user");
    campusId = teacher.campusDepartment.campusId;
  }
  return prisma.teacher.findMany({
    where: { campusDepartment: { campusId } },
    include: {
      user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
      campusDepartment: { include: { department: true } }
    }
  });
};
var updateTeacher = async (principalId, teacherId, payload) => {
  const teacher = await assertTeacherOwnership(principalId, teacherId);
  if (payload.campusDepartmentId) {
    const campus = await getPrincipalCampus2(principalId);
    const campusDept = await prisma.campusDepartment.findFirst({
      where: { id: payload.campusDepartmentId, campusId: campus.id }
    });
    if (!campusDept) throw new AppError_default(status8.NOT_FOUND, "Target department not found in your campus");
  }
  return prisma.teacher.update({
    where: { id: teacher.id },
    data: payload,
    include: { user: { select: { id: true, name: true, email: true, role: true } }, campusDepartment: { include: { department: true } } }
  });
};
var deleteTeacher = async (principalId, teacherId) => {
  const teacher = await assertTeacherOwnership(principalId, teacherId);
  await prisma.$transaction(async (tx) => {
    await tx.teacher.delete({ where: { id: teacher.id } });
    await tx.user.delete({ where: { id: teacher.userId } });
  });
};
var teacherService = { createTeacher, getTeachers, updateTeacher, deleteTeacher };

// src/modules/teacher/teacher.controller.ts
import status9 from "http-status";
var createTeacher2 = catchAsync(async (req, res) => {
  const { name, email, password, campusDepartmentId } = req.body;
  if (!name || !email || !password || !campusDepartmentId) {
    throw new AppError_default(status9.BAD_REQUEST, "name, email, password and campusDepartmentId are required");
  }
  const data = await teacherService.createTeacher(req.user.userId, req.body);
  sendResponse(res, { httpStatusCode: status9.CREATED, success: true, message: "Teacher created", data });
});
var getTeachers2 = catchAsync(async (req, res) => {
  const data = await teacherService.getTeachers(req.user.userId, req.user.role);
  sendResponse(res, { httpStatusCode: status9.OK, success: true, message: "Teachers fetched", data });
});
var updateTeacher2 = catchAsync(async (req, res) => {
  const data = await teacherService.updateTeacher(req.user.userId, req.params.id, req.body);
  sendResponse(res, { httpStatusCode: status9.OK, success: true, message: "Teacher updated", data });
});
var deleteTeacher2 = catchAsync(async (req, res) => {
  await teacherService.deleteTeacher(req.user.userId, req.params.id);
  sendResponse(res, { httpStatusCode: status9.OK, success: true, message: "Teacher deleted" });
});

// src/modules/student/student.service.ts
import status10 from "http-status";
var studentInclude = {
  user: { select: { id: true, name: true, email: true, role: true, isActive: true } },
  campusDepartment: { include: { department: true } }
};
var resolveCampusId = async (userId, role) => {
  if (role === UserRole.PRINCIPAL) {
    const campus = await prisma.campus.findUnique({ where: { principalId: userId } });
    if (!campus) throw new AppError_default(status10.NOT_FOUND, "No campus found for this principal");
    return campus.id;
  }
  const teacher = await prisma.teacher.findFirst({
    where: { userId },
    include: { campusDepartment: true }
  });
  if (!teacher) throw new AppError_default(status10.NOT_FOUND, "No campus department found for this user");
  return teacher.campusDepartment.campusId;
};
var assertCampusDeptOwnership2 = async (userId, role, campusDepartmentId) => {
  const campusId = await resolveCampusId(userId, role);
  const campusDept = await prisma.campusDepartment.findFirst({
    where: { id: campusDepartmentId, campusId }
  });
  if (!campusDept) throw new AppError_default(status10.NOT_FOUND, "Department not found in your campus");
  return campusDept;
};
var assertStudentOwnership = async (userId, role, studentId) => {
  const campusId = await resolveCampusId(userId, role);
  const student = await prisma.student.findFirst({
    where: { id: studentId, campusDepartment: { campusId } },
    include: studentInclude
  });
  if (!student) throw new AppError_default(status10.NOT_FOUND, "Student not found in your campus");
  return student;
};
var createStudent = async (userId, role, payload) => {
  await assertCampusDeptOwnership2(userId, role, payload.campusDepartmentId);
  const registered = await auth.api.signUpEmail({
    body: { name: payload.name, email: payload.email, password: payload.password }
  });
  if (!registered.user) throw new AppError_default(status10.BAD_REQUEST, "Failed to create student user");
  try {
    return await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: registered.user.id },
        data: { role: UserRole.STUDENT, isActive: true }
      });
      return tx.student.create({
        data: {
          userId: registered.user.id,
          campusDepartmentId: payload.campusDepartmentId,
          roll: payload.roll,
          session: payload.session,
          semester: payload.semester,
          shift: payload.shift
        },
        include: studentInclude
      });
    });
  } catch (error) {
    await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
    throw error;
  }
};
var getStudents = async (userId, role, semester) => {
  const campusId = await resolveCampusId(userId, role);
  return prisma.student.findMany({
    where: { campusDepartment: { campusId }, ...semester ? { semester } : {} },
    include: studentInclude,
    orderBy: { roll: "asc" }
  });
};
var updateStudent = async (userId, role, studentId, payload) => {
  const student = await assertStudentOwnership(userId, role, studentId);
  if (payload.campusDepartmentId) {
    await assertCampusDeptOwnership2(userId, role, payload.campusDepartmentId);
  }
  const updateData = Object.fromEntries(
    Object.entries({ roll: payload.roll, session: payload.session, semester: payload.semester, shift: payload.shift, campusDepartmentId: payload.campusDepartmentId }).filter(([, v]) => v !== void 0)
  );
  return prisma.student.update({
    where: { id: student.id },
    data: updateData,
    include: studentInclude
  });
};
var deleteStudent = async (userId, role, studentId) => {
  const student = await assertStudentOwnership(userId, role, studentId);
  await prisma.$transaction(async (tx) => {
    await tx.student.delete({ where: { id: student.id } });
    await tx.user.delete({ where: { id: student.userId } });
  });
};
var studentService = { createStudent, getStudents, updateStudent, deleteStudent };

// src/modules/student/student.controller.ts
import status11 from "http-status";
var createStudent2 = catchAsync(async (req, res) => {
  const { name, email, password, campusDepartmentId, roll, rollNumber, session, semester, shift } = req.body;
  const resolvedRoll = roll || rollNumber;
  const resolvedSession = session || `${(/* @__PURE__ */ new Date()).getFullYear()}`;
  const resolvedShift = shift || "MORNING";
  if (!name || !email || !password || !campusDepartmentId || !resolvedRoll || !semester) {
    throw new AppError_default(status11.BAD_REQUEST, "name, email, password, campusDepartmentId, roll and semester are required");
  }
  const data = await studentService.createStudent(req.user.userId, req.user.role, {
    ...req.body,
    roll: resolvedRoll,
    session: resolvedSession,
    shift: resolvedShift
  });
  sendResponse(res, { httpStatusCode: status11.CREATED, success: true, message: "Student created", data });
});
var getStudents2 = catchAsync(async (req, res) => {
  const semester = req.query.semester ? Number(req.query.semester) : void 0;
  const data = await studentService.getStudents(req.user.userId, req.user.role, semester);
  sendResponse(res, { httpStatusCode: status11.OK, success: true, message: "Students fetched", data });
});
var updateStudent2 = catchAsync(async (req, res) => {
  const { roll, rollNumber, session, semester, shift, campusDepartmentId } = req.body;
  const data = await studentService.updateStudent(
    req.user.userId,
    req.user.role,
    req.params.id,
    {
      roll: roll || rollNumber,
      session,
      semester,
      shift,
      campusDepartmentId
    }
  );
  sendResponse(res, { httpStatusCode: status11.OK, success: true, message: "Student updated", data });
});
var deleteStudent2 = catchAsync(async (req, res) => {
  await studentService.deleteStudent(req.user.userId, req.user.role, req.params.id);
  sendResponse(res, { httpStatusCode: status11.OK, success: true, message: "Student deleted" });
});

// src/modules/principal/principal.routes.ts
var router3 = Router3();
router3.use(checkAuth(UserRole.PRINCIPAL));
router3.post("/departments", addDepartmentToCampus2);
router3.get("/departments", getCampusDepartments2);
router3.delete("/departments/:id", removeDepartmentFromCampus2);
router3.post("/departments/:id/hod", assignHOD2);
router3.patch("/departments/:id/hod", changeHOD2);
router3.delete("/departments/:id/hod", removeHOD2);
router3.post("/teachers", createTeacher2);
router3.get("/teachers", getTeachers2);
router3.patch("/teachers/:id", updateTeacher2);
router3.delete("/teachers/:id", deleteTeacher2);
router3.post("/students", createStudent2);
router3.get("/students", getStudents2);
router3.patch("/students/:id", updateStudent2);
router3.delete("/students/:id", deleteStudent2);
var principal_routes_default = router3;

// src/modules/user/user.routes.ts
import { Router as Router4 } from "express";

// src/modules/user/user.service.ts
import status12 from "http-status";
var addUser = async (payload, requesterId, requesterRole) => {
  const { name, email, password, role, campusDepartmentId, ...profile } = payload;
  const allowed = {
    [UserRole.PRINCIPAL]: [UserRole.HOD, UserRole.TEACHER],
    [UserRole.HOD]: [UserRole.TEACHER, UserRole.STUDENT],
    [UserRole.TEACHER]: [UserRole.STUDENT]
  };
  if (!allowed[requesterRole]?.includes(role)) {
    throw new AppError_default(status12.FORBIDDEN, `${requesterRole} cannot add ${role}`);
  }
  if (role === UserRole.STUDENT) {
    const { roll, session, semester, shift } = profile;
    if (!roll || !session || !semester || !shift) {
      throw new AppError_default(status12.BAD_REQUEST, "roll, session, semester and shift are required for student");
    }
  }
  const registered = await auth.api.signUpEmail({ body: { name, email, password } });
  if (!registered.user) throw new AppError_default(status12.BAD_REQUEST, "Failed to create user");
  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.update({
        where: { id: registered.user.id },
        data: { role, isActive: true }
      });
      if (role === UserRole.STUDENT) {
        const student = await tx.student.create({
          data: {
            userId: user.id,
            campusDepartmentId,
            roll: profile.roll,
            session: profile.session,
            semester: profile.semester,
            shift: profile.shift
          }
        });
        return { user, student };
      } else {
        const teacher = await tx.teacher.create({
          data: {
            userId: user.id,
            campusDepartmentId,
            employeeId: profile.employeeId,
            designation: profile.designation,
            qualification: profile.qualification
          }
        });
        return { user, teacher };
      }
    });
    return result;
  } catch (error) {
    await prisma.user.delete({ where: { id: registered.user.id } }).catch(() => null);
    throw error;
  }
};
var userService = { addUser };

// src/modules/user/user.controller.ts
import status13 from "http-status";
var addUser2 = catchAsync(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password || !role) {
    throw new AppError_default(status13.BAD_REQUEST, "name, email, password and role are required");
  }
  if (!req.body.campusDepartmentId) {
    throw new AppError_default(status13.BAD_REQUEST, "campusDepartmentId is required");
  }
  const data = await userService.addUser(req.body, req.user.userId, req.user.role);
  sendResponse(res, {
    httpStatusCode: status13.CREATED,
    success: true,
    message: `${role} added successfully`,
    data
  });
});

// src/modules/user/user.routes.ts
var router4 = Router4();
router4.post("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), addUser2);
var user_routes_default = router4;

// src/modules/dashboard/dashboard.routes.ts
import { Router as Router5 } from "express";

// src/modules/dashboard/dashboard.service.ts
import status14 from "http-status";
var getPrincipalCampus3 = async (userId) => {
  const campus = await prisma.campus.findUnique({
    where: { principalId: userId },
    include: { departments: { include: { department: true } } }
  });
  return campus;
};
var getTeacherCampusDept = async (userId) => {
  const teacher = await prisma.teacher.findFirst({
    where: { userId },
    include: { campusDepartment: { include: { department: true, campus: true } } }
  });
  if (!teacher) throw new AppError_default(status14.NOT_FOUND, "No campus department found for this user");
  return teacher;
};
var getPrincipalDashboard = async (userId) => {
  const campus = await getPrincipalCampus3(userId);
  if (!campus) {
    const registration = await prisma.campusRegistration.findFirst({
      where: { createdById: userId }
    });
    return {
      pendingPayment: true,
      registration: registration ? {
        campusName: registration.campusName,
        campusCode: registration.campusCode,
        amount: registration.amount,
        expiresAt: registration.expiresAt
      } : null
    };
  }
  const campusId = campus.id;
  const [departments, teachers, students, pendingMarks] = await Promise.all([
    prisma.campusDepartment.count({ where: { campusId } }),
    prisma.teacher.count({ where: { campusDepartment: { campusId } } }),
    prisma.student.count({ where: { campusDepartment: { campusId } } }),
    prisma.mark.count({ where: { campusDepartment: { campusId }, status: "PENDING" } })
  ]);
  const departmentBreakdown = await prisma.campusDepartment.findMany({
    where: { campusId },
    include: {
      department: true,
      hod: { select: { id: true, name: true, email: true } },
      _count: { select: { teachers: true, students: true } }
    }
  });
  return {
    campus: { id: campus.id, name: campus.campusName, code: campus.campusCode, address: campus.address },
    stats: { departments, teachers, students, pendingMarks },
    departmentBreakdown
  };
};
var getHODDashboard = async (userId) => {
  const campusDept = await prisma.campusDepartment.findFirst({
    where: { hodId: userId },
    include: { department: true, campus: true }
  });
  if (!campusDept) throw new AppError_default(status14.NOT_FOUND, "No department found for this HOD");
  const campusDepartmentId = campusDept.id;
  const [teachers, students, subjects, pendingMarks] = await Promise.all([
    prisma.teacher.count({ where: { campusDepartmentId } }),
    prisma.student.count({ where: { campusDepartmentId } }),
    prisma.subject.count({ where: { campusDepartmentId } }),
    prisma.mark.count({ where: { campusDepartmentId, status: "PENDING" } })
  ]);
  const semesterBreakdown = await prisma.student.groupBy({
    by: ["semester"],
    where: { campusDepartmentId },
    _count: { id: true },
    orderBy: { semester: "asc" }
  });
  return {
    campus: { id: campusDept.campus.id, name: campusDept.campus.campusName },
    department: { id: campusDept.department.id, name: campusDept.department.name, shortName: campusDept.department.shortName },
    stats: { teachers, students, subjects, pendingMarks },
    semesterBreakdown: semesterBreakdown.map((s) => ({ semester: s.semester, students: s._count.id }))
  };
};
var getTeacherDashboard = async (userId) => {
  const teacher = await getTeacherCampusDept(userId);
  const campusDepartmentId = teacher.campusDepartmentId;
  const [students, subjects, submittedMarks, pendingMarks] = await Promise.all([
    prisma.student.count({ where: { campusDepartmentId } }),
    prisma.subject.count({ where: { campusDepartmentId } }),
    prisma.mark.count({ where: { campusDepartmentId, submittedById: userId } }),
    prisma.mark.count({ where: { campusDepartmentId, submittedById: userId, status: "PENDING" } })
  ]);
  return {
    campus: { id: teacher.campusDepartment.campus.id, name: teacher.campusDepartment.campus.campusName },
    department: { id: teacher.campusDepartment.department.id, name: teacher.campusDepartment.department.name },
    teacher: { id: teacher.id, employeeId: teacher.employeeId, designation: teacher.designation },
    stats: { students, subjects, submittedMarks, pendingMarks }
  };
};
var getStudentDashboard = async (userId) => {
  const student = await prisma.student.findFirst({
    where: { userId },
    include: { campusDepartment: { include: { department: true, campus: true } } }
  });
  if (!student) throw new AppError_default(status14.NOT_FOUND, "No student record found");
  const marks = await prisma.mark.findMany({
    where: { studentId: student.id },
    include: { subject: { select: { id: true, name: true, code: true, maxMarks: true } } },
    orderBy: { submittedAt: "desc" }
  });
  const totalMarks = marks.reduce((sum, m) => sum + m.marksObtained, 0);
  const totalMax = marks.reduce((sum, m) => sum + m.subject.maxMarks, 0);
  const percentage = totalMax > 0 ? parseFloat((totalMarks / totalMax * 100).toFixed(2)) : 0;
  return {
    campus: { id: student.campusDepartment.campus.id, name: student.campusDepartment.campus.campusName },
    department: { id: student.campusDepartment.department.id, name: student.campusDepartment.department.name },
    student: { id: student.id, roll: student.roll, session: student.session, semester: student.semester, shift: student.shift },
    stats: { totalAssessments: marks.length, totalMarks, totalMax, percentage },
    marks
  };
};
var getDashboard = async (userId, role) => {
  switch (role) {
    case UserRole.PRINCIPAL:
      return getPrincipalDashboard(userId);
    case UserRole.HOD:
      return getHODDashboard(userId);
    case UserRole.TEACHER:
      return getTeacherDashboard(userId);
    case UserRole.STUDENT:
      return getStudentDashboard(userId);
    default:
      throw new AppError_default(status14.FORBIDDEN, "No dashboard available for this role");
  }
};

// src/modules/dashboard/dashboard.controller.ts
var dashboard = catchAsync(async (req, res) => {
  const data = await getDashboard(req.user.userId, req.user.role);
  sendResponse(res, { httpStatusCode: 200, success: true, message: "Dashboard fetched", data });
});

// src/modules/dashboard/dashboard.routes.ts
var router5 = Router5();
router5.get(
  "/",
  checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER, UserRole.STUDENT),
  dashboard
);
var dashboard_routes_default = router5;

// src/modules/subject/subject.routes.ts
import { Router as Router6 } from "express";

// src/modules/subject/subject.service.ts
import status15 from "http-status";
var resolveCampusId2 = async (userId, role) => {
  if (role === UserRole.PRINCIPAL) {
    const campus = await prisma.campus.findUnique({ where: { principalId: userId } });
    if (!campus) throw new AppError_default(status15.NOT_FOUND, "No campus found");
    return campus.id;
  }
  const teacher = await prisma.teacher.findFirst({ where: { userId }, include: { campusDepartment: true } });
  if (!teacher) throw new AppError_default(status15.NOT_FOUND, "No campus found for this user");
  return teacher.campusDepartment.campusId;
};
var assertCampusDeptOwnership3 = async (userId, role, campusDepartmentId) => {
  const campusId = await resolveCampusId2(userId, role);
  const dept = await prisma.campusDepartment.findFirst({ where: { id: campusDepartmentId, campusId } });
  if (!dept) throw new AppError_default(status15.NOT_FOUND, "Department not found in your campus");
  return dept;
};
var subjectInclude = { campusDepartment: { include: { department: true } } };
var createSubject = async (userId, role, payload) => {
  await assertCampusDeptOwnership3(userId, role, payload.campusDepartmentId);
  return prisma.subject.create({ data: payload, include: subjectInclude });
};
var getSubjects = async (userId, role, semester) => {
  const campusId = await resolveCampusId2(userId, role);
  return prisma.subject.findMany({
    where: { campusDepartment: { campusId }, ...semester ? { semester } : {} },
    include: subjectInclude,
    orderBy: [{ semester: "asc" }, { name: "asc" }]
  });
};
var updateSubject = async (userId, role, subjectId, payload) => {
  const campusId = await resolveCampusId2(userId, role);
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, campusDepartment: { campusId } } });
  if (!subject) throw new AppError_default(status15.NOT_FOUND, "Subject not found");
  return prisma.subject.update({ where: { id: subjectId }, data: payload, include: subjectInclude });
};
var deleteSubject = async (userId, role, subjectId) => {
  const campusId = await resolveCampusId2(userId, role);
  const subject = await prisma.subject.findFirst({ where: { id: subjectId, campusDepartment: { campusId } } });
  if (!subject) throw new AppError_default(status15.NOT_FOUND, "Subject not found");
  await prisma.subject.delete({ where: { id: subjectId } });
};
var subjectService = { createSubject, getSubjects, updateSubject, deleteSubject };

// src/modules/subject/subject.controller.ts
import status16 from "http-status";
var createSubject2 = catchAsync(async (req, res) => {
  const { campusDepartmentId, name, code, semester, maxMarks, credit } = req.body;
  if (!campusDepartmentId || !name || !code || !semester || !maxMarks || !credit) {
    throw new AppError_default(status16.BAD_REQUEST, "campusDepartmentId, name, code, semester, maxMarks and credit are required");
  }
  const data = await subjectService.createSubject(req.user.userId, req.user.role, {
    campusDepartmentId,
    name,
    code,
    semester: Number(semester),
    maxMarks: Number(maxMarks),
    credit
  });
  sendResponse(res, { httpStatusCode: status16.CREATED, success: true, message: "Subject created", data });
});
var getSubjects2 = catchAsync(async (req, res) => {
  const semester = req.query.semester ? Number(req.query.semester) : void 0;
  const data = await subjectService.getSubjects(req.user.userId, req.user.role, semester);
  sendResponse(res, { httpStatusCode: status16.OK, success: true, message: "Subjects fetched", data });
});
var updateSubject2 = catchAsync(async (req, res) => {
  const { name, code, semester, maxMarks, credit } = req.body;
  const data = await subjectService.updateSubject(req.user.userId, req.user.role, req.params.id, {
    ...name && { name },
    ...code && { code },
    ...semester && { semester: Number(semester) },
    ...maxMarks && { maxMarks: Number(maxMarks) },
    ...credit && { credit }
  });
  sendResponse(res, { httpStatusCode: status16.OK, success: true, message: "Subject updated", data });
});
var deleteSubject2 = catchAsync(async (req, res) => {
  await subjectService.deleteSubject(req.user.userId, req.user.role, req.params.id);
  sendResponse(res, { httpStatusCode: status16.OK, success: true, message: "Subject deleted" });
});

// src/modules/subject/subject.routes.ts
var router6 = Router6();
router6.post("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), createSubject2);
router6.get("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER, UserRole.STUDENT), getSubjects2);
router6.patch("/:id", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), updateSubject2);
router6.delete("/:id", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), deleteSubject2);
var subject_routes_default = router6;

// src/modules/mark/mark.routes.ts
import { Router as Router7 } from "express";

// src/modules/mark/mark.service.ts
import status17 from "http-status";
var resolveCampusId3 = async (userId, role) => {
  if (role === UserRole.PRINCIPAL) {
    const campus = await prisma.campus.findUnique({ where: { principalId: userId } });
    if (!campus) throw new AppError_default(status17.NOT_FOUND, "No campus found");
    return campus.id;
  }
  const teacher = await prisma.teacher.findFirst({ where: { userId }, include: { campusDepartment: true } });
  if (!teacher) throw new AppError_default(status17.NOT_FOUND, "No campus found for this user");
  return teacher.campusDepartment.campusId;
};
var markInclude = {
  student: {
    select: {
      id: true,
      roll: true,
      semester: true,
      user: { select: { id: true, name: true, email: true } }
    }
  },
  subject: { select: { id: true, name: true, code: true, semester: true, maxMarks: true } }
};
var getMarks = async (userId, role, subjectId, semester) => {
  const campusId = await resolveCampusId3(userId, role);
  return prisma.mark.findMany({
    where: {
      campusDepartment: { campusId },
      ...subjectId ? { subjectId } : {},
      ...semester ? { subject: { semester } } : {}
    },
    include: markInclude,
    orderBy: { submittedAt: "desc" }
  });
};
var bulkUpsertMarks = async (userId, role, payload) => {
  const campusId = await resolveCampusId3(userId, role);
  const subject = await prisma.subject.findFirst({
    where: { id: payload.subjectId, campusDepartment: { campusId } }
  });
  if (!subject) throw new AppError_default(status17.NOT_FOUND, "Subject not found in your campus");
  const studentIds = payload.marks.map((m) => m.studentId);
  const students = await prisma.student.findMany({
    where: { id: { in: studentIds }, campusDepartment: { campusId } }
  });
  if (students.length !== studentIds.length) {
    throw new AppError_default(status17.BAD_REQUEST, "One or more students not found in your campus");
  }
  const results = await prisma.$transaction(
    payload.marks.map(
      (m) => prisma.mark.upsert({
        where: {
          studentId_subjectId_assessmentType_assessmentNo: {
            studentId: m.studentId,
            subjectId: payload.subjectId,
            assessmentType: payload.assessmentType,
            assessmentNo: payload.assessmentNo
          }
        },
        update: { marksObtained: m.marksObtained, submittedById: userId },
        create: {
          studentId: m.studentId,
          subjectId: payload.subjectId,
          campusDepartmentId: subject.campusDepartmentId,
          assessmentType: payload.assessmentType,
          assessmentNo: payload.assessmentNo,
          marksObtained: m.marksObtained,
          submittedById: userId
        },
        include: markInclude
      })
    )
  );
  return results;
};
var markService = { getMarks, bulkUpsertMarks };

// src/modules/mark/mark.controller.ts
import status18 from "http-status";
var getMarks2 = catchAsync(async (req, res) => {
  const subjectId = req.query.subjectId;
  const semester = req.query.semester ? Number(req.query.semester) : void 0;
  const data = await markService.getMarks(req.user.userId, req.user.role, subjectId, semester);
  sendResponse(res, { httpStatusCode: status18.OK, success: true, message: "Marks fetched", data });
});
var bulkUpsertMarks2 = catchAsync(async (req, res) => {
  const { subjectId, assessmentType, assessmentNo, marks } = req.body;
  if (!subjectId || !assessmentType || !assessmentNo || !Array.isArray(marks) || marks.length === 0) {
    throw new AppError_default(status18.BAD_REQUEST, "subjectId, assessmentType, assessmentNo and marks[] are required");
  }
  if (!Object.values(AssessmentType).includes(assessmentType)) {
    throw new AppError_default(status18.BAD_REQUEST, `assessmentType must be one of: ${Object.values(AssessmentType).join(", ")}`);
  }
  const data = await markService.bulkUpsertMarks(req.user.userId, req.user.role, {
    subjectId,
    assessmentType,
    assessmentNo: Number(assessmentNo),
    marks
  });
  sendResponse(res, { httpStatusCode: status18.OK, success: true, message: "Marks saved", data });
});

// src/modules/mark/mark.routes.ts
var router7 = Router7();
router7.get("/", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER, UserRole.STUDENT), getMarks2);
router7.post("/bulk", checkAuth(UserRole.PRINCIPAL, UserRole.HOD, UserRole.TEACHER), bulkUpsertMarks2);
var mark_routes_default = router7;

// src/routes/index.ts
var router8 = Router8();
router8.use("/auth", auth_routes_default);
router8.use("/campus", campus_routes_default);
router8.use("/principal", principal_routes_default);
router8.use("/users", user_routes_default);
router8.use("/subjects", subject_routes_default);
router8.use("/marks", mark_routes_default);
router8.use("/dashboard", dashboard_routes_default);
router8.get("/departments", getAllDepartments2);
router8.post("/departments", createDepartment);
router8.post("/departments/bulk", createDepartmentsBulk);
var routes_default = router8;

// src/middleware/errorHandler.ts
import status19 from "http-status";
import "dotenv/config";
var globalErrorHandler = async (err, req, res, next) => {
  console.error(`[${req.method}] ${req.path} \u2192`, err);
  let statusCode = status19.INTERNAL_SERVER_ERROR;
  let message = "Internal Server Error";
  if (err instanceof AppError_default) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }
  const errorResponse = {
    success: false,
    message
  };
  res.status(statusCode).json(errorResponse);
};

// src/app.ts
var app = express();
app.use(cors({
  origin: process.env.CLIENT_URL ?? "http://localhost:3000",
  credentials: true
}));
app.use(cookieParser());
app.post("/api/webhook/stripe", express.raw({ type: "application/json" }), stripeWebhook);
app.use(express.json());
app.use(morgan("dev"));
app.use((req, _res, next) => {
  console.log(`\u2192 ${req.method} ${req.path}`, Object.keys(req.body || {}).length ? req.body : "");
  next();
});
app.use("/api", routes_default);
app.get("/", (_req, res) => {
  res.send("Hello, TypeScript + Express!");
});
app.use(globalErrorHandler);
var app_default = app;

// src/index.ts
var index_default = app_default;
export {
  index_default as default
};
