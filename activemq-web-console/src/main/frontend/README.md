# ActiveMQ Modern Web Console - Frontend

This is the modern React-based frontend for the ActiveMQ Web Console.

## Technology Stack

- **React 18** with TypeScript
- **Vite** for fast development and optimized builds
- **Material-UI (MUI) v5** for UI components
- **Zustand** for state management
- **React Router v6** for routing
- **Axios** for HTTP requests
- **Recharts** for data visualization
- **React Hook Form** + **Zod** for form handling and validation
- **React Hot Toast** for notifications

## Prerequisites

- Node.js 18+ and npm

## Getting Started

### Install Dependencies

```bash
npm install
```

### Development Server

```bash
npm run dev
```

The development server will start at `http://localhost:3000` and proxy API requests to `http://localhost:8080`.

### Build for Production

```bash
npm run build
```

The production build will be output to the `dist/` directory.

### Lint Code

```bash
npm run lint
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable React components
│   ├── layout/         # Layout components (Header, Sidebar, Footer)
│   ├── common/         # Common components (DataTable, LoadingSpinner, etc.)
│   └── charts/         # Chart components (LineChart, BarChart, GaugeChart)
├── pages/              # Page components
├── services/           # API service layer
├── stores/             # Zustand state management stores
├── hooks/              # Custom React hooks
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles and theme configuration
```

## API Proxy Configuration

During development, API requests to `/api/*` are proxied to `http://localhost:8080`. This is configured in `vite.config.ts`.

## Building with Maven

The frontend build is integrated into the Maven build process. When you run `mvn package` on the parent project, it will:

1. Install Node.js and npm (if not present)
2. Run `npm install`
3. Run `npm run build`
4. Copy the build output to `src/main/webapp/modern/`

## Environment Variables

Create a `.env.local` file for local environment variables:

```
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Code Style

- ESLint is configured for TypeScript and React
- Prettier is configured for code formatting
- Run `npm run lint` to check for issues

## Accessibility

All components should meet WCAG 2.1 AA standards. Use semantic HTML, ARIA labels, and ensure keyboard navigation works properly.

## Contributing

1. Follow the existing code structure and naming conventions
2. Write TypeScript with proper types (avoid `any` when possible)
3. Ensure components are responsive and accessible
4. Test your changes in both light and dark modes
