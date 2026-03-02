import {ChevronDownIcon} from '@sanity/icons'
import {Button, Menu, MenuButton, MenuItem, Select} from '@sanity/ui'
import {
  AtSignIcon,
  FileTextIcon,
  GlobeIcon,
  FolderOpen,
  LinkIcon,
  type LucideIcon,
  MessageCircle,
  PhoneIcon,
  Printer,
  SmartphoneIcon,
} from 'lucide-react'
import {type ComponentType, memo} from 'react'
import {set, type StringInputProps} from 'sanity'

import {BuiltInLinkType, CustomLinkType, LinkFieldPluginOptions, LinkType} from '../types'

const ICON_SIZE = 16

const defaultLinkTypes: LinkType[] = [
  {title: 'Internal', value: 'internal', icon: LinkIcon},
  {title: 'URL', value: 'external', icon: GlobeIcon},
  {title: 'Email', value: 'email', icon: AtSignIcon},
  {title: 'Phone', value: 'phone', icon: PhoneIcon},
  {title: 'Document', value: 'document', icon: FileTextIcon},
  {title: 'Media', value: 'media', icon: FolderOpen},
  {title: 'SMS', value: 'sms', icon: MessageCircle},
  {title: 'WhatsApp', value: 'whatsapp', icon: SmartphoneIcon},
  {title: 'Fax', value: 'fax', icon: Printer},
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
  function SizedIcon(props: Record<string, unknown>) {
    return <Icon size={ICON_SIZE} {...props} />
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
  id,
  path,
  value,
  onChange,
  customLinkTypes = [],
  linkableSchemaTypes,
  enabledBuiltInLinkTypes,
}: StringInputProps & {
  customLinkTypes?: CustomLinkType[]
  linkableSchemaTypes: LinkFieldPluginOptions['linkableSchemaTypes']
  enabledBuiltInLinkTypes: BuiltInLinkType[]
}) {
  const isInlineLink = path.some((segment) => segment === 'markDefs')
  const enabledBuiltInLinkTypeSet = new Set(enabledBuiltInLinkTypes)
  const linkTypes = [
    // Disable internal links if not enabled for any schema types.
    ...defaultLinkTypes.filter(
      ({value}) =>
        enabledBuiltInLinkTypeSet.has(value as BuiltInLinkType) &&
        (value !== 'internal' || linkableSchemaTypes?.length > 0),
    ),
    ...customLinkTypes,
  ]

  const selectedType = linkTypes.find((type) => type.value === value) || linkTypes[0] || null

  if (isInlineLink) {
    return (
      <Select
        value={selectedType?.value ?? ''}
        onChange={(event) => {
          onChange(set(event.currentTarget.value))
        }}
        aria-label="Select link type"
        disabled={linkTypes.length === 0}
        style={{height: '35px'}}
      >
        {linkTypes.map((type) => (
          <option key={type.value} value={type.value}>
            {type.title}
          </option>
        ))}
      </Select>
    )
  }

  return (
    <MenuButton
      button={
        <Button
          type="button"
          mode="ghost"
          icon={selectedType ? getIcon(selectedType) : LinkIcon}
          iconRight={ChevronDownIcon}
          title="Select link type"
          aria-label={`Select link type${selectedType ? ` (currently: ${selectedType.title})` : ''}`}
          style={{height: '35px'}}
          disabled={linkTypes.length === 0}
        />
      }
      id={id}
      popover={{portal: true}}
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
