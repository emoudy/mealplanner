import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  ChefHat, 
  MessageCircle, 
  Bookmark, 
  Share2,
  Check,
  Star
} from 'lucide-react';

export default function Landing() {
  const handleGetStarted = () => {
    window.location.href = '/api/login';
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-brand-50 to-accent-50 dark:from-gray-800 dark:to-gray-900 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5 dark:opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Your AI-Powered <span className="text-brand-500">Recipe</span> Assistant
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Discover, save, and organize thousands of recipes with the help of AI. 
            Get personalized recommendations and never run out of meal ideas again.
          </p>
          <div className="flex justify-center">
            <Button 
              onClick={handleGetStarted}
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              Start Cooking Today
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Everything You Need to Cook
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Powerful features to transform your cooking experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* AI Chatbot Feature */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  AI Recipe Assistant
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Ask our AI for recipes based on ingredients, dietary preferences, or cooking time.
                </p>
              </CardContent>
            </Card>

            {/* Recipe Management */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Bookmark className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Save & Organize
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Save your favorite recipes and organize them by meal type for easy access.
                </p>
              </CardContent>
            </Card>

            {/* Sharing */}
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Share2 className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  Share Recipes
                </h3>
                <p className="text-gray-600 dark:text-gray-300">
                  Share your favorite recipes with friends via email or text message.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subscription Plans */}
      <section className="py-20 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Choose Your Plan
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Start free and upgrade as you cook more
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Free Plan */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Free</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  $0<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    5 recipes per month
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    Basic recipe search
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    Save up to 10 recipes
                  </li>
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full border-brand-500 text-brand-600 hover:bg-brand-50"
                  onClick={handleGetStarted}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Basic Plan */}
            <Card className="border-2 border-brand-500 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-brand-500 text-white px-4 py-1">
                  Most Popular
                </Badge>
              </div>
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Basic</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  $9<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    50 recipes per month
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    Advanced recipe search
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    Unlimited saved recipes
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    Recipe sharing
                  </li>
                </ul>
                <Button 
                  className="w-full bg-brand-500 hover:bg-brand-600"
                  onClick={handleGetStarted}
                >
                  Choose Basic
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border border-gray-200 dark:border-gray-700">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Pro</h3>
                <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                  $19<span className="text-lg text-gray-600 dark:text-gray-400">/month</span>
                </p>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    Unlimited recipes
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    AI meal planning
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    Priority support
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <Check className="w-5 h-5 text-brand-500 mr-3" />
                    Export recipes
                  </li>
                </ul>
                <Button 
                  variant="outline"
                  className="w-full border-brand-500 text-brand-600 hover:bg-brand-50"
                  onClick={handleGetStarted}
                >
                  Choose Pro
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
