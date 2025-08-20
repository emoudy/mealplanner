import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '../../test/test-utils'
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

describe('Navigation - Basic Tests', () => {
  it('renders MealPlanner logo and text', () => {
    render(<Navigation />)
    
    // Check for logo link
    const logoLink = screen.getByLabelText('MealPlanner home')
    expect(logoLink).toBeInTheDocument()
    expect(logoLink).toHaveAttribute('href', '/')
    
    // Check for MealPlanner text
    const logoText = screen.getByText('MealPlanner')
    expect(logoText).toBeInTheDocument()
  })

  it('displays navigation elements when authenticated', () => {
    render(<Navigation />)
    
    // Should have navigation role
    const nav = screen.getByRole('navigation')
    expect(nav).toBeInTheDocument()
    expect(nav).toHaveAttribute('aria-label', 'Main navigation')
  })

  it('has proper color contrast classes for logo', () => {
    render(<Navigation />)
    
    const logoText = screen.getByText('MealPlanner')
    expect(logoText).toHaveClass('text-gray-900', 'dark:text-white')
  })

  it('contains theme toggle button', () => {
    render(<Navigation />)
    
    const themeToggle = screen.getByLabelText(/Switch to .* mode/)
    expect(themeToggle).toBeInTheDocument()
  })

  it('displays user menu when authenticated', () => {
    render(<Navigation />)
    
    const userMenuButton = screen.getByLabelText(/User menu for/)
    expect(userMenuButton).toBeInTheDocument()
  })

  it('has responsive classes for desktop navigation', () => {
    render(<Navigation />)
    
    // Check that desktop navigation exists
    const menubar = screen.getByRole('menubar')
    expect(menubar).toBeInTheDocument()
    expect(menubar).toHaveClass('hidden', 'md:flex')
  })
})