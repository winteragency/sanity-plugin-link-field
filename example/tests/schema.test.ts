import {readFileSync} from 'node:fs'

import {describe, expect, it} from 'vitest'

type ObjectAttribute = {
  type: string
  value?: {type: string; name?: string}
}

type SchemaType = {
  name: string
  type: string
  attributes?: Record<string, ObjectAttribute>
  value?: {
    type: string
    attributes?: Record<string, ObjectAttribute>
  }
}

const readFile = (path: string) => readFileSync(new URL(path, import.meta.url), 'utf-8')

const schema = JSON.parse(readFile('../schema.json')) as SchemaType[]

const findType = (name: string) => schema.find((item) => item.name === name)

const attributeNames = (type?: SchemaType) =>
  Object.keys(type?.value?.attributes ?? type?.attributes ?? {})

const expectedLinkFields = [
  'type',
  'text',
  'internalLink',
  'url',
  'email',
  'phone',
  'value',
  'blank',
  'parameters',
  'anchor',
]

describe('extracted schema', () => {
  it('includes the link object type with expected fields', () => {
    const linkType = findType('link')

    expect(linkType).toBeDefined()
    expect(linkType?.type).toBe('type')
    expect(linkType?.value?.type).toBe('object')
    expect(attributeNames(linkType)).toEqual(expect.arrayContaining(expectedLinkFields))
  })

  it('registers a second link type under the configured name', () => {
    const ctaType = findType('cta')

    expect(ctaType).toBeDefined()
    expect(ctaType?.type).toBe('type')
    expect(ctaType?.value?.type).toBe('object')
    expect(attributeNames(ctaType)).toEqual(attributeNames(findType('link')))
  })

  it('exposes both link types as fields on the demo document', () => {
    const attributes = findType('demo')?.attributes

    expect(attributes?.link?.value).toMatchObject({type: 'inline', name: 'link'})
    expect(attributes?.cta?.value).toMatchObject({type: 'inline', name: 'cta'})
  })
})

describe('internationalized link types', () => {
  it('registers a wrapper type per fieldTypes entry', () => {
    for (const name of [
      'internationalizedArrayLink',
      'internationalizedArrayLabelledLink',
      'internationalizedArrayMinimalLink',
    ]) {
      expect(findType(name), name).toBeDefined()
    }
  })

  it('wraps the link type in each array item', () => {
    for (const name of [
      'internationalizedArrayLinkValue',
      'internationalizedArrayLabelledLinkValue',
      'internationalizedArrayMinimalLinkValue',
    ]) {
      const itemType = findType(name)

      expect(attributeNames(itemType), name).toEqual(expect.arrayContaining(['value', 'language']))
      expect(itemType?.value?.attributes?.value?.value, name).toMatchObject({
        type: 'inline',
        name: 'link',
      })
    }
  })

  it('exposes the localized link fields on the localized demo document', () => {
    const attributes = findType('localizedDemo')?.attributes

    expect(attributes?.link?.value).toMatchObject({
      type: 'inline',
      name: 'internationalizedArrayLink',
    })
    expect(attributes?.labelledLink?.value).toMatchObject({
      type: 'inline',
      name: 'internationalizedArrayLabelledLink',
    })
    expect(attributes?.minimalLink?.value).toMatchObject({
      type: 'inline',
      name: 'internationalizedArrayMinimalLink',
    })
  })
})

describe('generated types', () => {
  const types = readFile('../sanity.types.ts')

  it('generates a type for each registered link type', () => {
    expect(types).toMatch(/export type Link = \{\s+_type: 'link'/)
    expect(types).toMatch(/export type Cta = \{\s+_type: 'cta'/)
  })

  it('generates types for the internationalized link arrays', () => {
    expect(types).toMatch(/export type InternationalizedArrayLinkValue = /)
    expect(types).toMatch(/export type InternationalizedArrayLabelledLinkValue = /)
    expect(types).toMatch(/export type InternationalizedArrayMinimalLinkValue = /)
  })
})
