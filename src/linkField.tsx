import {defineField, definePlugin, defineType, type ObjectInputProps} from 'sanity'

import {CustomLinkInput} from './components/CustomLinkInput'
import {LinkInput} from './components/LinkInput'
import {LinkTypeInput} from './components/LinkTypeInput'
import {isCustomLink} from './helpers/typeGuards'
import type {LinkFieldPluginOptions, LinkSchemaType, LinkValue} from './types'

const validatePhoneNumber = (value: string) =>
  (new RegExp(/^\+?[0-9\s-]*$/).test(value) && !value.startsWith('-') && !value.endsWith('-')) ||
  'Must be a valid phone number'

const isCommunicationType = (type?: string) =>
  type === 'email' || type === 'phone' || type === 'sms' || type === 'whatsapp' || type === 'fax'

const defaultLinkPreview = {
  select: {
    text: 'text',
    type: 'type',
    url: 'url',
    email: 'email',
    phone: 'phone',
    documentAssetRef: 'documentLink.asset._ref',
    mediaAssetRef: 'mediaLink.asset._ref',
    sms: 'sms',
    whatsapp: 'whatsapp',
    fax: 'fax',
    internalTitle: 'internalLink.title',
    internalSlug: 'internalLink.slug.current',
    internalRef: 'internalLink._ref',
    customValue: 'value',
  },
  prepare: ({
    text,
    type,
    url,
    email,
    phone,
    documentAssetRef,
    mediaAssetRef,
    sms,
    whatsapp,
    fax,
    internalTitle,
    internalSlug,
    internalRef,
    customValue,
  }: {
    text?: string
    type?: string
    url?: string
    email?: string
    phone?: string
    documentAssetRef?: string
    mediaAssetRef?: string
    sms?: string
    whatsapp?: string
    fax?: string
    internalTitle?: string
    internalSlug?: string
    internalRef?: string
    customValue?: string
  }) => {
    const titleFromType =
      type === 'internal'
        ? internalTitle || (internalSlug ? `/${internalSlug}` : undefined) || internalRef
        : type === 'external'
          ? url
          : type === 'email'
            ? email
            : type === 'phone'
              ? phone
              : type === 'document'
                ? documentAssetRef
                : type === 'media'
                  ? mediaAssetRef
                  : type === 'sms'
                    ? sms
                    : type === 'whatsapp'
                      ? whatsapp
                      : type === 'fax'
                        ? fax
                        : customValue

    return {
      title: text || titleFromType || 'Link',
      subtitle: type ? `Type: ${type}` : undefined,
    }
  },
}

/**
 * A plugin that adds a custom Link field for creating internal and external links,
 * as well as `mailto` and `tel`-links, all using the same intuitive UI.
 *
 * @param options - Options for the plugin. See {@link LinkFieldPluginOptions}
 *
 * @example Minimal example
 * ```ts
 * // sanity.config.ts
 * import { defineConfig } from 'sanity'
 * import { linkField } from 'sanity-plugin-link-field'
 *
 * export default defineConfig((
 *  // ...
 *  plugins: [
 *    linkField()
 *  ]
 * })
 *
 * // mySchema.ts
 * import { defineField, defineType } from 'sanity';
 *
 * export const mySchema = defineType({
 *  // ...
 *  fields: [
 *    // ...
 *    defineField({
 *      name: 'link',
 *      title: 'Link',
 *      type: 'link'
 *    }),
 *  ]
 *});
 * ```
 */
