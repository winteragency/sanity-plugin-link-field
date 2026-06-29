import {describe, expect, it} from 'vitest'

import type {LinkValue} from '../types'

import {validateLinkTypeConsistency} from './validateLinkConsistency'

describe('validateLinkTypeConsistency', () => {
  it('passes for consistent internal and external links', () => {
    expect(
      validateLinkTypeConsistency({
        type: 'internal',
        internalLink: {_ref: 'page-1', _type: 'reference'},
      } as LinkValue),
    ).toBe(true)

    expect(
      validateLinkTypeConsistency({
        type: 'external',
        url: 'https://example.com',
      } as LinkValue),
    ).toBe(true)
  })

  it('flags external type with internal reference but no URL', () => {
    expect(
      validateLinkTypeConsistency({
        type: 'external',
        internalLink: {_ref: 'page-1', _type: 'reference'},
      } as LinkValue),
    ).toBe(
      'Link type is URL but an internal document reference is set. Select Internal or clear the reference.',
    )
  })

  it('flags internal type with URL but no internal reference', () => {
    expect(
      validateLinkTypeConsistency({
        type: 'internal',
        url: 'https://example.com',
      } as LinkValue),
    ).toBe('Link type is Internal but a URL is set. Select URL or clear the URL.')
  })

  it('ignores missing or empty values', () => {
    expect(validateLinkTypeConsistency(undefined)).toBe(true)
    expect(validateLinkTypeConsistency({type: 'internal'})).toBe(true)
    expect(validateLinkTypeConsistency({type: 'external'})).toBe(true)
  })
})
