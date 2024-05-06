import type {
  CustomLink,
  EmailLink,
  ExternalLink,
  InternalLink,
  LinkValue,
  PhoneLink,
} from '../types'

export const isInternalLink = (link: LinkValue): link is InternalLink => link.type === 'internal'

export const isExternalLink = (link: LinkValue): link is ExternalLink => link.type === 'external'

export const isEmailLink = (link: LinkValue): link is EmailLink => link.type === 'email'

export const isPhoneLink = (link: LinkValue): link is PhoneLink => link.type === 'phone'

export const isCustomLink = (link: LinkValue): link is CustomLink =>
  !!link.type && !['internal', 'external', 'email', 'phone'].includes(link.type)
