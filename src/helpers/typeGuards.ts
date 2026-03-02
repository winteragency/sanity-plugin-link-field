import type {
  BuiltInLinkType,
  CustomLink,
  DocumentLink,
  EmailLink,
  ExternalLink,
  FaxLink,
  InternalLink,
  LinkValue,
  MediaLink,
  PhoneLink,
  SMSLink,
  WhatsAppLink,
} from '../types'

export const BUILT_IN_LINK_TYPES: BuiltInLinkType[] = [
  'internal',
  'external',
  'email',
  'phone',
  'document',
  'media',
  'sms',
  'whatsapp',
  'fax',
]

export const isInternalLink = (link: LinkValue): link is InternalLink => link.type === 'internal'

export const isExternalLink = (link: LinkValue): link is ExternalLink => link.type === 'external'

export const isEmailLink = (link: LinkValue): link is EmailLink => link.type === 'email'

export const isPhoneLink = (link: LinkValue): link is PhoneLink => link.type === 'phone'

export const isDocumentLink = (link: LinkValue): link is DocumentLink => link.type === 'document'

export const isMediaLink = (link: LinkValue): link is MediaLink => link.type === 'media'

export const isSMSLink = (link: LinkValue): link is SMSLink => link.type === 'sms'

export const isWhatsAppLink = (link: LinkValue): link is WhatsAppLink => link.type === 'whatsapp'

export const isFaxLink = (link: LinkValue): link is FaxLink => link.type === 'fax'

export const isCustomLink = (link: LinkValue): link is CustomLink =>
  !BUILT_IN_LINK_TYPES.includes(link.type as BuiltInLinkType)
