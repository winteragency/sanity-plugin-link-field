import {ChevronDownIcon} from '@sanity/icons'
import {Button, Menu, MenuButton, MenuItem, Select} from '@sanity/ui'
import {LinkIcon} from 'lucide-react'
import {memo, useContext, useMemo} from 'react'
import type {StringInputProps} from 'sanity'

import {DEFAULT_LINK_TYPES, getLinkTypeOptionIcon} from '../helpers/defaultLinkTypes'
import {applyLinkTypeChange} from '../helpers/typeChangePatches'
import type {BuiltInLinkType, CustomLinkType, LinkFieldPluginOptions} from '../types'

import {LinkTypeChangeContext} from './linkTypeChangeContext'

const selectStyle = {height: '35px'} as const

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
  const changeLinkType = useContext(LinkTypeChangeContext)
  const isInlineLink = useMemo(() => path.some((segment) => segment === 'markDefs'), [path])
  const linkTypes = useMemo(() => {
    const enabledBuiltInLinkTypeSet = new Set(enabledBuiltInLinkTypes)

    return [
      // Disable internal links if not enabled for any schema types.
      ...DEFAULT_LINK_TYPES.filter(
        ({value}) =>
          enabledBuiltInLinkTypeSet.has(value as BuiltInLinkType) &&
          (value !== 'internal' || linkableSchemaTypes?.length > 0),
      ),
      ...customLinkTypes,
    ]
  }, [customLinkTypes, enabledBuiltInLinkTypes, linkableSchemaTypes])

  const selectedType = useMemo(
    () => linkTypes.find((type) => type.value === value) || linkTypes[0] || null,
    [linkTypes, value],
  )

  const selectType = (nextType: string) => {
    applyLinkTypeChange({
      nextType,
      currentType: value,
      changeLinkType,
      fieldOnChange: onChange,
    })
  }

  if (isInlineLink) {
    return (
      <Select
        value={selectedType?.value ?? ''}
        onChange={(event) => {
          selectType(event.currentTarget.value)
        }}
        aria-label="Select link type"
        disabled={linkTypes.length === 0}
        style={selectStyle}
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
          icon={selectedType ? getLinkTypeOptionIcon(selectedType) : LinkIcon}
          iconRight={ChevronDownIcon}
          title="Select link type"
          aria-label={`Select link type${selectedType ? ` (currently: ${selectedType.title})` : ''}`}
          style={selectStyle}
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
              icon={getLinkTypeOptionIcon(type)}
              onClick={() => {
                selectType(type.value)
              }}
            />
          ))}
        </Menu>
      }
    />
  )
})
