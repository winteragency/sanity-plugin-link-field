import {screen} from '@testing-library/react'
import {describe, expect, it} from 'vitest'

import {linkField} from '../linkField'
import type {LinkFieldOptions} from '../types'

import {renderDocumentForm} from './formHarness'
import {demoWithLinkOptions, page} from './schemaFixtures'

/**
 * Which fields a given set of options resolves to is covered by the unit tests
 * for `optionalLinkFields` and `linkField`. These tests only check that the
 * resolved options reach the rendered form.
 */
async function renderLinkField(fieldOptions?: LinkFieldOptions) {
  await renderDocumentForm({
    config: {
      name: 'test',
      plugins: [linkField()],
      schema: {types: [page, demoWithLinkOptions(fieldOptions)]},
    },
    documentType: 'demo',
    documentValue: {link: {_type: 'link', type: 'internal'}},
  })

  // The form renders behind a loading skeleton until the Studio locale resolves.
  await screen.findByRole('button', {name: /Select link type/}, {timeout: 10000})
}

const allOff: LinkFieldOptions = {
  enableNewTab: false,
  enableLinkParameters: false,
  enableAnchorLinks: false,
}

describe('link field options', () => {
  it('shows the new tab toggle and the advanced fieldset by default', async () => {
    await renderLinkField()

    expect(screen.getByText('Open in new window')).toBeInTheDocument()
    expect(screen.getByText('Advanced')).toBeInTheDocument()
  })

  it('hides the fields a field turns off', async () => {
    await renderLinkField(allOff)

    expect(screen.queryByText('Open in new window')).not.toBeInTheDocument()
    expect(screen.queryByText('Advanced')).not.toBeInTheDocument()
  })

  it('keeps the link type selector and link input when every optional field is off', async () => {
    await renderLinkField(allOff)

    expect(screen.getByRole('button', {name: /Select link type/})).toBeInTheDocument()
    expect(screen.getByTestId('reference-input')).toBeInTheDocument()
  })
})
