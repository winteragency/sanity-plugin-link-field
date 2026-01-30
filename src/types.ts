import {ComponentType} from 'react'
import type {
  BaseSchemaDefinition,
  CurrentUser,
  ObjectInputProps,
  ObjectSchemaType,
  Path,
  PreviewConfig,
  ReferenceFilterOptions,
  SanityDocument,
} from 'sanity'

export interface CustomizableLink {
  parameters?: string
  anchor?: string
  blank?: boolean
}

export interface InternalLink extends CustomizableLink {
  type: 'internal'
  internalLink?: {
    _type: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

export interface ExternalLink extends CustomizableLink {
  type: 'external'
  url?: string
}

export interface EmailLink {
  type: 'email'
  email?: string
}

export interface PhoneLink {
  type: 'phone'
  phone?: string
}

export interface DocumentLink extends CustomizableLink {
  type: 'document'
  documentLink?: {
    _type: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
}

export interface ImageLink extends CustomizableLink {
  type: 'image'
  imageLink?: {
    _type: 'image'
    asset?: {
      _ref: string
      _type: 'reference'
    }
  }
}

export interface VideoLink extends CustomizableLink {
  type: 'video'
  videoLink?: {
    _type: 'file'
    asset?: {
      _ref: string
      _type: 'reference'
    }
  }
}

export interface AudioLink extends CustomizableLink {
  type: 'audio'
  audioLink?: {
    _type: 'file'
    asset?: {
      _ref: string
      _type: 'reference'
    }
  }
}

export interface SMSLink {
  type: 'sms'
  sms?: string
}

export interface WhatsAppLink {
  type: 'whatsapp'
  whatsapp?: string
}

export interface FaxLink {
  type: 'fax'
  fax?: string
}

export interface CustomLink extends CustomizableLink {
  type: string
  value?: string
}

export type LinkValue = {
  _key?: string
  _type?: 'link'
  text?: string
} & (
  | InternalLink
  | ExternalLink
  | EmailLink
  | PhoneLink
  | DocumentLink
  | ImageLink
  | VideoLink
  | AudioLink
  | SMSLink
  | WhatsAppLink
  | FaxLink
  | CustomLink
)

export interface LinkType {
  title: string
  value: string
  icon: ComponentType
}

export interface CustomLinkTypeOptions {
  title: string
  value: string
}

export interface CustomLinkType extends LinkType {
  options:
    | CustomLinkTypeOptions[]
    | ((
        document: SanityDocument,
        fieldPath: Path,
        user: CurrentUser | null,
      ) => Promise<CustomLinkTypeOptions[]>)
  description?: string
}

/**
 * Global options for the link field plugin
 *
 * @todo: Should be overridable on the field level
 */
export interface LinkFieldPluginOptions {
  /**
   * An array of schema types that should be allowed in internal links.
   * @defaultValue ['page']
   */
  linkableSchemaTypes: string[]

  /**
   * Custom filter options passed to the reference input component for internal links.
   * Use it to filter the documents that should be available for linking, eg. by locale.
   *
   * @see https://www.sanity.io/docs/reference-type#1ecd78ab1655
   * @defaultValue undefined
   */
  referenceFilterOptions?: ReferenceFilterOptions

  /**
   * Make internal links use weak references
   * @see https://www.sanity.io/docs/reference-type#f45f659e7b28
   * @defaultValue false
   */
  weakReferences?: boolean

  /** Override the descriptions of the different subfields. */
  descriptions?: {
    internal?: string
    external?: string
    email?: string
    phone?: string
    document?: string
    image?: string
    video?: string
    audio?: string
    sms?: string
    whatsapp?: string
    fax?: string
    text?: string
    blank?: string
    advanced?: string
    parameters?: string
    anchor?: string
  }

  /**
   * Whether the user should be able to set custom URL parameters for internal and external links.
   * @defaultValue true
   */
  enableLinkParameters?: boolean

  /**
   * Whether the user should be able to set custom anchors (URL fragments) for internal and external links.
   * @defaultValue true
   */
  enableAnchorLinks?: boolean

  /**
   * Any custom link types that should be available in the dropdown.
   *
   * This can be used to allow users to link to pre-defined routes that don't exist within Sanity,
   * such as hardcoded routes in the frontend application, or dynamic content that is pulled in
   * from an external system.
   *
   * The options can be either an array of objects, or a function that, given the current document
   * and link field, returns an array of options. This can be used to dynamically fetch options.
   *
   * @defaultValue []
   *
   * @example
   * ```ts
   * customLinkTypes: [
   *  {
   *    title: 'Archive Page',
   *    value: 'archive',
   *    icon: OlistIcon,
   *    options: [
   *      {
   *        title: 'Blog',
   *        value: '/blog'
   *      },
   *      {
   *        title: 'News',
   *        value: '/news'
   *      }
   *    ]
   *  }
   * ]
   * ```
   */
  customLinkTypes?: CustomLinkType[]

  icon?: BaseSchemaDefinition['icon']

  preview?: PreviewConfig
}

/**
 * Options for an individual link field
 */
export interface LinkFieldOptions {
  /**
   * Whether the link should include an optional field for setting the link text/label.
   * @defaultValue false
   */
  enableText?: boolean

  /**
   * The label for the text input field, if enabled using the `enableText` option.
   * @defaultValue Text
   */
  textLabel?: string
}

export type LinkSchemaType = Omit<ObjectSchemaType, 'options'> & {
  options?: LinkFieldOptions
}

export type LinkInputProps = ObjectInputProps<LinkValue, LinkSchemaType> & {
  customLinkTypes: CustomLinkType[]
}
