# WellMeds – OTP Authentication Setup Guide

> Generated after completing mobile OTP migration.

---

## Required API Keys & Environment Variables

### Backend `.env`

```bash
# ─── OTP Core ───────────────────────────────────────────────────
OTP_PROVIDER=console          # console | msg91 | twilio
ENABLE_DEV_OTP_BYPASS=true    # Allow 000000 as OTP in dev — set false in production

OTP_LENGTH=6
OTP_EXPIRY_MINUTES=5
OTP_MAX_ATTEMPTS=3
OTP_RESEND_LIMIT=5

# ─── MSG91 (fill if OTP_PROVIDER=msg91) ─────────────────────────
OTP_AUTH_KEY=                 # From MSG91 dashboard
OTP_TEMPLATE_ID=              # Approved DLT template ID
OTP_SENDER_ID=                # 6-char sender ID (DLT approved)
OTP_BASE_URL=https://api.msg91.com/api/v5

# ─── Twilio (fill if OTP_PROVIDER=twilio) ────────────────────────
TWILIO_ACCOUNT_SID=           # From Twilio Console
TWILIO_AUTH_TOKEN=            # From Twilio Console
TWILIO_VERIFY_SERVICE_SID=    # Create a Verify Service in Twilio Console
TWILIO_PHONE_NUMBER=          # Your Twilio sender number (+1XXXXXXXXXX)

# ─── JWT (unchanged) ─────────────────────────────────────────────
JWT_SECRET=<strong-random-string>
JWT_REFRESH_SECRET=<strong-random-string>
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

### Frontend `.env`

```bash
VITE_API_URL=http://localhost:5000/api
# No OTP credentials ever exposed to frontend
```

---

## MSG91 Setup Instructions

1. **Register** at [msg91.com](https://msg91.com) and complete KYC
2. **Register DLT** (Distributed Ledger Technology) with TRAI via your telecom operator:
   - Register your entity
   - Register your header/sender ID (6 char, e.g., `WLMEDS`)
   - Submit OTP template (must include `{#var#}` for the OTP code)
   - Approval takes 1-5 business days
3. **Get Auth Key** from MSG91 Dashboard → API → Auth Key
4. **Get Template ID** after DLT template approval
5. Set in `.env`:
   ```
   OTP_PROVIDER=msg91
   OTP_AUTH_KEY=<your-auth-key>
   OTP_TEMPLATE_ID=<approved-template-id>
   OTP_SENDER_ID=WLMEDS
   ```

### Recommended DLT OTP Template
```
Your WellMeds OTP is {#var#}. Valid for 5 minutes. Do not share with anyone.
```

---

## Twilio Setup Instructions

1. **Create account** at [twilio.com](https://twilio.com)
2. **Get Account SID + Auth Token** from [console.twilio.com](https://console.twilio.com)
3. **Create Verify Service**:
   - Go to Verify → Services → Create Service
   - Name: "WellMeds"
   - Copy the **Service SID** (starts with `VA...`)
4. **Get Phone Number**: Verify → Phone Numbers → Buy a Number (choose India +91 capable)
5. Set in `.env`:
   ```
   OTP_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=ACxxxxx
   TWILIO_AUTH_TOKEN=xxxxxxxx
   TWILIO_VERIFY_SERVICE_SID=VAxxxxxx
   TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
   ```

---

## Development (Console) Mode

Default setup. OTP is printed directly to the server terminal:

```
┌─────────────────────────────────────────────────────┐
│  📱 OTP for 9999999999: 847261
│  ⏰ Expires in 5 minutes
│  ⚠️  Console provider — dev mode only.
└─────────────────────────────────────────────────────┘
```

Additionally, the API response in development includes `devOtp` field, which is displayed in the UI as a yellow hint banner.

**Dev bypass OTP:** If `ENABLE_DEV_OTP_BYPASS=true`, entering `000000` as the OTP will always succeed in development.

---

## Test Phone Number Instructions

### MSG91
- Use the MSG91 dashboard's "Test" feature before going live
- Indian numbers only (10-digit starting with 6-9)

### Twilio
- Use verified phone numbers in trial mode
- For production: remove trial restrictions (upgrade account)
- Test numbers: any real mobile that can receive SMS

---

## Production Deployment Checklist

- [ ] `NODE_ENV=production` in production `.env`
- [ ] `ENABLE_DEV_OTP_BYPASS=false`
- [ ] `OTP_PROVIDER=msg91` or `OTP_PROVIDER=twilio`
- [ ] All provider credentials filled in
- [ ] DLT registration complete (for MSG91)
- [ ] `JWT_SECRET` and `JWT_REFRESH_SECRET` are strong, unique, random strings (32+ chars)
- [ ] `COOKIE_SECRET` is strong and unique
- [ ] MongoDB Atlas IP whitelist includes production server IP
- [ ] Rate limiting is enabled (already configured)
- [ ] HTTPS is enforced (cookies use `secure: true` in production)
- [ ] `CLIENT_URL` and `FRONTEND_URL` point to production domain
- [ ] Test the full OTP flow end-to-end with a real number before launch

---

## Verification Checklist

After deployment, verify:

- ✅ `/login` shows the 3-step OTP flow
- ✅ Mobile number validates correctly
- ✅ OTP is sent (check server console in dev, SMS in production)
- ✅ Wrong OTP shows error + decrements remaining attempts
- ✅ Correct OTP → auto-login → redirect to home
- ✅ Existing user logging in → name/email ignored → existing data used
- ✅ New user → account created with provided name/email
- ✅ JWT stored in localStorage + cookie
- ✅ Refresh token works on page reload
- ✅ Logout clears session
- ✅ Protected routes (profile, orders) redirect to `/login` when unauthenticated
- ✅ Admin users are redirected to `/admin` after login
- ✅ `/register` → redirects to `/login`
- ✅ `/forgot-password` → redirects to `/login`
- ✅ OTP expires after 5 minutes → "OTP expired" error
- ✅ After 3 wrong attempts → "Maximum attempts reached" + OTP deleted
- ✅ Rate limit: 5 OTPs per hour per mobile (enforced in controller)
- ✅ No Google Sign-In button anywhere
- ✅ No password field anywhere on the site
- ✅ No console errors in production build

---

## New API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/otp/send` | Request OTP (body: `{ mobile, name?, email? }`) |
| `POST` | `/api/auth/otp/verify` | Verify OTP + auto-login (body: `{ mobile, otp, name?, email? }`) |
| `POST` | `/api/auth/logout` | Logout (requires auth) |
| `POST` | `/api/auth/refresh` | Refresh access token |
| `GET` | `/api/auth/me` | Get current user profile (requires auth) |
| `PUT` | `/api/auth/profile` | Update profile (requires auth) |

## Removed Endpoints

- ~~`POST /api/auth/google`~~
- ~~`POST /api/auth/register`~~
- ~~`POST /api/auth/login`~~
- ~~`POST /api/auth/verify-email`~~
- ~~`POST /api/auth/forgot-password`~~
- ~~`POST /api/auth/reset-password`~~

---

## Switching Providers (Zero Code Change)

To switch from console to MSG91:
```bash
# .env
OTP_PROVIDER=msg91
OTP_AUTH_KEY=your_msg91_auth_key
OTP_TEMPLATE_ID=your_approved_template_id
```

To switch to Twilio:
```bash
# .env
OTP_PROVIDER=twilio
TWILIO_ACCOUNT_SID=ACxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxx
TWILIO_VERIFY_SERVICE_SID=VAxxxxxx
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

**No controller, service, or frontend code needs modification.**
