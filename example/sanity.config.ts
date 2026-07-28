import {ComposeIcon} from '@sanity/icons'
import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {linkField} from 'sanity-plugin-link-field'

import {demo} from './schemaTypes/demo'
import {page} from './schemaTypes/page'

export default defineConfig({
  name: 'link-field-example',
  title: 'Link Field Example',
  projectId: 'placeholder',
  dataset: 'production',
  plugins: [
    linkField({
      linkableSchemaTypes: ['page'],
      customLinkTypes: [
        {
          title: 'Archive',
          value: 'archive',
          icon: ComposeIcon,
          options: [
            {title: 'Blog', value: '/blog'},
            {title: 'News', value: '/news'},
          ],
        },
      ],
    }),
    structureTool(),
  ],
  schema: {
    types: [page, demo],
  },
})
