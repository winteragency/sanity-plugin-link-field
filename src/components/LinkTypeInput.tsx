import {ChevronDownIcon} from '@sanity/icons'
import {Button, Menu, MenuButton, MenuItem} from '@sanity/ui'
import {
  AtSignIcon,
  AudioLines,
  FileTextIcon,
  GlobeIcon,
  ImageIcon,
  LinkIcon,
  MessageCircle,
  PhoneIcon,
  Printer,
  SmartphoneIcon,
  VideoIcon,
} from 'lucide-react'
import {set, type StringInputProps} from 'sanity'
import styled from 'styled-components'

import {CustomLinkType, LinkFieldPluginOptions, LinkType} from '../types'
import {memo} from 'react'

const defaultLinkTypes: LinkType[] = [
  {title: 'Internal', value: 'internal', icon: LinkIcon},
  {title: 'URL', value: 'external', icon: GlobeIcon},
  {title: 'Email', value: 'email', icon: AtSignIcon},
  {title: 'Phone', value: 'phone', icon: PhoneIcon},
  {title: 'Document', value: 'document', icon: FileTextIcon},
  {title: 'Image', value: 'image', icon: ImageIcon},
  {title: 'Video', value: 'video', icon: VideoIcon},
  {title: 'Audio', value: 'audio', icon: AudioLines},
  {title: 'SMS', value: 'sms', icon: MessageCircle},
  {title: 'WhatsApp', value: 'whatsapp', icon: SmartphoneIcon},
  {title: 'Fax', value: 'fax', icon: Printer},
]

const LinkTypeButton = styled(Button)`
  height: 35px;

  svg.lucide {
    width: 1rem;
    height: 1rem;
  }
`

const LinkTypeMenuItem = styled(MenuItem)`
  svg.lucide {
    width: 1rem;
    height: 1rem;
  }
`

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
        <LinkTypeButton
          type="button"
          mode="ghost"
          icon={selectedType.icon}
          iconRight={ChevronDownIcon}
          title="Select link type"
          aria-label={`Select link type (currently: ${selectedType.title})`}
        />
      }
      id="link-type"
      menu={
        <Menu>
          {linkTypes.map((type) => (
            <LinkTypeMenuItem
              key={type.value}
              text={type.title}
              icon={type.icon}
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
