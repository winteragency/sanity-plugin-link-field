import type {
  AudioLink,
  CustomLink,
  DocumentLink,
  EmailLink,
  ExternalLink,
  FaxLink,
  ImageLink,
  InternalLink,
  LinkValue,
  PhoneLink,
  SMSLink,
  VideoLink,
  WhatsAppLink,
} from '../types'

export const isInternalLink = (link: LinkValue): link is InternalLink => link.type === 'internal'

export const isExternalLink = (link: LinkValue): link is ExternalLink => link.type === 'external'

export const isEmailLink = (link: LinkValue): link is EmailLink => link.type === 'email'

export const isPhoneLink = (link: LinkValue): link is PhoneLink => link.type === 'phone'

export const isDocumentLink = (link: LinkValue): link is DocumentLink => link.type === 'document'

export const isImageLink = (link: LinkValue): link is ImageLink => link.type === 'image'

export const isVideoLink = (link: LinkValue): link is VideoLink => link.type === 'video'

export const isAudioLink = (link: LinkValue): link is AudioLink => link.type === 'audio'

export const isSMSLink = (link: LinkValue): link is SMSLink => link.type === 'sms'

export const isWhatsAppLink = (link: LinkValue): link is WhatsAppLink => link.type === 'whatsapp'

export const isFaxLink = (link: LinkValue): link is FaxLink => link.type === 'fax'

export const isCustomLink = (link: LinkValue): link is CustomLink =>
  ![
    'internal',
    'external',
    'email',
    'phone',
    'document',
    'image',
    'video',
    'audio',
    'sms',
    'whatsapp',
    'fax',
  ].includes(link.type)
