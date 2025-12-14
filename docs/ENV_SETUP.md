# Environment Setup

Create a `.env.local` file in the root directory with these variables:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/v1

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=true

# App Configuration
NEXT_PUBLIC_APP_NAME=Test Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Set `NEXT_PUBLIC_USE_MOCK_DATA=true` to use mock data during development.
