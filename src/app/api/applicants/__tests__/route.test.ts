import { NextRequest } from 'next/server'
import { POST } from '../route'

// Mock environment variables
const mockEnv = {
  LARK_WEBHOOK_URL: 'https://test-webhook.example.com'
}

describe('/api/applicants', () => {
  const originalEnv = process.env

  beforeEach(() => {
    process.env = { ...originalEnv, ...mockEnv }
    global.fetch = jest.fn()
    jest.clearAllMocks()
  })

  afterEach(() => {
    process.env = originalEnv
  })

  describe('getMediaName function', () => {
    // We need to test the getMediaName function indirectly through the POST handler
    // since it's not exported. We'll check the Lark message content.

    it('should return "直接アクセス" when no utm_source', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: JSON.stringify({
          lastName: 'テスト',
          firstName: '太郎',
          utmParams: {}
        })
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ code: 0 })
      })

      const response = await POST(mockRequest)
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-webhook.example.com',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('直接アクセス')
        })
      )
      expect(response.status).toBe(200)
    })

    it('should return correct media names for UTM parameters', async () => {
      const testCases = [
        {
          utm: { utm_source: 'google', utm_medium: 'search' },
          expected: 'Googleリスティング'
        },
        {
          utm: { utm_source: 'tiktok', utm_medium: 'ad' },
          expected: 'TikTok広告'
        },
        {
          utm: { utm_source: 'tiktok', utm_medium: 'organic' },
          expected: 'TikTokオーガニック'
        },
        {
          utm: { utm_source: 'meta', utm_medium: 'ad' },
          expected: 'Meta広告'
        },
        {
          utm: { utm_source: 'youtube', utm_medium: 'organic' },
          expected: 'YouTubeオーガニック'
        },
        {
          utm: { utm_source: 'threads', utm_medium: 'organic' },
          expected: 'スレッドオーガニック'
        },
        {
          utm: { utm_source: 'custom', utm_medium: 'test' },
          expected: 'custom(test)'
        },
        {
          utm: { utm_source: 'custom' },
          expected: 'custom'
        }
      ]

      for (const testCase of testCases) {
        const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
          method: 'POST',
          body: JSON.stringify({
            lastName: 'テスト',
            firstName: '太郎',
            utmParams: testCase.utm
          })
        })

        ;(global.fetch as jest.Mock).mockResolvedValue({
          ok: true,
          json: jest.fn().mockResolvedValue({ code: 0 })
        })

        await POST(mockRequest)
        
        expect(global.fetch).toHaveBeenCalledWith(
          'https://test-webhook.example.com',
          expect.objectContaining({
            body: expect.stringContaining(testCase.expected)
          })
        )

        jest.clearAllMocks()
      }
    })
  })

  describe('POST /api/applicants', () => {
    const validFormData = {
      birthYear: '1990',
      lastName: 'テスト',
      firstName: '太郎',
      lastNameKana: 'てすと',
      firstNameKana: 'たろう',
      postalCode: '1010051',
      phoneNumber: '09012345678',
      utmParams: {
        utm_source: 'google',
        utm_medium: 'search'
      }
    }

    it('should successfully submit application', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: JSON.stringify(validFormData)
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ code: 0 })
      })

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.message).toBe('Application submitted successfully!')
      
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-webhook.example.com',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.stringContaining('新しい応募がありました！')
        }
      )
    })

    it('should handle missing Lark webhook URL', async () => {
      delete process.env.LARK_WEBHOOK_URL

      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: JSON.stringify(validFormData)
      })

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.message).toBe('Internal Server Error')
    })

    it('should handle Lark webhook failure gracefully', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: JSON.stringify(validFormData)
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200) // Still returns success even if Lark fails
      expect(responseData.message).toBe('Application submitted successfully!')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Failed to send notification to Lark'),
        expect.any(String)
      )

      consoleSpy.mockRestore()
    })

    it('should handle successful Lark webhook response', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: JSON.stringify(validFormData)
      })

      const mockLarkResponse = { code: 0, msg: 'success' }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockLarkResponse)
      })

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()

      const response = await POST(mockRequest)
      
      expect(response.status).toBe(200)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Lark notification sent successfully:',
        mockLarkResponse
      )

      consoleSpy.mockRestore()
    })

    it('should handle JSON parsing errors', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: 'invalid json'
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.message).toBe('Internal Server Error')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error processing application in API route:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle fetch errors to Lark webhook', async () => {
      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: JSON.stringify(validFormData)
      })

      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await POST(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData.message).toBe('Internal Server Error')
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error processing application in API route:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should format Lark message correctly', async () => {
      const testData = {
        birthYear: '1985',
        lastName: '山田',
        firstName: '花子',
        lastNameKana: 'やまだ',
        firstNameKana: 'はなこ',
        postalCode: '5320011',
        phoneNumber: '08098765432',
        utmParams: {
          utm_source: 'tiktok',
          utm_medium: 'ad'
        }
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: JSON.stringify(testData)
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ code: 0 })
      })

      await POST(mockRequest)

      const expectedContent = `新しい応募がありました！
-------------------------
流入元: TikTok広告
生まれ年: 1985
氏名: 山田 花子 (やまだ はなこ)
郵便番号: 5320011
電話番号: 08098765432
-------------------------`

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-webhook.example.com',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            msg_type: 'text',
            content: {
              text: expectedContent
            }
          })
        }
      )
    })

    it('should handle missing form data fields', async () => {
      const incompleteData = {
        lastName: '山田',
        utmParams: {}
      }

      const mockRequest = new NextRequest('http://localhost:3000/api/applicants', {
        method: 'POST',
        body: JSON.stringify(incompleteData)
      })

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ code: 0 })
      })

      const response = await POST(mockRequest)
      
      expect(response.status).toBe(200)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-webhook.example.com',
        expect.objectContaining({
          body: expect.stringContaining('未入力')
        })
      )
    })
  })
})