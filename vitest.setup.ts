import '@testing-library/jest-dom/vitest'

import {cleanup} from '@testing-library/react'
import {afterEach} from 'vitest'

// Testing Library only auto-cleans when Vitest globals are enabled.
afterEach(cleanup)

// jsdom lacks the browser APIs that @sanity/ui and the Studio form builder rely on.
if (typeof window !== 'undefined') {
  if (!window.matchMedia) {
    window.matchMedia = (query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList
  }

  if (!window.ResizeObserver) {
    window.ResizeObserver = class {
      observe() {}
      disconnect() {}
      unobserve() {}
    } as unknown as typeof ResizeObserver
  }

  if (!window.IntersectionObserver) {
    window.IntersectionObserver = class {
      root = null
      rootMargin = ''
      thresholds: number[] = []
      observe() {}
      disconnect() {}
      unobserve() {}
      takeRecords() {
        return []
      }
    } as unknown as typeof IntersectionObserver
  }

  // jsdom defines this one as a stub that throws "Not implemented", so it is
  // replaced rather than filled in.
  window.scrollTo = (() => {}) as typeof window.scrollTo
}
