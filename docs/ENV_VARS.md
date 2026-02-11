# Environment Variables

Copy this to your `.env` file and fill in the values.

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/pioneer?schema=public"

# NextAuth
NEXTAUTH_SECRET="generate-with-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# OAuth Providers (Optional for MVP)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# AI APIs
OPENAI_API_KEY=""
# or
ANTHROPIC_API_KEY=""

# Google Places API (for scraping)
GOOGLE_PLACES_API_KEY=""

# Weather API (Phase 2)
OPENWEATHERMAP_API_KEY=""
```

## How to Get These

### DATABASE_URL
- Local: Install PostgreSQL and create a database
- Cloud options:
  - [Supabase](https://supabase.com) - Free tier available
  - [Railway](https://railway.app) - Free tier with limits
  - [Neon](https://neon.tech) - Free tier available

### NEXTAUTH_SECRET
Generate with:
```bash
openssl rand -base64 32
```

### GOOGLE_CLIENT_ID / SECRET
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create a project
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect: `http://localhost:3000/api/auth/callback/google`

### OPENAI_API_KEY
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Create API key

### GOOGLE_PLACES_API_KEY
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable Places API
3. Create API key
4. Restrict to Places API only (recommended)
