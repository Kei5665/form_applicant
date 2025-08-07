import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { setupServer } from 'msw/node'
import { http, HttpResponse } from 'msw'
import Home from '../app/page'

// Mock kuroshiro
const mockKuroshiro = {
  init: jest.fn().mockResolvedValue(undefined),
  convert: jest.fn().mockImplementation((text) => {
    const conversions: Record<string, string> = {
      '田中': 'たなか',
      '太郎': 'たろう',
      '山田': 'やまだ',
      '花子': 'はなこ'
    }
    return Promise.resolve(conversions[text] || 'てすと')
  })
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
    get: jest.fn((param) => {
      const params: Record<string, string> = {
        utm_source: 'integration_test',
        utm_medium: 'test'
      }
      return params[param] || null
    }),
    has: jest.fn(),
    toString: jest.fn(),
  }),
  usePathname: () => '/',
}))

// Setup MSW server for API mocking
const server = setupServer(
  // Mock jobs-count API
  http.get('/api/jobs-count', ({ request }) => {
    const url = new URL(request.url)
    const postalCode = url.searchParams.get('postalCode')
    
    if (postalCode === '1010051') {
      return HttpResponse.json({
        postalCode: '1010051',
        jobCount: 8,
        searchMethod: 'prefecture',
        searchArea: '東京都内',
        message: '東京都内で8件の求人が見つかりました'
      })
    } else if (postalCode === '5320011') {
      return HttpResponse.json({
        postalCode: '5320011',
        jobCount: 0,
        searchMethod: 'prefecture',
        searchArea: '大阪府内',
        message: '大阪府内では現在求人がありません'
      })
    }
    
    return HttpResponse.json({ error: 'Invalid postal code' }, { status: 400 })
  }),

  // Mock applicants API
  http.post('/api/applicants', async ({ request }) => {
    const body = await request.json() as any
    
    // Simulate different response scenarios
    if (body.phoneNumber === '09099999999') {
      return HttpResponse.json({ message: 'Server Error' }, { status: 500 })
    }
    
    if (body.phoneNumber === '09088888888') {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 100))
    }
    
    return HttpResponse.json({ message: 'Application submitted successfully!' })
  })
)

