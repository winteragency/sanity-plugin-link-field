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

const getCustomDisplayText = (value?: string): string | undefined => {
  if (!value) return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) {
    return trimmed.replace(/^\/+/, '') || trimmed
  }
  return trimmed
}

const getAssetOriginalFilename = (asset: unknown): string | undefined => {
  if (!asset || typeof asset !== 'object') return undefined
  const originalFilename = (asset as {originalFilename?: unknown}).originalFilename
  return typeof originalFilename === 'string' ? originalFilename : undefined
}

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
  if (isDocumentLink(link)) {
    return (
      getAssetOriginalFilename(link.documentLink?.asset) ||
      link.documentLink?.asset?._ref ||
      undefined
    )
  }
  if (isMediaLink(link)) {
    return (
      getAssetOriginalFilename(link.mediaLink?.asset) || link.mediaLink?.asset?._ref || undefined
    )
  }
  if (isCustomLink(link)) return getCustomDisplayText(link.value)

  return undefined
}
