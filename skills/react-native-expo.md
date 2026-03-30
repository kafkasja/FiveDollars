# React Native Expo Development Skill

## Overview
This skill provides guidance for working with React Native Expo projects, specifically tailored for the FiveDollars/Family App.

## Common Commands

### Starting the Development Server
```bash
# Start Metro bundler
npx expo start

# Start with specific port
npx expo start --port 19000

# Start for web
npx expo start --web

# Start for Android emulator
npx expo start --android

# Start for iOS simulator
npx expo start --ios
```

### Installing Dependencies
```bash
# Standard installation
npm install

# Installation with legacy peer deps (for version conflicts)
npm install --legacy-peer-deps

# Installing Expo SDK packages
npx expo install [package-name]
```

### Testing on Devices
```bash
# Generate QR code for Expo Go
npx expo start

# For development client (if needed)
npx expo start --dev-client
```

## Project Structure Navigation
- `app/` - Expo Router pages and layouts
- `lib/` - Utility libraries (Supabase, storage)
- `types/` - TypeScript interfaces
- Configuration files in root directory

## Common Issues and Fixes

### Babel Configuration Issues
If you see `.plugins is not a valid Plugin property` errors:
1. Simplify `babel.config.js` to only contain essential presets
2. Remove any deprecated plugin references like `expo-router/babel`
3. Reinstall dependencies

### Dependency Conflicts
For peer dependency errors:
1. Use `--legacy-peer-deps` flag when installing
2. Check version compatibility between packages
3. Consider updating to compatible versions

### Asset Loading Issues
If you see missing asset errors:
1. Ensure asset files exist in the referenced locations
2. Check `app.json` for correct asset paths
3. Create placeholder assets if needed for testing

## Development Best Practices

### State Management
- Use React hooks (useState, useEffect) for local state
- Consider context API for global state if needed
- Supabase provides real-time subscriptions for data synchronization

### Styling with NativeWind/Tailwind
- Use Tailwind utility classes for styling
- Refer to `tailwind.config.js` for custom configurations
- Check `global.css` for base styles

### Supabase Integration
- Initialize client in `lib/supabase.ts`
- Use real-time subscriptions for live updates
- Handle authentication via AsyncStorage if needed

### TypeScript Usage
- Define interfaces in `types/index.ts`
- Use strict type checking as configured in tsconfig.json
- Leverage path aliases (@/*) for cleaner imports