import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '../../test/test-utils'
import userEvent from '@testing-library/user-event'
// AddRecipeModal will be imported after the mock

// Mock the API calls and AddRecipeModal component since it doesn't exist yet
const mockApiRequest = vi.fn()
vi.mock('@/lib/queryClient', () => ({
  apiRequest: mockApiRequest,
  queryClient: {
    invalidateQueries: vi.fn(),
  },
}))

// Mock AddRecipeModal component
const AddRecipeModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  if (!isOpen) return null
  
  return (
    <div role="dialog" aria-labelledby="modal-title" aria-describedby="modal-description">
      <h2 id="modal-title">Add New Recipe</h2>
      <p id="modal-description">Create a new recipe for your collection</p>
      <button aria-label="Close" onClick={onClose}>X</button>
      
      <form>
        <label htmlFor="title">Recipe Title</label>
        <input id="title" type="text" />
        
        <label htmlFor="description">Description</label>
        <textarea id="description" />
        
        <label htmlFor="ingredients">Ingredients</label>
        <textarea id="ingredients" />
        
        <label htmlFor="instructions">Instructions</label>
        <textarea id="instructions" />
        
        <label htmlFor="mealType">Meal Type</label>
        <select id="mealType">
          <option value="">Select meal type</option>
          <option value="breakfast">Breakfast</option>
          <option value="lunch">Lunch</option>
          <option value="dinner">Dinner</option>
          <option value="snacks">Snacks</option>
        </select>
        
        <label htmlFor="prepTime">Prep Time (minutes)</label>
        <input id="prepTime" type="number" />
        
        <label htmlFor="cookTime">Cook Time (minutes)</label>
        <input id="cookTime" type="number" />
        
        <label htmlFor="servings">Servings</label>
        <input id="servings" type="number" />
        
        <button type="submit">Add Recipe</button>
      </form>
    </div>
  )
}

