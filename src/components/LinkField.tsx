import {Box, Flex, Stack, Text} from '@sanity/ui'
import {
  type FieldMember,
  FormFieldValidationStatus,
  ObjectInputMember,
  type ObjectInputProps,
} from 'sanity'
import styled from 'styled-components'

import {isCustomLink} from '../helpers/typeGuards'
import {CustomLinkType, LinkValue} from '../types'

const ValidationErrorWrapper = styled(Box)`
  contain: size;
  margin-bottom: 6px;
  margin-left: auto;
  margin-right: 12px;
`

/**
 * Custom field component for the link object.
 * Nicely renders the type and link fields next to each other, with the
 * description and any validation errors for the link field below them.
 *
 * The rest of the fields ("blank" and "advanced") are rendered as usual.
 */
export function LinkField(props: ObjectInputProps & {customLinkTypes: CustomLinkType[]}) {
  const [typeField, linkField, ...otherFields] = props.members as FieldMember[]

  const {
    field: {
      validation: linkFieldValidation,
      schemaType: {description: linkFieldDescription},
    },
  } = linkField

  const description =
    // If a custom link type is used, use its description if it has one.
    props.value && isCustomLink(props.value as LinkValue)
      ? props.customLinkTypes.find((type) => type.value === (props.value as LinkValue).type)
          ?.description
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

  return (
    <Stack space={4}>
      <Stack space={3}>
        <Flex gap={2} align="center">
          {/* Render the type field (without its label) */}
          <ObjectInputMember
            member={{
              ...typeField,
              field: {
                ...typeField.field,
                schemaType: {
                  ...typeField.field.schemaType,
                  title: undefined,
                },
              },
            }}
            {...renderProps}
          />

          <Stack space={2}>
            {/* Render the input for the selected type of link (withouts its label) */}
            <ObjectInputMember
              member={{
                ...linkField,
                field: {
                  ...linkField.field,
                  schemaType: {
                    ...linkField.field.schemaType,
                    title: undefined,
                  },
                },
              }}
              {...renderProps}
            />

            {/* Render any validation errors for the link field */}
            {linkFieldValidation.length > 0 && (
              <ValidationErrorWrapper>
                <FormFieldValidationStatus
                  fontSize={1}
                  placement="top"
                  validation={linkFieldValidation}
                />
              </ValidationErrorWrapper>
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
}
