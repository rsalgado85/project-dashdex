# DashDex - Pokémon Analytics Dashboard

> A modern, professional Pokémon analytics dashboard built with React 19, TypeScript, and cutting-edge web technologies. Transform raw PokéAPI data into beautiful, interactive visualizations.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![React](https://img.shields.io/badge/React-19-61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6)
![License](https://img.shields.io/badge/license-MIT-green)

## 🚀 Features

- **Dashboard** - Real-time KPIs and analytics overview
- **Global Statistics** - Type distribution, height/weight histograms, base experience charts
- **Pokémon Comparator** - Side-by-side stat comparison with radar charts
- **Advanced Explorer** - Search, filter, and infinite scroll through all Pokémon
- **Pokémon Detail** - Detailed view with stats, abilities, and artwork
- **Rankings** - Top performers across all stat categories
- **Insights** - Data-driven conclusions and type averages

## 🛠️ Tech Stack

| Technology | Purpose |
|------------|---------|
| React 19 | UI Framework |
| TypeScript | Type Safety |
| Vite | Build Tool |
| React Router | Navigation |
| TanStack Query | Server State & Caching |
| Zustand | Client State Management |
| Tailwind CSS | Styling |
| Framer Motion | Animations |
| Recharts | Data Visualization |
| Axios | HTTP Client |
| Lucide React | Icons |

## 📁 Architecture

```
src/
├── app/           # App configuration
├── assets/        # Static assets
├── components/    # Reusable components
│   ├── common/    # Shared UI components
│   ├── charts/    # Chart components
│   ├── dashboard/ # Dashboard-specific
│   └── pokemon/   # Pokémon-specific
├── pages/         # Route pages
├── hooks/         # Custom React hooks
├── services/      # API services
├── store/         # Zustand store
├── routes/        # Route definitions
├── layouts/       # Layout components
├── utils/         # Utility functions
├── cache/         # Cache management
├── constants/     # Constants
├── types/         # TypeScript types
└── styles/        # Global styles
```

## 🏗️ Principles Applied

- **SOLID** - Single responsibility, open/closed, Liskov substitution, interface segregation, dependency inversion
- **DRY** - Don't Repeat Yourself
- **KISS** - Keep It Simple, Stupid
- **Separation of Concerns** - Clear boundaries between layers

## 🚦 Getting Started

### Prerequisites

- Node.js 20+
- npm 10+
- Docker (optional, for containerized deployment)

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/dashdex.git
cd dashdex

# Install dependencies
npm install

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm run preview
```

## 🐳 Docker Deployment

### Using Docker Compose (Recommended)

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

The application will be available at `http://localhost:3000`.

### Using Docker Directly

```bash
# Build the image
docker build -t dashdex .

# Run the container
docker run -d -p 3000:80 --name dashdex dashdex
```

## ▲ Vercel Deployment

### Automatic (Recommended)

1. Push your code to a GitHub repository
2. Import the project in Vercel
3. Vercel will automatically detect the Vite configuration
4. Deploy!

### Manual

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

## ⚡ Performance

- **TanStack Query** - 30-minute stale time, 24-hour cache
- **LocalStorage Cache** - Multi-level caching with configurable TTL
- **Lazy Loading** - Images and components loaded on demand
- **Infinite Scroll** - Efficient data loading in Explorer
- **Code Splitting** - Route-based code splitting

## ♿ Accessibility

- ARIA labels on all interactive elements
- Keyboard navigation support
- Semantic HTML structure
- High contrast ratios
- Screen reader friendly

## 📊 Data Visualization

All charts are built with Recharts and feature:

- Interactive tooltips
- Smooth animations
- Responsive design
- Custom theming
- Hover states

## 🔒 Security

- Content Security Policy headers
- XSS protection
- Secure HTTP headers (via nginx/Vercel)
- No sensitive data exposure

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

Built with ❤️ using React + TypeScript
