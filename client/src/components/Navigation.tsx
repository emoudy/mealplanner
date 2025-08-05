import { useAuth } from '@/hooks/useAuth';
import { useThemeContext } from '@/components/ThemeProvider';
import { useAddRecipe } from '@/contexts/AddRecipeContext';
import { Button } from '@/components/ui/button';
import { Link, useLocation } from 'wouter';
import { 
  Moon, 
  Sun, 
  ChefHat, 
  BookOpen, 
  MessageCircle, 
  UtensilsCrossed,
  Settings, 
  LogOut,
  User
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function Navigation() {
  const { user, isAuthenticated } = useAuth();
  const { isDarkMode, toggleTheme } = useThemeContext();
  const { openAddRecipeModal } = useAddRecipe();
  const [location] = useLocation();

  const handleLogout = async () => {
    try {
      await fetch('/api/logout', { 
        method: 'POST',
        credentials: 'include' 
      });
      // Force a page refresh to clear the auth state
      window.location.href = '/';
    } catch (error) {
      console.error('Logout error:', error);
      // Fallback to GET request
      window.location.href = '/api/logout';
    }
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50" role="navigation" aria-label="Main navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3" aria-label="FlavorBot home">
            <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-yellow-500 rounded-lg flex items-center justify-center" aria-hidden="true">
              <ChefHat className="w-4 h-4 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">FlavorBot</span>
          </Link>

          {/* Navigation Links (Authenticated State) */}
          {isAuthenticated && (
            <div className="hidden md:flex items-center space-x-2" role="menubar" aria-label="Main menu">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/chatbot">
                    <Button 
                      variant={location === '/chatbot' ? 'default' : 'ghost'}
                      size="icon"
                      className="w-10 h-10"
                      aria-label="Ask FlavorBot for recipe recommendations"
                      aria-current={location === '/chatbot' ? 'page' : undefined}
                      role="menuitem"
                    >
                      <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Chat with FlavorBot</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href="/recipes">
                    <Button 
                      variant={location === '/recipes' ? 'default' : 'ghost'}
                      size="icon"
                      className="w-10 h-10"
                      aria-label="View saved recipes"
                      aria-current={location === '/recipes' ? 'page' : undefined}
                      role="menuitem"
                    >
                      <BookOpen className="w-5 h-5" aria-hidden="true" />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>My Recipes</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="ghost"
                    size="icon"
                    className="w-10 h-10"
                    onClick={openAddRecipeModal}
                    aria-label="Add new recipe"
                    role="menuitem"
                  >
                    <UtensilsCrossed className="w-5 h-5" aria-hidden="true" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add Recipe</p>
                </TooltipContent>
              </Tooltip>
            </div>
          )}

          {/* User Menu & Controls */}
          <div className="flex items-center space-x-4">
            {/* Dark Mode Toggle */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={toggleTheme}
                  className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label={`Switch to ${isDarkMode ? 'light' : 'dark'} mode`}
                  aria-pressed={isDarkMode}
                >
                  {isDarkMode ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}</p>
              </TooltipContent>
            </Tooltip>
            
            {isAuthenticated ? (
              /* User Profile Dropdown */
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="flex items-center space-x-2 p-2"
                    aria-label={`User menu for ${(user as any)?.name}` || (user as any)?.email || 'User'}
                  >
                    <Avatar className="w-8 h-8">
                      <AvatarImage 
                        src={(user as any)?.profileImageUrl} 
                        alt={`${(user as any)?.name}` || (user as any)?.email || 'User'}
                      />
                      <AvatarFallback>
                        <User className="w-4 h-4" aria-hidden="true" />
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5" role="presentation">
                    <p className="text-sm font-medium">{(user as any)?.name}</p>
                    <p className="text-xs text-muted-foreground">{(user as any)?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <Link href="/settings">
                    <DropdownMenuItem className="cursor-pointer">
                      <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                      Settings
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>


      </div>
    </nav>
  );
}
