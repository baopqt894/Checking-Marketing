# 🔐 Quick Reference - Protected Routes

## ✅ Tất cả trang đã được bảo vệ!

### 🛡️ 3 Lớp Bảo Vệ

```
┌─────────────────────────────────────────┐
│  1. MIDDLEWARE (Server)                 │
│  ✓ Check cookies trước khi vào page     │
│  ✓ Redirect nếu không có token          │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  2. TEMPLATE (Client)                   │
│  ✓ Check localStorage khi page load     │
│  ✓ Show loading → redirect nếu cần      │
└─────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────┐
│  3. COMPONENT (Optional)                │
│  ✓ withAuth() HOC                       │
│  ✓ useRequireAuth() hook                │
│  ✓ AuthGuard component                  │
└─────────────────────────────────────────┘
```

## 🎯 Cách Sử Dụng

### Cho Client Components

```tsx
// Option 1: HOC (Recommended)
import { withAuth } from '@/lib/with-auth'

function MyPage() {
  return <div>Content</div>
}

export default withAuth(MyPage)
```

```tsx
// Option 2: Hook
import { useRequireAuth } from '@/lib/with-auth'

export default function MyPage() {
  useRequireAuth() // Auto redirect if not auth
  return <div>Content</div>
}
```

```tsx
// Option 3: Component
import { AuthGuard } from '@/components/auth/auth-guard'

export default function MyPage() {
  return (
    <AuthGuard>
      <div>Content</div>
    </AuthGuard>
  )
}
```

### Cho Server Components

```tsx
import { requireAuth } from '@/lib/server-auth'

export default async function MyPage() {
  await requireAuth() // Will redirect if not auth
  
  return <div>Content</div>
}
```

## 📁 Files

| File | Purpose |
|------|---------|
| `middleware.ts` | Server-side protection |
| `app/dashboard/template.tsx` | Client-side check all dashboard |
| `lib/auth.ts` | Client auth utilities |
| `lib/server-auth.ts` | Server auth utilities |
| `lib/with-auth.tsx` | HOC & hook |
| `components/auth/auth-guard.tsx` | Guard component |

## ✅ Protected Pages

- ✅ `/dashboard` 
- ✅ `/dashboard/apps`
- ✅ `/dashboard/accounts`
- ✅ `/dashboard/tokens`
- ✅ `/dashboard/app-performance`
- ✅ `/dashboard/app-performance/[app_id]`
- ✅ `/dashboard/app-performance/[app_id]/[country]`
- ✅ All other dashboard routes

## 🧪 Test

```bash
# 1. Logout
Click avatar → Log out

# 2. Try access protected page
Visit: http://localhost:3000/dashboard/apps
Result: Should redirect to /

# 3. Login
Email: admin@example.com
Password: admin

# 4. Access protected page
Visit: http://localhost:3000/dashboard/apps
Result: Should see content

# 5. Refresh page
Result: Should stay authenticated
```

## 🔑 Authentication Data

### Stored in Cookies
- `accessToken` - JWT token
- `refreshToken` - Refresh token
- `userInfo` - User data (JSON encoded)
- `authToken` - Legacy support

### Stored in localStorage
- `accessToken`
- `refreshToken`
- `userInfo`

### Expiry
- 30 days for all cookies

## 🚀 Current Setup

**NO ADDITIONAL SETUP NEEDED!**

Tất cả đã được config sẵn:
- ✅ Middleware protecting all routes
- ✅ Template checking authentication
- ✅ Utilities ready to use
- ✅ Examples documented

Chỉ cần login và sử dụng! 🎉
