import {screen, within} from '@testing-library/react'
import {defineField, defineType, type FieldDefinition} from 'sanity'
import {internationalizedArray} from 'sanity-plugin-internationalized-array'
import {describe, expect, it} from 'vitest'

import {linkField} from '../linkField'
import type {LinkFieldOptions} from '../types'

import {renderDocumentForm} from './formHarness'
import {page} from './schemaFixtures'

const languages = [
  {id: 'en', title: 'English'},
  {id: 'sv', title: 'Swedish'},
]

/**
 * `sanity-plugin-internationalized-array` spreads each `fieldTypes` entry onto
 * the `value` field of the generated wrapper object, which is how link field
 * options reach a localized link field.
 */
const localizedLink = (name: string, options?: LinkFieldOptions) =>
  defineField({
    name,
    type: 'link',
    ...(options ? {options} : {}),
  }) as FieldDefinition

async function renderLocalizedLinks(options: {
  fieldTypes: (string | FieldDefinition)[]
  fields: {name: string; type: string}[]
  documentValue?: Record<string, unknown>
}) {
  await renderDocumentForm({
    config: {
      name: 'test',
      plugins: [
        linkField(),
        internationalizedArray({
          languages,
          defaultLanguages: ['en'],
          fieldTypes: options.fieldTypes,
        }),
      ],
      schema: {
        types: [
          page,
          defineType({
            name: 'demo',
            title: 'Demo',
            type: 'document',
            fields: options.fields.map((field) => defineField(field as never)),
          }),
        ],
      },
    },
    documentType: 'demo',
    documentValue: options.documentValue,
  })

  await screen.findAllByRole('button', {name: /Select link type/}, {timeout: 10000})
}

const linkValue = (language: string, type: string, name = 'Link') => ({
  _key: language,
  _type: `internationalizedArray${name}Value`,
  language,
  value: {_type: 'link', type},
})

describe('link field inside an internationalized array', () => {
  it('renders the plugin input, once per language', async () => {
    await renderLocalizedLinks({
      fieldTypes: ['link'],
      fields: [{name: 'links', type: 'internationalizedArrayLink'}],
      documentValue: {links: [linkValue('en', 'internal'), linkValue('sv', 'external')]},
    })

    // The plugin input renders the type selector next to the link input and
    // strips the per-subfield titles the default object input would show.
    expect(screen.getAllByRole('button', {name: /Select link type/})).toHaveLength(2)
    expect(screen.getByTestId('reference-input')).toBeInTheDocument()
    expect(screen.queryByText('Internal Link')).not.toBeInTheDocument()
    expect(screen.queryByText('Text')).not.toBeInTheDocument()
  })

  it('applies field options declared on the fieldTypes entry', async () => {
    await renderLocalizedLinks({
      fieldTypes: [
        localizedLink('link', {
          enableText: true,
          enableNewTab: false,
          enableLinkParameters: false,
          enableAnchorLinks: false,
        }),
      ],
      fields: [{name: 'links', type: 'internationalizedArrayLink'}],
      documentValue: {links: [linkValue('en', 'internal')]},
    })

    expect(screen.getByText('Text')).toBeInTheDocument()
    expect(screen.queryByText('Open in new window')).not.toBeInTheDocument()
    expect(screen.queryByText('Advanced')).not.toBeInTheDocument()
  })

  it('keeps options separate for each named fieldTypes entry', async () => {
    await renderLocalizedLinks({
      fieldTypes: [
        'link',
        localizedLink('minimalLink', {
          enableNewTab: false,
          enableLinkParameters: false,
          enableAnchorLinks: false,
        }),
      ],
      fields: [
        {name: 'links', type: 'internationalizedArrayLink'},
        {name: 'minimalLinks', type: 'internationalizedArrayMinimalLink'},
      ],
      documentValue: {
        links: [linkValue('en', 'internal')],
        minimalLinks: [linkValue('en', 'internal', 'MinimalLink')],
      },
    })

    const plain = screen.getByTestId('field-links')
    const minimal = screen.getByTestId('field-minimalLinks')

    expect(within(plain).getByText('Advanced')).toBeInTheDocument()
    expect(within(plain).getByText('Open in new window')).toBeInTheDocument()
    expect(within(minimal).queryByText('Advanced')).not.toBeInTheDocument()
    expect(within(minimal).queryByText('Open in new window')).not.toBeInTheDocument()
  })
})
