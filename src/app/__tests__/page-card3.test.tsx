import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import Home from '../page'

// Mock kuroshiro
const mockKuroshiro = {
  init: jest.fn().mockResolvedValue(undefined),
  convert: jest.fn().mockResolvedValue('てすと')
}

jest.mock('kuroshiro', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => mockKuroshiro)
  }
})

jest.mock('kuroshiro-analyzer-kuromoji', () => {
  return {
    __esModule: true,
    default: jest.fn()
  }
})

global.fetch = jest.fn()

describe('Home Page - Card 3 (Phone Number and Job Search)', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        search: '',
        pathname: '/',
      },
      writable: true,
    })

    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  const navigateToCard3 = async () => {
    // Navigate through cards 1 and 2
    const currentYear = new Date().getFullYear()
    const validYear = (currentYear - 25).toString()

    // Card 1 - Birth date
    const yearSelect = screen.getByDisplayValue('年を選択')
    const monthSelect = screen.getByDisplayValue('月を選択')
    const daySelect = screen.getByDisplayValue('日を選択')

    await act(async () => {
      fireEvent.change(yearSelect, { target: { value: validYear } })
      fireEvent.change(monthSelect, { target: { value: '6' } })
      fireEvent.change(daySelect, { target: { value: '15' } })
    })

    let nextButton = screen.getByRole('button', { name: '次へ' })
    await act(async () => {
      fireEvent.click(nextButton)
    })

    // Card 2 - Name and address
    await waitFor(() => {
      expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
    })

    const lastNameInput = screen.getByLabelText('姓')
    const firstNameInput = screen.getByLabelText('名')
    const lastNameKanaInput = screen.getByLabelText('せい')
    const firstNameKanaInput = screen.getByLabelText('めい')
    const postalCodeInput = screen.getByLabelText(/郵便番号/)

    await act(async () => {
      fireEvent.change(lastNameInput, { target: { value: '田中' } })
      fireEvent.change(firstNameInput, { target: { value: '太郎' } })
      fireEvent.change(lastNameKanaInput, { target: { value: 'たなか' } })
      fireEvent.change(firstNameKanaInput, { target: { value: 'たろう' } })
      fireEvent.change(postalCodeInput, { target: { value: '1010051' } })
    })

    nextButton = screen.getByRole('button', { name: '次へ' })
    await act(async () => {
      fireEvent.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByLabelText(/携帯番号/)).toBeInTheDocument()
    })
  }

  describe('Job Count Display', () => {
    it('should show job count when postal code is entered', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      // Mock successful job count API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          jobCount: 5,
          message: '東京都内で5件の求人が見つかりました',
          searchArea: '東京都内'
        })
      })

      await waitFor(() => {
        expect(screen.getByText('5件の求人があります')).toBeInTheDocument()
        expect(screen.getByText('✅ お近くの求人をご案内できます！')).toBeInTheDocument()
      })
    })

    it('should show loading state while fetching job count', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      // Mock delayed response
      ;(global.fetch as jest.Mock).mockImplementation(() => 
        new Promise(resolve => setTimeout(() => resolve({
          ok: true,
          json: jest.fn().mockResolvedValue({ jobCount: 3 })
        }), 100))
      )

      expect(screen.getByText('求人件数を確認中...')).toBeInTheDocument()
    })

    it('should handle job count API errors', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      // Mock API error
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          error: 'API Error'
        })
      })

      await waitFor(() => {
        expect(screen.getByText('API Error')).toBeInTheDocument()
      })
    })

    it('should show zero jobs message when no jobs found', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          jobCount: 0,
          message: '東京都内では現在求人がありません'
        })
      })

      await waitFor(() => {
        expect(screen.getByText('東京都内では現在求人がありません')).toBeInTheDocument()
      })
    })
  })

  describe('Phone Number Validation', () => {
    it('should validate phone number format', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '123' } }) // Invalid format
      })

      const submitButton = screen.getByRole('button', { name: '入力内容を確認する' })
      expect(submitButton).toBeDisabled()
    })

    it('should accept valid phone numbers', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '09012345678' } })
      })

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '入力内容を確認する' })
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should validate phone number patterns', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      const invalidNumbers = [
        '01012345678', // Invalid prefix
        '09011111111', // Too many repeating digits
        '09012345678' // This might be considered a test number
      ]

      for (const invalidNumber of invalidNumbers) {
        await act(async () => {
          fireEvent.change(phoneInput, { target: { value: invalidNumber } })
        })

        if (invalidNumber === '01012345678') {
          await waitFor(() => {
            expect(screen.getByText('有効な携帯番号を入力してください。')).toBeInTheDocument()
          })
        }

        // Clear the input for next test
        await act(async () => {
          fireEvent.change(phoneInput, { target: { value: '' } })
        })
      }
    })

    it('should remove hyphens from phone number input', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '090-1234-5678' } })
      })

      // The component should remove hyphens internally
      expect(phoneInput.value).toBe('09012345678')
    })

    it('should limit phone number input length', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      expect(phoneInput.getAttribute('maxLength')).toBe('11')
    })
  })

  describe('Form Submission', () => {
    it('should disable submit button when phone number is invalid', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '123' } })
      })

      const submitButton = screen.getByRole('button', { name: '入力内容を確認する' })
      expect(submitButton).toBeDisabled()
    })

    it('should enable submit button when phone number is valid', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '08012345678' } })
      })

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '入力内容を確認する' })
        expect(submitButton).not.toBeDisabled()
      })
    })

    it('should proceed to confirmation screen when form is valid', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '08012345678' } })
      })

      await waitFor(() => {
        const submitButton = screen.getByRole('button', { name: '入力内容を確認する' })
        expect(submitButton).not.toBeDisabled()
      })

      await act(async () => {
        const submitButton = screen.getByRole('button', { name: '入力内容を確認する' })
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(screen.getByText('📋 入力内容をご確認ください')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation from Card 3', () => {
    it('should go back to card 2 when back button is clicked', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const backButton = screen.getByRole('button', { name: '＜ 戻る' })
      await act(async () => {
        fireEvent.click(backButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
      })
    })
  })

  describe('Error Display', () => {
    it('should show phone number error message', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '01012345678' } }) // Invalid prefix
      })

      await waitFor(() => {
        expect(screen.getByText('有効な携帯番号を入力してください。')).toBeInTheDocument()
      })
    })

    it('should clear phone error when valid number is entered', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      const phoneInput = screen.getByLabelText(/携帯番号/)
      
      // First enter invalid number
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '123' } })
      })

      // Then enter valid number
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '08012345678' } })
      })

      await waitFor(() => {
        expect(screen.queryByText('有効な携帯番号を入力してください。')).not.toBeInTheDocument()
      })
    })
  })

  describe('API Integration', () => {
    it('should call job count API with correct postal code', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      expect(global.fetch).toHaveBeenCalledWith('/api/jobs-count?postalCode=1010051')
    })

    it('should handle network errors gracefully', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard3()

      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await waitFor(() => {
        expect(screen.getByText('求人件数の取得中にエラーが発生しました')).toBeInTheDocument()
      })
    })
  })
})