# AI Interviewer - Practice Interviews with AI Feedback

A modern, AI-powered interview practice platform built with Next.js, React, and VAPI for voice AI integration. Practice behavioral, technical, and mixed interviews with instant, personalized feedback.

## ✨ Features

- **🎤 Voice AI Interviews** - Real-time voice conversations with AI interviewer
- **📊 Personalized Feedback** - Detailed scoring and improvement suggestions
- **🎯 Multiple Interview Types** - Behavioral, Technical, and Mixed interviews
- **⚙️ Custom Interviews** - Create personalized interview sessions
- **📈 Progress Tracking** - Monitor your improvement over time
- **🔐 Secure Authentication** - Firebase-based user management
- **📱 Responsive Design** - Works perfectly on all devices
- **🎨 Modern UI** - Beautiful, intuitive interface with dark mode

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm, yarn, or pnpm
- Firebase project (for authentication)
- VAPI account (for voice AI)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd ai_interviewer
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY=your-private-key
   FIREBASE_CLIENT_EMAIL=your-client-email
   
   # VAPI Configuration
   NEXT_PUBLIC_VAPI_PUBLIC_KEY=your-vapi-public-key
   NEXT_PUBLIC_VAPI_WORKFLOW_ID=your-workflow-id
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🏗️ Project Structure

```
ai_interviewer/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Authentication routes
│   ├── (root)/            # Protected routes
│   ├── api/               # API endpoints
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── ui/               # Reusable UI components
│   └── ...               # Feature components
├── constants/            # Application constants
├── firebase/             # Firebase configuration
├── lib/                  # Utility functions
├── public/               # Static assets
└── types/                # TypeScript definitions
```

## 🎯 Key Components

- **Agent.tsx** - Voice AI interview interface
- **InterviewCard.tsx** - Interview history cards
- **ProgressDashboard.tsx** - User progress tracking
- **AuthForm.tsx** - Authentication forms

## 🔧 Technologies Used

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Firebase Auth
- **Database**: Firebase Firestore
- **Voice AI**: VAPI
- **Forms**: React Hook Form + Zod
- **Notifications**: Sonner

## 📱 Features in Detail

### Voice AI Interviews
- Real-time voice conversation with AI
- Automatic speech recognition
- Natural language processing
- Context-aware responses

### Interview Types
- **Behavioral**: Focus on past experiences and soft skills
- **Technical**: Programming and technical knowledge
- **Mixed**: Combination of both types

### Feedback System
- Detailed scoring across multiple categories
- Strengths and areas for improvement
- Actionable suggestions
- Progress tracking over time

### Custom Interviews
- Create personalized interview sessions
- Add custom questions
- Configure interview settings
- Choose technology stack focus

## 🚀 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy automatically

### Other Platforms
The app can be deployed to any platform that supports Next.js:
- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:
1. Check the [Issues](../../issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎉 Acknowledgments

- [VAPI](https://vapi.ai) for voice AI capabilities
- [Firebase](https://firebase.google.com) for backend services
- [shadcn/ui](https://ui.shadcn.com) for beautiful UI components
- [Next.js](https://nextjs.org) for the amazing framework
