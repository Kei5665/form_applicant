import '@testing-library/jest-dom'

// Mock global objects
global.fetch = jest.fn()

// Mock Next.js Image component
jest.mock('next/image', () => {
  return function Image({ src, alt, ...props }: any) {
    return <img src={src} alt={alt} {...props} />
  }
})

// Mock Next.js navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
    prefetch: jest.fn(),
  })),
  useSearchParams: jest.fn(() => ({
    get: jest.fn(),
    has: jest.fn(),
    toString: jest.fn(),
  })),
  usePathname: jest.fn(() => '/'),
}))

// Mock window.dataLayer for GTM
Object.defineProperty(window, 'dataLayer', {
  value: [],
  writable: true,
})

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

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks()
})