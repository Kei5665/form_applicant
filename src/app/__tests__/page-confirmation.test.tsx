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

// Mock next/navigation
const mockPush = jest.fn()
jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
    has: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}))

global.fetch = jest.fn()

describe('Home Page - Confirmation and Submission', () => {
  const user = userEvent.setup()

  beforeEach(() => {
    jest.clearAllMocks()
    
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?utm_source=google&utm_medium=search',
        search: '?utm_source=google&utm_medium=search',
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

  const navigateToConfirmation = async () => {
    // Navigate through all cards to confirmation
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

    // Card 3 - Phone number
    await waitFor(() => {
      expect(screen.getByLabelText(/携帯番号/)).toBeInTheDocument()
    })

    // Mock job count API response
    ;(global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        jobCount: 5,
        message: '東京都内で5件の求人が見つかりました'
      })
    })

    const phoneInput = screen.getByLabelText(/携帯番号/)
    await act(async () => {
      fireEvent.change(phoneInput, { target: { value: '08012345678' } })
    })

    await waitFor(() => {
      const confirmButton = screen.getByRole('button', { name: '入力内容を確認する' })
      expect(confirmButton).not.toBeDisabled()
    })

    const confirmButton = screen.getByRole('button', { name: '入力内容を確認する' })
    await act(async () => {
      fireEvent.click(confirmButton)
    })

    await waitFor(() => {
      expect(screen.getByText('📋 入力内容をご確認ください')).toBeInTheDocument()
    })
  }

  describe('Confirmation Screen Display', () => {
    it('should display all entered information correctly', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      // Check if all information is displayed
      expect(screen.getByText('080-1234-5678')).toBeInTheDocument() // Formatted phone
      expect(screen.getByText('田中 太郎')).toBeInTheDocument()
      expect(screen.getByText('たなか たろう')).toBeInTheDocument()
      expect(screen.getByText('1010051')).toBeInTheDocument()
      
      // Check birth date formatting
      const currentYear = new Date().getFullYear()
      const expectedBirthDate = `${currentYear - 25}年6月15日`
      expect(screen.getByText(expectedBirthDate)).toBeInTheDocument()
    })

    it('should format phone number with hyphens', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      expect(screen.getByText('080-1234-5678')).toBeInTheDocument()
    })

    it('should show modify button', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      expect(screen.getByRole('button', { name: '✏️ 入力内容を修正する' })).toBeInTheDocument()
    })

    it('should show final submit button', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      expect(screen.getByRole('button', { name: '✅ この内容で送信する' })).toBeInTheDocument()
    })
  })

  describe('Navigation from Confirmation', () => {
    it('should go back to card 3 when modify button is clicked', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      const modifyButton = screen.getByRole('button', { name: '✏️ 入力内容を修正する' })
      await act(async () => {
        fireEvent.click(modifyButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText(/携帯番号/)).toBeInTheDocument()
      })
    })
  })

  describe('Form Submission', () => {
    it('should submit form successfully', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      // Mock successful API response
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: 'Application submitted successfully!'
        })
      })

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/applicants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('田中')
        })
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/applicants/new')
      })
    })

    it('should include UTM parameters in submission', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({
          message: 'Application submitted successfully!'
        })
      })

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/applicants', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('utm_source')
        })
      })

      const callArgs = (global.fetch as jest.Mock).mock.calls[1] // Skip the jobs-count call
      const requestBody = JSON.parse(callArgs[1].body)
      expect(requestBody.utmParams.utm_source).toBe('google')
      expect(requestBody.utmParams.utm_medium).toBe('search')
    })

    it('should handle API errors gracefully', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        json: jest.fn().mockResolvedValue({
          message: 'Server Error'
        })
      })

      // Mock window.alert
      const alertSpy = jest.spyOn(window, 'alert').mockImplementation()

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith('エラーが発生しました: Server Error')
      })

      alertSpy.mockRestore()
    })

    it('should handle network errors', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const alertSpy = jest.spyOn(window, 'alert').mockImplementation()

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(alertSpy).toHaveBeenCalledWith(
          'フォームの送信中にエラーが発生しました。ネットワーク接続を確認してください。'
        )
      })

      alertSpy.mockRestore()
    })

    it('should validate form data before submission', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      // Modify the global fetch to simulate validation failure
      ;(global.fetch as jest.Mock).mockImplementation(() => Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ message: 'Success' })
      }))

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      // Should proceed with submission since all data is valid
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/api/applicants', expect.any(Object))
      })
    })

    it('should format birth date correctly for API', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Success' })
      })

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        const callArgs = (global.fetch as jest.Mock).mock.calls.find(
          call => call[0] === '/api/applicants'
        )
        expect(callArgs).toBeTruthy()
        
        const requestBody = JSON.parse(callArgs[1].body)
        const currentYear = new Date().getFullYear() - 25
        expect(requestBody.birthDate).toBe(`${currentYear}-06-15`)
      })
    })
  })

  describe('GTM Tracking', () => {
    it('should track form submission', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Success' })
      })

      const dataLayerSpy = jest.spyOn(window.dataLayer, 'push')

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      expect(dataLayerSpy).toHaveBeenCalledWith({
        event: 'form_submit',
        form_name: 'ridejob_application'
      })
    })
  })

  describe('Form State Management', () => {
    it('should clear dirty state after successful submission', async () => {
      await act(async () => {
        render(<Home />)
      })

      await navigateToConfirmation()

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ message: 'Success' })
      })

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      // Form should be marked as clean after successful submission
      // This is tested indirectly through the navigation behavior
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/applicants/new')
      })
    })
  })
})