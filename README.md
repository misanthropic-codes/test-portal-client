# Test Portal - JEE/NEET Exam Platform

A comprehensive Next.js web application for competitive exam preparation (JEE Main, JEE Advanced, NEET) with test-taking interface, analytics, and performance tracking.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Navigate to project directory
cd test-portal-client

# Install dependencies (if not already done)
npm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:8000/v1
NEXT_PUBLIC_USE_MOCK_DATA=true
NEXT_PUBLIC_APP_NAME=Test Portal
NEXT_PUBLIC_APP_URL=http://localhost:3000
EOF

# Run development server
npm run dev
```

Visit `http://localhost:3000`

## 🎯 Current Features (MVP)

### ✅ Implemented

#### Core Infrastructure
- TypeScript with strict type safety
- Tailwind CSS with dark/light theme
- Authentication context with JWT
- Mock data services for development
- Responsive design system

#### Authentication
- Login/Register pages
- Session management
- Protected routes
- User profile

#### Test Discovery
- Test listing with filters
- Search functionality 
- Test categories (JEE Main, JEE Advanced, NEET)
- Test details page

#### Test Taking (Planned - Essential Components Created)
- Question navigation panel
- MCQ question types
- Numerical answer inputs
- Timer system with hooks
- Auto-save functionality

#### Additional
- Dark/Light mode toggle
- Responsive navigation
- Custom hooks (useTimer, useDebounce, useLocalStorage)
- Comprehensive utilities (formatters, validators, calculations)

### 🔜 To Be Completed

The following features have utilities and types ready but need UI components:
- Full test-taking interface with all question types
- Results and analytics dashboard
- Answer key with solutions
- Performance graphs and charts
- Bookmarks and notes
- Leaderboard
- Previous year papers section

## 📁 Project Structure

```
test-portal-client/
├── src/
│   ├── app/                  # Next.js app router
│   │   ├── (auth)/          # Auth pages (login, register)
│   │   ├── (dashboard)/     # Protected pages
│   │   └── globals.css      # Global styles
│   ├── components/          # React components
│   │   ├── ui/             # Reusable UI components
│   │   ├── test/           # Test-specific components
│   │   └── layout/         # Layout components
│   ├── contexts/           # React contexts
│   │   ├── AuthContext.tsx # Authentication
│   │   └── ThemeContext.tsx # Theme management
│   ├── hooks/              # Custom React hooks
│   ├── services/           # API services
│   │   ├── mock/          # Mock data for development
│   │   └── api.client.ts  # Axios instance
│   ├── types/              # TypeScript types
│   └── utils/              # Utility functions
├── docs/                   # Documentation
└── public/                # Static assets
```

## 🎨 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **State Management**: React Context + hooks
- **HTTP Client**: Axios
- **Charts**: Recharts, Chart.js
- **Math Rendering**: KaTeX
- **Icons**: Lucide React

## 🔧 Development

### Environment Variables

See `docs/ENV_SETUP.md` for details.

### Mock Data

The application uses mock data in development mode. Set `NEXT_PUBLIC_USE_MOCK_DATA=true` in `.env.local`.

Mock services are located in `src/services/mock/mockData.ts` and include:
- Sample users
- Test papers (JEE Main, JEE Advanced, NEET)
- Questions (MCQ, Numerical)
- Results and analytics

### Scripts

```bash
npm run dev      # Start development server
npm run build    # Build for production  
npm run start    # Start production server
npm run lint     # Run ESLint
```

## 📚 API Integration

### For Backend Team

Complete API documentation is available at:
**`/Users/misanthropic/.gemini/antigravity/brain/427424d8-aa4c-4ff3-97ff-1a92b43dd6bf/api-documentation.md`**

The frontend is designed to easily switch from mock data to real APIs:

1. Set `NEXT_PUBLIC_USE_MOCK_DATA=false`
2. Update `NEXT_PUBLIC_API_URL` to your API endpoint
3. The API client (`src/services/api.client.ts`) handles:
   - JWT authentication
   - Token refresh
   - Error handling
   - Request/response interceptors

## 🎯 User Credentials (Mock)

For testing with mock data:
- **Email**: `rahul@test.com`
- **Password**: Any password (mock mode accepts any)

Or register a new account - it will be stored in localStorage.

## 🚧 Completing the Application

The foundation is complete. To finish the application:

1. **Test Taking Interface**
   - Create question display components
   - Implement navigation panel UI
   - Add timer display component
   - Build submit confirmation modal

2. **Results & Analytics**
   - Create result cards with charts
   - Build solution viewer
   - Add performance graphs

3. **Dashboard**
   - Design dashboard widgets
   - Add recent activity feed
   - Show upcoming tests

4. **Additional Features**
   - Bookmarks interface
   - Leaderboard tables
   - Notification system

All utilities, hooks, types, and mock data are ready. Just create the UI components!

## 📖 Documentation

- **API Documentation**: See implementation plan artifact
- **Development Strategy**: `docs/DEVELOPMENT_STRATEGY.md`
- **Environment Setup**: `docs/ENV_SETUP.md`

## 🤝 Contributing

This is a starter template. Feel free to:
- Add more question types
- Enhance the UI/UX
- Add new features
- Improve performance
- Add tests

## 📝 License

Private project for educational purposes.

---

**Built with ❤️ for competitive exam aspirants**
