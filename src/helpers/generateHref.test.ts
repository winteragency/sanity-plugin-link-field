import {describe, expect, it} from 'vitest'

import type {LinkValue} from '../types'
import {generateHref} from './generateHref'

describe('generateHref', () => {
  describe('internal', () => {
    it('builds href from slug when no resolver is provided', () => {
      const link = {
        type: 'internal',
        internalLink: {slug: {current: 'about'}},
      } as LinkValue

      expect(generateHref.internal(link)).toBe('/about')
    })

    it('strips leading slash from slug', () => {
      const link = {
        type: 'internal',
        internalLink: {slug: {current: '/about'}},
      } as LinkValue

      expect(generateHref.internal(link)).toBe('/about')
    })

    it('appends parameters and anchor to string hrefs', () => {
      const link = {
        type: 'internal',
        internalLink: {slug: {current: 'about'}},
        parameters: '?utm_source=test',
        anchor: '#section',
      } as LinkValue

      expect(generateHref.internal(link)).toBe('/about?utm_source=test#section')
    })

    it('uses hrefResolver when internal link is set', () => {
      const link = {
        type: 'internal',
        internalLink: {_type: 'page', slug: {current: 'ignored'}},
      } as LinkValue

      expect(generateHref.internal(link, () => '/custom-path')).toBe('/custom-path')
    })

    it('merges parameters and anchor into UrlObject hrefs', () => {
      const link = {
        type: 'internal',
        internalLink: {_type: 'page'},
        parameters: '?foo=bar',
        anchor: '#intro',
      } as LinkValue

      const href = generateHref.internal(link, () => ({
        pathname: '/page',
        query: 'existing=1',
      }))

      expect(href).toEqual({
        pathname: '/page',
        query: 'existing=1&foo=bar',
        hash: 'intro',
      })
    })

    it('returns # when href cannot be resolved', () => {
      expect(generateHref.internal({type: 'internal'} as LinkValue)).toBe('#')
    })
  })

  describe('external', () => {
    it('builds external href with parameters and anchor', () => {
      const link = {
        type: 'external',
        url: 'https://example.com',
        parameters: '?ref=home',
        anchor: '#top',
      } as LinkValue

      expect(generateHref.external(link)).toBe('https://example.com?ref=home#top')
    })

    it('returns # when url is missing', () => {
      expect(generateHref.external({type: 'external'} as LinkValue)).toBe('#')
    })
  })

  describe('email', () => {
    it('builds mailto href', () => {
      expect(generateHref.email({type: 'email', email: 'hello@example.com'} as LinkValue)).toBe(
        'mailto:hello@example.com',
      )
    })

    it('returns # when email is missing', () => {
      expect(generateHref.email({type: 'email'} as LinkValue)).toBe('#')
    })
  })

  describe('phone', () => {
    it('builds tel href without spaces', () => {
      expect(generateHref.phone({type: 'phone', phone: '+47 12 34 56 78'} as LinkValue)).toBe(
        'tel:+4712345678',
      )
    })

    it('returns # when phone is missing', () => {
      expect(generateHref.phone({type: 'phone'} as LinkValue)).toBe('#')
    })
  })

  describe('custom', () => {
    it('builds custom href with parameters and anchor', () => {
      const link = {
        type: 'archive',
        value: '/blog',
        parameters: '?sort=date',
        anchor: '#latest',
      } as LinkValue

      expect(generateHref.custom(link)).toBe('/blog?sort=date#latest')
    })

    it('returns # when value is missing', () => {
      expect(generateHref.custom({type: 'archive'} as LinkValue)).toBe('#')
    })
  })
})