describe('AddRecipeModal Component', () => {
  const defaultProps = {
    isOpen: true,
    onClose: vi.fn(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockApiRequest.mockResolvedValue({ id: 1, title: 'Test Recipe' })
  })

  describe('Modal Display', () => {
    it('renders when isOpen is true', () => {
      render(<AddRecipeModal {...defaultProps} />)
      
      expect(screen.getByText('Add New Recipe')).toBeInTheDocument()
      expect(screen.getByText('Create a new recipe for your collection')).toBeInTheDocument()
    })

    it('does not render when isOpen is false', () => {
      render(<AddRecipeModal {...defaultProps} isOpen={false} />)
      
      expect(screen.queryByText('Add New Recipe')).not.toBeInTheDocument()
    })

    it('calls onClose when close button is clicked', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddRecipeModal {...defaultProps} onClose={onClose} />)
      
      const closeButton = screen.getByLabelText('Close')
      await user.click(closeButton)
      
      expect(onClose).toHaveBeenCalledOnce()
    })

    it('calls onClose when escape key is pressed', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddRecipeModal {...defaultProps} onClose={onClose} />)
      
      await user.keyboard('{Escape}')
      
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('Form Fields', () => {
    it('displays all required form fields', () => {
      render(<AddRecipeModal {...defaultProps} />)
      
      expect(screen.getByLabelText('Recipe Title')).toBeInTheDocument()
      expect(screen.getByLabelText('Description')).toBeInTheDocument()
      expect(screen.getByLabelText('Ingredients')).toBeInTheDocument()
      expect(screen.getByLabelText('Instructions')).toBeInTheDocument()
      expect(screen.getByLabelText('Meal Type')).toBeInTheDocument()
      expect(screen.getByLabelText('Prep Time (minutes)')).toBeInTheDocument()
      expect(screen.getByLabelText('Cook Time (minutes)')).toBeInTheDocument()
      expect(screen.getByLabelText('Servings')).toBeInTheDocument()
    })

    it('has proper field validation', async () => {
      const user = userEvent.setup()
      render(<AddRecipeModal {...defaultProps} />)
      
      const submitButton = screen.getByText('Add Recipe')
      await user.click(submitButton)
      
      // Should show validation errors for required fields
      await waitFor(() => {
        expect(screen.getByText('Title is required')).toBeInTheDocument()
      })
    })

    it('accepts valid input in all fields', async () => {
      const user = userEvent.setup()
      render(<AddRecipeModal {...defaultProps} />)
      
      // Fill out the form
      await user.type(screen.getByLabelText('Recipe Title'), 'Test Recipe')
      await user.type(screen.getByLabelText('Description'), 'A delicious test recipe')
      await user.type(screen.getByLabelText('Ingredients'), 'ingredient 1\ningredient 2')
      await user.type(screen.getByLabelText('Instructions'), 'Step 1\nStep 2')
      await user.type(screen.getByLabelText('Prep Time (minutes)'), '15')
      await user.type(screen.getByLabelText('Cook Time (minutes)'), '30')
      await user.type(screen.getByLabelText('Servings'), '4')
      
      // Select meal type
      const mealTypeSelect = screen.getByLabelText('Meal Type')
      await user.click(mealTypeSelect)
      await user.click(screen.getByText('Dinner'))
      
      expect(screen.getByDisplayValue('Test Recipe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('A delicious test recipe')).toBeInTheDocument()
    })
  })

  describe('Form Submission', () => {
    it('submits form with valid data', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddRecipeModal {...defaultProps} onClose={onClose} />)
      
      // Fill out required fields
      await user.type(screen.getByLabelText('Recipe Title'), 'Test Recipe')
      await user.type(screen.getByLabelText('Ingredients'), 'Test ingredients')
      await user.type(screen.getByLabelText('Instructions'), 'Test instructions')
      
      // Select meal type
      const mealTypeSelect = screen.getByLabelText('Meal Type')
      await user.click(mealTypeSelect)
      await user.click(screen.getByText('Dinner'))
      
      const submitButton = screen.getByText('Add Recipe')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/api/recipes', {
          method: 'POST',
          body: expect.objectContaining({
            title: 'Test Recipe',
            ingredients: ['Test ingredients'],
            instructions: ['Test instructions'],
            mealType: 'dinner',
          }),
        })
      })
    })

    it('shows loading state during submission', async () => {
      const user = userEvent.setup()
      mockApiRequest.mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)))
      
      render(<AddRecipeModal {...defaultProps} />)
      
      // Fill out form and submit
      await user.type(screen.getByLabelText('Recipe Title'), 'Test Recipe')
      await user.type(screen.getByLabelText('Ingredients'), 'Test ingredients')
      await user.type(screen.getByLabelText('Instructions'), 'Test instructions')
      
      const submitButton = screen.getByText('Add Recipe')
      await user.click(submitButton)
      
      expect(screen.getByText('Adding Recipe...')).toBeInTheDocument()
    })

    it('handles submission errors gracefully', async () => {
      const user = userEvent.setup()
      mockApiRequest.mockRejectedValue(new Error('API Error'))
      
      render(<AddRecipeModal {...defaultProps} />)
      
      // Fill out form and submit
      await user.type(screen.getByLabelText('Recipe Title'), 'Test Recipe')
      await user.type(screen.getByLabelText('Ingredients'), 'Test ingredients')
      await user.type(screen.getByLabelText('Instructions'), 'Test instructions')
      
      const submitButton = screen.getByText('Add Recipe')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(screen.getByText(/Error adding recipe/)).toBeInTheDocument()
      })
    })

    it('closes modal after successful submission', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddRecipeModal {...defaultProps} onClose={onClose} />)
      
      // Fill out form and submit
      await user.type(screen.getByLabelText('Recipe Title'), 'Test Recipe')
      await user.type(screen.getByLabelText('Ingredients'), 'Test ingredients')
      await user.type(screen.getByLabelText('Instructions'), 'Test instructions')
      
      const submitButton = screen.getByText('Add Recipe')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(onClose).toHaveBeenCalledOnce()
      })
    })
  })

  describe('Accessibility Features', () => {
    it('has proper ARIA labels and roles', () => {
      render(<AddRecipeModal {...defaultProps} />)
      
      const dialog = screen.getByRole('dialog')
      expect(dialog).toHaveAttribute('aria-labelledby')
      expect(dialog).toHaveAttribute('aria-describedby')
    })

    it('traps focus within modal', async () => {
      const user = userEvent.setup()
      render(<AddRecipeModal {...defaultProps} />)
      
      const titleInput = screen.getByLabelText('Recipe Title')
      const closeButton = screen.getByLabelText('Close')
      
      // Focus should start on title input
      expect(titleInput).toHaveFocus()
      
      // Tab through to close button
      await user.tab()
      // Continue tabbing to reach close button
      let tabCount = 0
      while (!closeButton.matches(':focus') && tabCount < 20) {
        await user.tab()
        tabCount++
      }
      
      expect(tabCount).toBeLessThan(20) // Should find close button within reasonable tabs
    })

    it('supports keyboard navigation', async () => {
      const user = userEvent.setup()
      const onClose = vi.fn()
      render(<AddRecipeModal {...defaultProps} onClose={onClose} />)
      
      // Should be able to close with Escape
      await user.keyboard('{Escape}')
      expect(onClose).toHaveBeenCalledOnce()
    })
  })

  describe('Data Processing', () => {
    it('correctly processes ingredients list', async () => {
      const user = userEvent.setup()
      render(<AddRecipeModal {...defaultProps} />)
      
      const ingredientsField = screen.getByLabelText('Ingredients')
      await user.type(ingredientsField, '1 cup flour\n2 eggs\n1 tsp salt')
      
      await user.type(screen.getByLabelText('Recipe Title'), 'Test Recipe')
      await user.type(screen.getByLabelText('Instructions'), 'Test instructions')
      
      const submitButton = screen.getByText('Add Recipe')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/api/recipes', {
          method: 'POST',
          body: expect.objectContaining({
            ingredients: ['1 cup flour', '2 eggs', '1 tsp salt'],
          }),
        })
      })
    })

    it('correctly processes instructions list', async () => {
      const user = userEvent.setup()
      render(<AddRecipeModal {...defaultProps} />)
      
      const instructionsField = screen.getByLabelText('Instructions')
      await user.type(instructionsField, 'Mix ingredients\nBake for 30 min\nLet cool')
      
      await user.type(screen.getByLabelText('Recipe Title'), 'Test Recipe')
      await user.type(screen.getByLabelText('Ingredients'), 'Test ingredients')
      
      const submitButton = screen.getByText('Add Recipe')
      await user.click(submitButton)
      
      await waitFor(() => {
        expect(mockApiRequest).toHaveBeenCalledWith('/api/recipes', {
          method: 'POST',
          body: expect.objectContaining({
            instructions: ['Mix ingredients', 'Bake for 30 min', 'Let cool'],
          }),
        })
      })
    })
  })
})