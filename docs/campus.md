# Campus API

Base: `/api/campus`

---

### POST `/api/campus`
Create a campus and register its principal user in a single transaction.

**Auth required:** No

**Body:**
```json
{
  "campusName": "Main Campus",
  "campusCode": "MC001",
  "address": "Dhaka, Bangladesh",
  "principal": {
    "name": "Jane Smith",
    "email": "jane@example.com",
    "password": "secret123"
  }
}
```

| Field | Type | Required |
|-------|------|----------|
| `campusName` | string | Yes |
| `campusCode` | string | Yes |
| `address` | string | No |
| `principal.name` | string | Yes |
| `principal.email` | string | Yes |
| `principal.password` | string | Yes |

**Response `201`:**
```json
{
  "success": true,
  "message": "Campus created with principal",
  "data": {
    "campus": {
      "id": "clx...",
      "campusName": "Main Campus",
      "campusCode": "MC001",
      "address": "Dhaka, Bangladesh",
      "createdById": "clx...",
      "createdAt": "2025-01-01T00:00:00.000Z"
    },
    "principal": {
      "id": "clx...",
      "name": "Jane Smith",
      "email": "jane@example.com",
      "role": "PRINCIPAL"
    }
  }
}
```

| Status | Reason |
|--------|--------|
| `400` | Missing required fields |
| `400` | Principal email already registered |
| `401` | No valid session |
