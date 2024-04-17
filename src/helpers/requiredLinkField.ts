import type {CustomValidatorResult} from 'sanity'

import type {LinkValue} from '../types'
import {isCustomLink, isEmailLink, isExternalLink, isInternalLink, isPhoneLink} from './typeGuards'

/**
 * Helper to create a required link field.
 */
export const requiredLinkField = (field: unknown): CustomValidatorResult => {
  const link = field as LinkValue

  if (!link || !link.type) {
    return 'Link is required'
  }

  if (isInternalLink(link) && !link.internalLink) {
    return {
      message: 'Link is required',
      path: 'internalLink',
    }
  }

  if (isExternalLink(link) && !link.url) {
    return {
      message: 'URL is required',
      path: 'url',
    }
  }

  if (isEmailLink(link) && !link.email) {
    return {
      message: 'E-mail is required',
      path: 'email',
    }
  }

  if (isPhoneLink(link) && !link.phone) {
    return {
      message: 'Phone is required',
      path: 'phone',
    }
  }

  if (isCustomLink(link) && !link.value) {
    return {
      message: 'Value is required',
      path: 'value',
    }
  }

  return true
}
