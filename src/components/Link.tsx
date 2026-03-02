import React, {type ElementType, type ForwardedRef, forwardRef, memo} from 'react'
import {type UrlObject} from 'url'

import {generateHref} from '../helpers/generateHref'
import {getLinkText} from '../helpers/getLinkText'
import {
  isCustomLink,
  isDocumentLink,
  isEmailLink,
  isFaxLink,
  isMediaLink,
  isPhoneLink,
  isSMSLink,
  isWhatsAppLink,
} from '../helpers/typeGuards'
import {DocumentLink, InternalLink, LinkValue, MediaLink} from '../types'

type LinkProps = {
  link?: LinkValue
  as?: ElementType
  hrefResolver?: (link: InternalLink) => string | UrlObject
  assetHrefResolver?: (link: DocumentLink | MediaLink) => string | UrlObject
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target'>

const Link = memo(
  forwardRef(
    (
      {link, as: Component = 'a', hrefResolver, assetHrefResolver, children, ...props}: LinkProps,
      ref: ForwardedRef<HTMLAnchorElement>,
    ) => {
      if (!link) {
        return null
      }

      // If no link text is provided, try and find a fallback
      if (!children) {
        const fallbackText = getLinkText(link)
        children =
          fallbackText && fallbackText.trim().length > 0 ? fallbackText : link.type || 'Link'
      }

      const href =
        link.type === 'internal'
          ? generateHref.internal(link, hrefResolver)
          : isDocumentLink(link)
            ? generateHref.document(link, assetHrefResolver)
            : isMediaLink(link)
              ? generateHref.media(link, assetHrefResolver)
              : generateHref[isCustomLink(link) ? 'custom' : link.type]?.(link)

      const target =
        !isPhoneLink(link) &&
        !isEmailLink(link) &&
        !isSMSLink(link) &&
        !isWhatsAppLink(link) &&
        !isFaxLink(link) &&
        link.blank
          ? '_blank'
          : undefined

      return (
        <Component
          href={href}
          target={target}
          rel={target === '_blank' ? 'noopener noreferrer' : undefined}
          ref={ref}
          {...props}
        >
          {children}
        </Component>
      )
    },
  ),
)

Link.displayName = 'Link'

export {Link, type LinkProps}
