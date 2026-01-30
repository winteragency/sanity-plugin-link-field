import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',

  // Remove this block to enable strict export validation
  extract: {
    rules: {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'ae-forgotten-export': 'off' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'ae-incompatible-release-tags': 'off' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'ae-internal-missing-underscore': 'off' as any,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      'ae-missing-release-tag': 'off' as any,
    },
  },
})
