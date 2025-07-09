# StoryVid Client Portal

A professional video production client portal built with React and Material UI. This web application provides role-based dashboards for clients, staff, and administrators to manage video production projects, milestones, and deliverables.

## 🚀 Features

### Authentication & Authorization
- Mock authentication system with three user roles
- Protected routes and role-based access control
- Session persistence with localStorage

### Role-Based Dashboards
- **Client Dashboard**: View projects, approve milestones, access deliverables
- **Staff Dashboard**: Manage assigned tasks, upload files, track deadlines
- **Admin Dashboard**: Full system overview, client management, team oversight

### Key Components
- Project cards with progress tracking
- Milestone management system
- Activity feed with real-time updates
- File upload and management (UI ready)
- Responsive design for all devices
- Professional StoryVid branding

## 🛠️ Tech Stack

- **Frontend**: React 18
- **UI Framework**: Material UI v5
- **Routing**: React Router v6
- **State Management**: React Context API
- **Styling**: Material UI Theme + Custom Styles
- **Build Tool**: Create React App
- **Deployment**: Vercel

## 📦 Installation

1. Clone the repository:
```bash
git clone https://github.com/Christopher-I/storyvid.git
cd storyvid
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

## 🔐 Demo Accounts

Use these credentials to test different user roles:

- **Client**: `client@test.com` / `password`
- **Staff**: `staff@test.com` / `password`
- **Admin**: `admin@test.com` / `password`

## 📱 Available Scripts

### `npm start`
Runs the app in development mode

### `npm test`
Launches the test runner

### `npm run build`
Builds the app for production to the `build` folder

### `npm run eject`
**Note: this is a one-way operation. Once you `eject`, you can't go back!**

## 🚀 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Build the project:
```bash
npm run build
```

3. Deploy to Vercel:
```bash
vercel --prod
```

### Manual Vercel Setup

When deploying through Vercel's dashboard:
- **Framework Preset**: Create React App
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Environment Variables

For production deployment, set these environment variables in Vercel:

```
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
├── contexts/           # React Context providers
├── data/              # Mock data and configurations
├── pages/             # Page components
├── services/          # Service layer (Firebase ready)
└── App.js             # Main application component
```

## 🔄 Firebase Migration

The app is built with a service layer abstraction that allows easy migration from mock data to Firebase:

1. Update Firebase configuration in `src/services/firebase/firebaseConfig.js`
2. Toggle `useMockData` flag in `src/services/firebase/firebaseService.js`
3. Follow the migration guide in `FIREBASE_MIGRATION_GUIDE.md`

## 📊 Week 2 Completion Status

✅ **Completed Features:**
- Authentication system with role-based access
- Responsive dashboard with all required components
- Project cards with progress tracking
- Activity feed and notifications
- Mobile-responsive design
- Error handling and loading states
- Firebase migration preparation

## 🐛 Troubleshooting

### Build Issues
If you encounter build errors:
1. Delete `node_modules` and `package-lock.json`
2. Run `npm install` again
3. Clear npm cache: `npm cache clean --force`

### Vercel Deployment Issues
- Ensure you're deploying from the correct repository
- Check that all dependencies are listed in `package.json`
- Verify build command is set to `npm run build`

## 📝 Documentation

- [Week 2 Completion Report](./WEEK_2_COMPLETION_REPORT.md)
- [Detailed Technical Report](./WEEK_2_DETAILED_COMPLETION_REPORT.md)
- [Firebase Migration Guide](./FIREBASE_MIGRATION_GUIDE.md)

## 🤝 Contributing

This is a private project for StoryVid. For any questions or issues, please contact the development team.

## 📄 License

This project is proprietary and confidential. All rights reserved.

---

Built with ❤️ for StoryVid