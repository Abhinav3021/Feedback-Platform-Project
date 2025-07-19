# FeedbackPro

FeedbackPro is a full-stack platform built using Next.js, TypeScript, and MongoDB, designed for businesses to create and manage customer feedback forms.

## Features
### Admin
- Register/login with JWT authentication
- Create forms (3-5 customizable questions)
- View and analyze responses
- Export responses as CSV

### User
- Access and submit forms via public URLs

## Tech Stack
- **Frontend**: Next.js, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: MongoDB, Mongoose, Next.js API Routes
- **Auth**: JWT, bcryptjs

## Installation
1. Clone or download the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create `.env.local` file and configure:
   ```env
   MONGODB_URI=mongodb://localhost:27017/feedback-platform
   JWT_SECRET=[SECRET]
   NEXTAUTH_SECRET=[SECRET]
   NEXTAUTH_URL=http://localhost:3000
   ```
   Generate secrets with:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```
4. Run the development server:
   ```bash
   npm run dev
   ````

## Usage
1. Register as an admin and create a feedback form.
2. Share the public URL with users to collect responses.
3. View and analyze responses in the admin dashboard.

## Deployment
Recommend deploying with Vercel; follow the platform instructions to connect your repository and set environment variables.

## License
This project is licensed under the MIT License.

**Built with ❤️ for better feedback management**
