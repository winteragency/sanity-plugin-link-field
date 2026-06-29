import {Box, Flex, Stack, Text} from '@sanity/ui'
import {memo, type ReactNode, useCallback, useEffect, useMemo} from 'react'
import {set, FormFieldValidationStatus, ObjectInputMember, type StringInputProps} from 'sanity'

import {CustomLinkInput} from './CustomLinkInput'
import {LinkTypeInput} from './LinkTypeInput'
import {getAvailableLinkTypeValues} from '../helpers/availableLinkTypes'
import {resolveLinkInputMembers} from '../helpers/linkInputMembers'
import {isCustomLink} from '../helpers/typeGuards'
import {LinkInputProps} from '../types'

const fullWidthStyle = {width: '100%'} as const
const validationBoxStyle = {
  contain: 'size',
  marginBottom: '6px',
  marginLeft: 'auto',
  marginRight: '12px',
} as const

/**
 * Custom input component for the link object.
 * Nicely renders the type and link fields next to each other, with the
 * description and any validation errors for the link field below them.
 *
 * The rest of the fields ("blank" and "advanced") are rendered as usual.
 */
export const LinkInput = memo(function LinkInput(props: LinkInputProps) {
  const {textField, typeField, linkField, otherFields} = resolveLinkInputMembers(
    props.members,
    props.value,
  )

  const {options} = props.schemaType
  const currentType = props.value?.type
  const handleChange = props.onChange
  const enabledBuiltInLinkTypes = options?.enabledBuiltInLinkTypes ?? props.enabledBuiltInLinkTypes
  const linkableSchemaTypes = options?.linkableSchemaTypes ?? props.linkableSchemaTypes
  const customLinkTypes = options?.customLinkTypes ?? props.customLinkTypes
  const weakReferences = options?.weakReferences ?? props.weakReferences
  const referenceFilterOptions = options?.referenceFilterOptions ?? props.referenceFilterOptions
  const hasFieldLevelLinkableSchemaTypes = Array.isArray(options?.linkableSchemaTypes)
  const hasFieldLevelWeakReferences = typeof options?.weakReferences === 'boolean'
  const hasFieldLevelReferenceFilterOptions = typeof options?.referenceFilterOptions !== 'undefined'
  const availableTypeValues = useMemo(
    () => getAvailableLinkTypeValues(enabledBuiltInLinkTypes, linkableSchemaTypes, customLinkTypes),
    [customLinkTypes, enabledBuiltInLinkTypes, linkableSchemaTypes],
  )

  useEffect(() => {
    if (!typeField || !linkField) return
    if (!currentType || availableTypeValues.includes(currentType)) return
    if (availableTypeValues.length === 0) return
    handleChange(set(availableTypeValues[0], ['type']))
  }, [availableTypeValues, currentType, handleChange, linkField, typeField])

  const linkFieldValidation = linkField?.field.validation ?? []
  const linkFieldDescription = linkField?.field.schemaType.description

  const description = useMemo(
    () =>
      props.value && isCustomLink(props.value)
        ? customLinkTypes.find((type) => type.value === props.value?.type)?.description
        : linkFieldDescription,
    [customLinkTypes, linkFieldDescription, props.value],
  )

  const renderProps = useMemo(
    () => ({
      renderAnnotation: props.renderAnnotation,
      renderBlock: props.renderBlock,
      renderField: props.renderField,
      renderInlineBlock: props.renderInlineBlock,
      renderInput: props.renderInput,
      renderItem: props.renderItem,
      renderPreview: props.renderPreview,
    }),
    [
      props.renderAnnotation,
      props.renderBlock,
      props.renderField,
      props.renderInlineBlock,
      props.renderInput,
      props.renderItem,
      props.renderPreview,
    ],
  )

  const renderInlineField = useCallback(
    (fieldProps: {children: ReactNode}) => <>{fieldProps.children}</>,
    [],
  )

  const inlineFieldRenderProps = useMemo(
    () => ({
      ...renderProps,
      renderField: renderInlineField,
    }),
    [renderInlineField, renderProps],
  )

  const textFieldSchemaType = useMemo(
    () =>
      textField
        ? {
            ...textField.field.schemaType,
            title: options?.textLabel || textField.field.schemaType.title,
          }
        : undefined,
    [options?.textLabel, textField],
  )

  const selectedFieldName = linkField?.name
  const renderCustomLinkInput = useCallback(
    (inputProps: StringInputProps) => (
      <CustomLinkInput customLinkTypes={customLinkTypes} {...inputProps} />
    ),
    [customLinkTypes],
  )

  const renderLinkTypeInput = useCallback(
    (inputProps: StringInputProps) => (
      <LinkTypeInput
        customLinkTypes={customLinkTypes}
        linkableSchemaTypes={linkableSchemaTypes}
        enabledBuiltInLinkTypes={enabledBuiltInLinkTypes}
        {...inputProps}
      />
    ),
    [customLinkTypes, enabledBuiltInLinkTypes, linkableSchemaTypes],
  )

  const linkFieldSchemaType = useMemo(() => {
    if (!linkField) return undefined

    const schemaType: Record<string, unknown> = {
      ...linkField.field.schemaType,
      title: undefined,
      description: undefined,
    }

    if (selectedFieldName === 'internalLink') {
      if (hasFieldLevelLinkableSchemaTypes) {
        schemaType.to = linkableSchemaTypes.map((type) => ({type}))
      }

      if (hasFieldLevelWeakReferences) {
        schemaType.weak = weakReferences
      }

      if (hasFieldLevelReferenceFilterOptions) {
        schemaType.options = {
          disableNew: true,
          ...referenceFilterOptions,
        }
      }
    }

    if (selectedFieldName === 'value') {
      schemaType.components = {
        ...linkField.field.schemaType.components,
        input: renderCustomLinkInput,
      }
    }

    return schemaType as unknown as typeof linkField.field.schemaType
  }, [
    hasFieldLevelLinkableSchemaTypes,
    hasFieldLevelReferenceFilterOptions,
    hasFieldLevelWeakReferences,
    linkField,
    linkableSchemaTypes,
    referenceFilterOptions,
    renderCustomLinkInput,
    selectedFieldName,
    weakReferences,
  ])

  const typeFieldSchemaType = useMemo(() => {
    if (!typeField) return undefined

    return {
      ...typeField.field.schemaType,
      title: undefined,
      components: {
        ...typeField.field.schemaType.components,
        input: renderLinkTypeInput,
      },
    }
  }, [renderLinkTypeInput, typeField])

  // In Sanity Studio v6, `members` can be undefined while form state is resolving.
  if (!typeField || !linkField || !typeFieldSchemaType || !linkFieldSchemaType) {
    return props.renderDefault(props)
  }

  return (
    <Stack space={4}>
      {options?.enableText && textField && textFieldSchemaType && (
        <ObjectInputMember
          member={{
            ...textField,
            field: {
              ...textField.field,
              schemaType: textFieldSchemaType as unknown as typeof textField.field.schemaType,
            },
          }}
          {...renderProps}
        />
      )}

      <Stack space={3}>
        {options?.enableText && (
          <Text as="label" weight="medium" size={1}>
            {options?.linkSectionLabel ?? 'Link'}
          </Text>
        )}

        <Flex gap={2} align="flex-start">
          <ObjectInputMember
            member={{
              ...typeField,
              field: {
                ...typeField.field,
                schemaType: typeFieldSchemaType as unknown as typeof typeField.field.schemaType,
              },
            }}
            {...inlineFieldRenderProps}
          />

          <Stack space={2} style={fullWidthStyle}>
            <ObjectInputMember
              member={{
                ...linkField,
                field: {
                  ...linkField.field,
                  schemaType: linkFieldSchemaType,
                },
              }}
              {...inlineFieldRenderProps}
            />

            {linkFieldValidation.length > 0 && (
              <Box style={validationBoxStyle}>
                <FormFieldValidationStatus
                  fontSize={1}
                  placement="top"
                  validation={linkFieldValidation}
                />
              </Box>
            )}
          </Stack>
        </Flex>

        {description && (
          <Text muted size={1}>
            {description}
          </Text>
        )}
      </Stack>

      {otherFields.map((field) => (
        <ObjectInputMember key={field.key} member={field} {...renderProps} />
      ))}
    </Stack>
  )
})
