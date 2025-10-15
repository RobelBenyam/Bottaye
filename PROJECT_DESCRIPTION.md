# Bottaye - Property Management System

## Project Overview

**Bottaye** is a comprehensive property and building management system specifically designed for the Kenyan market. It's a modern web application built with React and TypeScript that helps property managers, landlords, and real estate companies efficiently manage their properties, tenants, payments, and maintenance operations.

## 🏢 Core Features

### 1. **Property Management**
- Add, edit, and manage multiple properties
- Support for residential, commercial, and mixed-use properties
- Property details including address, description, type, and images
- Property-specific manager assignment

### 2. **Unit Management**
- Detailed unit tracking with unit numbers and types
- Support for various unit types: studio, 1-4 bedroom apartments, offices, and shops
- Unit status tracking (vacant, occupied, maintenance)
- Rent and deposit amount management
- Floor plan and image support

### 3. **Tenant Management**
- Complete tenant profiles with contact information
- Kenyan ID number tracking
- Emergency contact management
- Lease agreement tracking with start/end dates
- Tenant-unit assignment and status updates

### 4. **Payment System**
- Comprehensive payment tracking for rent, deposits, maintenance, and penalties
- Support for multiple payment methods: Cash, M-Pesa, Bank Transfer, Cheque
- Payment status tracking (pending, paid, overdue, partial)
- Due date and payment date management
- Reference number tracking for digital payments

### 5. **Maintenance Management**
- Maintenance request tracking and categorization
- Priority levels: low, medium, high, urgent
- Status tracking: pending, in progress, completed, cancelled
- Cost estimation and actual cost tracking
- Assignment to maintenance staff

### 6. **Dashboard & Analytics**
- Real-time property statistics
- Occupancy rate monitoring
- Revenue tracking and collection rates
- Payment status overview
- Maintenance request alerts
- Recent activity feed

### 7. **User Management**
- Role-based access control (Super Admin, Admin)
- Property-specific access permissions
- User authentication and authorization

## 🛠️ Technical Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and building
- **React Router DOM** for client-side routing
- **Tailwind CSS** for responsive, utility-first styling
- **Lucide React** for consistent iconography
- **React Hook Form** with Zod validation for form handling
- **React Hot Toast** for user notifications
- **Recharts** for data visualization

### Backend & Database
- **Firebase** as the backend-as-a-service platform
- **Firestore** for NoSQL document database
- **Firebase Authentication** for user management
- **Firebase Storage** for file uploads

### State Management
- **Zustand** for lightweight state management
- Custom stores for authentication and theme management

### Development Tools
- **TypeScript** for type safety
- **ESLint** for code quality
- **PostCSS** with Autoprefixer for CSS processing
- **Date-fns** for date manipulation
- **CLSX** for conditional class names

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── modals/         # Modal dialogs for CRUD operations
│   ├── Layout.tsx      # Main application layout
│   └── ...
├── pages/              # Route-based page components
│   ├── DashboardPage.tsx
│   ├── PropertiesPage.tsx
│   ├── TenantsPage.tsx
│   └── ...
├── hooks/              # Custom React hooks
├── lib/                # External library configurations
├── services/           # Business logic and data services
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
└── utils/              # Utility functions
```

## 🎨 Design System

The application features a comprehensive design system with:
- **Custom color palette** optimized for property management workflows
- **Dark/Light mode** support with smooth transitions
- **Responsive design** that works on desktop, tablet, and mobile
- **Consistent spacing** and typography using Tailwind CSS
- **Accessible components** with proper ARIA labels and keyboard navigation

## 🚀 Key Technical Highlights

### 1. **Type Safety**
- Comprehensive TypeScript interfaces for all data models
- Strict typing throughout the application
- Form validation with Zod schemas

### 2. **Performance Optimization**
- Lazy loading of components
- Optimized Firebase queries
- Efficient state management with Zustand
- Responsive image handling

### 3. **User Experience**
- Intuitive navigation with breadcrumbs
- Real-time data updates
- Toast notifications for user feedback
- Loading states and error handling
- Mobile-first responsive design

### 4. **Data Management**
- Firebase Firestore for scalable data storage
- Batch operations for data consistency
- Real-time data synchronization
- Offline capability with Firebase

### 5. **Security**
- Firebase Authentication with role-based access
- Secure API key management with environment variables
- Data validation on both client and server side

## 📱 Pages & Functionality

1. **Dashboard** - Overview of all key metrics and recent activity
2. **Properties** - Manage property portfolio
3. **Units** - Track individual rental units
4. **Tenants** - Tenant management and profiles
5. **Payments** - Payment tracking and collection
6. **Maintenance** - Maintenance request management
7. **Leases** - Lease agreement management
8. **Reports** - Analytics and reporting
9. **Users** - User management (Super Admin only)

## 🌍 Localization

The application is designed with Kenyan context in mind:
- Currency formatting in Kenyan Shillings (KES)
- Date formatting for Kenyan locale
- Support for Kenyan ID numbers
- M-Pesa payment method integration
- Local address and property type conventions

## 🔧 Development Setup

1. **Prerequisites**: Node.js 18+, npm/yarn
2. **Installation**: `npm install`
3. **Environment**: Configure Firebase credentials in `.env`
4. **Development**: `npm run dev`
5. **Build**: `npm run build`
6. **Preview**: `npm run preview`

## 📊 Sample Data

The application includes sample data for demonstration:
- 12 properties across different areas
- 156 rental units
- 142 active tenants
- Payment and maintenance records
- Realistic Kenyan property scenarios

## 🎯 Target Users

- **Property Managers** managing multiple properties
- **Real Estate Companies** with diverse portfolios
- **Landlords** with multiple rental units
- **Property Management Companies** serving clients

## 💡 Business Value

- **Streamlined Operations**: Centralized management of all property-related activities
- **Improved Cash Flow**: Better payment tracking and collection
- **Enhanced Tenant Relations**: Systematic tenant management and communication
- **Data-Driven Decisions**: Analytics and reporting for business insights
- **Scalability**: Cloud-based solution that grows with your business
- **Cost Efficiency**: Reduces manual work and administrative overhead

## 🔮 Future Enhancements

- Mobile app development
- Advanced reporting and analytics
- Integration with Kenyan banking systems
- Automated rent collection
- Tenant portal for self-service
- Maintenance scheduling optimization
- Document management system

---

This project demonstrates modern web development practices, cloud-native architecture, and user-centered design principles while solving real-world property management challenges in the Kenyan market.
