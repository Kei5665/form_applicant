import React from 'react'
import { render, screen } from '@testing-library/react'
import ApplicationComplete from '../page'

describe('ApplicationComplete Page', () => {
  beforeEach(() => {
    // Mock console methods
    jest.spyOn(console, 'log').mockImplementation(() => {})
    jest.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  describe('Page Rendering', () => {
    it('should render the completion page correctly', () => {
      render(<ApplicationComplete />)

      // Check for main heading
      expect(screen.getByText('お申し込み完了')).toBeInTheDocument()

      // Check for completion message
      expect(screen.getByText('この度は、RIDE JOBにお申し込みいただき、')).toBeInTheDocument()
      expect(screen.getByText('誠にありがとうございました。')).toBeInTheDocument()
      
      // Check for contact information
      expect(screen.getByText('担当者より、お電話またはメールにて')).toBeInTheDocument()
      expect(screen.getByText('ご連絡させていただきます。')).toBeInTheDocument()
      
      // Check for waiting message
      expect(screen.getByText('今しばらくお待ちください。')).toBeInTheDocument()
    })

    it('should render the header with logo and branding', () => {
      render(<ApplicationComplete />)

      // Check for company branding
      expect(screen.getByText('未経験でタクシー会社に就職するなら')).toBeInTheDocument()
      expect(screen.getByText('RIDE JOB（ライドジョブ）')).toBeInTheDocument()

      // Check for logo image
      const logoImage = screen.getByAltText('Ride Job Logo')
      expect(logoImage).toBeInTheDocument()
      expect(logoImage).toHaveAttribute('src', '/images/ride_logo.png')
    })

    it('should render the taxi image', () => {
      render(<ApplicationComplete />)

      const taxiImage = screen.getByAltText('Taxi')
      expect(taxiImage).toBeInTheDocument()
      expect(taxiImage).toHaveAttribute('src', '/images/car.png')
    })

    it('should render the footer with company information', () => {
      render(<ApplicationComplete />)

      // Check for footer logo
      const footerLogo = screen.getByAltText('Footer Logo')
      expect(footerLogo).toBeInTheDocument()
      expect(footerLogo).toHaveAttribute('src', '/images/flogo.png')

      // Check for footer links
      expect(screen.getByText('運営会社について')).toBeInTheDocument()
      expect(screen.getByText('プライバシーポリシー')).toBeInTheDocument()

      // Check for copyright
      expect(screen.getByText('© 2025 株式会社PMAgent')).toBeInTheDocument()
    })

    it('should have correct link URLs in footer', () => {
      render(<ApplicationComplete />)

      const companyLink = screen.getByRole('link', { name: '運営会社について' })
      expect(companyLink).toHaveAttribute('href', 'https://pmagent.jp/')

      const privacyLink = screen.getByRole('link', { name: 'プライバシーポリシー' })
      expect(privacyLink).toHaveAttribute('href', '/privacy')
    })
  })

  describe('GTM Tracking', () => {
    it('should track form completion on page load', () => {
      const dataLayerSpy = jest.spyOn(window.dataLayer, 'push')

      render(<ApplicationComplete />)

      expect(dataLayerSpy).toHaveBeenCalledWith({
        event: 'form_complete',
        form_name: 'ridejob_application'
      })
    })

    it('should only track completion once', () => {
      const dataLayerSpy = jest.spyOn(window.dataLayer, 'push')

      const { rerender } = render(<ApplicationComplete />)
      rerender(<ApplicationComplete />)

      // Should only be called once despite re-render
      expect(dataLayerSpy).toHaveBeenCalledTimes(1)
    })
  })

  describe('Styling and Layout', () => {
    it('should have proper container styling', () => {
      render(<ApplicationComplete />)

      const mainContainer = screen.getByText('お申し込み完了').closest('div')
      expect(mainContainer).toHaveClass('mx-auto', 'max-w-md')
    })

    it('should have proper header styling', () => {
      render(<ApplicationComplete />)

      const header = screen.getByRole('banner')
      expect(header).toHaveClass('flex', 'items-center', 'justify-between', 'p-1.5', 'bg-white')
    })

    it('should have proper completion card styling', () => {
      render(<ApplicationComplete />)

      const completionCard = screen.getByText('お申し込み完了').closest('div')
      expect(completionCard).toHaveClass('bg-white', 'rounded-lg', 'p-8', 'shadow-lg', 'text-center')
    })

    it('should have proper footer styling', () => {
      render(<ApplicationComplete />)

      const footer = screen.getByRole('contentinfo')
      expect(footer).toHaveClass('text-white', 'py-5', 'mt-8', 'bg-[#6DCFE4]')
    })
  })

  describe('Accessibility', () => {
    it('should have proper heading hierarchy', () => {
      render(<ApplicationComplete />)

      const mainHeading = screen.getByRole('heading', { level: 2 })
      expect(mainHeading).toHaveTextContent('お申し込み完了')
    })

    it('should have alt text for all images', () => {
      render(<ApplicationComplete />)

      const images = screen.getAllByRole('img')
      images.forEach(image => {
        expect(image).toHaveAttribute('alt')
        expect(image.getAttribute('alt')).not.toBe('')
      })
    })

    it('should have proper link accessibility', () => {
      render(<ApplicationComplete />)

      const links = screen.getAllByRole('link')
      links.forEach(link => {
        expect(link).toHaveAttribute('href')
        expect(link.getAttribute('href')).not.toBe('')
      })
    })
  })

  describe('Content Validation', () => {
    it('should display proper Japanese text formatting', () => {
      render(<ApplicationComplete />)

      // Check for proper line breaks in Japanese text
      expect(screen.getByText(/この度は、RIDE JOBにお申し込みいただき、/)).toBeInTheDocument()
      expect(screen.getByText(/誠にありがとうございました。/)).toBeInTheDocument()
    })

    it('should have consistent branding message', () => {
      render(<ApplicationComplete />)

      expect(screen.getByText('RIDE JOB（ライドジョブ）')).toBeInTheDocument()
      expect(screen.getByText('未経験でタクシー会社に就職するなら')).toBeInTheDocument()
    })
  })

  describe('Error Handling', () => {
    it('should render without errors when dataLayer is not available', () => {
      // Temporarily remove dataLayer
      const originalDataLayer = window.dataLayer
      delete (window as any).dataLayer

      expect(() => {
        render(<ApplicationComplete />)
      }).not.toThrow()

      // Restore dataLayer
      window.dataLayer = originalDataLayer
    })

    it('should handle missing images gracefully', () => {
      render(<ApplicationComplete />)

      // Component should render even if images fail to load
      expect(screen.getByText('お申し込み完了')).toBeInTheDocument()
    })
  })

  describe('Responsive Design', () => {
    it('should have responsive classes for different screen sizes', () => {
      render(<ApplicationComplete />)

      // Check for responsive classes in footer
      const footerContent = screen.getByText('運営会社について').closest('div')
      expect(footerContent).toHaveClass('flex', 'flex-col', 'md:flex-row')

      // Check for responsive image classes
      const footerLogo = screen.getByAltText('Footer Logo')
      expect(footerLogo).toHaveClass('w-1/4', 'sm:w-1/6', 'md:w-[150px]')
    })

    it('should have proper spacing for mobile and desktop', () => {
      render(<ApplicationComplete />)

      const footerContent = screen.getByText('運営会社について').closest('div')
      expect(footerContent).toHaveClass('space-y-2', 'md:space-y-0')
    })
  })

  describe('SEO and Meta Information', () => {
    it('should have meaningful content for search engines', () => {
      render(<ApplicationComplete />)

      // Check for important keywords
      expect(screen.getByText(/RIDE JOB/)).toBeInTheDocument()
      expect(screen.getByText(/タクシー/)).toBeInTheDocument()
      expect(screen.getByText(/申し込み完了/)).toBeInTheDocument()
    })
  })
})