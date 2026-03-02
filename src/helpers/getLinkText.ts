import {LinkValue} from '../types'
import {
  isCustomLink,
  isDocumentLink,
  isEmailLink,
  isExternalLink,
  isFaxLink,
  isInternalLink,
  isMediaLink,
  isPhoneLink,
  isSMSLink,
  isWhatsAppLink,
} from './typeGuards'

/**
 * Get the text to display for the given link.
 * Returns undefined when no meaningful text can be derived.
 */
export const getLinkText = (link: LinkValue): string | undefined => {
  if (link.text) return link.text

  if (isInternalLink(link)) {
    return link.internalLink?.title || link.internalLink?.slug?.current || undefined
  }
  if (isExternalLink(link)) return link.url || undefined
  if (isPhoneLink(link)) return link.phone || undefined
  if (isEmailLink(link)) return link.email || undefined
  if (isSMSLink(link)) return link.sms || undefined
  if (isWhatsAppLink(link)) return link.whatsapp || undefined
  if (isFaxLink(link)) return link.fax || undefined
  if (isDocumentLink(link)) return link.documentLink?.asset?._ref || undefined
  if (isMediaLink(link)) return link.mediaLink?.asset?._ref || undefined
  if (isCustomLink(link)) return link.value || undefined

  return undefined
}
