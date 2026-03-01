import React, {type ElementType, type ForwardedRef, forwardRef} from 'react'

import {generateHref} from '../helpers/generateHref'
import {getLinkText} from '../helpers/getLinkText'
import {
  isCustomLink,
  isEmailLink,
  isFaxLink,
  isPhoneLink,
  isSMSLink,
  isWhatsAppLink,
} from '../helpers/typeGuards'
import {InternalLink, LinkValue} from '../types'

type LinkProps = {
  link?: LinkValue
  as?: ElementType
  hrefResolver?: (link: InternalLink) => string
} & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href' | 'target'>

const Link = forwardRef(
  (
    {link, as: Component = 'a', hrefResolver, children, ...props}: LinkProps,
    ref: ForwardedRef<HTMLAnchorElement>,
  ) => {
    if (!link) {
      return null
    }

    // If no link text is provided, try and find a fallback
    if (!children) {
      children = getLinkText(link)
    }

    return (
      <Component
        href={
          link.type === 'internal'
            ? generateHref[link.type]?.(link, hrefResolver)
            : generateHref[isCustomLink(link) ? 'custom' : link.type]?.(link)
        }
        target={
          !isPhoneLink(link) &&
          !isEmailLink(link) &&
          !isSMSLink(link) &&
          !isWhatsAppLink(link) &&
          !isFaxLink(link) &&
          link.blank
            ? '_blank'
            : undefined
        }
        ref={ref}
        {...props}
      >
        {children}
      </Component>
    )
  },
)

Link.displayName = 'Link'

export {Link, type LinkProps}
