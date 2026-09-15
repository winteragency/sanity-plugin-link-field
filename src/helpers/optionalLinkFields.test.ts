import type {ObjectMember} from 'sanity'
import {describe, expect, it} from 'vitest'

import {
  filterOptionalLinkFieldMembers,
  resolveOptionalLinkFieldVisibility,
} from './optionalLinkFields'

const field = (name: string) => ({kind: 'field', key: name, name}) as unknown as ObjectMember

const advancedFieldset = (...names: string[]) =>
  ({
    kind: 'fieldSet',
    key: 'fieldset:advanced',
    fieldSet: {name: 'advanced', members: names.map(field)},
  }) as unknown as ObjectMember

const names = (members: ObjectMember[]): string[] =>
  members.flatMap((member) =>
    member.kind === 'fieldSet'
      ? [`fieldset:${member.fieldSet.name}`, ...member.fieldSet.members.map((m) => m.key)]
      : [member.key],
  )

describe('resolveOptionalLinkFieldVisibility', () => {
  it('shows every optional field by default', () => {
    expect(resolveOptionalLinkFieldVisibility()).toEqual({
      blank: true,
      parameters: true,
      anchor: true,
    })
  })

  it('applies plugin-level options', () => {
    expect(
      resolveOptionalLinkFieldVisibility({enableNewTab: false, enableAnchorLinks: false}),
    ).toEqual({blank: false, parameters: true, anchor: false})
  })

  it('lets field-level options override plugin-level options', () => {
    expect(
      resolveOptionalLinkFieldVisibility(
        {enableNewTab: true, enableLinkParameters: true},
        {enableNewTab: false, enableLinkParameters: false},
      ),
    ).toEqual({blank: false, parameters: false, anchor: true})
  })

  it('lets a field re-enable what the plugin turned off', () => {
    expect(
      resolveOptionalLinkFieldVisibility({enableAnchorLinks: false}, {enableAnchorLinks: true}),
    ).toEqual({blank: true, parameters: true, anchor: true})
  })
})

describe('filterOptionalLinkFieldMembers', () => {
  const members = [
    field('text'),
    field('type'),
    field('blank'),
    advancedFieldset('parameters', 'anchor'),
  ]

  it('keeps every member when all optional fields are visible', () => {
    const visibility = {blank: true, parameters: true, anchor: true}

    expect(names(filterOptionalLinkFieldMembers(members, visibility))).toEqual([
      'text',
      'type',
      'blank',
      'fieldset:advanced',
      'parameters',
      'anchor',
    ])
  })

  it('removes hidden fields from inside the fieldset', () => {
    const visibility = {blank: true, parameters: false, anchor: true}

    expect(names(filterOptionalLinkFieldMembers(members, visibility))).toEqual([
      'text',
      'type',
      'blank',
      'fieldset:advanced',
      'anchor',
    ])
  })

  it('drops the fieldset once it has no members left', () => {
    const visibility = {blank: true, parameters: false, anchor: false}

    expect(names(filterOptionalLinkFieldMembers(members, visibility))).toEqual([
      'text',
      'type',
      'blank',
    ])
  })

  it('removes the new tab toggle and never the link fields themselves', () => {
    const visibility = {blank: false, parameters: false, anchor: false}

    expect(names(filterOptionalLinkFieldMembers(members, visibility))).toEqual(['text', 'type'])
  })
})
