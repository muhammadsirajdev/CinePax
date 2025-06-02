# CinePax Frontend

A modern React application for movie ticket booking and management.

## Features

- User authentication (login/register)
- Movie browsing and searching
- Movie details view
- Ticket booking system
- Responsive design

## Tech Stack

- React 18
- TypeScript
- Material-UI
- React Router
- Vite
- Redux Toolkit (for state management)

## Prerequisites

- Node.js (v16 or higher)
- npm (v7 or higher)

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory with the following variables:
   ```
   VITE_API_URL=http://localhost:5000/api
   VITE_APP_NAME=CinePax
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking

## Project Structure

```
src/
  ├── components/     # Reusable components
  ├── pages/         # Page components
  ├── services/      # API services
  ├── store/         # Redux store
  ├── types/         # TypeScript types
  ├── utils/         # Utility functions
  ├── App.tsx        # Main App component
  └── main.tsx       # Entry point
```

## Development Guidelines

1. Follow the TypeScript strict mode guidelines
2. Use functional components with hooks
3. Implement proper error handling
4. Write meaningful component and function names
5. Add comments for complex logic
6. Use proper type definitions
7. Follow Material-UI best practices

## Contributing

1. Create a new branch for your feature
2. Make your changes
3. Submit a pull request

## License

MIT
