import fs from 'fs'
import path from 'path'
import { 
  normalizePostcode, 
  getPrefectureByPostcode, 
  loadPostcodeData 
} from '../postcode'

// Mock fs module
jest.mock('fs')

describe('postcode utils', () => {
  const mockData = [
    { postal_code: 1010051, prefecture: '東京都' },
    { postal_code: 5320011, prefecture: '大阪府' },
    { postal_code: 2310001, prefecture: '神奈川県' },
  ]

  beforeEach(() => {
    // Reset the postcodeMap cache
    jest.clearAllMocks()
    
    // Mock fs.readFileSync to return test data
    ;(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockData))
  })

  describe('normalizePostcode', () => {
    it('should remove hyphens and pad with zeros', () => {
      expect(normalizePostcode('101-0051')).toBe('1010051')
      expect(normalizePostcode('101-51')).toBe('0010151')
      expect(normalizePostcode('12345')).toBe('0012345')
    })

    it('should handle Japanese hyphens and spaces', () => {
      expect(normalizePostcode('101－0051')).toBe('1010051')
      expect(normalizePostcode('101ー0051')).toBe('1010051')
      expect(normalizePostcode('101 0051')).toBe('1010051')
    })

    it('should handle already normalized postcodes', () => {
      expect(normalizePostcode('1010051')).toBe('1010051')
      expect(normalizePostcode('5320011')).toBe('5320011')
    })

    it('should pad shorter postcodes', () => {
      expect(normalizePostcode('123')).toBe('0000123')
      expect(normalizePostcode('1')).toBe('0000001')
    })
  })

  describe('loadPostcodeData', () => {
    it('should load postcode data from JSON file', () => {
      const result = loadPostcodeData()
      
      expect(fs.readFileSync).toHaveBeenCalledWith(
        path.join(process.cwd(), 'public', 'data', 'ken_all.json'),
        'utf-8'
      )
      expect(result.size).toBe(3)
      expect(result.get('1010051')).toBe('東京都')
      expect(result.get('5320011')).toBe('大阪府')
      expect(result.get('2310001')).toBe('神奈川県')
    })

    it('should cache the loaded data', () => {
      loadPostcodeData()
      loadPostcodeData() // Second call should use cache
      
      expect(fs.readFileSync).toHaveBeenCalledTimes(1)
    })

    it('should handle file read errors gracefully', () => {
      ;(fs.readFileSync as jest.Mock).mockImplementation(() => {
        throw new Error('File not found')
      })
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = loadPostcodeData()
      
      expect(result.size).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load postcode data:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })

    it('should handle invalid JSON gracefully', () => {
      ;(fs.readFileSync as jest.Mock).mockReturnValue('invalid json')
      
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
      const result = loadPostcodeData()
      
      expect(result.size).toBe(0)
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load postcode data:', expect.any(Error))
      
      consoleSpy.mockRestore()
    })
  })

  describe('getPrefectureByPostcode', () => {
    it('should return prefecture for valid postcodes', () => {
      expect(getPrefectureByPostcode('1010051')).toBe('東京都')
      expect(getPrefectureByPostcode('5320011')).toBe('大阪府')
      expect(getPrefectureByPostcode('2310001')).toBe('神奈川県')
    })

    it('should return null for invalid postcode formats', () => {
      expect(getPrefectureByPostcode('123')).toBeNull()
      expect(getPrefectureByPostcode('12345678')).toBeNull()
      expect(getPrefectureByPostcode('abcdefg')).toBeNull()
      expect(getPrefectureByPostcode('')).toBeNull()
    })

    it('should return null for valid format but unknown postcodes', () => {
      expect(getPrefectureByPostcode('9999999')).toBeNull()
      expect(getPrefectureByPostcode('0000000')).toBeNull()
    })

    it('should handle postcodes with leading zeros', () => {
      // Add test data with leading zeros
      const mockDataWithZeros = [
        ...mockData,
        { postal_code: 1234, prefecture: '青森県' }
      ]
      ;(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(mockDataWithZeros))
      
      // Clear cache to reload with new data
      jest.doMock('../postcode', () => ({
        ...jest.requireActual('../postcode'),
        postcodeMap: null
      }))
      
      expect(getPrefectureByPostcode('0001234')).toBe('青森県')
    })
  })

  describe('edge cases', () => {
    it('should handle empty postcode data file', () => {
      ;(fs.readFileSync as jest.Mock).mockReturnValue('[]')
      
      const result = loadPostcodeData()
      expect(result.size).toBe(0)
      expect(getPrefectureByPostcode('1010051')).toBeNull()
    })

    it('should handle malformed postcode data', () => {
      const malformedData = [
        { postal_code: 'invalid', prefecture: '東京都' },
        { postal_code: null, prefecture: '大阪府' },
        { prefecture: '神奈川県' }, // missing postal_code
      ]
      ;(fs.readFileSync as jest.Mock).mockReturnValue(JSON.stringify(malformedData))
      
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const result = loadPostcodeData()
      
      // Should skip invalid entries but still create the map
      expect(result).toBeInstanceOf(Map)
      
      consoleSpy.mockRestore()
    })
  })
})