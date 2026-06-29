import React, {type ElementType, type ForwardedRef, forwardRef, memo} from 'react'
import {type UrlObject} from 'url'

import {generateHref} from '../helpers/generateHref'
import {getLinkText} from '../helpers/getLinkText'
import {isCommunicationLink} from '../helpers/typeGuards'
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
      if (children == null) {
        const fallbackText = getLinkText(link)
        children =
          fallbackText && fallbackText.trim().length > 0 ? fallbackText : link.type || 'Link'
      }

      const resolveHref = (): string | UrlObject => {
        switch (link.type) {
          case 'internal':
            return generateHref.internal(link, hrefResolver)
          case 'document':
            return generateHref.document(link, assetHrefResolver)
          case 'media':
            return generateHref.media(link, assetHrefResolver)
          case 'external':
          case 'email':
          case 'phone':
          case 'sms':
          case 'whatsapp':
          case 'fax':
            return generateHref[link.type](link)
          default:
            return generateHref.custom(link)
        }
      }

      const href = resolveHref()
      const target = !isCommunicationLink(link) && link.blank ? '_blank' : undefined

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
