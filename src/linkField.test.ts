import {ComposeIcon} from '@sanity/icons'
import {describe, expect, it} from 'vitest'

import {linkField} from './linkField'
import type {LinkFieldPluginOptions} from './types'

type RegisteredField = {
  name: string
  type: string
  initialValue?: unknown
  to?: {type: string}[]
}

type RegisteredLinkType = {
  name: string
  type: string
  title?: string
  fields: RegisteredField[]
  fieldsets?: {name: string}[]
  preview?: {
    select?: Record<string, string>
    prepare?: (selection: Record<string, unknown>) => {title?: string; subtitle?: string}
  }
  components?: {input?: unknown}
  validation?: unknown
}

const register = (options?: LinkFieldPluginOptions) => {
  const plugin = linkField(options)
  const types = plugin.schema?.types as unknown as RegisteredLinkType[]
  return {pluginName: plugin.name, types, linkType: types[0]}
}

const fieldNames = (linkType: RegisteredLinkType) => linkType.fields.map((field) => field.name)

const findField = (linkType: RegisteredLinkType, name: string) =>
  linkType.fields.find((field) => field.name === name)

describe('linkField schema type name', () => {
  it('registers a single object type named "link" by default', () => {
    const {types, linkType} = register()

    expect(types).toHaveLength(1)
    expect(linkType.name).toBe('link')
    expect(linkType.type).toBe('object')
    expect(linkType.title).toBe('Link')
  })

  it('falls back to the default name when no name is given', () => {
    expect(register({}).linkType.name).toBe('link')
    expect(register({linkableSchemaTypes: ['article']}).linkType.name).toBe('link')
  })

  it('registers the type under a custom name', () => {
    const {types, linkType} = register({name: 'cta'})

    expect(types).toHaveLength(1)
    expect(linkType.name).toBe('cta')
    expect(linkType.type).toBe('object')
  })

  it('keeps the plugin name stable by default and namespaces it when renamed', () => {
    expect(register().pluginName).toBe('link-field')
    expect(register({name: 'link'}).pluginName).toBe('link-field')
    expect(register({name: 'cta'}).pluginName).toBe('link-field-cta')
  })

  it('leaves the rest of the schema type untouched when renamed', () => {
    const defaultType = register().linkType
    const renamedType = register({name: 'cta'}).linkType

    expect(fieldNames(renamedType)).toEqual(fieldNames(defaultType))
    expect(renamedType.fieldsets?.map((fieldset) => fieldset.name)).toEqual(
      defaultType.fieldsets?.map((fieldset) => fieldset.name),
    )
    expect(renamedType.title).toBe(defaultType.title)
    expect(renamedType.preview).toBeDefined()
    expect(renamedType.components?.input).toBeDefined()
  })

  it('applies the remaining options to a renamed type', () => {
    const {linkType} = register({
      name: 'cta',
      linkableSchemaTypes: ['article', 'page'],
      enabledBuiltInLinkTypes: ['external', 'email'],
      enableAnchorLinks: false,
      enableLinkParameters: false,
      customLinkTypes: [{title: 'Archive', value: 'archive', icon: ComposeIcon, options: []}],
    })

    expect(findField(linkType, 'internalLink')?.to).toEqual([{type: 'article'}, {type: 'page'}])
    expect(findField(linkType, 'type')?.initialValue).toBe('external')
    expect(fieldNames(linkType)).not.toContain('anchor')
    expect(fieldNames(linkType)).not.toContain('parameters')
  })

  it('keeps preview and validation working for a renamed type', () => {
    const {linkType} = register({name: 'cta'})

    expect(linkType.preview?.select?.internalTitle).toBe('internalLink->title')
    expect(
      linkType.preview?.prepare?.({type: 'external', url: 'https://example.com'}),
    ).toMatchObject({title: 'https://example.com', subtitle: 'Type: external'})
    expect(linkType.validation).toBeTypeOf('function')
  })

  it('supports registering several independently configured link types', () => {
    const defaultInstance = register()
    const ctaInstance = register({
      name: 'cta',
      linkableSchemaTypes: ['article'],
      enabledBuiltInLinkTypes: ['email'],
    })

    expect([defaultInstance.linkType.name, ctaInstance.linkType.name]).toEqual(['link', 'cta'])
    expect([defaultInstance.pluginName, ctaInstance.pluginName]).toEqual([
      'link-field',
      'link-field-cta',
    ])

    expect(findField(defaultInstance.linkType, 'internalLink')?.to).toEqual([{type: 'page'}])
    expect(findField(ctaInstance.linkType, 'internalLink')?.to).toEqual([{type: 'article'}])
    expect(findField(defaultInstance.linkType, 'type')?.initialValue).toBe('internal')
    expect(findField(ctaInstance.linkType, 'type')?.initialValue).toBe('email')
  })
})

describe('linkField optional fields', () => {
  it('includes the new tab toggle and the advanced fieldset by default', () => {
    const {linkType} = register()

    expect(fieldNames(linkType)).toEqual(expect.arrayContaining(['blank', 'parameters', 'anchor']))
    expect(linkType.fieldsets?.map((fieldset) => fieldset.name)).toEqual(['advanced'])
  })

  it('omits the new tab toggle when enableNewTab is false', () => {
    const {linkType} = register({enableNewTab: false})

    expect(fieldNames(linkType)).not.toContain('blank')
    expect(linkType.fieldsets?.map((fieldset) => fieldset.name)).toEqual(['advanced'])
  })

  it('drops the fieldset when both advanced fields are individually disabled', () => {
    const {linkType} = register({enableLinkParameters: false, enableAnchorLinks: false})

    expect(linkType.fieldsets).toEqual([])
  })

  it('keeps the fieldset when only one advanced field is disabled', () => {
    const {linkType} = register({enableLinkParameters: false})

    expect(fieldNames(linkType)).toContain('anchor')
    expect(linkType.fieldsets?.map((fieldset) => fieldset.name)).toEqual(['advanced'])
  })

  it('keeps the link type fields when every optional field is disabled', () => {
    const {linkType} = register({
      enableLinkParameters: false,
      enableAnchorLinks: false,
      enableNewTab: false,
    })

    expect(fieldNames(linkType)).toEqual(
      expect.arrayContaining(['text', 'type', 'internalLink', 'url', 'email', 'phone', 'value']),
    )
  })
})
