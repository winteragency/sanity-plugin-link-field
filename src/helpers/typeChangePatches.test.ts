import {describe, expect, it, vi} from 'vitest'

import {
  applyLinkTypeChange,
  createLinkTypeChangePatches,
  getInactiveLinkFieldNames,
} from './typeChangePatches'

describe('getInactiveLinkFieldNames', () => {
  it('returns all link value fields except the active one for built-in types', () => {
    expect(getInactiveLinkFieldNames('internal')).toEqual([
      'url',
      'email',
      'phone',
      'assetLink',
      'sms',
      'whatsapp',
      'fax',
      'value',
    ])
    expect(getInactiveLinkFieldNames('external')).toEqual([
      'internalLink',
      'email',
      'phone',
      'assetLink',
      'sms',
      'whatsapp',
      'fax',
      'value',
    ])
    expect(getInactiveLinkFieldNames('asset')).toEqual([
      'internalLink',
      'url',
      'email',
      'phone',
      'sms',
      'whatsapp',
      'fax',
      'value',
    ])
  })

  it('keeps value and clears built-in link fields for custom types', () => {
    expect(getInactiveLinkFieldNames('archive')).toEqual([
      'internalLink',
      'url',
      'email',
      'phone',
      'assetLink',
      'sms',
      'whatsapp',
      'fax',
    ])
  })
})

describe('createLinkTypeChangePatches', () => {
  it('sets type on the link object and unsets sibling value fields', () => {
    const patches = createLinkTypeChangePatches('external')

    expect(patches).toMatchObject([
      {type: 'set', path: ['type'], value: 'external'},
      {type: 'unset', path: ['internalLink']},
      {type: 'unset', path: ['email']},
      {type: 'unset', path: ['phone']},
      {type: 'unset', path: ['assetLink']},
      {type: 'unset', path: ['sms']},
      {type: 'unset', path: ['whatsapp']},
      {type: 'unset', path: ['fax']},
      {type: 'unset', path: ['value']},
    ])
  })

  it('does not nest unset paths under the type field', () => {
    const patches = createLinkTypeChangePatches('internal')

    for (const patch of patches) {
      if (patch.type === 'unset') {
        expect(patch.path[0]).not.toBe('type')
        expect(patch.path).toHaveLength(1)
      }
    }
  })

  it('keeps the active field for the next type', () => {
    const externalPatches = createLinkTypeChangePatches('external')
    expect(externalPatches.some((patch) => patch.type === 'unset' && patch.path[0] === 'url')).toBe(
      false,
    )

    const customPatches = createLinkTypeChangePatches('archive')
    expect(customPatches.some((patch) => patch.type === 'unset' && patch.path[0] === 'value')).toBe(
      false,
    )
    expect(customPatches).toMatchObject([
      {type: 'set', path: ['type'], value: 'archive'},
      {type: 'unset', path: ['internalLink']},
      {type: 'unset', path: ['url']},
      {type: 'unset', path: ['email']},
      {type: 'unset', path: ['phone']},
      {type: 'unset', path: ['assetLink']},
      {type: 'unset', path: ['sms']},
      {type: 'unset', path: ['whatsapp']},
      {type: 'unset', path: ['fax']},
    ])
  })
})

describe('applyLinkTypeChange', () => {
  it('is a no-op when the selected type is unchanged', () => {
    const changeLinkType = vi.fn()
    const fieldOnChange = vi.fn()

    applyLinkTypeChange({
      nextType: 'internal',
      currentType: 'internal',
      changeLinkType,
      fieldOnChange,
    })

    expect(changeLinkType).not.toHaveBeenCalled()
    expect(fieldOnChange).not.toHaveBeenCalled()
  })

  it('uses the object-scoped handler when available', () => {
    const changeLinkType = vi.fn()
    const fieldOnChange = vi.fn()

    applyLinkTypeChange({
      nextType: 'external',
      currentType: 'internal',
      changeLinkType,
      fieldOnChange,
    })

    expect(changeLinkType).toHaveBeenCalledWith('external')
    expect(fieldOnChange).not.toHaveBeenCalled()
  })

  it('falls back to field-scoped set when no object handler exists', () => {
    const fieldOnChange = vi.fn()

    applyLinkTypeChange({
      nextType: 'email',
      currentType: 'internal',
      changeLinkType: null,
      fieldOnChange,
    })

    expect(fieldOnChange).toHaveBeenCalledTimes(1)
    expect(fieldOnChange.mock.calls[0]?.[0]).toMatchObject({
      type: 'set',
      path: [],
      value: 'email',
    })
  })
})
