import {defineField, defineType} from 'sanity'

import type {LinkFieldOptions} from '../types'

export const page = defineType({
  name: 'page',
  title: 'Page',
  type: 'document',
  fields: [
    defineField({name: 'title', type: 'string'}),
    defineField({name: 'slug', type: 'slug', options: {source: 'title'}}),
  ],
})

/** A document with a single link field, using the given field-level options. */
export const demoWithLinkOptions = (options: LinkFieldOptions = {}) =>
  defineType({
    name: 'demo',
    title: 'Demo',
    type: 'document',
    fields: [
      defineField({
        name: 'link',
        title: 'Link',
        type: 'link',
        options,
      }),
    ],
  })
