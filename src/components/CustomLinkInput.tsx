import {Select} from '@sanity/ui'
import {set, type StringInputProps, useFormValue} from 'sanity'

import {CustomLinkType, LinkValue} from '../types'
import {CustomLinkOptions} from './CustomLinkOptions'

/**
 * Custom input component used for custom link types.
 * Renders a dropdown with the available options for the custom link type.
 */
export function CustomLinkInput(
  props: StringInputProps & {
    customLinkTypes: CustomLinkType[]
  },
) {
  const linkValue = useFormValue(props.path.slice(0, -1)) as LinkValue | null

  const customLinkType = props.customLinkTypes.find((type) => type.value === linkValue!.type)!

  return (
    <Select
      onChange={(e) => {
        props.onChange(set(e.currentTarget.value || ''))
      }}
    >
      <CustomLinkOptions
        options={customLinkType.options}
        path={props.path}
        value={props.value || ''}
      />
    </Select>
  )
}
