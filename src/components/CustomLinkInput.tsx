import {Select, Spinner} from '@sanity/ui'
import {memo, useEffect, useState} from 'react'
import {SanityDocument, set, type StringInputProps, useFormValue, useWorkspace} from 'sanity'

import {CustomLinkType, CustomLinkTypeOptions, LinkValue} from '../types'

/**
 * Custom input component used for custom link types.
 * Renders a dropdown with the available options for the custom link type.
 */
export const CustomLinkInput = memo(function CustomLinkInput(
  props: StringInputProps & {
    customLinkTypes: CustomLinkType[]
  },
) {
  const workspace = useWorkspace()
  const document = useFormValue([]) as SanityDocument
  const linkValue = useFormValue(props.path.slice(0, -1)) as LinkValue | null
  const [options, setOptions] = useState<CustomLinkTypeOptions[] | null>(null)

  const customLinkType = props.customLinkTypes.find((type) => type.value === linkValue!.type)

  useEffect(() => {
    if (customLinkType) {
      if (Array.isArray(customLinkType?.options)) {
        setOptions(customLinkType.options)
      } else {
        customLinkType
          .options(document, props.path, workspace.currentUser)
          .then((options) => setOptions(options))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customLinkType, props.path, workspace.currentUser])

  return options ? (
    <Select
      onChange={(e) => {
        props.onChange(set(e.currentTarget.value || ''))
      }}
    >
      <>
        <option value="" selected={props.value === ''} disabled hidden />
        {options.map((option) => (
          <option key={option.value} value={option.value} selected={props.value === option.value}>
            {option.title}
          </option>
        ))}
      </>
    </Select>
  ) : (
    <Spinner style={{marginLeft: '0.5rem'}} />
  )
})
