import {type FormPatch, type PatchEvent, set, unset} from 'sanity'

import type {LinkValue} from '../types'

import {
  getActiveLinkFieldName,
  LINK_VALUE_FIELD_NAMES,
  type LinkValueFieldName,
} from './linkInputMembers'

export type {LinkValueFieldName}

/**
 * Returns link value field names that should be cleared when switching to `nextType`.
 */
export function getInactiveLinkFieldNames(
  nextType: LinkValue['type'] | string,
): LinkValueFieldName[] {
  const activeField = getActiveLinkFieldName(nextType as LinkValue['type']) as LinkValueFieldName

  return LINK_VALUE_FIELD_NAMES.filter((name) => name !== activeField)
}

/**
 * Builds patches relative to the link object for a type change.
 *
 * These must be applied via the link object's `onChange` (not the nested `type`
 * string input). Field-scoped `onChange` prefixes every patch with `type`, which
 * would turn sibling clears like `unset(['url'])` into `unset(['type', 'url'])`.
 */
export function createLinkTypeChangePatches(nextType: string): FormPatch[] {
  return [
    set(nextType, ['type']),
    ...getInactiveLinkFieldNames(nextType).map((field) => unset([field])),
  ]
}

/**
 * Applies a link type selection from the type input.
 *
 * Prefers an object-scoped handler (from LinkInput) so inactive sibling fields
 * are cleared correctly. Falls back to a field-scoped set when that handler is
 * unavailable (e.g. default object input fallback).
 */
export function applyLinkTypeChange(options: {
  nextType: string
  currentType: string | undefined
  changeLinkType: ((nextType: string) => void) | null
  fieldOnChange: (patch: FormPatch | FormPatch[] | PatchEvent) => void
}): void {
  const {nextType, currentType, changeLinkType, fieldOnChange} = options

  if (nextType === currentType) {
    return
  }

  if (changeLinkType) {
    changeLinkType(nextType)
    return
  }

  fieldOnChange(set(nextType))
}
