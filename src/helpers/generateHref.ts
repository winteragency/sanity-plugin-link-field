import {type UrlObject} from 'url'

import {InternalLink, LinkValue} from '../types'
import {isCustomLink, isEmailLink, isExternalLink, isPhoneLink} from './typeGuards'

export const generateHref = {
  internal: (link: LinkValue, hrefResolver?: (link: InternalLink) => string | UrlObject) => {
    const internalLink = link as InternalLink
    const resolvedHref =
      internalLink.internalLink && hrefResolver ? hrefResolver(internalLink) : undefined

    // Support UrlObjects, e.g. from Next.js
    if (typeof resolvedHref === 'object' && 'pathname' in resolvedHref) {
      resolvedHref.hash = internalLink.anchor?.replace(/^#/, '')

      if (internalLink.parameters) {
        const params = new URLSearchParams(internalLink.parameters)
        const resolvedParams = new URLSearchParams(resolvedHref.query?.toString())

        for (const [key, value] of params.entries()) {
          resolvedParams.set(key, value)
        }

        resolvedHref.query = resolvedParams.toString()
      }

      return resolvedHref
    }

    let href =
      resolvedHref ||
      (internalLink.internalLink?.slug?.current
        ? `/${internalLink.internalLink.slug.current.replace(/^\//, '')}`
        : undefined)

    if (href && typeof href === 'string') {
      href += (internalLink.parameters?.trim() || '') + (internalLink.anchor?.trim() || '')
    }

    return href || '#'
  },
  external: (link: LinkValue) =>
    isExternalLink(link) && link.url
      ? link.url.trim() + (link.parameters?.trim() || '') + (link.anchor?.trim() || '')
      : '#',
  email: (link: LinkValue) =>
    isEmailLink(link) && link.email ? `mailto:${link.email.trim()}` : '#',
  phone: (link: LinkValue) =>
    isPhoneLink(link) && link.phone
      ? // Tel links cannot contain spaces
        `tel:${link.phone?.replace(/\s+/g, '').trim()}`
      : '#',
  custom: (link: LinkValue) =>
    isCustomLink(link) && link.value
      ? link.value.trim() + (link.parameters?.trim() || '') + (link.anchor?.trim() || '')
      : '#',
}
