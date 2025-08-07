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

describe('Home Page - Card 2 (Name and Address)', () => {
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

  const navigateToCard2 = async () => {
    const currentYear = new Date().getFullYear()
    const validYear = (currentYear - 25).toString()

    const yearSelect = screen.getByDisplayValue('年を選択')
    const monthSelect = screen.getByDisplayValue('月を選択')
    const daySelect = screen.getByDisplayValue('日を選択')

    await act(async () => {
      fireEvent.change(yearSelect, { target: { value: validYear } })
      fireEvent.change(monthSelect, { target: { value: '6' } })
      fireEvent.change(daySelect, { target: { value: '15' } })
    })

    const nextButton = screen.getByRole('button', { name: '次へ' })
    await act(async () => {
      fireEvent.click(nextButton)
    })

    await waitFor(() => {
      expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
    })
  }

  describe('Name Input Validation', () => {
    it('should validate required name fields', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      const nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('姓は必須です。')).toBeInTheDocument()
        expect(screen.getByText('名は必須です。')).toBeInTheDocument()
      })
    })

    it('should validate hiragana fields', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      const lastNameInput = screen.getByLabelText('姓')
      const firstNameInput = screen.getByLabelText('名')
      const lastNameKanaInput = screen.getByLabelText('せい')
      const firstNameKanaInput = screen.getByLabelText('めい')

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '田中' } })
        fireEvent.change(firstNameInput, { target: { value: '太郎' } })
        fireEvent.change(lastNameKanaInput, { target: { value: 'tanaka' } }) // Invalid - should be hiragana
        fireEvent.change(firstNameKanaInput, { target: { value: 'taro' } }) // Invalid - should be hiragana
      })

      const nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('ひらがなで入力してください。')).toBeInTheDocument()
      })
    })

    it('should accept valid hiragana input', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

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

      const nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/携帯番号/)).toBeInTheDocument()
      })
    })
  })

  describe('Postal Code Validation', () => {
    it('should validate postal code format', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

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
        fireEvent.change(postalCodeInput, { target: { value: '123' } }) // Too short
      })

      const nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('郵便番号はハイフンなしの7桁で入力してください。')).toBeInTheDocument()
      })
    })

    it('should require postal code', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      const lastNameInput = screen.getByLabelText('姓')
      const firstNameInput = screen.getByLabelText('名')
      const lastNameKanaInput = screen.getByLabelText('せい')
      const firstNameKanaInput = screen.getByLabelText('めい')

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '田中' } })
        fireEvent.change(firstNameInput, { target: { value: '太郎' } })
        fireEvent.change(lastNameKanaInput, { target: { value: 'たなか' } })
        fireEvent.change(firstNameKanaInput, { target: { value: 'たろう' } })
      })

      const nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('郵便番号は必須です。')).toBeInTheDocument()
      })
    })
  })

  describe('Auto Furigana Conversion', () => {
    it('should auto-convert kanji to hiragana on blur', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      const lastNameInput = screen.getByLabelValue('姓')
      const lastNameKanaInput = screen.getByLabelValue('せい')

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '田中' } })
        fireEvent.blur(lastNameInput)
      })

      await waitFor(() => {
        expect(mockKuroshiro.convert).toHaveBeenCalledWith('田中', {
          to: 'hiragana',
          mode: 'spaced'
        })
      })

      // The actual conversion result should be set in the kana field
      // but we can't easily test this without exposing component state
    })

    it('should handle kuroshiro conversion errors gracefully', async () => {
      mockKuroshiro.convert.mockRejectedValue(new Error('Conversion failed'))

      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      const lastNameInput = screen.getByLabelValue('姓')

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '田中' } })
        fireEvent.blur(lastNameInput)
      })

      // Should not crash the application
      expect(screen.getByLabelValue('姓')).toBeInTheDocument()
    })
  })

  describe('Error Clearing', () => {
    it('should clear errors when user starts typing', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      // First, trigger validation errors
      const nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('姓は必須です。')).toBeInTheDocument()
      })

      // Then start typing to clear error
      const lastNameInput = screen.getByLabelValue('姓')
      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '田' } })
      })

      await waitFor(() => {
        expect(screen.queryByText('姓は必須です。')).not.toBeInTheDocument()
      })
    })
  })

  describe('Input Field Behavior', () => {
    it('should handle input changes correctly', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      const lastNameInput = screen.getByLabelValue('姓')
      const firstNameInput = screen.getByLabelValue('名')
      const postalCodeInput = screen.getByLabelValue(/郵便番号/)

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '山田' } })
        fireEvent.change(firstNameInput, { target: { value: '花子' } })
        fireEvent.change(postalCodeInput, { target: { value: '1234567' } })
      })

      expect(lastNameInput.value).toBe('山田')
      expect(firstNameInput.value).toBe('花子')
      expect(postalCodeInput.value).toBe('1234567')
    })

    it('should limit postal code input to 7 digits', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      const postalCodeInput = screen.getByLabelValue(/郵便番号/)

      await act(async () => {
        fireEvent.change(postalCodeInput, { target: { value: '123456789' } }) // 9 digits
      })

      // Input should be limited to 7 characters by maxLength attribute
      expect(postalCodeInput.getAttribute('maxLength')).toBe('7')
    })
  })

  describe('Navigation from Card 2', () => {
    it('should go back to card 1 when back button is clicked', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToCard2()

      const backButton = screen.getByRole('button', { name: '＜ 戻る' })
      await act(async () => {
        fireEvent.click(backButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelValue('生年月日')).toBeInTheDocument()
      })
    })
  })
})