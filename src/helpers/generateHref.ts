import {type UrlObject} from 'url'

import {DocumentLink, InternalLink, LinkValue} from '../types'
import {
  isAudioLink,
  isCustomLink,
  isDocumentLink,
  isEmailLink,
  isExternalLink,
  isFaxLink,
  isImageLink,
  isPhoneLink,
  isSMSLink,
  isVideoLink,
  isWhatsAppLink,
} from './typeGuards'

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
  document: (link: LinkValue, hrefResolver?: (link: DocumentLink) => string | UrlObject) => {
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

    let href = resolvedHref || undefined

    if (href && typeof href === 'string') {
      href += (documentLink.parameters?.trim() || '') + (documentLink.anchor?.trim() || '')
    }

    return href || '#'
  },
  image: (link: LinkValue) =>
    isImageLink(link) && link.imageLink?.asset?._ref ? link.imageLink.asset._ref : '#',
  video: (link: LinkValue) =>
    isVideoLink(link) && link.videoLink?.asset?._ref ? link.videoLink.asset._ref : '#',
  audio: (link: LinkValue) =>
    isAudioLink(link) && link.audioLink?.asset?._ref ? link.audioLink.asset._ref : '#',
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
    isCustomLink(link) && link.value
      ? link.value.trim() + (link.parameters?.trim() || '') + (link.anchor?.trim() || '')
      : '#',
}
