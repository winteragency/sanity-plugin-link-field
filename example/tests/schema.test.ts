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

describe('generated types', () => {
  const types = readFile('../sanity.types.ts')

  it('generates a type for each registered link type', () => {
    expect(types).toMatch(/export type Link = \{\s+_type: 'link'/)
    expect(types).toMatch(/export type Cta = \{\s+_type: 'cta'/)
  })
})
