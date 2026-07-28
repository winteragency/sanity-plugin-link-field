import type {FieldMember, ObjectMember} from 'sanity'

import type {LinkValue} from '../types'

export const LINK_VALUE_FIELD_NAMES = ['internalLink', 'url', 'email', 'phone', 'value'] as const

export type LinkValueFieldName = (typeof LINK_VALUE_FIELD_NAMES)[number]

const LINK_VALUE_FIELD_NAME_SET: ReadonlySet<string> = new Set(LINK_VALUE_FIELD_NAMES)

export function getActiveLinkFieldName(type: LinkValue['type'] | undefined): string {
  switch (type) {
    case 'internal':
      return 'internalLink'
    case 'external':
      return 'url'
    case 'email':
      return 'email'
    case 'phone':
      return 'phone'
    default:
      return 'value'
  }
}

export function resolveLinkInputMembers(
  members: ObjectMember[] | undefined,
  value: LinkValue | undefined,
): {
  textField?: FieldMember
  typeField?: FieldMember
  linkField?: FieldMember
  otherFields: ObjectMember[]
} {
  const textField = members?.find(
    (member): member is FieldMember => member.kind === 'field' && member.name === 'text',
  )
  const typeField = members?.find(
    (member): member is FieldMember => member.kind === 'field' && member.name === 'type',
  )
  const linkField = members?.find(
    (member): member is FieldMember =>
      member.kind === 'field' && member.name === getActiveLinkFieldName(value?.type ?? 'internal'),
  )

  const otherFields = (members ?? []).filter((member) => {
    if (member === textField || member === typeField || member === linkField) {
      return false
    }

    // Inactive link-type fields stay in `members` but are rendered via `linkField`.
    if (member.kind === 'field' && LINK_VALUE_FIELD_NAME_SET.has(member.name)) {
      return false
    }

    return true
  })

  return {
    textField,
    typeField,
    linkField,
    otherFields,
  }
}
