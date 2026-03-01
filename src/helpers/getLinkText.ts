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
 */
export const getLinkText = (link: LinkValue): string =>
  link.text ||
  (isInternalLink(link)
    ? // Naively try to get the title or slug of the internal link
      link.internalLink?.title || link.internalLink?.slug?.current
    : isExternalLink(link)
      ? link.url
      : isPhoneLink(link)
        ? link.phone
        : isEmailLink(link)
          ? link.email
          : isSMSLink(link)
            ? link.sms
            : isWhatsAppLink(link)
              ? link.whatsapp
              : isFaxLink(link)
                ? link.fax
                : isDocumentLink(link)
                  ? link.documentLink?.asset?._ref
                  : isMediaLink(link)
                    ? link.mediaLink?.asset?._ref
                    : isCustomLink(link)
                      ? link.value
                      : undefined) ||
  '#'
