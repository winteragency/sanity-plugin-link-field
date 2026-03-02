import {Select, Spinner, Text} from '@sanity/ui'
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
  const [loadError, setLoadError] = useState<string | null>(null)

  const customLinkType = linkValue
    ? props.customLinkTypes.find((type) => type.value === linkValue.type)
    : undefined

  useEffect(() => {
    if (customLinkType) {
      if (Array.isArray(customLinkType?.options)) {
        setOptions(customLinkType.options)
      } else {
        customLinkType
          .options(document, props.path, workspace.currentUser)
          .then((resolved) => setOptions(resolved))
          .catch(() => setLoadError('Failed to load options'))
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customLinkType, props.path, workspace.currentUser])

  if (loadError) {
    return (
      <Text size={1} style={{color: 'var(--card-critical-fg-color)'}}>
        {loadError}
      </Text>
    )
  }

  return options ? (
    <Select
      value={props.value ?? ''}
      onChange={(e) => {
        props.onChange(set(e.currentTarget.value || ''))
      }}
    >
      <>
        <option value="" disabled hidden />
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.title}
          </option>
        ))}
      </>
    </Select>
  ) : (
    <Spinner style={{marginLeft: '0.5rem'}} />
  )
})
