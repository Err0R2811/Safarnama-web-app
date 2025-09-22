# 🌟 Safarnama - Travel Management App

<div align="center">
  <h1>✈️ Safarnama</h1>
  <p>A beautiful, feature-rich travel management application for planning, tracking, and managing your adventures</p>
  
  ![React](https://img.shields.io/badge/React-18.3.1-blue.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-3.4.17-blue.svg)
  ![Supabase](https://img.shields.io/badge/Supabase-2.57.4-green.svg)
  ![Mobile](https://img.shields.io/badge/Mobile%20Ready-iOS%20%26%20Android-purple.svg)
</div>

## 🚀 Features

### ✈️ **Trip Management**
- 📅 **Plan & Track**: Create, manage, and monitor your travel itineraries
- 🗺️ **GPS Integration**: Location-based trip creation and tracking
- 📊 **Trip Status**: Planning → In Progress → Completed workflow
- 🚗 **Travel Modes**: Support for car, plane, train with visual indicators

### 💰 **Smart Expense Tracking**
- 💳 **Real-time Updates**: Instant expense calculation and sync
- 📈 **Category Breakdown**: Transport, food, accommodation, entertainment, other
- 📊 **Visual Analytics**: Expense summaries and category-wise insights
- ₹ **Multi-currency**: Full Indian Rupee support

### 📱 **Cross-Platform Ready**
- 🌐 **Progressive Web App**: Installable from any browser
- 📱 **Native Mobile Apps**: iOS and Android app store ready
- 🎨 **Responsive Design**: Seamless experience across all devices
- 🌙 **Dark/Light Mode**: Beautiful themes with smooth transitions

### 📊 **Data Management**
- 📤 **Export Options**: CSV and Excel export with multi-sheet support
- 📥 **Import Capabilities**: Bulk trip creation from files
- 🔄 **Data Validation**: Error checking and reporting
- 📋 **Template Generation**: Pre-formatted import templates

### 👤 **Profile & Settings**
- 🖼️ **Profile Pictures**: Camera/gallery integration
- ✏️ **Editable Profiles**: Personal information management
- ⚙️ **Privacy Controls**: Location and data sharing preferences
- 🔐 **Secure Authentication**: Email/password with Supabase

## 🛠️ Technology Stack

### **Frontend**
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first styling with custom design system
- **Radix UI** - Accessible, unstyled UI components
- **Lucide React** - Beautiful, customizable icons
- **React Router** - Client-side routing
- **React Query** - Server state management
- **Next Themes** - Theme switching with system preference support

### **Backend & Database**
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Row Level Security** - Data isolation and privacy
- **Real-time Subscriptions** - Live data synchronization
- **Authentication** - Secure user management

### **Mobile & Build Tools**
- **Capacitor** - Native mobile app capabilities
- **Vite** - Fast development and optimized builds
- **ESLint** - Code quality and consistency
- **Papa Parse** - CSV processing
- **SheetJS** - Excel file handling

## 🚀 Quick Start

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Git

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/safarnama.git

# Navigate to project directory
cd safarnama

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Environment Setup

1. Create a `.env.local` file in the root directory
2. Add your Supabase credentials:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 📱 Mobile Development

### Build Mobile Apps

```bash
# Build and sync for mobile
npm run mobile:sync

# Open Android Studio
npm run mobile:android

# Open Xcode (Mac only)
npm run mobile:ios
```

### Mobile Features
- 📷 **Camera Integration**: Profile picture upload
- 📍 **GPS Location**: Automatic location detection
- 🔔 **Push Notifications**: Trip reminders and updates
- 💾 **Offline Support**: Local storage with cloud sync

## 🎨 Design System

### Color Palette
- **Primary**: Royal Blue (#1A73E8) - Trust and professionalism
- **Secondary**: Champagne Gold (#D4AF37) - Luxury and exclusivity
- **Accent**: Sunset Orange (#FF7043) - Excitement and highlights
- **Success**: Emerald Green - Positive actions
- **Background**: Ivory White/Midnight Black - Clean and elegant

### Theme Features
- 🌅 **Luxury Travel Theme**: Premium color palette
- 🎯 **Accessible Design**: WCAG compliant contrast ratios
- ✨ **Smooth Animations**: Delightful micro-interactions
- 📱 **Touch Optimized**: Mobile-first design approach

## 📊 Performance

### Bundle Size
- **Gzipped**: 327KB (58% reduction from original)
- **Optimized**: Tree-shaking and code splitting
- **Mobile-First**: Efficient resource loading

### Features Coverage
- ✅ 100% Mobile navigation
- ✅ 100% CRUD operations
- ✅ 100% Real-time sync
- ✅ 100% Import/Export
- ✅ 100% User profiles
- ✅ 100% Authentication

## 📁 Project Structure

```
safarnama/
├── 📁 src/
│   ├── 📁 components/     # Reusable UI components
│   ├── 📁 contexts/       # React contexts (Auth, Theme)
│   ├── 📁 hooks/          # Custom React hooks
│   ├── 📁 lib/            # Utilities and configurations
│   ├── 📁 pages/          # Application pages
│   ├── 📁 services/       # API and business logic
│   └── 📄 App.tsx         # Root component
├── 📁 android/            # Android native project
├── 📁 ios/                # iOS native project
├── 📁 public/             # Static assets
├── 📁 docs/               # Documentation
└── 📄 dist/               # Production build
```

## 🔧 Available Scripts

```bash
# Development
npm run dev                 # Start dev server
npm run build              # Production build
npm run preview            # Preview production build
npm run lint               # Run ESLint

# Mobile Development
npm run mobile:sync        # Build and sync to mobile
npm run mobile:android     # Open Android Studio
npm run mobile:ios         # Open Xcode
npm run mobile:serve       # Serve with Capacitor
```

## 📖 User Guide

### First Time Setup
1. 📝 **Sign Up**: Create your account
2. ✏️ **Profile Setup**: Add personal information
3. ✈️ **Create First Trip**: Use the guided trip creation
4. 💰 **Track Expenses**: Add real-time expenses
5. 📊 **View Analytics**: Monitor your travel statistics

### Key Features
- 🏠 **Dashboard**: Overview of all trips and statistics
- ➕ **Add Trip**: Create new adventures with GPS
- 👤 **Profile**: Manage personal information
- ⚙️ **Settings**: Privacy, data, and app preferences

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- 📝 **TypeScript**: Use type-safe code
- 🎨 **Component Structure**: Follow established patterns
- ♿ **Accessibility**: Ensure ARIA compliance
- 📱 **Mobile-First**: Consider mobile experience
- ✅ **Testing**: Add tests for new features

## 📚 Documentation

- 📖 [Development Setup](./DEV_SETUP.md)
- 📱 [Mobile App Guide](./MOBILE_APP_GUIDE.md)
- 📊 [Import/Export Guide](./IMPORT_EXPORT_GUIDE.md)
- 📋 [Project Summary](./PROJECT_SUMMARY.md)

## 🔐 Security

- 🛡️ **Supabase Authentication**: Industry-standard security
- 🔒 **Row Level Security**: Data isolation per user
- 🔑 **API Security**: Protected endpoints
- 👤 **Privacy First**: User data control
- 📱 **Mobile Security**: Native app protection

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- 🎨 **Radix UI** - Accessible component primitives
- 🎯 **Lucide** - Beautiful icon library
- 🚀 **Supabase** - Amazing backend platform
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- ⚡ **Vite** - Lightning-fast build tool

## 📞 Support

If you have any questions or need help:

- 📧 **Email**: amitvirpara@outlook.com
- 💬 **Issues**: Open a GitHub issue
- 📱 **Mobile**: Check mobile-specific guides

---

<div align="center">
  <h3>🌟 Happy Traveling with Safarnama! ✈️</h3>
  <p>Built with ❤️ for travelers, by travelers</p>
</div>
