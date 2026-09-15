import {defineField, defineType} from 'sanity'

export const localizedDemo = defineType({
  name: 'localizedDemo',
  title: 'Localized Demo',
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
      type: 'internationalizedArrayLink',
    }),
    defineField({
      name: 'labelledLink',
      title: 'Labelled link',
      type: 'internationalizedArrayLabelledLink',
    }),
    defineField({
      name: 'minimalLink',
      title: 'Minimal link',
      type: 'internationalizedArrayMinimalLink',
    }),
  ],
})
