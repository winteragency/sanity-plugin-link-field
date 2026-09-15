import type {ObjectMember} from 'sanity'

import type {LinkFieldPluginOptions} from '../types'

export const ADVANCED_FIELDSET_NAME = 'advanced'

/** Fields that can be turned off per link field, mapped to the option that controls them. */
const OPTIONAL_FIELD_NAMES = {
  blank: 'enableNewTab',
  parameters: 'enableLinkParameters',
  anchor: 'enableAnchorLinks',
} as const

type OptionalFieldName = keyof typeof OPTIONAL_FIELD_NAMES

export type OptionalLinkFieldVisibility = Record<OptionalFieldName, boolean>

type VisibilityOptions = Pick<
  LinkFieldPluginOptions,
  'enableLinkParameters' | 'enableAnchorLinks' | 'enableNewTab'
>

/**
 * Resolves which optional fields a link field should show, letting field-level
 * options override the plugin-level defaults.
 */
export function resolveOptionalLinkFieldVisibility(
  pluginOptions: VisibilityOptions = {},
  fieldOptions: VisibilityOptions = {},
): OptionalLinkFieldVisibility {
  const resolve = (option: keyof VisibilityOptions): boolean =>
    fieldOptions[option] ?? pluginOptions[option] ?? true

  return {
    blank: resolve('enableNewTab'),
    parameters: resolve('enableLinkParameters'),
    anchor: resolve('enableAnchorLinks'),
  }
}

const isOptionalFieldName = (name: string): name is OptionalFieldName =>
  Object.prototype.hasOwnProperty.call(OPTIONAL_FIELD_NAMES, name)

/**
 * Removes the members of optional fields that are turned off for this field,
 * dropping the "Advanced" fieldset entirely once it has no members left.
 *
 * The fields themselves always exist on the schema type, which is shared by
 * every link field in the Studio, so they are filtered out of the form instead.
 */
export function filterOptionalLinkFieldMembers(
  members: ObjectMember[],
  visibility: OptionalLinkFieldVisibility,
): ObjectMember[] {
  const isVisible = (member: {kind: string; name?: string}): boolean =>
    !(member.kind === 'field' && member.name && isOptionalFieldName(member.name)) ||
    visibility[member.name as OptionalFieldName]

  const kept: ObjectMember[] = []

  for (const member of members) {
    if (member.kind === 'fieldSet') {
      const fieldSetMembers = member.fieldSet.members.filter(isVisible)
      if (fieldSetMembers.length > 0) {
        kept.push({...member, fieldSet: {...member.fieldSet, members: fieldSetMembers}})
      }
    } else if (isVisible(member)) {
      kept.push(member)
    }
  }

  return kept
}
