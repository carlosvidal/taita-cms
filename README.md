# Astro Blog CMS

Content Management System for the Astro Blog platform.

## Features
- User authentication and authorization
- Article creation and management
- Media library for images and files
- Category and tag management
- Draft and scheduling system

## Installation

1. Install dependencies:
```
npm install
```
2. Configure environment:
```
cp .env.example .env
```
3. Update .env with your settings:
```
CMS_PORT=3001
API_URL=http://localhost:3000/api
SESSION_SECRET=your_session_secret
```
## Development
```
# Start development server
npm run dev
# Build for production
npm run build
```

## Deployment
```
# Start production server
npm start
```

## Environment Variables Variable Description Required Default CMS_PORT

CMS server port

No

3001 API_URL

Backend API URL

Yes SESSION_SECRET

Session secret key

Yes
## License
MIT