import type {CustomValidatorResult, ValidationError} from 'sanity'

import type {LinkFieldOptions, LinkValue} from '../types'
import {
  isAssetLink,
  isCustomLink,
  isEmailLink,
  isExternalLink,
  isFaxLink,
  isInternalLink,
  isPhoneLink,
  isSMSLink,
  isWhatsAppLink,
} from './typeGuards'

/**
 * Helper to create a required link field.
 *
 * Pass it directly to `rule.custom` so it also receives the validation context:
 * `validation: (rule) => rule.custom(requiredLinkField)`. With the context it
 * additionally enforces the `requireText` option, which the plugin's type-level
 * validation cannot guarantee once a field defines its own `validation`.
 *
 * Returns an array of errors so the link value and the text label can be
 * flagged at the same time, or `true` when the field is valid.
 */
export const requiredLinkField = (
  field: unknown,
  context?: {type?: {options?: unknown}},
): CustomValidatorResult => {
  const link = field as LinkValue | undefined
  const hasValue = (value?: string) => Boolean(value?.trim())
  const options = context?.type?.options as LinkFieldOptions | undefined

  const errors: ValidationError[] = []

  // Validate the link value itself. Only the active type's field is checked,
  // so at most one link-value error applies.
  if (!link || !link.type) {
    errors.push({message: 'Link is required'})
  } else if (isInternalLink(link) && !link.internalLink) {
    errors.push({message: 'Link is required', path: ['internalLink']})
  } else if (isExternalLink(link) && !hasValue(link.url)) {
    errors.push({message: 'URL is required', path: ['url']})
  } else if (isEmailLink(link) && !hasValue(link.email)) {
    errors.push({message: 'E-mail is required', path: ['email']})
  } else if (isPhoneLink(link) && !hasValue(link.phone)) {
    errors.push({message: 'Phone number is required', path: ['phone']})
  } else if (isAssetLink(link) && !link.assetLink?.asset) {
    errors.push({message: 'Asset is required', path: ['assetLink']})
  } else if (isSMSLink(link) && !hasValue(link.sms)) {
    errors.push({message: 'Phone number is required', path: ['sms']})
  } else if (isWhatsAppLink(link) && !hasValue(link.whatsapp)) {
    errors.push({message: 'Phone number is required', path: ['whatsapp']})
  } else if (isFaxLink(link) && !hasValue(link.fax)) {
    errors.push({message: 'Fax number is required', path: ['fax']})
  } else if (isCustomLink(link) && !hasValue(link.value)) {
    errors.push({message: 'Value is required', path: ['value']})
  }

  // Validate the text label independently so it can be flagged alongside a
  // link-value error. When a field defines its own `validation` (e.g. this
  // helper), it overrides the link type's validation, so the type-level
  // requireText check never runs; reading the field options here covers that.
  if (options?.enableText && options.requireText && !hasValue(link?.text)) {
    errors.push({message: 'Link label is required', path: ['text']})
  }

  return errors.length > 0 ? errors : true
}
