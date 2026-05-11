# JeezBank

A consumer fintech product built on top of FuseCore — Nigeria's core banking API.

## Apps

| App | Description | Port |
|---|---|---|
| `apps/admin` | Admin dashboard (Bank Manager, Officers, Customer Care) | 3000 |
| `apps/app` | Customer PWA (OPay-style wallet) | 3001 |

## Architecture

```
User App (PWA)  ──→  /api/* routes  ──→  FuseCore API
Admin Dashboard ──→  /api/* routes  ──→  FuseCore API
                         ↕
                      Convex DB
                (users, otps, adminUsers)
```

**FuseCore** handles all banking operations: accounts, transactions, payments, loans, AML, reporting.  
**Convex** handles user auth state: phone → OTP → user mapping to FuseCore IDs, admin users + roles.

## Setup

### 1. Install dependencies

```bash
# From root
npm install

# Or per app
cd apps/app && npm install
cd apps/admin && npm install
```

### 2. Configure environment

```bash
cp apps/app/.env.example apps/app/.env.local
cp apps/admin/.env.example apps/admin/.env.local
```

Edit both `.env.local` files:
- `FUSECORE_BASE_URL` — your FuseCore instance URL
- `FUSECORE_API_KEY` — your FuseCore tenant API key
- `JWT_SECRET` — random 64-char string
- `CONVEX_URL` — your Convex deployment URL (after `npx convex dev`)

### 3. Set up Convex

```bash
# In apps/app
cd apps/app && npx convex dev

# In apps/admin  
cd apps/admin && npx convex dev
```

### 4. Run

```bash
# Customer app (port 3001)
cd apps/app && npm run dev -- -p 3001

# Admin dashboard (port 3000)
cd apps/admin && npm run dev
```

## Admin Credentials (dev)

| Email | Password | Role |
|---|---|---|
| manager@jeezbank.com | password123 | MANAGER |
| officer@jeezbank.com | password123 | OFFICER |
| cc@jeezbank.com | password123 | CUSTOMER_CARE |

## Role Permissions

| Feature | Manager | Officer | Customer Care |
|---|---|---|---|
| Dashboard | ✅ | ✅ | ✅ |
| Customers (full) | ✅ | ✅ | Read + Freeze |
| Transactions | ✅ | ✅ | Read only |
| Loans + Approve | ✅ | View only | ❌ |
| AML Alerts | ✅ | ❌ | ❌ |
| CBN Reports | ✅ | ❌ | ❌ |

## Customer App Flow

1. Enter phone → receive OTP (logged in dev, Termii SMS in prod)
2. Enter OTP (any 6 digits in dev)
3. New users: complete profile (name + optional BVN/NIN)
4. FuseCore customer + account created automatically
5. Home dashboard with balance, send, fund, airtime, history

## What's mocked

- **OTP delivery**: logged to console (plug in Termii SMS)  
- **Airtime/VAS**: simulated (plug in VTpass)  
- **Convex queries**: commented out with TODOs (wire up after `npx convex dev`)
