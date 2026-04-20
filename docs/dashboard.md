# Dashboard API

## `GET /api/dashboard`

Auth: session cookie required  
Returns role-specific dashboard data based on the logged-in user's role.

---

## PRINCIPAL Response

```json
{
  "success": true,
  "message": "Dashboard fetched",
  "data": {
    "campus": {
      "id": "clx...",
      "name": "Main Campus",
      "code": "MC001",
      "address": "Dhaka, Bangladesh"
    },
    "stats": {
      "departments": 4,
      "teachers": 20,
      "students": 150,
      "pendingMarks": 12
    },
    "departmentBreakdown": [
      {
        "id": "clx...",
        "campusId": "clx...",
        "departmentId": "clx...",
        "hodId": "clx...",
        "department": { "id": "clx...", "name": "Computer Science", "shortName": "CSE" },
        "hod": { "id": "clx...", "name": "Dr. John", "email": "john@example.com" },
        "_count": { "teachers": 5, "students": 40 }
      }
    ]
  }
}
```

---

## HOD Response

```json
{
  "success": true,
  "message": "Dashboard fetched",
  "data": {
    "campus": { "id": "clx...", "name": "Main Campus" },
    "department": { "id": "clx...", "name": "Computer Science", "shortName": "CSE" },
    "stats": {
      "teachers": 5,
      "students": 40,
      "subjects": 10,
      "pendingMarks": 8
    },
    "semesterBreakdown": [
      { "semester": 1, "students": 10 },
      { "semester": 2, "students": 8 },
      { "semester": 3, "students": 12 }
    ]
  }
}
```

---

## TEACHER Response

```json
{
  "success": true,
  "message": "Dashboard fetched",
  "data": {
    "campus": { "id": "clx...", "name": "Main Campus" },
    "department": { "id": "clx...", "name": "Computer Science" },
    "teacher": {
      "id": "clx...",
      "employeeId": "EMP001",
      "designation": "Lecturer"
    },
    "stats": {
      "students": 40,
      "subjects": 10,
      "submittedMarks": 35,
      "pendingMarks": 5
    }
  }
}
```

---

## STUDENT Response

```json
{
  "success": true,
  "message": "Dashboard fetched",
  "data": {
    "campus": { "id": "clx...", "name": "Main Campus" },
    "department": { "id": "clx...", "name": "Computer Science" },
    "student": {
      "id": "clx...",
      "roll": "741096",
      "session": "2026",
      "semester": 1,
      "shift": "MORNING"
    },
    "stats": {
      "totalAssessments": 6,
      "totalMarks": 245,
      "totalMax": 300,
      "percentage": 81.67
    },
    "marks": [
      {
        "id": "clx...",
        "assessmentType": "MIDTERM",
        "assessmentNo": 1,
        "marksObtained": 45,
        "status": "APPROVED",
        "submittedAt": "2026-01-01T00:00:00.000Z",
        "subject": { "id": "clx...", "name": "Data Structures", "code": "CSE201", "maxMarks": 50 }
      }
    ]
  }
}
```

---

## Frontend Usage

```ts
const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/dashboard`, {
  credentials: "include",
});
const { data } = await res.json();

// data.stats is always present
// narrow by role from auth context:
// role === "PRINCIPAL" → data.departmentBreakdown
// role === "HOD"       → data.semesterBreakdown
// role === "TEACHER"   → data.teacher
// role === "STUDENT"   → data.marks, data.stats.percentage
```

---

## Error Responses

| Status | Reason |
|--------|--------|
| `401` | Not authenticated |
| `403` | Role has no dashboard (e.g. VOLUNTEER) |
| `404` | No campus / department / student record found |
