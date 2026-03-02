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

  if (!link || !link.type) {
    return 'Link is required'
  }

  if (isInternalLink(link) && !link.internalLink) {
    return {message: 'Link is required', path: 'internalLink'}
  }

  if (isExternalLink(link) && !link.url) {
    return {message: 'URL is required', path: 'url'}
  }

  if (isEmailLink(link) && !link.email) {
    return {message: 'E-mail is required', path: 'email'}
  }

  if (isPhoneLink(link) && !link.phone) {
    return {message: 'Phone number is required', path: 'phone'}
  }

  if (isDocumentLink(link) && !link.documentLink?.asset) {
    return {message: 'Document is required', path: 'documentLink.asset'}
  }

  if (isMediaLink(link) && !link.mediaLink?.asset) {
    return {message: 'Media file is required', path: 'mediaLink'}
  }

  if (isSMSLink(link) && !link.sms) {
    return {message: 'Phone number is required', path: 'sms'}
  }

  if (isWhatsAppLink(link) && !link.whatsapp) {
    return {message: 'Phone number is required', path: 'whatsapp'}
  }

  if (isFaxLink(link) && !link.fax) {
    return {message: 'Fax number is required', path: 'fax'}
  }

  if (isCustomLink(link) && !link.value) {
    return {message: 'Value is required', path: 'value'}
  }

  return true
}
