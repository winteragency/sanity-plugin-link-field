import {InternalLink, LinkValue} from '../types'
import {isCustomLink, isEmailLink, isExternalLink, isInternalLink, isPhoneLink} from './typeGuards'

export const generateHref = {
  internal: (link: LinkValue, hrefResolver?: (link: InternalLink) => string) =>
    isInternalLink(link) && link.internalLink
      ? (hrefResolver
          ? hrefResolver(link)
          : `/${link.internalLink.slug?.current?.replace(/^\//, '')}`) +
        (link.parameters?.trim() || '') +
        (link.anchor?.trim() || '')
      : '#',
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
