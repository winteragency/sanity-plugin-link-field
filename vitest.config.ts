import react from '@vitejs/plugin-react'
import {defineConfig} from 'vitest/config'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.{ts,tsx}'],
    setupFiles: ['./vitest.setup.ts'],
    // Rendering a real Studio form takes a few seconds to resolve.
    testTimeout: 30000,
  },
})
