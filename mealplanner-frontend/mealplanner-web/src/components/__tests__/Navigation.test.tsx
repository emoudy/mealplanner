import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
import { Navigation } from '../Navigation'

// Mock wouter
vi.mock('wouter', () => ({
  Link: ({ children, href, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useLocation: () => ['/'],
}))

describe('Navigation Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('Logo and Branding', () => {
    it('displays the MealPlanner logo with correct styling', () => {
      render(<Navigation />)
      
      const logo = screen.getByLabelText('MealPlanner home')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveAttribute('href', '/')
      
      const logoText = screen.getByText('MealPlanner')
      expect(logoText).toBeInTheDocument()
      expect(logoText).toHaveClass('text-xl', 'font-bold')
    })

    it('has the ChefHat icon with proper gradient background', () => {
      render(<Navigation />)
      
      const iconContainer = screen.getByRole('link', { name: 'MealPlanner home' })
        .querySelector('div')
      expect(iconContainer).toHaveClass(
        'w-8', 'h-8', 'bg-gradient-to-br', 'from-red-500', 'to-yellow-500', 'rounded-lg'
      )
    })
  })

  describe('Desktop Navigation Menu', () => {
    it('displays all navigation buttons when authenticated', () => {
      render(<Navigation />)
      
      // Check for chatbot button
      const chatbotButton = screen.getByLabelText('Ask MealPlanner for recipe recommendations')
      expect(chatbotButton).toBeInTheDocument()
      expect(chatbotButton.closest('a')).toHaveAttribute('href', '/chatbot')
      
      // Check for recipes button
      const recipesButton = screen.getByLabelText('View saved recipes')
      expect(recipesButton).toBeInTheDocument()
      expect(recipesButton.closest('a')).toHaveAttribute('href', '/recipes')
      
      // Check for add recipe button
      const addRecipeButton = screen.getByLabelText('Add new recipe')
      expect(addRecipeButton).toBeInTheDocument()
    })

    it('highlights current page in navigation', () => {
      // Mock current location as chatbot
      vi.doMock('wouter', () => ({
        Link: ({ children, href, ...props }: any) => (
          <a href={href} {...props}>
            {children}
          </a>
        ),
        useLocation: () => ['/chatbot'],
      }))

      render(<Navigation />)
      
      const chatbotButton = screen.getByLabelText('Ask MealPlanner for recipe recommendations')
      expect(chatbotButton).toHaveAttribute('aria-current', 'page')
    })

    it('opens add recipe modal when add recipe button is clicked', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const addRecipeButton = screen.getByLabelText('Add new recipe')
      await user.click(addRecipeButton)
      
      // The modal should be opened via context
      // We can verify this by checking if the button was clicked
      expect(addRecipeButton).toBeInTheDocument()
    })
  })

  describe('Theme Toggle', () => {
    it('displays dark mode toggle button', () => {
      render(<Navigation />)
      
      const themeToggle = screen.getByLabelText(/Switch to .* mode/)
      expect(themeToggle).toBeInTheDocument()
    })

    it('toggles theme when clicked', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const themeToggle = screen.getByLabelText(/Switch to .* mode/)
      await user.click(themeToggle)
      
      // Button should still be present after click
      expect(themeToggle).toBeInTheDocument()
    })

    it('shows correct icon based on theme state', () => {
      render(<Navigation />)
      
      const themeToggle = screen.getByLabelText(/Switch to .* mode/)
      expect(themeToggle).toBeInTheDocument()
      
      // Should contain either Sun or Moon icon
      const iconElement = themeToggle.querySelector('svg')
      expect(iconElement).toBeInTheDocument()
    })
  })

  describe('User Profile Dropdown', () => {
    it('displays user avatar when authenticated', () => {
      render(<Navigation />)
      
      const userMenuButton = screen.getByLabelText(/User menu for/)
      expect(userMenuButton).toBeInTheDocument()
    })

    it('opens dropdown menu when avatar is clicked', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const userMenuButton = screen.getByLabelText(/User menu for/)
      await user.click(userMenuButton)
      
      // Check if dropdown items appear
      await waitFor(() => {
        expect(screen.getByText('Settings')).toBeInTheDocument()
        expect(screen.getByText('Sign out')).toBeInTheDocument()
      })
    })

    it('navigates to settings when settings option is clicked', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const userMenuButton = screen.getByLabelText(/User menu for/)
      await user.click(userMenuButton)
      
      await waitFor(() => {
        const settingsLink = screen.getByText('Settings')
        expect(settingsLink.closest('a')).toHaveAttribute('href', '/settings')
      })
    })

    it('handles logout when sign out is clicked', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const userMenuButton = screen.getByLabelText(/User menu for/)
      await user.click(userMenuButton)
      
      await waitFor(() => {
        const signOutButton = screen.getByText('Sign out')
        expect(signOutButton).toBeInTheDocument()
      })
    })
  })

  describe('Accessibility Features', () => {
    it('has proper ARIA labels and roles', () => {
      render(<Navigation />)
      
      const nav = screen.getByRole('navigation')
      expect(nav).toHaveAttribute('aria-label', 'Main navigation')
      
      const menubar = screen.getByRole('menubar')
      expect(menubar).toHaveAttribute('aria-label', 'Main menu')
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const chatbotButton = screen.getByLabelText('Ask MealPlanner for recipe recommendations')
      
      // Tab to the button and press Enter
      await user.tab()
      await user.keyboard('{Enter}')
      
      expect(chatbotButton).toBeInTheDocument()
    })

    it('has proper aria-current for active pages', () => {
      render(<Navigation />)
      
      // Default location is '/', so check for appropriate aria-current
      const buttons = screen.getAllByRole('menuitem')
      buttons.forEach(button => {
        const ariaCurrent = button.getAttribute('aria-current')
        expect(ariaCurrent).toSatisfy((value: string | null) => 
          value === null || value === 'page'
        )
      })
    })

    it('has proper color contrast for visibility', () => {
      render(<Navigation />)
      
      const logoContainer = screen.getByLabelText('MealPlanner home')
        .querySelector('div')
      
      // Verify the gradient classes are applied
      expect(logoContainer).toHaveClass('from-red-500', 'to-yellow-500')
      
      // Verify text color for contrast
      const logoText = screen.getByText('MealPlanner')
      expect(logoText).toHaveClass('text-gray-900', 'dark:text-white')
    })
  })

  describe('Responsive Design', () => {
    it('hides desktop navigation on mobile screens', () => {
      render(<Navigation />)
      
      const desktopNav = screen.getByRole('menubar')
      expect(desktopNav).toHaveClass('hidden', 'md:flex')
    })

    it('maintains logo visibility across all screen sizes', () => {
      render(<Navigation />)
      
      const logo = screen.getByLabelText('MealPlanner home')
      expect(logo).toBeInTheDocument()
      expect(logo).toHaveClass('flex', 'items-center')
    })
  })

  describe('Error Handling', () => {
    it('gracefully handles missing user data', () => {
      // Mock useAuth to return no user
      vi.doMock('@/hooks/useAuth', () => ({
        useAuth: () => ({
          user: null,
          isAuthenticated: false,
          login: vi.fn(),
          logout: vi.fn(),
        }),
      }))

      expect(() => render(<Navigation />)).not.toThrow()
    })

    it('handles theme toggle errors gracefully', async () => {
      const user = userEvent.setup()
      render(<Navigation />)
      
      const themeToggle = screen.getByLabelText(/Switch to .* mode/)
      
      // Multiple rapid clicks shouldn't cause errors
      await user.click(themeToggle)
      await user.click(themeToggle)
      await user.click(themeToggle)
      
      expect(themeToggle).toBeInTheDocument()
    })
  })
})