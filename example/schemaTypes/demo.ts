import {defineField, defineType} from 'sanity'
import {requiredLinkField} from 'sanity-plugin-link-field'

export const demo = defineType({
  name: 'demo',
  title: 'Demo',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
    }),
    defineField({
      name: 'link',
      title: 'Link',
      type: 'link',
      options: {
        enableText: true,
        requireText: true,
      },
      validation: (rule) => rule.custom(requiredLinkField),
    }),
  ],
})
