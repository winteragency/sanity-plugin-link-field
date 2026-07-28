import {render, screen} from '@testing-library/react'
import React from 'react'
import {describe, expect, it} from 'vitest'

import type {LinkValue} from '../types'
import {Link} from './Link'

describe('Link', () => {
  it('returns null when link is missing', () => {
    const {container} = render(React.createElement(Link))

    expect(container).toBeEmptyDOMElement()
  })

  it('renders external links', () => {
    render(
      React.createElement(
        Link,
        {
          link: {
            type: 'external',
            url: 'https://example.com',
            blank: true,
          },
        },
        'Visit site',
      ),
    )

    const anchor = screen.getByRole('link', {name: 'Visit site'})

    expect(anchor).toHaveAttribute('href', 'https://example.com')
    expect(anchor).toHaveAttribute('target', '_blank')
  })

  it('renders email links without target blank', () => {
    render(
      React.createElement(
        Link,
        {
          link: {
            type: 'email',
            email: 'hello@example.com',
            blank: true,
          },
        },
        'Email us',
      ),
    )

    const anchor = screen.getByRole('link', {name: 'Email us'})

    expect(anchor).toHaveAttribute('href', 'mailto:hello@example.com')
    expect(anchor).not.toHaveAttribute('target')
  })

  it('renders phone links without target blank', () => {
    render(
      React.createElement(
        Link,
        {
          link: {
            type: 'phone',
            phone: '+47 12 34 56 78',
          },
        },
        'Call us',
      ),
    )

    expect(screen.getByRole('link', {name: 'Call us'})).toHaveAttribute('href', 'tel:+4712345678')
  })

  it('renders internal links using hrefResolver', () => {
    render(
      React.createElement(
        Link,
        {
          link: {
            type: 'internal',
            internalLink: {_type: 'page', slug: {current: 'about'}},
            parameters: '?ref=nav',
            anchor: '#team',
          },
          hrefResolver: () => '/about-us',
        },
        'About',
      ),
    )

    expect(screen.getByRole('link', {name: 'About'})).toHaveAttribute(
      'href',
      '/about-us?ref=nav#team',
    )
  })

  it('falls back to link text when children are not provided', () => {
    render(
      React.createElement(Link, {
        link: {
          type: 'external',
          url: 'https://example.com',
          text: 'Example',
        },
      }),
    )

    expect(screen.getByRole('link', {name: 'Example'})).toBeInTheDocument()
  })

  it('renders custom link types', () => {
    const link = {
      type: 'archive',
      value: '/blog',
    } as LinkValue

    render(React.createElement(Link, {link}, 'Archive'))

    expect(screen.getByRole('link', {name: 'Archive'})).toHaveAttribute('href', '/blog')
  })
})
