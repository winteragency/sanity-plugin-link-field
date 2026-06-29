import type {FieldMember, ObjectMember} from 'sanity'

import type {LinkValue} from '../types'

const LINK_VALUE_FIELD_NAMES = new Set([
  'internalLink',
  'url',
  'email',
  'phone',
  'documentLink',
  'mediaLink',
  'sms',
  'whatsapp',
  'fax',
  'value',
])

function getActiveLinkFieldName(type: LinkValue['type'] | undefined): string {
  switch (type) {
    case 'internal':
      return 'internalLink'
    case 'external':
      return 'url'
    case 'email':
      return 'email'
    case 'phone':
      return 'phone'
    case 'document':
      return 'documentLink'
    case 'media':
      return 'mediaLink'
    case 'sms':
      return 'sms'
    case 'whatsapp':
      return 'whatsapp'
    case 'fax':
      return 'fax'
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
    if (member.kind === 'field' && LINK_VALUE_FIELD_NAMES.has(member.name)) {
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
