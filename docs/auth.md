# Auth API

Base: `/api/auth`

---

> **Note:** Public registration is disabled. Users are created by privileged roles via `POST /api/users`. See [User API](./user.md).

---

### POST `/api/auth/login`
Authenticate and set session cookie.

**Auth required:** No

**Body:**
```json
{
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response `200`:**
```json
{
  "success": true,
  "message": "Logged in successfully",
  "data": { "id": "clx...", "name": "John Doe", "email": "john@example.com", "role": "STUDENT" }
}
```

**Sets cookie:** `better-auth.session_token` (HTTP-only)

| Status | Reason |
|--------|--------|
| `401` | Invalid credentials |

---

### POST `/api/auth/logout`
Invalidate session and clear cookie.

**Auth required:** Yes

**Response `200`:**
```json
{ "success": true, "message": "Logged out successfully" }
```

| Status | Reason |
|--------|--------|
| `401` | No valid session |

---

### GET `/api/auth/me`
Get the currently authenticated user.

**Auth required:** Yes

**Response `200`:**
```json
{
  "success": true,
  "message": "User fetched successfully",
  "data": { "id": "clx...", "name": "John Doe", "email": "john@example.com", "role": "PRINCIPAL", "isActive": true }
}
```

| Status | Reason |
|--------|--------|
| `401` | No valid session |
