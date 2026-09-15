import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder',
    dataset: 'production',
  },
  typegen: {
    path: './**/*.{ts,tsx}',
    schema: './schema.json',
    generates: './sanity.types.ts',
  },
})
