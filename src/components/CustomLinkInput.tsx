import {Select, Spinner, Text} from '@sanity/ui'
import {memo, useEffect, useMemo, useState} from 'react'
import {SanityDocument, set, type StringInputProps, useFormValue, useWorkspace} from 'sanity'

import {CustomLinkType, CustomLinkTypeOptions, LinkValue} from '../types'

const errorTextStyle = {color: 'var(--card-critical-fg-color)'} as const
const spinnerStyle = {marginLeft: '0.5rem'} as const

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
  const [asyncOptionsResult, setAsyncOptionsResult] = useState<{
    key: string
    options: CustomLinkTypeOptions[] | null
    error: string | null
  } | null>(null)

  const customLinkType = linkValue
    ? props.customLinkTypes.find((type) => type.value === linkValue.type)
    : undefined
  const pathKey = useMemo(() => JSON.stringify(props.path), [props.path])
  const requestKey = customLinkType ? `${customLinkType.value}:${pathKey}` : null

  useEffect(() => {
    if (!customLinkType || Array.isArray(customLinkType.options) || !requestKey) return () => {}

    let isCurrentRequest = true

    customLinkType
      .options(document, props.path, workspace.currentUser)
      .then((resolved) => {
        if (!isCurrentRequest) return
        setAsyncOptionsResult({
          key: requestKey,
          options: resolved,
          error: null,
        })
      })
      .catch(() => {
        if (!isCurrentRequest) return
        setAsyncOptionsResult({
          key: requestKey,
          options: null,
          error: 'Failed to load options',
        })
      })

    return () => {
      isCurrentRequest = false
    }
  }, [customLinkType, document, props.path, requestKey, workspace.currentUser])

  if (!customLinkType) return null

  const options = Array.isArray(customLinkType.options)
    ? customLinkType.options
    : asyncOptionsResult?.key === requestKey
      ? asyncOptionsResult.options
      : null
  const loadError =
    !Array.isArray(customLinkType.options) && asyncOptionsResult?.key === requestKey
      ? asyncOptionsResult.error
      : null

  if (loadError) {
    return (
      <Text size={1} style={errorTextStyle}>
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
    <Spinner style={spinnerStyle} />
  )
})
