import {type UrlObject} from 'url'

import {DocumentLink, InternalLink, LinkValue, MediaLink} from '../types'
import {
  isCustomLink,
  isEmailLink,
  isExternalLink,
  isFaxLink,
  isPhoneLink,
  isSMSLink,
  isWhatsAppLink,
} from './typeGuards'

type HrefResolvableLink = InternalLink | DocumentLink | MediaLink
type HrefResolver = (link: HrefResolvableLink) => string | UrlObject

const appendParamsAndAnchor = (
  href: string,
  link: {
    parameters?: string
    anchor?: string
  },
) => href + (link.parameters?.trim() || '') + (link.anchor?.trim() || '')

export const generateHref = {
  internal: (link: LinkValue, hrefResolver?: HrefResolver) => {
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

    const href =
      resolvedHref ||
      (internalLink.internalLink?.slug?.current
        ? `/${internalLink.internalLink.slug.current.replace(/^\//, '')}`
        : undefined)

    return href && typeof href === 'string' ? appendParamsAndAnchor(href, internalLink) : '#'
  },
  external: (link: LinkValue) =>
    isExternalLink(link) && link.url ? appendParamsAndAnchor(link.url.trim(), link) : '#',
  email: (link: LinkValue) =>
    isEmailLink(link) && link.email ? `mailto:${link.email.trim()}` : '#',
  phone: (link: LinkValue) =>
    isPhoneLink(link) && link.phone
      ? // Tel links cannot contain spaces
        `tel:${link.phone?.replace(/\s+/g, '').trim()}`
      : '#',
  document: (link: LinkValue, hrefResolver?: HrefResolver) => {
    const documentLink = link as DocumentLink
    const resolvedHref =
      documentLink.documentLink && hrefResolver ? hrefResolver(documentLink) : undefined

    // Support UrlObjects, e.g. from Next.js
    if (typeof resolvedHref === 'object' && 'pathname' in resolvedHref) {
      resolvedHref.hash = documentLink.anchor?.replace(/^#/, '')

      if (documentLink.parameters) {
        const params = new URLSearchParams(documentLink.parameters)
        const resolvedParams = new URLSearchParams(resolvedHref.query?.toString())

        for (const [key, value] of params.entries()) {
          resolvedParams.set(key, value)
        }

        resolvedHref.query = resolvedParams.toString()
      }

      return resolvedHref
    }

    const href = resolvedHref || documentLink.documentLink?.asset?._ref
    return href && typeof href === 'string' ? appendParamsAndAnchor(href, documentLink) : '#'
  },
  media: (link: LinkValue, hrefResolver?: HrefResolver) => {
    const mediaLink = link as MediaLink
    const resolvedHref = mediaLink.mediaLink && hrefResolver ? hrefResolver(mediaLink) : undefined

    // Support UrlObjects, e.g. from Next.js
    if (typeof resolvedHref === 'object' && 'pathname' in resolvedHref) {
      resolvedHref.hash = mediaLink.anchor?.replace(/^#/, '')

      if (mediaLink.parameters) {
        const params = new URLSearchParams(mediaLink.parameters)
        const resolvedParams = new URLSearchParams(resolvedHref.query?.toString())

        for (const [key, value] of params.entries()) {
          resolvedParams.set(key, value)
        }

        resolvedHref.query = resolvedParams.toString()
      }

      return resolvedHref
    }

    const href = resolvedHref || mediaLink.mediaLink?.asset?._ref
    return href && typeof href === 'string' ? appendParamsAndAnchor(href, mediaLink) : '#'
  },
  sms: (link: LinkValue) =>
    isSMSLink(link) && link.sms
      ? // SMS links cannot contain spaces
        `sms:${link.sms?.replace(/\s+/g, '').trim()}`
      : '#',
  whatsapp: (link: LinkValue) =>
    isWhatsAppLink(link) && link.whatsapp
      ? // WhatsApp links use wa.me and need the + removed
        `https://wa.me/${link.whatsapp?.replace(/\s+/g, '').replace(/^\+/, '').trim()}`
      : '#',
  fax: (link: LinkValue) =>
    isFaxLink(link) && link.fax
      ? // Fax links cannot contain spaces
        `fax:${link.fax?.replace(/\s+/g, '').trim()}`
      : '#',
  custom: (link: LinkValue) =>
    isCustomLink(link) && link.value ? appendParamsAndAnchor(link.value.trim(), link) : '#',
}
