import {
  getJobsByPostalCode,
  getJobCountByPostalCode,
  getPrefectureByRegion,
  getJobsByPrefectureId,
  getJobCountByPrefecture,
  Job,
  JobsResponse,
  Prefecture,
  PrefecturesResponse
} from '../microcms'

// Mock environment variables
const mockEnv = {
  MICROCMS_SERVICE_DOMAIN: 'test-domain',
  MICROCMS_API_KEY: 'test-api-key'
}

describe('microcms utils', () => {
  const originalEnv = process.env

  beforeEach(() => {
    // Reset environment variables
    process.env = { ...originalEnv, ...mockEnv }
    
    // Reset fetch mock
    global.fetch = jest.fn()
  })

  afterEach(() => {
    process.env = originalEnv
    jest.clearAllMocks()
  })

  describe('Environment variable validation', () => {
    it('should throw error when MICROCMS_SERVICE_DOMAIN is not set', () => {
      delete process.env.MICROCMS_SERVICE_DOMAIN
      
      expect(() => {
        jest.resetModules()
        require('../microcms')
      }).toThrow('microCMS environment variables are not set')
    })

    it('should throw error when MICROCMS_API_KEY is not set', () => {
      delete process.env.MICROCMS_API_KEY
      
      expect(() => {
        jest.resetModules()
        require('../microcms')
      }).toThrow('microCMS environment variables are not set')
    })
  })

  describe('getJobsByPostalCode', () => {
    const mockJobsResponse: JobsResponse = {
      contents: [
        {
          id: '1',
          title: 'Test Job 1',
          addressZip: '1010051',
          companyName: 'Test Company',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          publishedAt: '2024-01-01T00:00:00.000Z',
          revisedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      totalCount: 1,
      offset: 0,
      limit: 10
    }

    it('should fetch jobs by postal code successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockJobsResponse)
      })

      const result = await getJobsByPostalCode('1010051')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-domain.microcms.io/api/v1/jobs?filters=addressZip[equals]1010051',
        {
          headers: {
            'X-MICROCMS-API-KEY': 'test-api-key'
          }
        }
      )
      expect(result).toEqual(mockJobsResponse)
    })

    it('should throw error when API request fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(getJobsByPostalCode('1010051'))
        .rejects.toThrow('microCMS API error: 404 Not Found')
    })

    it('should handle network errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'))

      await expect(getJobsByPostalCode('1010051'))
        .rejects.toThrow('Network error')
    })
  })

  describe('getJobCountByPostalCode', () => {
    it('should return job count successfully', async () => {
      const mockResponse: JobsResponse = {
        contents: [],
        totalCount: 5,
        offset: 0,
        limit: 10
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockResponse)
      })

      const result = await getJobCountByPostalCode('1010051')
      expect(result).toBe(5)
    })

    it('should handle errors and rethrow them', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(getJobCountByPostalCode('1010051'))
        .rejects.toThrow('microCMS API error: 500 Internal Server Error')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching job count:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('getPrefectureByRegion', () => {
    const mockPrefecturesResponse: PrefecturesResponse = {
      contents: [
        {
          id: 'tokyo',
          region: '東京都',
          area: '関東',
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          publishedAt: '2024-01-01T00:00:00.000Z',
          revisedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      totalCount: 1,
      offset: 0,
      limit: 10
    }

    it('should fetch prefecture by region name successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockPrefecturesResponse)
      })

      const result = await getPrefectureByRegion('東京都')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-domain.microcms.io/api/v1/prefectures?filters=region[equals]%E6%9D%B1%E4%BA%AC%E9%83%BD',
        {
          headers: {
            'X-MICROCMS-API-KEY': 'test-api-key'
          }
        }
      )
      expect(result).toEqual(mockPrefecturesResponse.contents[0])
    })

    it('should return null when no prefecture is found', async () => {
      const emptyResponse: PrefecturesResponse = {
        contents: [],
        totalCount: 0,
        offset: 0,
        limit: 10
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(emptyResponse)
      })

      const result = await getPrefectureByRegion('存在しない県')
      expect(result).toBeNull()
    })

    it('should throw error when API request fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      })

      await expect(getPrefectureByRegion('東京都'))
        .rejects.toThrow('microCMS API error: 400 Bad Request')
    })
  })

  describe('getJobsByPrefectureId', () => {
    const mockJobsResponse: JobsResponse = {
      contents: [
        {
          id: '1',
          title: 'Prefecture Job',
          prefecture: {
            id: 'tokyo',
            region: '東京都',
            area: '関東'
          },
          createdAt: '2024-01-01T00:00:00.000Z',
          updatedAt: '2024-01-01T00:00:00.000Z',
          publishedAt: '2024-01-01T00:00:00.000Z',
          revisedAt: '2024-01-01T00:00:00.000Z'
        }
      ],
      totalCount: 1,
      offset: 0,
      limit: 10
    }

    it('should fetch jobs by prefecture ID successfully', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(mockJobsResponse)
      })

      const result = await getJobsByPrefectureId('tokyo')

      expect(global.fetch).toHaveBeenCalledWith(
        'https://test-domain.microcms.io/api/v1/jobs?filters=prefecture[equals]tokyo',
        {
          headers: {
            'X-MICROCMS-API-KEY': 'test-api-key'
          }
        }
      )
      expect(result).toEqual(mockJobsResponse)
    })

    it('should throw error when API request fails', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 404,
        statusText: 'Not Found'
      })

      await expect(getJobsByPrefectureId('tokyo'))
        .rejects.toThrow('microCMS API error: 404 Not Found')
    })
  })

  describe('getJobCountByPrefecture', () => {
    it('should return job count by prefecture successfully', async () => {
      const mockPrefectureResponse: PrefecturesResponse = {
        contents: [
          {
            id: 'tokyo',
            region: '東京都',
            area: '関東',
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
            publishedAt: '2024-01-01T00:00:00.000Z',
            revisedAt: '2024-01-01T00:00:00.000Z'
          }
        ],
        totalCount: 1,
        offset: 0,
        limit: 10
      }

      const mockJobsResponse: JobsResponse = {
        contents: [],
        totalCount: 10,
        offset: 0,
        limit: 10
      }

      ;(global.fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockPrefectureResponse)
        })
        .mockResolvedValueOnce({
          ok: true,
          json: jest.fn().mockResolvedValue(mockJobsResponse)
        })

      const result = await getJobCountByPrefecture('東京都')
      expect(result).toBe(10)
    })

    it('should return 0 when prefecture is not found', async () => {
      const emptyPrefectureResponse: PrefecturesResponse = {
        contents: [],
        totalCount: 0,
        offset: 0,
        limit: 10
      }

      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue(emptyPrefectureResponse)
      })

      const result = await getJobCountByPrefecture('存在しない県')
      expect(result).toBe(0)
    })

    it('should handle errors and rethrow them', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      })

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

      await expect(getJobCountByPrefecture('東京都'))
        .rejects.toThrow('microCMS API error: 500 Internal Server Error')

      expect(consoleSpy).toHaveBeenCalledWith(
        'Error fetching job count by prefecture:',
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })
  })

  describe('API URL encoding', () => {
    it('should properly encode special characters in region names', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: jest.fn().mockResolvedValue({ contents: [], totalCount: 0, offset: 0, limit: 10 })
      })

      await getPrefectureByRegion('特殊文字&=?県')

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('%E7%89%B9%E6%AE%8A%E6%96%87%E5%AD%97%26%3D%3F%E7%9C%8C'),
        expect.any(Object)
      )
    })
  })
})