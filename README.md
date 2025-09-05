# Saven - Financial App with Gamification

This project uses a monorepo structure with separate landing and app pages:

- **localhost:3000** → Landing page
- **app.localhost:3001** → App page

## Setup Instructions

### 1. Add to your hosts file
Add this line to your `/etc/hosts` file (on macOS/Linux) or `C:\Windows\System32\drivers\etc\hosts` (on Windows):

```
127.0.0.1 app.localhost
```

### 2. Install dependencies
```bash
npm install
cd pages/app && npm install
cd ../landing && npm install
```

### 3. Run both servers
```bash
# Run both servers simultaneously
npm run dev:all

# Or run them separately:
# Terminal 1: Landing page (localhost:3000)
npm run dev:landing

# Terminal 2: App page (app.localhost:3001)
npm run dev:app
```

### 4. Access the sites
- **Landing page**: http://localhost:3000
- **App page**: http://app.localhost:3001

## Project Structure

```
pages/
├── landing/             # Landing page (localhost:3000)
│   ├── src/app/        # Landing page components
│   └── package.json    # Landing page dependencies
├── app/                # App page (app.localhost:3001)
│   ├── src/app/        # App page components
│   └── package.json    # App dependencies
└── packages/           # Shared packages
    └── ui/             # Shared UI components
```

## Features

### Landing Page
- Video background with ocean theme
- Hero section with rotating cryptocurrency names
- Glassmorphism design
- "Open App" button linking to app subdomain
- Tooltip with enhanced z-index for proper display

### App Page
- Left sidebar with user progression (profile, rank, objectives)
- 2x2 grid layout dashboard with glassmorphism styling
- Savings summary with rotating assets
- Saver ranks and progress tracking
- Win chance calculator and next draw information
- Card packs visualization
- Asset allocation pie chart
- Activity ticker at the top
- "Back to Home" button linking to main domain

## Recent Updates

- ✅ Restructured project into monorepo architecture
- ✅ Added left sidebar with user progression tracking
- ✅ Implemented glassmorphism design across all components
- ✅ Fixed tooltip z-index issues on landing page
- ✅ Compressed background video from 116MB to 21MB
- ✅ Set up shared UI components and configuration
- ✅ Added professional financial app styling and layout