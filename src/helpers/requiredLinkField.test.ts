import {describe, expect, it} from 'vitest'

import type {LinkValue} from '../types'
import {requiredLinkField} from './requiredLinkField'

describe('requiredLinkField', () => {
  it('requires a link type', () => {
    expect(requiredLinkField(undefined)).toBe('Link is required')
    expect(requiredLinkField({} as LinkValue)).toBe('Link is required')
  })

  it('requires internalLink for internal links', () => {
    expect(requiredLinkField({type: 'internal'} as LinkValue)).toEqual({
      message: 'Link is required',
      path: ['internalLink'],
    })
  })

  it('requires url for external links', () => {
    expect(requiredLinkField({type: 'external'} as LinkValue)).toEqual({
      message: 'URL is required',
      path: ['url'],
    })
  })

  it('requires email for email links', () => {
    expect(requiredLinkField({type: 'email'} as LinkValue)).toEqual({
      message: 'E-mail is required',
      path: ['email'],
    })
  })

  it('requires phone for phone links', () => {
    expect(requiredLinkField({type: 'phone'} as LinkValue)).toEqual({
      message: 'Phone number is required',
      path: ['phone'],
    })
  })

  it('requires assetLink for asset links', () => {
    expect(requiredLinkField({type: 'asset'} as LinkValue)).toEqual({
      message: 'Asset is required',
      path: ['assetLink'],
    })
  })

  it('requires value for custom links', () => {
    expect(requiredLinkField({type: 'archive'} as LinkValue)).toEqual({
      message: 'Value is required',
      path: ['value'],
    })
  })

  it('passes when the active field is populated', () => {
    expect(
      requiredLinkField({
        type: 'external',
        url: 'https://example.com',
      } as LinkValue),
    ).toBe(true)

    expect(
      requiredLinkField({
        type: 'internal',
        internalLink: {_type: 'page', _ref: 'page-id'},
      } as LinkValue),
    ).toBe(true)
  })
})
