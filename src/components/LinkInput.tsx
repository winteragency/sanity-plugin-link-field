import {Box, Flex, Stack, Text} from '@sanity/ui'
import {memo, useCallback, useMemo} from 'react'
import {
  type FieldMember,
  FormFieldValidationStatus,
  ObjectInputMember,
  type StringInputProps,
} from 'sanity'

import {CustomLinkInput} from './CustomLinkInput'
import {LinkTypeInput} from './LinkTypeInput'
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
  const [textField, typeField, linkField, ...otherFields] = props.members as FieldMember[]
  const {options} = props.schemaType
  const enabledBuiltInLinkTypes = options?.enabledBuiltInLinkTypes ?? props.enabledBuiltInLinkTypes
  const linkableSchemaTypes = options?.linkableSchemaTypes ?? props.linkableSchemaTypes
  const customLinkTypes = options?.customLinkTypes ?? props.customLinkTypes
  const weakReferences = options?.weakReferences ?? props.weakReferences
  const referenceFilterOptions = options?.referenceFilterOptions ?? props.referenceFilterOptions
  const hasFieldLevelLinkableSchemaTypes = Array.isArray(options?.linkableSchemaTypes)
  const hasFieldLevelWeakReferences = typeof options?.weakReferences === 'boolean'
  const hasFieldLevelReferenceFilterOptions = typeof options?.referenceFilterOptions !== 'undefined'

  const {
    field: {
      validation: linkFieldValidation,
      schemaType: {description: linkFieldDescription},
    },
  } = linkField

  const description = useMemo(
    () =>
      // If a custom link type is used, use its description if it has one.
      props.value && isCustomLink(props.value)
        ? customLinkTypes.find((type) => type.value === props.value?.type)?.description
        : // Fallback to the description of the current link type field.
          linkFieldDescription,
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
    (fieldProps: Parameters<typeof props.renderField>[0]) => <>{fieldProps.children}</>,
    [props],
  )

  const inlineFieldRenderProps = useMemo(
    () => ({
      ...renderProps,
      renderField: renderInlineField,
    }),
    [renderInlineField, renderProps],
  )

  const textFieldSchemaType = useMemo(
    () => ({
      ...textField.field.schemaType,
      title: options?.textLabel || textField.field.schemaType.title,
      ...(options?.enableText && options?.requireText
        ? {
            validation: (rule: {required: () => {error: (message: string) => unknown}}) =>
              rule.required().error('Link label is required'),
          }
        : {}),
    }),
    [options?.enableText, options?.requireText, options?.textLabel, textField.field.schemaType],
  )

  const selectedFieldName = (linkField as {name?: string}).name
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

  const typeFieldSchemaType = useMemo(
    () => ({
      ...typeField.field.schemaType,
      title: undefined,
      components: {
        ...typeField.field.schemaType.components,
        input: renderLinkTypeInput,
      },
    }),
    [renderLinkTypeInput, typeField.field.schemaType],
  )

  return (
    <Stack space={4}>
      {/* Render the text field if enabled */}
      {options?.enableText && (
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
        {/* Render a label for the link field if there's also a text field enabled. */}
        {/* If there's no text field, the label here is irrelevant */}
        {options?.enableText && (
          <Text as="label" weight="medium" size={1}>
            {options?.linkSectionLabel ?? 'Link'}
          </Text>
        )}

        <Flex gap={2} align="flex-start">
          {/* Render the type field (without its label) */}
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
            {/* Render the input for the selected type of link (without its label) */}
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

            {/* Render any validation errors for the link field */}
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

        {/* Render the description of the selected link field, if any */}
        {description && (
          <Text muted size={1}>
            {description}
          </Text>
        )}
      </Stack>

      {/* Render the rest of the fields as usual */}
      {otherFields.map((field) => (
        <ObjectInputMember key={field.key} member={field} {...renderProps} />
      ))}
    </Stack>
  )
})
