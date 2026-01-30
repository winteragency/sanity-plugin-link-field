import {ChevronDownIcon} from '@sanity/icons'
import {Button, Menu, MenuButton, MenuItem} from '@sanity/ui'
import {AtSignIcon, GlobeIcon, LinkIcon, PhoneIcon, type LucideIcon} from 'lucide-react'
import {type ComponentType, memo} from 'react'
import {set, type StringInputProps} from 'sanity'

import {CustomLinkType, LinkFieldPluginOptions, LinkType} from '../types'

const ICON_SIZE = 16

const defaultLinkTypes: LinkType[] = [
  {title: 'Internal', value: 'internal', icon: LinkIcon},
  {title: 'URL', value: 'external', icon: GlobeIcon},
  {title: 'Email', value: 'email', icon: AtSignIcon},
  {title: 'Phone', value: 'phone', icon: PhoneIcon},
]

/**
 * Check if the icon is a lucide icon (one of the default link types)
 */
function isLucideIcon(icon: ComponentType): boolean {
  return defaultLinkTypes.some((t) => t.icon === icon)
}

/**
 * Create a sized wrapper for lucide icons
 */
function createSizedIcon(Icon: LucideIcon): ComponentType {
  function SizedIcon() {
    return <Icon size={ICON_SIZE} />
  }
  SizedIcon.displayName = `SizedIcon(${Icon.displayName || Icon.name || 'Unknown'})`
  return SizedIcon
}

/**
 * Get the icon component for a link type, wrapping lucide icons to set the correct size
 */
function getIcon(type: LinkType): ComponentType {
  if (isLucideIcon(type.icon)) {
    return createSizedIcon(type.icon as LucideIcon)
  }
  return type.icon
}

/**
 * Custom input component for the "type" field on the link object.
 * Renders a button with an icon and a dropdown menu to select the link type.
 */
export const LinkTypeInput = memo(function LinkTypeInput({
  value,
  onChange,
  customLinkTypes = [],
  linkableSchemaTypes,
}: StringInputProps & {
  customLinkTypes?: CustomLinkType[]
  linkableSchemaTypes: LinkFieldPluginOptions['linkableSchemaTypes']
}) {
  const linkTypes = [
    // Disable internal links if not enabled for any schema types
    ...defaultLinkTypes.filter(
      ({value}) => value !== 'internal' || linkableSchemaTypes?.length > 0,
    ),
    ...customLinkTypes,
  ]

  const selectedType = linkTypes.find((type) => type.value === value) || linkTypes[0]

  return (
    <MenuButton
      button={
        <Button
          type="button"
          mode="ghost"
          icon={getIcon(selectedType)}
          iconRight={ChevronDownIcon}
          title="Select link type"
          aria-label={`Select link type (currently: ${selectedType.title})`}
          style={{height: '35px'}}
        />
      }
      id="link-type"
      menu={
        <Menu>
          {linkTypes.map((type) => (
            <MenuItem
              key={type.value}
              text={type.title}
              icon={getIcon(type)}
              onClick={() => {
                onChange(set(type.value))
              }}
            />
          ))}
        </Menu>
      }
    />
  )
})
