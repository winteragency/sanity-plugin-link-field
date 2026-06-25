import type {FieldMember, ObjectMember} from 'sanity'

import type {LinkValue} from '../types'

const OTHER_FIELD_NAMES = new Set(['blank', 'parameters', 'anchor'])

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

function isFieldMember(member: ObjectMember): member is FieldMember {
  return member.kind === 'field'
}

export function resolveLinkInputMembers(
  members: ObjectMember[] | undefined,
  value: LinkValue | undefined,
): {
  textField?: FieldMember
  typeField?: FieldMember
  linkField?: FieldMember
  otherFields: FieldMember[]
  isReady: boolean
} {
  const fieldMembers = (members ?? []).filter(isFieldMember)

  const textField = fieldMembers.find((member) => member.name === 'text')
  const typeField = fieldMembers.find((member) => member.name === 'type')
  const linkField = fieldMembers.find(
    (member) => member.name === getActiveLinkFieldName(value?.type ?? 'internal'),
  )

  const otherFields = fieldMembers.filter((member) => OTHER_FIELD_NAMES.has(member.name))

  return {
    textField,
    typeField,
    linkField,
    otherFields,
    isReady: Boolean(typeField && linkField),
  }
}
