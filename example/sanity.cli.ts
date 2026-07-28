import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'placeholder',
    dataset: 'production',
  },
  typegen: {
    path: './**/*.{ts,tsx}',
    schema: './schema.json',
    generates: './sanity.types.ts',
  },
})
