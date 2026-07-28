import type {
  AssetLink,
  BuiltInLinkType,
  CustomLink,
  EmailLink,
  ExternalLink,
  FaxLink,
  InternalLink,
  LinkValue,
  PhoneLink,
  SMSLink,
  WhatsAppLink,
} from '../types'

type CommunicationLink = EmailLink | PhoneLink | SMSLink | WhatsAppLink | FaxLink

export const BUILT_IN_LINK_TYPES: BuiltInLinkType[] = [
  'internal',
  'external',
  'email',
  'phone',
  'asset',
  'sms',
  'whatsapp',
  'fax',
]

export const isInternalLink = (link: LinkValue): link is InternalLink => link.type === 'internal'

export const isExternalLink = (link: LinkValue): link is ExternalLink => link.type === 'external'

export const isEmailLink = (link: LinkValue): link is EmailLink => link.type === 'email'

export const isPhoneLink = (link: LinkValue): link is PhoneLink => link.type === 'phone'

export const isAssetLink = (link: LinkValue): link is AssetLink => link.type === 'asset'

export const isSMSLink = (link: LinkValue): link is SMSLink => link.type === 'sms'

export const isWhatsAppLink = (link: LinkValue): link is WhatsAppLink => link.type === 'whatsapp'

export const isFaxLink = (link: LinkValue): link is FaxLink => link.type === 'fax'

export const isCustomLink = (link: LinkValue): link is CustomLink =>
  !BUILT_IN_LINK_TYPES.includes(link.type as BuiltInLinkType)

export const isCommunicationLink = (link: LinkValue): link is CommunicationLink =>
  link.type === 'email' ||
  link.type === 'phone' ||
  link.type === 'sms' ||
  link.type === 'whatsapp' ||
  link.type === 'fax'

export const isCommunicationType = (type?: string): boolean =>
  type === 'email' || type === 'phone' || type === 'sms' || type === 'whatsapp' || type === 'fax'
