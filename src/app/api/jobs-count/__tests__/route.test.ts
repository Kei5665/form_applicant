import { NextRequest } from 'next/server'
import { GET } from '../route'
import * as microcms from '@/lib/microcms'
import * as postcode from '@/lib/postcode'

// Mock the lib modules
jest.mock('@/lib/microcms')
jest.mock('@/lib/postcode')

const mockGetJobCountByPrefecture = microcms.getJobCountByPrefecture as jest.MockedFunction<typeof microcms.getJobCountByPrefecture>
const mockGetPrefectureByPostcode = postcode.getPrefectureByPostcode as jest.MockedFunction<typeof postcode.getPrefectureByPostcode>
const mockNormalizePostcode = postcode.normalizePostcode as jest.MockedFunction<typeof postcode.normalizePostcode>

describe('/api/jobs-count', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    
    // Set up default mock implementations
    mockNormalizePostcode.mockImplementation((code) => code.replace(/[-－ー\s]/g, '').padStart(7, '0'))
  })

  describe('GET /api/jobs-count', () => {
    it('should return job count successfully', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count?postalCode=1010051')
      const mockRequest = new NextRequest(url)

      mockNormalizePostcode.mockReturnValue('1010051')
      mockGetPrefectureByPostcode.mockReturnValue('東京都')
      mockGetJobCountByPrefecture.mockResolvedValue(5)

      const response = await GET(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        postalCode: '1010051',
        jobCount: 5,
        searchMethod: 'prefecture',
        searchArea: '東京都内',
        message: '東京都内で5件の求人が見つかりました'
      })

      expect(mockNormalizePostcode).toHaveBeenCalledWith('1010051')
      expect(mockGetPrefectureByPostcode).toHaveBeenCalledWith('1010051')
      expect(mockGetJobCountByPrefecture).toHaveBeenCalledWith('東京都')
    })

    it('should return error when postal code is missing', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count')
      const mockRequest = new NextRequest(url)

      const response = await GET(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toEqual({
        error: 'Postal code is required'
      })
    })

    it('should return error for invalid postal code format', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count?postalCode=123')
      const mockRequest = new NextRequest(url)

      mockNormalizePostcode.mockReturnValue('0000123')

      const response = await GET(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(400)
      expect(responseData).toEqual({
        error: 'Invalid postal code format. Must be 7 digits.'
      })
    })

    it('should handle postal codes with hyphens', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count?postalCode=101-0051')
      const mockRequest = new NextRequest(url)

      mockNormalizePostcode.mockReturnValue('1010051')
      mockGetPrefectureByPostcode.mockReturnValue('東京都')
      mockGetJobCountByPrefecture.mockResolvedValue(3)

      const response = await GET(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData.postalCode).toBe('1010051')
      expect(responseData.jobCount).toBe(3)

      expect(mockNormalizePostcode).toHaveBeenCalledWith('101-0051')
    })

    it('should return 404 when prefecture is not found', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count?postalCode=9999999')
      const mockRequest = new NextRequest(url)

      mockNormalizePostcode.mockReturnValue('9999999')
      mockGetPrefectureByPostcode.mockReturnValue(null)

      const response = await GET(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(404)
      expect(responseData).toEqual({
        error: 'Prefecture not found for this postal code'
      })
    })

    it('should return 0 jobs found message when no jobs available', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count?postalCode=1010051')
      const mockRequest = new NextRequest(url)

      mockNormalizePostcode.mockReturnValue('1010051')
      mockGetPrefectureByPostcode.mockReturnValue('東京都')
      mockGetJobCountByPrefecture.mockResolvedValue(0)

      const response = await GET(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(200)
      expect(responseData).toEqual({
        postalCode: '1010051',
        jobCount: 0,
        searchMethod: 'prefecture',
        searchArea: '東京都内',
        message: '東京都内では現在求人がありません'
      })
    })

    it('should handle microCMS API errors', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count?postalCode=1010051')
      const mockRequest = new NextRequest(url)

      mockNormalizePostcode.mockReturnValue('1010051')
      mockGetPrefectureByPostcode.mockReturnValue('東京都')
      mockGetJobCountByPrefecture.mockRejectedValue(new Error('microCMS API error'))

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await GET(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        error: 'Failed to fetch job count'
      })
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in jobs-count API:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should handle postcode utility errors', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count?postalCode=1010051')
      const mockRequest = new NextRequest(url)

      mockNormalizePostcode.mockImplementation(() => {
        throw new Error('Postcode normalization error')
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      const response = await GET(mockRequest)
      const responseData = await response.json()

      expect(response.status).toBe(500)
      expect(responseData).toEqual({
        error: 'Failed to fetch job count'
      })
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error in jobs-count API:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('should validate postal code format correctly', async () => {
      const testCases = [
        { input: 'abcdefg', valid: false },
        { input: '123456', valid: false }, // Only 6 digits after normalization
        { input: '12345678', valid: false }, // 8 digits
        { input: '1234567', valid: true },
        { input: '0001234', valid: true },
      ]

      for (const testCase of testCases) {
        const url = new URL(`http://localhost:3000/api/jobs-count?postalCode=${testCase.input}`)
        const mockRequest = new NextRequest(url)

        mockNormalizePostcode.mockReturnValue(testCase.input.padStart(7, '0'))

        if (testCase.valid) {
          mockGetPrefectureByPostcode.mockReturnValue('東京都')
          mockGetJobCountByPrefecture.mockResolvedValue(1)
        }

        const response = await GET(mockRequest)
        const responseData = await response.json()

        if (testCase.valid) {
          expect(response.status).toBe(200)
        } else {
          expect(response.status).toBe(400)
          expect(responseData.error).toBe('Invalid postal code format. Must be 7 digits.')
        }

        jest.clearAllMocks()
      }
    })

    it('should handle different prefecture names correctly', async () => {
      const prefectures = ['東京都', '大阪府', '神奈川県', '北海道']

      for (const prefecture of prefectures) {
        const url = new URL('http://localhost:3000/api/jobs-count?postalCode=1234567')
        const mockRequest = new NextRequest(url)

        mockNormalizePostcode.mockReturnValue('1234567')
        mockGetPrefectureByPostcode.mockReturnValue(prefecture)
        mockGetJobCountByPrefecture.mockResolvedValue(2)

        const response = await GET(mockRequest)
        const responseData = await response.json()

        expect(response.status).toBe(200)
        expect(responseData.searchArea).toBe(`${prefecture}内`)
        expect(responseData.message).toBe(`${prefecture}内で2件の求人が見つかりました`)

        jest.clearAllMocks()
      }
    })

    it('should handle URL encoding in postal code parameter', async () => {
      const url = new URL('http://localhost:3000/api/jobs-count?postalCode=101%2D0051')
      const mockRequest = new NextRequest(url)

      mockNormalizePostcode.mockReturnValue('1010051')
      mockGetPrefectureByPostcode.mockReturnValue('東京都')
      mockGetJobCountByPrefecture.mockResolvedValue(1)

      const response = await GET(mockRequest)
      
      expect(response.status).toBe(200)
      expect(mockNormalizePostcode).toHaveBeenCalledWith('101-0051') // URL decoded
    })
  })
})