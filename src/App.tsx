import { Authenticated, Unauthenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { Dashboard } from "./components/Dashboard";
import { ProfileSetup } from "./components/ProfileSetup";

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">AI</span>
            </div>
            <h1 className="text-xl font-bold text-gray-900">Smart Study Companion</h1>
          </div>
          <Authenticated>
            <SignOutButton />
          </Authenticated>
        </div>
      </header>
      
      <main className="flex-1">
        <Content />
      </main>
      
      <Toaster position="top-right" />
    </div>
  );
}

function Content() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const profile = useQuery(api.profiles.getCurrentProfile);

  if (loggedInUser === undefined || profile === undefined) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Authenticated>
        {!profile ? <ProfileSetup /> : <Dashboard />}
      </Authenticated>
      
      <Unauthenticated>
        <div className="max-w-md mx-auto mt-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Learning
            </h2>
            <p className="text-lg text-gray-600">
              Personalized study plans, intelligent tutoring, and behavioral adaptation 
              to maximize your academic success.
            </p>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">
              Sign in to get started
            </h3>
            <SignInForm />
          </div>
          
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 text-xl">📚</span>
              </div>
              <h4 className="font-semibold text-gray-900">Smart Planning</h4>
              <p className="text-sm text-gray-600 mt-1">
                AI-generated study schedules based on your goals and availability
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 text-xl">🤖</span>
              </div>
              <h4 className="font-semibold text-gray-900">AI Tutoring</h4>
              <p className="text-sm text-gray-600 mt-1">
                Personalized explanations, quizzes, and doubt resolution
              </p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 text-xl">📊</span>
              </div>
              <h4 className="font-semibold text-gray-900">Behavioral Insights</h4>
              <p className="text-sm text-gray-600 mt-1">
                Fatigue detection and adaptive scheduling for optimal learning
              </p>
            </div>
          </div>
        </div>
      </Unauthenticated>
    </div>
  );
}
