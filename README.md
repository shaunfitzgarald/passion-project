# Passion Project

A modern React.js application built with Material UI, Firebase, and Google Maps integration.

## Features

- 🎨 Beautiful Material UI components
- 🔥 Firebase backend (Authentication, Firestore, Storage)
- 🗺️ Google Maps integration
- 📱 Responsive design
- ⚡ Modern React hooks

## Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm or yarn
- Firebase project
- Google Maps API key

### Installation

1. Clone or navigate to this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env`:
     ```bash
     cp .env.example .env
     ```
   - Fill in your Firebase and Google Maps API credentials in `.env`

### Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or select an existing one
3. **Enable Authentication:**
   - Go to Authentication → Sign-in method
   - Enable **Email/Password** provider
   - Enable **Email link (passwordless sign-in)** in the Email/Password settings
   - Enable **Google** provider (add your support email if prompted)
4. Create a Firestore database:
   - Go to Firestore Database → Create database
   - Start in test mode (you can change rules later)
5. Enable Storage if needed
6. Copy your Firebase config:
   - Go to Project Settings → General → Your apps
   - Click the web icon (</>) to add a web app if you haven't already
   - Copy the config values to your `.env` file
7. Add authorized domains (for email link authentication):
   - Go to Authentication → Settings → Authorized domains
   - Make sure `localhost` is listed (it should be by default)

### Google Maps Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **Enable the required APIs:**
   - **Maps JavaScript API** (REQUIRED) - For displaying interactive maps
   - **Places API (New)** (RECOMMENDED) - For place search, autocomplete, and details
   - **Geocoding API** (OPTIONAL) - For address ↔ coordinates conversion
3. Create an API key:
   - Go to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "API Key"
   - (Optional but recommended) Restrict the key to your domain for security
4. Add the key to your `.env` file as `REACT_APP_GOOGLE_MAPS_API_KEY`

### Running the App

```bash
npm start
```

The app will open at [http://localhost:3000](http://localhost:3000)

### Building for Production

```bash
npm run build
```

## Project Structure

```
src/
  ├── components/     # Reusable UI components
  ├── pages/         # Page components
  ├── services/      # Firebase and API services
  ├── config/        # Configuration files
  ├── utils/         # Utility functions
  └── App.js         # Main app component
```

## Technologies Used

- **React** - UI library
- **Material UI** - Component library
- **Firebase** - Backend services
- **Google Maps API** - Map integration

## Development Tips

- The app uses environment variables for API keys - never commit `.env` to version control
- Firebase services are initialized in `src/config/firebase.js`
- Map configuration is in `src/config/googleMaps.js`
- Material UI theme can be customized in `src/config/theme.js`

## Next Steps

- Add authentication flows
- Implement data fetching from Firestore
- Add more interactive map features
- Create additional pages and components
- Add user profiles and settings

## License

This project is for educational purposes.