export const linkField = definePlugin<LinkFieldPluginOptions | void>((opts) => {
  const {
    linkableSchemaTypes = ['page'],
    weakReferences = false,
    referenceFilterOptions,
    descriptions = {
      internal: 'Link to another page or document on the website.',
      external: 'Link to an absolute URL to a page on another website.',
      email: 'Link to send an e-mail to the given address.',
      phone: 'Link to call the given phone number.',
      document: 'Link to a document file.',
      media: 'Link to an image, video, or audio file.',
      sms: 'Link to send an SMS to the given phone number.',
      whatsapp: 'Link to open a WhatsApp chat with the given phone number.',
      fax: 'Link to send a fax to the given number.',
      advanced: 'Optional. Add anchor links and custom parameters.',
      parameters: 'Optional. Add custom parameters to the URL, such as UTM tags.',
      anchor: 'Optional. Add an anchor to link to a specific section on the page.',
    },
    enableLinkParameters = true,
    enableAnchorLinks = true,
    customLinkTypes = [],
    enabledBuiltInLinkTypes = ['internal', 'external', 'email', 'phone'],
    icon,
    preview,
  } = opts || {}

  const initialBuiltInLinkType =
    (enabledBuiltInLinkTypes.includes('internal') && linkableSchemaTypes.length > 0
      ? 'internal'
      : enabledBuiltInLinkTypes.find((type) => type !== 'internal')) ||
    customLinkTypes[0]?.value ||
    'internal'
  const initialLinkType = initialBuiltInLinkType

  const linkType = defineType({
    name: 'link',
    title: 'Link',
    type: 'object',
    icon,
    preview: preview || defaultLinkPreview,
    fieldsets: [
      {
        name: 'advanced',
        title: 'Advanced',
        description: descriptions.advanced,
        options: {
          collapsible: true,
          collapsed: true,
        },
      },
    ],
    fields: [
      defineField({
        name: 'text',
        type: 'string',
        description: descriptions.text,
      }),

      defineField({
        name: 'type',
        type: 'string',
        initialValue: initialLinkType,
        validation: (Rule) => Rule.required(),
        components: {
          input: (props) => (
            <LinkTypeInput
              customLinkTypes={customLinkTypes}
              linkableSchemaTypes={linkableSchemaTypes}
              enabledBuiltInLinkTypes={enabledBuiltInLinkTypes}
              {...props}
            />
          ),
        },
      }),

      // Internal
      defineField({
        name: 'internalLink',
        type: 'reference',
        to: linkableSchemaTypes.map((type) => ({
          type,
        })),
        weak: weakReferences,
        options: {
          disableNew: true,
          ...referenceFilterOptions,
        },
        description: descriptions?.internal,
        hidden: ({parent}) => !!parent?.type && parent?.type !== 'internal',
      }),

      // External
      defineField({
        name: 'url',
        type: 'url',
        description: descriptions?.external,
        validation: (rule) =>
          rule.uri({
            allowRelative: true,
            scheme: ['https', 'http'],
          }),
        hidden: ({parent}) => parent?.type !== 'external',
      }),

      // E-mail
      defineField({
        name: 'email',
        type: 'email',
        description: descriptions?.email,
        hidden: ({parent}) => parent?.type !== 'email',
      }),

      // Phone
      defineField({
        name: 'phone',
        type: 'string',
        description: descriptions?.phone,
        validation: (rule) =>
          rule.custom((value, context) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!value || (context.parent as any)?.type !== 'phone') {
              return true
            }

            return validatePhoneNumber(value)
          }),
        hidden: ({parent}) => parent?.type !== 'phone',
      }),

      // Document
      defineField({
        name: 'documentLink',
        type: 'file',
        description: descriptions?.document,
        hidden: ({parent}) => parent?.type !== 'document',
      }),

      // Media
      defineField({
        name: 'mediaLink',
        type: 'file',
        options: {
          accept: 'image/*,video/*,audio/*',
        },
        description: descriptions?.media,
        hidden: ({parent}) => parent?.type !== 'media',
      }),

      // SMS
      defineField({
        name: 'sms',
        type: 'string',
        description: descriptions?.sms,
        validation: (rule) =>
          rule.custom((value, context) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!value || (context.parent as any)?.type !== 'sms') {
              return true
            }

            return validatePhoneNumber(value)
          }),
        hidden: ({parent}) => parent?.type !== 'sms',
      }),

      // WhatsApp
      defineField({
        name: 'whatsapp',
        type: 'string',
        description: descriptions?.whatsapp,
        validation: (rule) =>
          rule.custom((value, context) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!value || (context.parent as any)?.type !== 'whatsapp') {
              return true
            }

            return validatePhoneNumber(value)
          }),
        hidden: ({parent}) => parent?.type !== 'whatsapp',
      }),

      // Fax
      defineField({
        name: 'fax',
        type: 'string',
        description: descriptions?.fax,
        validation: (rule) =>
          rule.custom((value, context) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if (!value || (context.parent as any)?.type !== 'fax') {
              return true
            }

            return validatePhoneNumber(value)
          }),
        hidden: ({parent}) => parent?.type !== 'fax',
      }),

      // Custom
      defineField({
        name: 'value',
        type: 'string',
        description: descriptions?.external,
        hidden: ({parent}) => !parent || !isCustomLink(parent as LinkValue),
        components: {
          input: (props) => <CustomLinkInput customLinkTypes={customLinkTypes} {...props} />,
        },
      }),

      // New tab
      defineField({
        title: 'Open in new window',
        name: 'blank',
        type: 'boolean',
        initialValue: false,
        description: descriptions.blank,
        hidden: ({parent}) => isCommunicationType(parent?.type),
      }),

      // Parameters
      ...(enableLinkParameters || enableAnchorLinks
        ? [
            ...(enableLinkParameters
              ? [
                  defineField({
                    title: 'Parameters',
                    name: 'parameters',
                    type: 'string',
                    description: descriptions.parameters,
                    validation: (rule) =>
                      rule.custom((value, context) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const parentType = (context.parent as any)?.type
                        if (!value || isCommunicationType(parentType)) {
                          return true
                        }

                        if (value.indexOf('?') !== 0) {
                          return 'Must start with ?; eg. ?utm_source=example.com&utm_medium=referral'
                        }

                        if (value.length === 1) {
                          return 'Must contain at least one parameter'
                        }

                        return true
                      }),
                    hidden: ({parent}) => isCommunicationType(parent?.type),
                    fieldset: 'advanced',
                  }),
                ]
              : []),

            // Anchor
            ...(enableAnchorLinks
              ? [
                  defineField({
                    title: 'Anchor',
                    name: 'anchor',
                    type: 'string',
                    description: descriptions.anchor,
                    validation: (rule) =>
                      rule.custom((value, context) => {
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        const parentType = (context.parent as any)?.type
                        if (!value || isCommunicationType(parentType)) {
                          return true
                        }

                        if (value.indexOf('#') !== 0) {
                          return 'Must start with #; eg. #page-section-1'
                        }

                        if (value.length === 1) {
                          return 'Must contain at least one character'
                        }

                        return (
                          new RegExp(/^([-?/:@._~!$&'()*+,;=a-zA-Z0-9]|%[0-9a-fA-F]{2})*$/).test(
                            value.replace(/^#/, ''),
                          ) || 'Invalid URL fragment'
                        )
                      }),
                    hidden: ({parent}) => isCommunicationType(parent?.type),
                    fieldset: 'advanced',
                  }),
                ]
              : []),
          ]
        : []),
    ],
    components: {
      input: (props: ObjectInputProps) => (
        <LinkInput
          customLinkTypes={customLinkTypes}
          {...(props as ObjectInputProps<LinkValue, LinkSchemaType>)}
        />
      ),
    },
  })

  return {
    name: 'link-field',
    schema: {
      types: [linkType],
    },
  }
})
