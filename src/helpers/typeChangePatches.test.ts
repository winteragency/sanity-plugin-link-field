import {describe, expect, it} from 'vitest'

import {getInactiveLinkFieldNames} from './typeChangePatches'

describe('getInactiveLinkFieldNames', () => {
  it('returns all link value fields except the active one for built-in types', () => {
    expect(getInactiveLinkFieldNames('internal')).toEqual(['url', 'email', 'phone', 'value'])
    expect(getInactiveLinkFieldNames('external')).toEqual([
      'internalLink',
      'email',
      'phone',
      'value',
    ])
    expect(getInactiveLinkFieldNames('email')).toEqual(['internalLink', 'url', 'phone', 'value'])
    expect(getInactiveLinkFieldNames('phone')).toEqual(['internalLink', 'url', 'email', 'value'])
  })

  it('keeps value and clears built-in link fields for custom types', () => {
    expect(getInactiveLinkFieldNames('archive')).toEqual(['internalLink', 'url', 'email', 'phone'])
  })
})
