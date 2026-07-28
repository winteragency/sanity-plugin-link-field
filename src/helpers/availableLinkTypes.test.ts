import {describe, expect, it} from 'vitest'

import {getAvailableBuiltInLinkTypeValues, getAvailableLinkTypeValues} from './availableLinkTypes'

describe('availableLinkTypes', () => {
  it('returns default built-ins when all four core types are enabled', () => {
    expect(
      getAvailableBuiltInLinkTypeValues(['internal', 'external', 'email', 'phone'], ['page']),
    ).toEqual(['internal', 'external', 'email', 'phone'])
  })

  it('hides internal when linkableSchemaTypes is empty', () => {
    expect(
      getAvailableBuiltInLinkTypeValues(['internal', 'external', 'email', 'phone'], []),
    ).toEqual(['external', 'email', 'phone'])
  })

  it('filters optional built-in types when not enabled', () => {
    expect(getAvailableBuiltInLinkTypeValues(['internal', 'external'], ['page'])).toEqual([
      'internal',
      'external',
    ])
  })

  it('includes opt-in types when explicitly enabled', () => {
    expect(
      getAvailableBuiltInLinkTypeValues(['external', 'asset', 'sms', 'whatsapp', 'fax'], ['page']),
    ).toEqual(['external', 'asset', 'sms', 'whatsapp', 'fax'])
  })

  it('appends custom link type values', () => {
    expect(
      getAvailableLinkTypeValues(
        ['external', 'email'],
        ['page'],
        [{title: 'Archive', value: 'archive', icon: () => null, options: []}],
      ),
    ).toEqual(['external', 'email', 'archive'])
  })
})
