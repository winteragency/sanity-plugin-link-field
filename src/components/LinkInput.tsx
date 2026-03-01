import {Box, Flex, Stack, Text} from '@sanity/ui'
import {memo} from 'react'
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

  const {
    field: {
      validation: linkFieldValidation,
      schemaType: {description: linkFieldDescription},
    },
  } = linkField

  const description =
    // If a custom link type is used, use its description if it has one.
    props.value && isCustomLink(props.value)
      ? customLinkTypes.find((type) => type.value === props.value?.type)?.description
      : // Fallback to the description of the current link type field.
        linkFieldDescription

  const renderProps = {
    renderAnnotation: props.renderAnnotation,
    renderBlock: props.renderBlock,
    renderField: props.renderField,
    renderInlineBlock: props.renderInlineBlock,
    renderInput: props.renderInput,
    renderItem: props.renderItem,
    renderPreview: props.renderPreview,
  }

  const selectedFieldName = (linkField as {name?: string}).name
  const linkFieldSchemaType = {
    ...linkField.field.schemaType,
    title: undefined,
  } as Record<string, unknown>

  if (selectedFieldName === 'internalLink') {
    linkFieldSchemaType.to = linkableSchemaTypes.map((type) => ({type}))
    linkFieldSchemaType.weak = weakReferences
    linkFieldSchemaType.options = {
      disableNew: true,
      ...referenceFilterOptions,
    }
  }

  if (selectedFieldName === 'value') {
    linkFieldSchemaType.components = {
      ...linkField.field.schemaType.components,
      input: (inputProps: StringInputProps) => (
        <CustomLinkInput customLinkTypes={customLinkTypes} {...inputProps} />
      ),
    }
  }

  return (
    <Stack space={4}>
      {/* Render the text field if enabled */}
      {options?.enableText && (
        <ObjectInputMember
          member={{
            ...textField,
            field: {
              ...textField.field,
              schemaType: {
                ...textField.field.schemaType,
                title: options?.textLabel || textField.field.schemaType.title,
              },
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
            Link
          </Text>
        )}

        <Flex gap={2} align="flex-start">
          {/* Render the type field (without its label) */}
          <ObjectInputMember
            member={{
              ...typeField,
              field: {
                ...typeField.field,
                schemaType: {
                  ...typeField.field.schemaType,
                  title: undefined,
                  components: {
                    ...typeField.field.schemaType.components,
                    input: (inputProps: StringInputProps) => (
                      <LinkTypeInput
                        customLinkTypes={customLinkTypes}
                        linkableSchemaTypes={linkableSchemaTypes}
                        enabledBuiltInLinkTypes={enabledBuiltInLinkTypes}
                        {...inputProps}
                      />
                    ),
                  },
                },
              },
            }}
            {...renderProps}
          />

          <Stack space={2} style={{width: '100%'}}>
            {/* Render the input for the selected type of link (without its label) */}
            <ObjectInputMember
              member={{
                ...linkField,
                field: {
                  ...linkField.field,
                  schemaType: linkFieldSchemaType as unknown as typeof linkField.field.schemaType,
                },
              }}
              {...renderProps}
            />

            {/* Render any validation errors for the link field */}
            {linkFieldValidation.length > 0 && (
              <Box
                style={{
                  contain: 'size',
                  marginBottom: '6px',
                  marginLeft: 'auto',
                  marginRight: '12px',
                }}
              >
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
