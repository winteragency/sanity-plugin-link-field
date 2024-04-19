import React, {type ElementType, type ForwardedRef, forwardRef} from 'react'

import {
  isCustomLink,
  isEmailLink,
  isExternalLink,
  isInternalLink,
  isPhoneLink,
} from '../helpers/typeGuards'
import {InternalLink, LinkValue} from '../types'

const generateHref = {
  internal: (link: LinkValue, hrefResolver?: (link: InternalLink) => string) =>
    isInternalLink(link) && link.internalLink
      ? hrefResolver
        ? hrefResolver(link)
        : `/${link.internalLink.slug?.current}`
      : '#',
  external: (link: LinkValue) =>
    isExternalLink(link) && link.url
      ? link.url.trim() + (link.parameters?.trim() || '') + (link.anchor?.trim() || '')
      : '#',
  email: (link: LinkValue) =>
    isEmailLink(link) && link.email ? `mailto:${link.email.trim()}` : '#',
  phone: (link: LinkValue) =>
    isPhoneLink(link) && link.phone
      ? // Tel links cannot contain spaces
        `tel:${link.phone?.replace(/\s+/g, '').trim()}`
      : '#',
  custom: (link: LinkValue) =>
    isCustomLink(link) && link.value
      ? link.value.trim() + (link.parameters?.trim() || '') + (link.anchor?.trim() || '')
      : '#',
}

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

    return (
      <Component
        href={
          link.type === 'internal'
            ? generateHref[link.type]?.(link, hrefResolver)
            : generateHref[isCustomLink(link) ? 'custom' : link.type]?.(link)
        }
        target={!isPhoneLink(link) && !isEmailLink(link) && link.blank ? '_blank' : undefined}
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