describe('Integration Tests - Complete User Journey', () => {
  const user = userEvent.setup()

  beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
  })

  beforeEach(() => {
    jest.clearAllMocks()
    
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000?utm_source=integration_test&utm_medium=test',
        search: '?utm_source=integration_test&utm_medium=test',
        pathname: '/',
      },
      writable: true,
    })

    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    server.resetHandlers()
    jest.restoreAllMocks()
  })

  afterAll(() => {
    server.close()
  })

  describe('Complete Application Flow', () => {
    it('should complete entire application process successfully', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Step 1: Fill birth date
      const currentYear = new Date().getFullYear()
      const validYear = (currentYear - 30).toString()

      const yearSelect = screen.getByDisplayValue('年を選択')
      const monthSelect = screen.getByDisplayValue('月を選択')
      const daySelect = screen.getByDisplayValue('日を選択')

      await act(async () => {
        fireEvent.change(yearSelect, { target: { value: validYear } })
        fireEvent.change(monthSelect, { target: { value: '8' } })
        fireEvent.change(daySelect, { target: { value: '20' } })
      })

      let nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      // Step 2: Fill name and address
      await waitFor(() => {
        expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
      })

      const lastNameInput = screen.getByLabelText('姓')
      const firstNameInput = screen.getByLabelText('名')
      const postalCodeInput = screen.getByLabelText(/郵便番号/)

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '田中' } })
        fireEvent.blur(lastNameInput)
      })

      // Wait for auto-furigana conversion
      await waitFor(() => {
        expect(mockKuroshiro.convert).toHaveBeenCalledWith('田中', {
          to: 'hiragana',
          mode: 'spaced'
        })
      })

      await act(async () => {
        fireEvent.change(firstNameInput, { target: { value: '太郎' } })
        fireEvent.blur(firstNameInput)
      })

      // Manually fill kana fields (simulating auto-conversion result)
      const lastNameKanaInput = screen.getByLabelText('せい')
      const firstNameKanaInput = screen.getByLabelText('めい')

      await act(async () => {
        fireEvent.change(lastNameKanaInput, { target: { value: 'たなか' } })
        fireEvent.change(firstNameKanaInput, { target: { value: 'たろう' } })
        fireEvent.change(postalCodeInput, { target: { value: '1010051' } })
      })

      nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      // Step 3: Fill phone number and see job results
      await waitFor(() => {
        expect(screen.getByLabelText(/携帯番号/)).toBeInTheDocument()
      })

      // Wait for job count to load
      await waitFor(() => {
        expect(screen.getByText('8件の求人があります')).toBeInTheDocument()
        expect(screen.getByText('✅ お近くの求人をご案内できます！')).toBeInTheDocument()
      })

      const phoneInput = screen.getByLabelText(/携帯番号/)
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '08011112222' } })
      })

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: '入力内容を確認する' })
        expect(confirmButton).not.toBeDisabled()
      })

      const confirmButton = screen.getByRole('button', { name: '入力内容を確認する' })
      await act(async () => {
        fireEvent.click(confirmButton)
      })

      // Step 4: Confirmation screen
      await waitFor(() => {
        expect(screen.getByText('📋 入力内容をご確認ください')).toBeInTheDocument()
      })

      // Verify all information is displayed correctly
      expect(screen.getByText('080-1111-2222')).toBeInTheDocument()
      expect(screen.getByText('田中 太郎')).toBeInTheDocument()
      expect(screen.getByText('たなか たろう')).toBeInTheDocument()
      expect(screen.getByText('1010051')).toBeInTheDocument()
      expect(screen.getByText(`${validYear}年8月20日`)).toBeInTheDocument()

      // Submit application
      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      // Verify redirect to completion page
      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/applicants/new')
      })
    })

    it('should handle user journey with no job results', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Navigate to step 3 with different postal code
      const currentYear = new Date().getFullYear()
      const validYear = (currentYear - 25).toString()

      // Step 1
      const yearSelect = screen.getByDisplayValue('年を選択')
      const monthSelect = screen.getByDisplayValue('月を選択')
      const daySelect = screen.getByDisplayValue('日を選択')

      await act(async () => {
        fireEvent.change(yearSelect, { target: { value: validYear } })
        fireEvent.change(monthSelect, { target: { value: '12' } })
        fireEvent.change(daySelect, { target: { value: '1' } })
      })

      let nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      // Step 2
      await waitFor(() => {
        expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
      })

      const lastNameInput = screen.getByLabelText('姓')
      const firstNameInput = screen.getByLabelText('名')
      const lastNameKanaInput = screen.getByLabelText('せい')
      const firstNameKanaInput = screen.getByLabelText('めい')
      const postalCodeInput = screen.getByLabelText(/郵便番号/)

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '山田' } })
        fireEvent.change(firstNameInput, { target: { value: '花子' } })
        fireEvent.change(lastNameKanaInput, { target: { value: 'やまだ' } })
        fireEvent.change(firstNameKanaInput, { target: { value: 'はなこ' } })
        fireEvent.change(postalCodeInput, { target: { value: '5320011' } }) // Osaka - no jobs
      })

      nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      // Step 3 - Should show no jobs message
      await waitFor(() => {
        expect(screen.getByLabelText(/携帯番号/)).toBeInTheDocument()
      })

      await waitFor(() => {
        expect(screen.getByText('大阪府内では現在求人がありません')).toBeInTheDocument()
      })

      // User can still proceed with application
      const phoneInput = screen.getByLabelText(/携帯番号/)
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '07033334444' } })
      })

      await waitFor(() => {
        const confirmButton = screen.getByRole('button', { name: '入力内容を確認する' })
        expect(confirmButton).not.toBeDisabled()
      })
    })

    it('should handle form validation errors throughout the flow', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Try to proceed without filling birth date
      let nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('生年月日をすべて選択してください。')).toBeInTheDocument()
      })

      // Fill valid birth date
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

      nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      // Try to proceed from step 2 without filling required fields
      await waitFor(() => {
        expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
      })

      nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('姓は必須です。')).toBeInTheDocument()
        expect(screen.getByText('名は必須です。')).toBeInTheDocument()
      })

      // Fill name fields with invalid kana
      const lastNameInput = screen.getByLabelText('姓')
      const firstNameInput = screen.getByLabelText('名')
      const lastNameKanaInput = screen.getByLabelText('せい')
      const firstNameKanaInput = screen.getByLabelText('めい')

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '田中' } })
        fireEvent.change(firstNameInput, { target: { value: '太郎' } })
        fireEvent.change(lastNameKanaInput, { target: { value: 'tanaka' } }) // Invalid
        fireEvent.change(firstNameKanaInput, { target: { value: 'taro' } }) // Invalid
      })

      nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('ひらがなで入力してください。')).toBeInTheDocument()
      })
    })

    it('should handle API errors gracefully', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Complete form with phone number that triggers server error
      const currentYear = new Date().getFullYear()
      const validYear = (currentYear - 25).toString()

      // Navigate through all steps quickly
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

      const phoneInput = screen.getByLabelText(/携帯番号/)
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '09099999999' } }) // Triggers server error
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

      // Mock window.alert to capture error message
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
  })

  describe('UTM Parameter Tracking', () => {
    it('should capture and submit UTM parameters correctly', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Quick form completion
      const currentYear = new Date().getFullYear()
      const validYear = (currentYear - 25).toString()

      // Fill all required fields
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

      const phoneInput = screen.getByLabelText(/携帯番号/)
      await act(async () => {
        fireEvent.change(phoneInput, { target: { value: '08011112222' } })
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

      // Create a spy to intercept the fetch call
      const fetchSpy = jest.spyOn(global, 'fetch')

      const submitButton = screen.getByRole('button', { name: '✅ この内容で送信する' })
      await act(async () => {
        fireEvent.click(submitButton)
      })

      await waitFor(() => {
        expect(fetchSpy).toHaveBeenCalledWith('/api/applicants', expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('integration_test')
        }))
      })

      // Verify UTM parameters in request body
      const callArgs = fetchSpy.mock.calls.find(call => call[0] === '/api/applicants')
      const requestBody = JSON.parse(callArgs![1]!.body as string)
      expect(requestBody.utmParams.utm_source).toBe('integration_test')
      expect(requestBody.utmParams.utm_medium).toBe('test')

      fetchSpy.mockRestore()
    })
  })

  describe('Data Persistence', () => {
    it('should maintain form data when navigating back and forth', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Fill birth date
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

      let nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      // Fill name data
      await waitFor(() => {
        expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
      })

      const lastNameInput = screen.getByLabelText('姓')
      const firstNameInput = screen.getByLabelText('名')

      await act(async () => {
        fireEvent.change(lastNameInput, { target: { value: '田中' } })
        fireEvent.change(firstNameInput, { target: { value: '太郎' } })
      })

      // Go back to card 1
      const backButton = screen.getByRole('button', { name: '＜ 戻る' })
      await act(async () => {
        fireEvent.click(backButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText('生年月日')).toBeInTheDocument()
      })

      // Verify birth date is still selected
      expect(screen.getByDisplayValue(`${validYear}年`)).toBeInTheDocument()
      expect(screen.getByDisplayValue('6月')).toBeInTheDocument()
      expect(screen.getByDisplayValue('15日')).toBeInTheDocument()

      // Go forward again
      nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
      })

      // Verify name data is still there
      const lastNameInputAgain = screen.getByLabelText('姓') as HTMLInputElement
      const firstNameInputAgain = screen.getByLabelText('名') as HTMLInputElement
      expect(lastNameInputAgain.value).toBe('田中')
      expect(firstNameInputAgain.value).toBe('太郎')
    })
  })
})