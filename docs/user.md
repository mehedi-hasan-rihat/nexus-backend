# User API

Base: `/api/users`

> Users are never self-registered. They are always created by a privileged user according to the permission matrix below.

---

## Permission Matrix

| Requester | Can add |
|-----------|---------|
| `PRINCIPAL` | `HOD`, `TEACHER` |
| `HOD` | `TEACHER`, `STUDENT` |
| `TEACHER` | `STUDENT` |

---

### POST `/api/users`
Add a new HOD, Teacher, or Student. The target role and required fields depend on who is making the request.

**Auth required:** Yes (`PRINCIPAL`, `HOD`, or `TEACHER`)

#### Add HOD or Teacher

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123",
  "role": "HOD",
  "campusDepartmentId": "clx...",
  "employeeId": "EMP001",
  "designation": "Head of Department",
  "qualification": "PhD"
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `email` | string | Yes |
| `password` | string | Yes |
| `role` | `HOD` \| `TEACHER` | Yes |
| `campusDepartmentId` | string | Yes |
| `employeeId` | string | No |
| `designation` | string | No |
| `qualification` | string | No |

**Response `201`:**
```json
{
  "success": true,
  "message": "HOD added successfully",
  "data": {
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "HOD",
      "isActive": true
    },
    "teacher": {
      "id": "clx...",
      "userId": "clx...",
      "campusDepartmentId": "clx...",
      "employeeId": "EMP001",
      "designation": "Head of Department",
      "qualification": "PhD"
    }
  }
}
```

---

#### Add Student

**Body:**
```json
{
  "name": "Jane Smith",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "STUDENT",
  "campusDepartmentId": "clx...",
  "roll": "2301",
  "session": "2023-24",
  "semester": 3,
  "shift": "MORNING"
}
```

| Field | Type | Required |
|-------|------|----------|
| `name` | string | Yes |
| `email` | string | Yes |
| `password` | string | Yes |
| `role` | `STUDENT` | Yes |
| `campusDepartmentId` | string | Yes |
| `roll` | string | Yes |
| `session` | string | Yes |
| `semester` | number | Yes |
| `shift` | `MORNING` \| `EVENING` | Yes |

**Response `201`:**
```json
{
  "success": true,
  "message": "STUDENT added successfully",
  "data": {
    "user": {
      "id": "clx...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "STUDENT",
      "isActive": true
    },
    "student": {
      "id": "clx...",
      "userId": "clx...",
      "campusDepartmentId": "clx...",
      "roll": "2301",
      "session": "2023-24",
      "semester": 3,
      "shift": "MORNING"
    }
  }
}
```

---

## Error Responses

| Status | Reason |
|--------|--------|
| `400` | Missing required fields |
| `400` | Email already registered |
| `401` | No valid session |
| `403` | Requester role not permitted to add the target role |
