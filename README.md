# InternTrack - Learning Management Platform

![Next.js](https://img.shields.io/badge/Next.js-14+-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)

**InternTrack** is a modern, responsive web application built for internship and cohort-based learning programs. It helps interns track their progress, view analytics, manage certificates, and update their profiles in a clean and intuitive interface.

## ✨ Features

- **📊 Analytics Dashboard** — Comprehensive progress tracking with study hours chart, module performance, GPA, streaks, and course overview.
- **🏆 Certificates Management** — View earned certificates with detailed modal, download, and shareable links.
- **⚙️ User Settings** — Profile editing (name, bio, learning track), account details, and security options.
- **📱 Fully Responsive Design** — Optimized for desktop, tablet, and mobile with smooth UX.
- **🎨 Modern UI** — Clean design using custom CSS, DM Sans & Playfair Display fonts, and consistent theming.
- **🔒 Secure API Integration** — Backend communication with authentication headers and error handling.

## 🛠 Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Styling**: Custom CSS + Tailwind-inspired design system
- **Fonts**: DM Sans (UI) + Playfair Display (Headings)
- **State Management**: React hooks (`useState`, `useEffect`, `useCallback`)
- **API**: Custom fetch wrappers with authentication
- **Other**: LocalStorage for user persistence, SVG icons, Skeleton loaders

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/interntrack.git
   cd interntrack
2. npm install
    # or
    yarn install
    # or
    pnpm install
3. NEXT_PUBLIC_BASE_URL=http://localhost:8000   # or your backend URL
4. npm run dev
    # or
    yarn dev
    # or
    pnpm dev
5. Open http://localhost:3000 in your browser.

app/
├── Dashboard/  
├── analytics/          # Analytics dashboard
├── certificates/       # Certificates page + modal
├── settings/           # Profile & account settings
├── components/         # Reusable UI components (Sidebar, etc.)
lib/
├── api.ts              # API utilities, headers, fetch wrappers
components/
└── sidebar.tsx         # Main navigation sidebar

npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run linter

Contributions, issues, and feature requests are welcome!

Fork the project
Create your feature branch (git checkout -b feature/amazing-feature)
Commit your changes (git commit -m 'Add amazing feature')
Push to the branch (git push origin feature/amazing-feature)
Open a Pull Request

📄 License
This project is for educational/internship purposes. All rights reserved.

Built with ❤️ for internship success tracking.
If you have any questions or need more details about the project (API endpoints, backend integration, etc.), feel free to open an issue or contact the team.