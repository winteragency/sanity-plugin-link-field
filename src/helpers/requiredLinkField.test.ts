import {describe, expect, it} from 'vitest'

import type {LinkValue} from '../types'
import {requiredLinkField} from './requiredLinkField'

const requireTextContext = {type: {options: {enableText: true, requireText: true}}}

describe('requiredLinkField', () => {
  it('requires a link type', () => {
    expect(requiredLinkField(undefined)).toEqual([{message: 'Link is required'}])
    expect(requiredLinkField({} as LinkValue)).toEqual([{message: 'Link is required'}])
  })

  it('requires internalLink for internal links', () => {
    expect(requiredLinkField({type: 'internal'} as LinkValue)).toEqual([
      {message: 'Link is required', path: ['internalLink']},
    ])
  })

  it('requires url for external links', () => {
    expect(requiredLinkField({type: 'external'} as LinkValue)).toEqual([
      {message: 'URL is required', path: ['url']},
    ])
  })

  it('requires email for email links', () => {
    expect(requiredLinkField({type: 'email'} as LinkValue)).toEqual([
      {message: 'E-mail is required', path: ['email']},
    ])
  })

  it('requires phone for phone links', () => {
    expect(requiredLinkField({type: 'phone'} as LinkValue)).toEqual([
      {message: 'Phone number is required', path: ['phone']},
    ])
  })

  it('requires assetLink for asset links', () => {
    expect(requiredLinkField({type: 'asset'} as LinkValue)).toEqual([
      {message: 'Asset is required', path: ['assetLink']},
    ])
  })

  it('requires value for custom links', () => {
    expect(requiredLinkField({type: 'archive'} as LinkValue)).toEqual([
      {message: 'Value is required', path: ['value']},
    ])
  })

  it('passes when the active field is populated', () => {
    expect(requiredLinkField({type: 'external', url: 'https://example.com'} as LinkValue)).toBe(
      true,
    )

    expect(
      requiredLinkField({
        type: 'internal',
        internalLink: {_type: 'page', _ref: 'page-id'},
      } as LinkValue),
    ).toBe(true)
  })

  it('enforces requireText only when the field options require it', () => {
    // No context → requireText is not enforced.
    expect(requiredLinkField({type: 'external', url: 'https://example.com'} as LinkValue)).toBe(
      true,
    )

    // Context requires text but the label is missing → flagged.
    expect(
      requiredLinkField(
        {type: 'external', url: 'https://example.com'} as LinkValue,
        requireTextContext,
      ),
    ).toEqual([{message: 'Link label is required', path: ['text']}])

    // Label present → valid.
    expect(
      requiredLinkField(
        {type: 'external', url: 'https://example.com', text: 'Example'} as LinkValue,
        requireTextContext,
      ),
    ).toBe(true)
  })

  it('flags the link value and the text label at the same time', () => {
    expect(requiredLinkField({type: 'internal'} as LinkValue, requireTextContext)).toEqual([
      {message: 'Link is required', path: ['internalLink']},
      {message: 'Link label is required', path: ['text']},
    ])
  })

  it('does not require text when enableText is false', () => {
    expect(
      requiredLinkField({type: 'external', url: 'https://example.com'} as LinkValue, {
        type: {options: {enableText: false, requireText: true}},
      }),
    ).toBe(true)
  })

  it('does not require text when requireText is false', () => {
    expect(
      requiredLinkField({type: 'external', url: 'https://example.com'} as LinkValue, {
        type: {options: {enableText: true, requireText: false}},
      }),
    ).toBe(true)
  })

  it('treats a whitespace-only label as missing', () => {
    expect(
      requiredLinkField(
        {type: 'external', url: 'https://example.com', text: '   '} as LinkValue,
        requireTextContext,
      ),
    ).toEqual([{message: 'Link label is required', path: ['text']}])
  })

  it('ignores a context without type options', () => {
    expect(requiredLinkField({type: 'external', url: 'https://example.com'} as LinkValue, {})).toBe(
      true,
    )
  })
})
