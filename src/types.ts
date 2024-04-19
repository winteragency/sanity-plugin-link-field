import {ComponentType} from 'react'
import type {CurrentUser, Path, SanityDocument} from 'sanity'

export interface CustomizableLink {
  parameters?: string
  anchor?: string
}

export interface InternalLink extends CustomizableLink {
  type: 'internal'
  internalLink?: {
    _type: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [key: string]: any
  }
  blank?: boolean
}

export interface ExternalLink extends CustomizableLink {
  type: 'external'
  url?: string
  blank?: boolean
}

export interface EmailLink {
  type: 'email'
  email?: string
}

export interface PhoneLink {
  type: 'phone'
  phone?: string
}

export interface CustomLink extends CustomizableLink {
  type: string
  value?: string
  blank?: boolean
}

export type LinkValue = {
  _key?: string
  _type?: 'link'
} & (InternalLink | ExternalLink | EmailLink | PhoneLink | CustomLink)

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
 * Options for the link field plugin
 *
 * @todo: Should be overridable on the field level
 */
export interface LinkFieldOptions {
  /** An array of schema types that should be allowed in internal links.
   * @defaultValue ['page']
   */
  linkableSchemaTypes: string[]

  /** Override the descriptions of the different link types. */
  descriptions?: {
    internal?: string
    external?: string
    email?: string
    phone?: string
    blank?: string
    advanced?: string
    parameters?: string
    anchor?: string
  }

  /** Whether the user should be able to set custom URL parameters for internal and external links.
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
}
