import type {LinkValue} from '../types'

import {getActiveLinkFieldName} from './linkInputMembers'

export const LINK_VALUE_FIELD_NAMES = ['internalLink', 'url', 'email', 'phone', 'value'] as const

export type LinkValueFieldName = (typeof LINK_VALUE_FIELD_NAMES)[number]

/**
 * Returns link value field names that should be cleared when switching to `nextType`.
 */
export function getInactiveLinkFieldNames(
  nextType: LinkValue['type'] | string,
): LinkValueFieldName[] {
  const activeField = getActiveLinkFieldName(nextType as LinkValue['type']) as LinkValueFieldName

  return LINK_VALUE_FIELD_NAMES.filter((name) => name !== activeField)
}
