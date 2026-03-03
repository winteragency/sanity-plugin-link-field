import {
  AtSignIcon,
  FileTextIcon,
  FolderOpen,
  GlobeIcon,
  LinkIcon,
  type LucideIcon,
  MessageCircle,
  PhoneIcon,
  Printer,
  SmartphoneIcon,
} from 'lucide-react'
import {type ComponentType} from 'react'
import {
  defineField,
  definePlugin,
  defineType,
  type ObjectInputProps,
  type PreviewConfig,
} from 'sanity'

import {CustomLinkInput} from './components/CustomLinkInput'
import {LinkInput} from './components/LinkInput'
import {LinkTypeInput} from './components/LinkTypeInput'
import {getCustomDisplayText} from './helpers/getLinkText'
import {isCommunicationType, isCustomLink} from './helpers/typeGuards'
import type {
  BuiltInLinkType,
  CustomLinkType,
  LinkFieldPluginOptions,
  LinkSchemaType,
  LinkValue,
} from './types'

const PHONE_REGEX = /^\+?[0-9\s-]*$/
const ANCHOR_REGEX = /^([-?/:@._~!$&'()*+,;=a-zA-Z0-9]|%[0-9a-fA-F]{2})*$/

/**
 * Wrap a lucide ForwardRefExoticComponent in a plain function component
 * so Sanity's preview system recognises it as renderable media
 * (`typeof fn === 'function'`).
 */
const wrapIcon = (Icon: LucideIcon): ComponentType => {
  function PreviewIcon() {
    return <Icon />
  }
  PreviewIcon.displayName = Icon.displayName || Icon.name
  return PreviewIcon
}

const BUILT_IN_LINK_TYPE_ICONS: Record<BuiltInLinkType, ComponentType> = {
  internal: wrapIcon(LinkIcon),
  external: wrapIcon(GlobeIcon),
  email: wrapIcon(AtSignIcon),
  phone: wrapIcon(PhoneIcon),
  document: wrapIcon(FileTextIcon),
  media: wrapIcon(FolderOpen),
  sms: wrapIcon(MessageCircle),
  whatsapp: wrapIcon(SmartphoneIcon),
  fax: wrapIcon(Printer),
}

const getIconForLinkType = (
  type: string | undefined,
  customLinkTypes: CustomLinkType[],
): ComponentType => {
  if (type && type in BUILT_IN_LINK_TYPE_ICONS) {
    return BUILT_IN_LINK_TYPE_ICONS[type as BuiltInLinkType]
  }
  return customLinkTypes.find((ct) => ct.value === type)?.icon ?? BUILT_IN_LINK_TYPE_ICONS.internal
}

const validatePhoneNumber = (value: string): true | string => {
  const trimmed = value.trim()
  if (
    !trimmed ||
    !PHONE_REGEX.test(trimmed) ||
    trimmed.startsWith('-') ||
    trimmed.endsWith('-') ||
    !/\d/.test(trimmed)
  ) {
    return 'Must be a valid phone number'
  }
  return true
}

/**
 * Returns a custom validation function for phone-like fields.
 * Skips validation when the parent type doesn't match the given field name.
 */
const makePhoneValidator =
  (fieldName: string) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (value: string | undefined, context: {parent?: any}): true | string => {
    if (!value || context.parent?.type !== fieldName) return true
    const result = validatePhoneNumber(value)
    if (result !== true) return result
    return true
  }

type LinkPreviewSelection = {
  text?: string
  type?: BuiltInLinkType | string
  url?: string
  email?: string
  phone?: string
  documentAssetRef?: string
  documentFilename?: string
  mediaAssetRef?: string
  mediaFilename?: string
  sms?: string
  whatsapp?: string
  fax?: string
  internalTitle?: string
  internalSlug?: string
  internalRef?: string
  customValue?: string
}

const getPreviewTitleFromType = ({
  type,
  url,
  email,
  phone,
  documentAssetRef,
  documentFilename,
  mediaAssetRef,
  mediaFilename,
  sms,
  whatsapp,
  fax,
  internalTitle,
  internalSlug,
  internalRef,
  customValue,
}: LinkPreviewSelection): string | undefined => {
  switch (type) {
    case 'internal':
      return internalTitle || (internalSlug ? `/${internalSlug}` : undefined) || internalRef
    case 'external':
      return url
    case 'email':
      return email
    case 'phone':
      return phone
    case 'document':
      return documentFilename || documentAssetRef
    case 'media':
      return mediaFilename || mediaAssetRef
    case 'sms':
      return sms
    case 'whatsapp':
      return whatsapp
    case 'fax':
      return fax
    default:
      return getCustomDisplayText(customValue)
  }
}

const createDefaultLinkPreview = (customLinkTypes: CustomLinkType[]) => ({
  select: {
    text: 'text',
    type: 'type',
    url: 'url',
    email: 'email',
    phone: 'phone',
    documentAssetRef: 'documentLink.asset._ref',
    documentFilename: 'documentLink.asset.originalFilename',
    mediaAssetRef: 'mediaLink.asset._ref',
    mediaFilename: 'mediaLink.asset.originalFilename',
    sms: 'sms',
    whatsapp: 'whatsapp',
    fax: 'fax',
    internalTitle: 'internalLink->title',
    internalSlug: 'internalLink->slug.current',
    internalRef: 'internalLink._ref',
    customValue: 'value',
  },
  prepare: (selection: LinkPreviewSelection) => {
    const {text, type} = selection
    const titleFromType = getPreviewTitleFromType(selection)

    const hasLinkText = Boolean(text)

    return {
      title: text || titleFromType || 'Link',
      // Keep compact one-line previews when editors provide explicit link text.
      subtitle: !hasLinkText && type ? `Type: ${type}` : undefined,
      media: getIconForLinkType(type, customLinkTypes),
    }
  },
})

/**
 * Wraps a user-provided preview (or the default) so that `media` always
 * falls back to the link-type icon when the consumer doesn't supply one.
 */
const buildPreview = (
  userPreview: LinkFieldPluginOptions['preview'],
  customLinkTypes: CustomLinkType[],
): PreviewConfig => {
  const defaultPreview = createDefaultLinkPreview(customLinkTypes)
  if (!userPreview) return defaultPreview

  return {
    select: {
      ...defaultPreview.select,
      ...userPreview.select,
      _linkType: 'type',
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    prepare: (selection: any) => {
      const linkType = selection._linkType as string | undefined
      const defaultResult = defaultPreview.prepare?.(selection) ?? {}
      const userResult = userPreview.prepare?.(selection) ?? {}
      const result = {
        ...defaultResult,
        ...userResult,
      }
      return {
        ...result,
        media: result.media ?? getIconForLinkType(linkType, customLinkTypes),
      }
    },
  }
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
    descriptions: userDescriptions,
    enableLinkParameters = true,
    enableAnchorLinks = true,
    customLinkTypes = [],
    enabledBuiltInLinkTypes = ['internal', 'external', 'email', 'phone'],
    icon,
    preview,
  } = opts || {}

  const descriptions = {
    internal: 'Link to another page or document on the website.',
    external: 'Link to an absolute URL to a page on another website.',
    email: 'Link to send an e-mail to the given address.',
    phone: 'Link to call the given phone number.',
    document: 'Link to a document file.',
    media: 'Link to an image, video, or audio file.',
    sms: 'Link to send an SMS to the given phone number.',
    whatsapp: 'Link to open a WhatsApp chat with the given phone number.',
    fax: 'Link to send a fax to the given number.',
    custom: 'Link to a custom route or value.',
    advanced: 'Optional. Add anchor links and custom parameters.',
    parameters: 'Optional. Add custom parameters to the URL, such as UTM tags.',
    anchor: 'Optional. Add an anchor to link to a specific section on the page.',
    ...userDescriptions,
  }

  const firstAvailableType =
    (enabledBuiltInLinkTypes.includes('internal') && linkableSchemaTypes.length > 0
      ? 'internal'
      : enabledBuiltInLinkTypes.find((type) => type !== 'internal')) || customLinkTypes[0]?.value

  if (!firstAvailableType) {
    console.warn(
      '[sanity-plugin-link-field] No link types are enabled. ' +
        'Set at least one entry in `enabledBuiltInLinkTypes` or provide `customLinkTypes`.',
    )
  }

  const initialLinkType = firstAvailableType

  const advancedFields = []

  if (enableLinkParameters) {
    advancedFields.push(
      defineField({
        title: 'Parameters',
        name: 'parameters',
        type: 'string',
        description: descriptions.parameters,
        validation: (rule) =>
          rule.custom((value, context) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parentType = (context.parent as any)?.type
            if (!value || isCommunicationType(parentType)) return true
            if (value.indexOf('?') !== 0) {
              return 'Must start with ?; eg. ?utm_source=example.com&utm_medium=referral'
            }
            if (value.length === 1) return 'Must contain at least one parameter'
            return true
          }),
        hidden: ({parent}) => isCommunicationType(parent?.type),
        fieldset: 'advanced',
      }),
    )
  }

  if (enableAnchorLinks) {
    advancedFields.push(
      defineField({
        title: 'Anchor',
        name: 'anchor',
        type: 'string',
        description: descriptions.anchor,
        validation: (rule) =>
          rule.custom((value, context) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const parentType = (context.parent as any)?.type
            if (!value || isCommunicationType(parentType)) return true
            if (value.indexOf('#') !== 0) return 'Must start with #; eg. #page-section-1'
            if (value.length === 1) return 'Must contain at least one character'
            return ANCHOR_REGEX.test(value.replace(/^#/, '')) || 'Invalid URL fragment'
          }),
        hidden: ({parent}) => isCommunicationType(parent?.type),
        fieldset: 'advanced',
      }),
    )
  }

  const linkType = defineType({
    name: 'link',
    title: 'Link',
    type: 'object',
    icon,
    preview: buildPreview(preview, customLinkTypes),
    validation: (rule) =>
      rule.custom((value, context) => {
        const fieldOptions = (context.type as LinkSchemaType).options
        if (!fieldOptions?.enableText || !fieldOptions.requireText) return true
        const text = (value as LinkValue | undefined)?.text
        return text?.trim()
          ? true
          : {
              message: 'Link label is required',
              path: ['text'],
            }
      }),
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
        to: linkableSchemaTypes.map((type) => ({type})),
        weak: weakReferences,
        options: {
          disableNew: true,
          ...referenceFilterOptions,
        },
        description: descriptions.internal,
        hidden: ({parent}) => !!parent?.type && parent?.type !== 'internal',
      }),

      // External
      defineField({
        name: 'url',
        type: 'url',
        description: descriptions.external,
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
        description: descriptions.email,
        hidden: ({parent}) => parent?.type !== 'email',
      }),

      // Phone
      defineField({
        name: 'phone',
        type: 'string',
        description: descriptions.phone,
        validation: (rule) => rule.custom(makePhoneValidator('phone')),
        hidden: ({parent}) => parent?.type !== 'phone',
      }),

      // Document
      defineField({
        name: 'documentLink',
        type: 'file',
        options: {
          storeOriginalFilename: true,
        },
        description: descriptions.document,
        hidden: ({parent}) => parent?.type !== 'document',
      }),

      // Media
      defineField({
        name: 'mediaLink',
        type: 'file',
        options: {
          storeOriginalFilename: true,
          accept: 'image/*,video/*,audio/*',
        },
        description: descriptions.media,
        hidden: ({parent}) => parent?.type !== 'media',
      }),

      // SMS
      defineField({
        name: 'sms',
        type: 'string',
        description: descriptions.sms,
        validation: (rule) => rule.custom(makePhoneValidator('sms')),
        hidden: ({parent}) => parent?.type !== 'sms',
      }),

      // WhatsApp
      defineField({
        name: 'whatsapp',
        type: 'string',
        description: descriptions.whatsapp,
        validation: (rule) => rule.custom(makePhoneValidator('whatsapp')),
        hidden: ({parent}) => parent?.type !== 'whatsapp',
      }),

      // Fax
      defineField({
        name: 'fax',
        type: 'string',
        description: descriptions.fax,
        validation: (rule) => rule.custom(makePhoneValidator('fax')),
        hidden: ({parent}) => parent?.type !== 'fax',
      }),

      // Custom
      defineField({
        name: 'value',
        type: 'string',
        description: descriptions.custom,
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

      ...advancedFields,
    ],
    components: {
      input: (props: ObjectInputProps) => (
        <LinkInput
          customLinkTypes={customLinkTypes}
          enabledBuiltInLinkTypes={enabledBuiltInLinkTypes}
          linkableSchemaTypes={linkableSchemaTypes}
          weakReferences={weakReferences}
          referenceFilterOptions={referenceFilterOptions}
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
