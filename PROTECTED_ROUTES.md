# Protected Routes - Hướng dẫn

## Tổng quan

Tất cả các trang trong dashboard đã được bảo vệ bởi **3 lớp security**:

### 1️⃣ **Middleware (Server-side)**
**File:** `/middleware.ts`

- Chạy trên server trước khi request đến page
- Kiểm tra cookies: `accessToken` hoặc `authToken`
- Tự động redirect về `/` nếu không có token
- Bảo vệ tất cả routes trừ `/` và `/login`

```typescript
// Tự động bảo vệ:
/dashboard/*           ✅ Protected
/dashboard/apps        ✅ Protected  
/dashboard/accounts    ✅ Protected
/                      ✓ Public (Login page)
```

### 2️⃣ **Template (Client-side)**
**File:** `/app/dashboard/template.tsx`

- Chạy trên client khi page load
- Kiểm tra localStorage: `accessToken` hoặc `authToken`
- Hiển thị loading state khi checking
- Redirect về `/` nếu không authenticated

### 3️⃣ **Component Level Protection**

Có 3 cách bảo vệ component:

#### **Option A: HOC (Higher Order Component)**
```tsx
// YourPage.tsx
'use client'

import { withAuth } from '@/lib/with-auth'

function YourPage() {
  return <div>Protected Content</div>
}

export default withAuth(YourPage)
```

#### **Option B: Hook**
```tsx
'use client'

import { useRequireAuth } from '@/lib/with-auth'

export default function YourPage() {
  const isAuthenticated = useRequireAuth()
  
  if (!isAuthenticated) return null

  return <div>Protected Content</div>
}
```

#### **Option C: AuthGuard Component**
```tsx
import { AuthGuard } from '@/components/auth/auth-guard'

export default function YourPage() {
  return (
    <AuthGuard>
      <div>Protected Content</div>
    </AuthGuard>
  )
}
```

## Server Components

Cho Server Components, sử dụng server-side utilities:

```tsx
// app/dashboard/example/page.tsx
import { requireAuth, getServerAuth } from '@/lib/server-auth'

export default async function ServerPage() {
  // Option 1: Require auth (will redirect if not authenticated)
  const token = await requireAuth()
  
  // Option 2: Get auth info
  const { isAuthenticated, userInfo, accessToken } = await getServerAuth()
  
  if (!isAuthenticated) {
    return <div>Not authorized</div>
  }

  return (
    <div>
      <h1>Welcome {userInfo?.name}</h1>
    </div>
  )
}
```

## Kiểm tra Authentication

### Client-side
```tsx
import { isAuthenticated, getUserInfo, getAccessToken } from '@/lib/auth'

// Check auth status
if (isAuthenticated()) {
  console.log('User is logged in')
}

// Get user info
const user = getUserInfo()
console.log(user?.email, user?.name)

// Get token
const token = getAccessToken()
```

### Server-side
```tsx
import { isAuthenticatedServer, getServerAuth } from '@/lib/server-auth'

// In Server Component or Server Action
const isAuth = await isAuthenticatedServer()

const auth = await getServerAuth()
console.log(auth.userInfo, auth.accessToken)
```

## Flow Diagram

```
User visits /dashboard/apps
        ↓
1. Middleware checks cookies
   - ❌ No token → Redirect to /
   - ✅ Has token → Continue
        ↓
2. Template.tsx checks localStorage  
   - ❌ No token → Redirect to /
   - ✅ Has token → Continue
        ↓
3. Page component renders
   - Can use useRequireAuth() for extra check
   - Can use withAuth() HOC
   - Can use AuthGuard component
        ↓
4. User sees protected content
```

## Testing

### 1. Test Protected Routes
```bash
# Not logged in
1. Visit http://localhost:3000/dashboard/apps
2. Should redirect to /

# Logged in
1. Login at http://localhost:3000
2. Visit http://localhost:3000/dashboard/apps
3. Should see content
```

### 2. Test Logout
```bash
1. Login
2. Visit any dashboard page
3. Click avatar → Log out
4. Should redirect to /
5. Try to visit /dashboard/apps
6. Should redirect to /
```

### 3. Test Direct Access
```bash
# Clear cookies and localStorage
1. Clear all site data
2. Try to access http://localhost:3000/dashboard/accounts
3. Should redirect to /
```

## Các trang đã được bảo vệ

✅ `/dashboard` - Main dashboard
✅ `/dashboard/apps` - Apps management
✅ `/dashboard/accounts` - Accounts management
✅ `/dashboard/tokens` - Tokens management
✅ `/dashboard/app-performance` - App performance
✅ `/dashboard/app-performance/[app_id]` - App detail
✅ `/dashboard/app-performance/[app_id]/[country]` - Country analytics
✅ `/dashboard/detailapp/[id]` - App details
✅ `/dashboard/test` - Test page

## Files Structure

```
lib/
  ├── auth.ts              # Client-side auth utilities
  ├── server-auth.ts       # Server-side auth utilities
  └── with-auth.tsx        # HOC and hook for protection

components/
  └── auth/
      └── auth-guard.tsx   # AuthGuard component

app/
  ├── page.tsx             # Login page (public)
  ├── middleware.ts        # Route protection (server)
  └── dashboard/
      ├── template.tsx     # Client-side check for all dashboard
      └── layout.tsx       # Dashboard layout
```

## Best Practices

1. **Use middleware for all routes** - Đã setup sẵn
2. **Use template.tsx for dashboard** - Đã setup sẵn
3. **Use component-level protection khi cần** - Optional, thêm layer bảo mật
4. **Always check token in API calls** - Thêm `Authorization` header
5. **Handle token refresh** - Implement khi token expired

## Troubleshooting

### User can access protected route without login
- Check middleware.ts matcher patterns
- Check if cookies are being set correctly
- Check browser dev tools → Application → Cookies

### Redirect loop
- Make sure login page (/) is in public paths
- Check both middleware and template.tsx logic

### User info not showing
- Check if userInfo cookie is set after login
- Check getUserInfo() function
- Verify JSON encoding/decoding
