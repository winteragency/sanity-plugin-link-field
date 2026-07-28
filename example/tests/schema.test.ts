import {readFileSync} from 'node:fs'

import {describe, expect, it} from 'vitest'

type SchemaType = {
  name: string
  type: string
  value?: {
    type: string
    attributes?: Record<string, unknown>
  }
}

describe('extracted schema', () => {
  it('includes the link object type with expected fields', () => {
    const schemaPath = new URL('../schema.json', import.meta.url)
    const schema = JSON.parse(readFileSync(schemaPath, 'utf-8')) as SchemaType[]
    const linkType = schema.find((item) => item.name === 'link')

    expect(linkType).toBeDefined()
    expect(linkType?.type).toBe('type')
    expect(linkType?.value?.type).toBe('object')

    const fieldNames = Object.keys(linkType?.value?.attributes ?? {})

    expect(fieldNames).toEqual(
      expect.arrayContaining([
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
      ]),
    )
  })
})
