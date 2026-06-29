import type {CustomValidatorResult} from 'sanity'

import type {LinkValue} from '../types'
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
 * Helper to create a required link field.
 */
export const requiredLinkField = (field: unknown): CustomValidatorResult => {
  const link = field as LinkValue
  const hasValue = (value?: string) => Boolean(value?.trim())

  if (!link || !link.type) {
    return 'Link is required'
  }

  if (isInternalLink(link) && !link.internalLink) {
    return {message: 'Link is required', path: ['internalLink']}
  }

  if (isExternalLink(link) && !hasValue(link.url)) {
    return {message: 'URL is required', path: ['url']}
  }

  if (isEmailLink(link) && !hasValue(link.email)) {
    return {message: 'E-mail is required', path: ['email']}
  }

  if (isPhoneLink(link) && !hasValue(link.phone)) {
    return {message: 'Phone number is required', path: ['phone']}
  }

  if (isDocumentLink(link) && !link.documentLink?.asset) {
    return {message: 'Document is required', path: ['documentLink']}
  }

  if (isMediaLink(link) && !link.mediaLink?.asset) {
    return {message: 'Media file is required', path: ['mediaLink']}
  }

  if (isSMSLink(link) && !hasValue(link.sms)) {
    return {message: 'Phone number is required', path: ['sms']}
  }

  if (isWhatsAppLink(link) && !hasValue(link.whatsapp)) {
    return {message: 'Phone number is required', path: ['whatsapp']}
  }

  if (isFaxLink(link) && !hasValue(link.fax)) {
    return {message: 'Fax number is required', path: ['fax']}
  }

  if (isCustomLink(link) && !hasValue(link.value)) {
    return {message: 'Value is required', path: ['value']}
  }

  return true
}
