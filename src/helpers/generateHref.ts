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

/**
 * Merges anchor and query parameters from a link into a UrlObject without mutating the input.
 */
const mergeUrlObject = (
  resolvedHref: UrlObject,
  link: {parameters?: string; anchor?: string},
): UrlObject => {
  const merged: UrlObject = {...resolvedHref}
  merged.hash = link.anchor?.replace(/^#/, '')

  if (link.parameters) {
    const params = new URLSearchParams(link.parameters)
    const existingQuery =
      typeof merged.query === 'string'
        ? merged.query
        : new URLSearchParams(merged.query as Record<string, string>).toString()
    const resolvedParams = new URLSearchParams(existingQuery)

    for (const [key, value] of params.entries()) {
      resolvedParams.set(key, value)
    }

    merged.query = resolvedParams.toString()
  }

  return merged
}

export const generateHref = {
  internal: (link: LinkValue, hrefResolver?: HrefResolver) => {
    const internalLink = link as InternalLink
    const resolvedHref =
      internalLink.internalLink && hrefResolver ? hrefResolver(internalLink) : undefined

    if (typeof resolvedHref === 'object' && 'pathname' in resolvedHref) {
      return mergeUrlObject(resolvedHref, internalLink)
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
    isPhoneLink(link) && link.phone ? `tel:${link.phone.replace(/\s+/g, '')}` : '#',
  document: (link: LinkValue, hrefResolver?: HrefResolver) => {
    const documentLink = link as DocumentLink
    const resolvedHref =
      documentLink.documentLink && hrefResolver ? hrefResolver(documentLink) : undefined

    if (typeof resolvedHref === 'object' && 'pathname' in resolvedHref) {
      return mergeUrlObject(resolvedHref, documentLink)
    }

    return resolvedHref && typeof resolvedHref === 'string'
      ? appendParamsAndAnchor(resolvedHref, documentLink)
      : '#'
  },
  media: (link: LinkValue, hrefResolver?: HrefResolver) => {
    const mediaLink = link as MediaLink
    const resolvedHref = mediaLink.mediaLink && hrefResolver ? hrefResolver(mediaLink) : undefined

    if (typeof resolvedHref === 'object' && 'pathname' in resolvedHref) {
      return mergeUrlObject(resolvedHref, mediaLink)
    }

    return resolvedHref && typeof resolvedHref === 'string'
      ? appendParamsAndAnchor(resolvedHref, mediaLink)
      : '#'
  },
  sms: (link: LinkValue) =>
    isSMSLink(link) && link.sms ? `sms:${link.sms.replace(/\s+/g, '')}` : '#',
  whatsapp: (link: LinkValue) =>
    isWhatsAppLink(link) && link.whatsapp
      ? `https://wa.me/${link.whatsapp.replace(/[^\d]/g, '')}`
      : '#',
  fax: (link: LinkValue) =>
    isFaxLink(link) && link.fax ? `fax:${link.fax.replace(/\s+/g, '')}` : '#',
  custom: (link: LinkValue) =>
    isCustomLink(link) && link.value ? appendParamsAndAnchor(link.value.trim(), link) : '#',
}
