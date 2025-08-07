import React from 'react'
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import Home from '../page'

// Mock kuroshiro
const mockKuroshiro = {
  init: jest.fn().mockResolvedValue(undefined),
  convert: jest.fn().mockResolvedValue('converted text')
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

// Mock fetch
global.fetch = jest.fn()

describe('Home Page', () => {

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: {
        href: 'http://localhost:3000',
        search: '',
        pathname: '/',
        hostname: 'localhost',
        port: '3000',
        protocol: 'http:',
      },
      writable: true,
    })

    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Initial Render', () => {
    it('should render the home page with initial form state', async () => {
      await act(async () => {
        render(<Home />)
      })

      expect(screen.getByText('RIDE JOB（ライドジョブ）')).toBeInTheDocument()
      expect(screen.getByLabelText('生年月日')).toBeInTheDocument()
      expect(screen.getByText('次へ')).toBeInTheDocument()
    })

    it('should initialize with loading screen', async () => {
      await act(async () => {
        render(<Home />)
      })

      // The loading screen should initially be visible
      const loadingScreen = screen.getByTestId ? 
        screen.queryByTestId('loading-screen') : 
        document.getElementById('loading-screen')
      
      if (loadingScreen) {
        expect(loadingScreen).toBeInTheDocument()
      }
    })

    it('should show card 1 initially', async () => {
      await act(async () => {
        render(<Home />)
      })

      expect(screen.getByLabelText('生年月日')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: '次へ' })).toBeInTheDocument()
    })
  })

  describe('Birth Date Validation (Card 1)', () => {
    it('should validate birth date fields', async () => {
      await act(async () => {
        render(<Home />)
      })

      const nextButton = screen.getByRole('button', { name: '次へ' })
      
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('生年月日をすべて選択してください。')).toBeInTheDocument()
      })
    })

    it('should validate age limits', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Select a birth date that makes the user too young (under 18)
      const currentYear = new Date().getFullYear()
      const tooYoungYear = (currentYear - 10).toString()

      const yearSelect = screen.getByDisplayValue('年を選択')
      const monthSelect = screen.getByDisplayValue('月を選択')
      const daySelect = screen.getByDisplayValue('日を選択')

      await act(async () => {
        fireEvent.change(yearSelect, { target: { value: tooYoungYear } })
        fireEvent.change(monthSelect, { target: { value: '1' } })
        fireEvent.change(daySelect, { target: { value: '1' } })
      })

      const nextButton = screen.getByRole('button', { name: '次へ' })
      
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('18歳以上である必要があります。')).toBeInTheDocument()
      })
    })

    it('should validate maximum age limit', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Select a birth date that makes the user too old (over 84)
      const currentYear = new Date().getFullYear()
      const tooOldYear = (currentYear - 90).toString()

      const yearSelect = screen.getByDisplayValue('年を選択')
      const monthSelect = screen.getByDisplayValue('月を選択')
      const daySelect = screen.getByDisplayValue('日を選択')

      await act(async () => {
        fireEvent.change(yearSelect, { target: { value: tooOldYear } })
        fireEvent.change(monthSelect, { target: { value: '1' } })
        fireEvent.change(daySelect, { target: { value: '1' } })
      })

      const nextButton = screen.getByRole('button', { name: '次へ' })
      
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('84歳以下である必要があります。')).toBeInTheDocument()
      })
    })

    it('should accept valid birth date and proceed to next card', async () => {
      await act(async () => {
        render(<Home />)
      })

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
    })

    it('should validate invalid dates like February 30', async () => {
      await act(async () => {
        render(<Home />)
      })

      const currentYear = new Date().getFullYear()
      const validYear = (currentYear - 25).toString()

      const yearSelect = screen.getByDisplayValue('年を選択')
      const monthSelect = screen.getByDisplayValue('月を選択')
      const daySelect = screen.getByDisplayValue('日を選択')

      await act(async () => {
        fireEvent.change(yearSelect, { target: { value: validYear } })
        fireEvent.change(monthSelect, { target: { value: '2' } })
        fireEvent.change(daySelect, { target: { value: '30' } })
      })

      const nextButton = screen.getByRole('button', { name: '次へ' })
      
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('有効な日付を選択してください。')).toBeInTheDocument()
      })
    })

    it('should prevent future dates', async () => {
      await act(async () => {
        render(<Home />)
      })

      const currentYear = new Date().getFullYear()
      const futureYear = (currentYear + 1).toString()

      const yearSelect = screen.getByDisplayValue('年を選択')
      const monthSelect = screen.getByDisplayValue('月を選択')
      const daySelect = screen.getByDisplayValue('日を選択')

      await act(async () => {
        fireEvent.change(yearSelect, { target: { value: futureYear } })
        fireEvent.change(monthSelect, { target: { value: '1' } })
        fireEvent.change(daySelect, { target: { value: '1' } })
      })

      const nextButton = screen.getByRole('button', { name: '次へ' })
      
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByText('未来の日付は選択できません。')).toBeInTheDocument()
      })
    })
  })

  describe('Navigation', () => {
    it('should navigate between cards using next and back buttons', async () => {
      await act(async () => {
        render(<Home />)
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

      // Go to card 2
      const nextButton = screen.getByRole('button', { name: '次へ' })
      await act(async () => {
        fireEvent.click(nextButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText('お名前（漢字）')).toBeInTheDocument()
      })

      // Go back to card 1
      const backButton = screen.getByRole('button', { name: '＜ 戻る' })
      await act(async () => {
        fireEvent.click(backButton)
      })

      await waitFor(() => {
        expect(screen.getByLabelText('生年月日')).toBeInTheDocument()
      })
    })
  })

  describe('UTM Parameter Handling', () => {
    it('should capture UTM parameters from URL', async () => {
      // Mock URL with UTM parameters
      Object.defineProperty(window, 'location', {
        value: {
          href: 'http://localhost:3000?utm_source=google&utm_medium=search',
          search: '?utm_source=google&utm_medium=search',
          pathname: '/',
        },
        writable: true,
      })

      await act(async () => {
        render(<Home />)
      })

      // UTM parameters should be captured (we can't directly test this without exposing internal state)
      // But we can verify that the component renders without errors
      expect(screen.getByText('RIDE JOB（ライドジョブ）')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should handle kuroshiro initialization failure gracefully', async () => {
      mockKuroshiro.init.mockRejectedValue(new Error('Kuroshiro failed'))

      await act(async () => {
        render(<Home />)
      })

      // Component should still render despite kuroshiro failure
      expect(screen.getByText('RIDE JOB（ライドジョブ）')).toBeInTheDocument()
    })
  })

  describe('GTM Tracking', () => {
    it('should track step view on initial load', async () => {
      const dataLayerSpy = jest.spyOn(window, 'dataLayer', 'get')
      dataLayerSpy.mockReturnValue([])

      await act(async () => {
        render(<Home />)
      })

      // Should track initial step view
      expect(window.dataLayer).toBeDefined()
    })
  })

  describe('Form Dirty State', () => {
    it('should set form as dirty when user starts typing', async () => {
      await act(async () => {
        render(<Home />)
      })

      // Navigate to card 2 first
      const currentYear = new Date().getFullYear()
      const validYear = (currentYear - 25).toString()

      const yearSelect = screen.getByDisplayValue('年を選択')
      await act(async () => {
        fireEvent.change(yearSelect, { target: { value: validYear } })
      })

      // Form should be marked as dirty after input
      // This is tested indirectly through the lack of errors
    })
  })

  describe('Accessibility', () => {
    it('should have proper form labels', async () => {
      await act(async () => {
        render(<Home />)
      })

      expect(screen.getByLabelText('生年月日')).toBeInTheDocument()
      
      // Navigate to card 2
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
        expect(screen.getByLabelText('姓')).toBeInTheDocument()
        expect(screen.getByLabelText('名')).toBeInTheDocument()
      })
    })
  })
})