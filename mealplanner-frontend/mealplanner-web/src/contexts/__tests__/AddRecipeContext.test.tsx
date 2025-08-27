import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AddRecipeProvider, useAddRecipe } from '../AddRecipeContext'

// Test component to use the context
const TestComponent = () => {
  const { isModalOpen, openAddRecipeModal, closeAddRecipeModal } = useAddRecipe()
  
  return (
    <div>
      <p>Modal is {isModalOpen ? 'open' : 'closed'}</p>
      <button onClick={openAddRecipeModal}>Open Modal</button>
      <button onClick={closeAddRecipeModal}>Close Modal</button>
    </div>
  )
}

describe('AddRecipeContext', () => {
  describe('Provider functionality', () => {
    it('provides default closed state', () => {
      render(
        <AddRecipeProvider>
          <TestComponent />
        </AddRecipeProvider>
      )
      
      expect(screen.getByText('Modal is closed')).toBeInTheDocument()
    })

    it('opens modal when openAddRecipeModal is called', async () => {
      const user = userEvent.setup()
      render(
        <AddRecipeProvider>
          <TestComponent />
        </AddRecipeProvider>
      )
      
      const openButton = screen.getByText('Open Modal')
      await user.click(openButton)
      
      expect(screen.getByText('Modal is open')).toBeInTheDocument()
    })

    it('closes modal when closeAddRecipeModal is called', async () => {
      const user = userEvent.setup()
      render(
        <AddRecipeProvider>
          <TestComponent />
        </AddRecipeProvider>
      )
      
      // First open the modal
      const openButton = screen.getByText('Open Modal')
      await user.click(openButton)
      expect(screen.getByText('Modal is open')).toBeInTheDocument()
      
      // Then close it
      const closeButton = screen.getByText('Close Modal')
      await user.click(closeButton)
      expect(screen.getByText('Modal is closed')).toBeInTheDocument()
    })

    it('toggles modal state correctly', async () => {
      const user = userEvent.setup()
      render(
        <AddRecipeProvider>
          <TestComponent />
        </AddRecipeProvider>
      )
      
      const openButton = screen.getByText('Open Modal')
      const closeButton = screen.getByText('Close Modal')
      
      // Initial state: closed
      expect(screen.getByText('Modal is closed')).toBeInTheDocument()
      
      // Open modal
      await user.click(openButton)
      expect(screen.getByText('Modal is open')).toBeInTheDocument()
      
      // Close modal
      await user.click(closeButton)
      expect(screen.getByText('Modal is closed')).toBeInTheDocument()
      
      // Open again
      await user.click(openButton)
      expect(screen.getByText('Modal is open')).toBeInTheDocument()
    })
  })

  describe('Hook usage outside provider', () => {
    it('throws error when used outside provider', () => {
      // Mock console.error to prevent error output in test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
      
      expect(() => {
        render(<TestComponent />)
      }).toThrow('useAddRecipe must be used within an AddRecipeProvider')
      
      consoleSpy.mockRestore()
    })
  })

  describe('Multiple consumers', () => {
    const MultipleConsumers = () => {
      return (
        <AddRecipeProvider>
          <TestComponent />
          <TestComponent />
        </AddRecipeProvider>
      )
    }

    it('shares state between multiple consumers', async () => {
      const user = userEvent.setup()
      render(<MultipleConsumers />)
      
      // Both components should show closed initially
      const closedTexts = screen.getAllByText('Modal is closed')
      expect(closedTexts).toHaveLength(2)
      
      // Click open button on first component
      const openButtons = screen.getAllByText('Open Modal')
      await user.click(openButtons[0])
      
      // Both components should now show open
      const openTexts = screen.getAllByText('Modal is open')
      expect(openTexts).toHaveLength(2)
    })
  })

  describe('State persistence', () => {
    it('maintains state during re-renders', async () => {
      const user = userEvent.setup()
      const { rerender } = render(
        <AddRecipeProvider>
          <TestComponent />
        </AddRecipeProvider>
      )
      
      // Open modal
      const openButton = screen.getByText('Open Modal')
      await user.click(openButton)
      expect(screen.getByText('Modal is open')).toBeInTheDocument()
      
      // Re-render component
      rerender(
        <AddRecipeProvider>
          <TestComponent />
        </AddRecipeProvider>
      )
      
      // State should persist
      expect(screen.getByText('Modal is open')).toBeInTheDocument()
    })
  })

  describe('Performance', () => {
    it('does not cause unnecessary re-renders', () => {
      const renderSpy = vi.fn()
      
      const SpyComponent = () => {
        renderSpy()
        const { isModalOpen } = useAddRecipe()
        return <div>Modal: {isModalOpen ? 'open' : 'closed'}</div>
      }
      
      render(
        <AddRecipeProvider>
          <SpyComponent />
        </AddRecipeProvider>
      )
      
      // Should render once initially
      expect(renderSpy).toHaveBeenCalledTimes(1)
    })
  })
})