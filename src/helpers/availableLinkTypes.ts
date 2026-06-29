import type {BuiltInLinkType, CustomLinkType} from '../types'

/**
 * Returns built-in link type values that should appear in the type dropdown,
 * respecting enabledBuiltInLinkTypes and hiding internal when no schema types are linkable.
 */
export function getAvailableBuiltInLinkTypeValues(
  enabledBuiltInLinkTypes: BuiltInLinkType[],
  linkableSchemaTypes: string[],
): BuiltInLinkType[] {
  return enabledBuiltInLinkTypes.filter(
    (type) => type !== 'internal' || linkableSchemaTypes.length > 0,
  )
}

/**
 * Returns all link type values (built-in + custom) available for selection.
 */
export function getAvailableLinkTypeValues(
  enabledBuiltInLinkTypes: BuiltInLinkType[],
  linkableSchemaTypes: string[],
  customLinkTypes: CustomLinkType[] = [],
): string[] {
  const builtInTypes = getAvailableBuiltInLinkTypeValues(
    enabledBuiltInLinkTypes,
    linkableSchemaTypes,
  )
  return [...builtInTypes, ...customLinkTypes.map((type) => type.value)]
}
