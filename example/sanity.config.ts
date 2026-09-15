import {ComposeIcon} from '@sanity/icons'
import {defineConfig, defineField} from 'sanity'
import {structureTool} from 'sanity/structure'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {linkField} from 'sanity-plugin-link-field'

import {demo} from './schemaTypes/demo'
import {localizedDemo} from './schemaTypes/localizedDemo'
import {page} from './schemaTypes/page'

export default defineConfig({
  name: 'link-field-example',
  title: 'Link Field Example',
  projectId: process.env.SANITY_STUDIO_PROJECT_ID || 'placeholder',
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
    linkField({
      name: 'cta',
      linkableSchemaTypes: ['page'],
      enabledBuiltInLinkTypes: ['internal', 'external'],
    }),
    internationalizedArray({
      languages: [
        {id: 'en', title: 'English'},
        {id: 'sv', title: 'Swedish'},
      ],
      defaultLanguages: ['en'],
      fieldTypes: [
        // A bare `link`, using the plugin defaults.
        'link',
        // Named variants. Each one becomes its own `internationalizedArray<Name>`
        // type, carrying its own link field options.
        defineField({
          name: 'labelledLink',
          type: 'link',
          options: {
            enableText: true,
            enableLinkParameters: false,
            enableAnchorLinks: false,
          },
        }),
        defineField({
          name: 'minimalLink',
          type: 'link',
          options: {
            enableLinkParameters: false,
            enableAnchorLinks: false,
            enableNewTab: false,
            enabledBuiltInLinkTypes: ['internal', 'external'],
          },
        }),
      ],
    }),
    structureTool(),
  ],
  schema: {
    types: [page, demo, localizedDemo],
  },
})
