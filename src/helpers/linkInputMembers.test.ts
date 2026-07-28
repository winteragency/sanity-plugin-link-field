import type {FieldMember, ObjectMember} from 'sanity'
import {describe, expect, it} from 'vitest'

import {resolveLinkInputMembers} from './linkInputMembers'

function fieldMember(name: string): FieldMember {
  return {
    kind: 'field',
    key: name,
    name,
  } as FieldMember
}

function fieldsetMember(key: string): ObjectMember {
  return {
    kind: 'fieldset',
    key,
    name: key,
  } as unknown as ObjectMember
}

describe('resolveLinkInputMembers', () => {
  it('returns empty otherFields when members is undefined', () => {
    const result = resolveLinkInputMembers(undefined, {type: 'internal'})

    expect(result.textField).toBeUndefined()
    expect(result.typeField).toBeUndefined()
    expect(result.linkField).toBeUndefined()
    expect(result.otherFields).toEqual([])
  })

  it('resolves fields by name regardless of member order', () => {
    const textField = fieldMember('text')
    const typeField = fieldMember('type')
    const internalLinkField = fieldMember('internalLink')
    const blankField = fieldMember('blank')

    const result = resolveLinkInputMembers([blankField, internalLinkField, typeField, textField], {
      type: 'internal',
    })

    expect(result.textField).toBe(textField)
    expect(result.typeField).toBe(typeField)
    expect(result.linkField).toBe(internalLinkField)
    expect(result.otherFields).toEqual([blankField])
  })

  it('excludes inactive link-type fields from otherFields', () => {
    const typeField = fieldMember('type')
    const internalLinkField = fieldMember('internalLink')
    const urlField = fieldMember('url')
    const emailField = fieldMember('email')
    const blankField = fieldMember('blank')

    const result = resolveLinkInputMembers(
      [typeField, internalLinkField, urlField, emailField, blankField],
      {type: 'internal'},
    )

    expect(result.linkField).toBe(internalLinkField)
    expect(result.otherFields).toEqual([blankField])
  })

  it('preserves fieldsets and unknown members in otherFields', () => {
    const typeField = fieldMember('type')
    const urlField = fieldMember('url')
    const advancedFieldset = fieldsetMember('advanced')

    const result = resolveLinkInputMembers([advancedFieldset, typeField, urlField], {
      type: 'external',
    })

    expect(result.linkField).toBe(urlField)
    expect(result.otherFields).toEqual([advancedFieldset])
  })

  it('switches the active link field when value.type changes', () => {
    const typeField = fieldMember('type')
    const internalLinkField = fieldMember('internalLink')
    const urlField = fieldMember('url')
    const members = [typeField, internalLinkField, urlField]

    const internalResult = resolveLinkInputMembers(members, {
      type: 'internal',
    })
    expect(internalResult.linkField).toBe(internalLinkField)

    const externalResult = resolveLinkInputMembers(members, {
      type: 'external',
    })
    expect(externalResult.linkField).toBe(urlField)
  })

  it('defaults to internalLink when type is missing', () => {
    const typeField = fieldMember('type')
    const internalLinkField = fieldMember('internalLink')

    const result = resolveLinkInputMembers([typeField, internalLinkField], undefined)

    expect(result.linkField).toBe(internalLinkField)
  })

  it('selects email, phone, and custom link fields by type', () => {
    const typeField = fieldMember('type')
    const emailField = fieldMember('email')
    const phoneField = fieldMember('phone')
    const valueField = fieldMember('value')
    const members = [typeField, emailField, phoneField, valueField]

    expect(resolveLinkInputMembers(members, {type: 'email'}).linkField).toBe(emailField)
    expect(resolveLinkInputMembers(members, {type: 'phone'}).linkField).toBe(phoneField)
    expect(resolveLinkInputMembers(members, {type: 'archive'}).linkField).toBe(valueField)
  })

  it('selects asset and communication link fields by type', () => {
    const typeField = fieldMember('type')
    const assetLinkField = fieldMember('assetLink')
    const smsField = fieldMember('sms')
    const whatsappField = fieldMember('whatsapp')
    const faxField = fieldMember('fax')
    const blankField = fieldMember('blank')
    const members = [typeField, assetLinkField, smsField, whatsappField, faxField, blankField]

    expect(resolveLinkInputMembers(members, {type: 'asset'}).linkField).toBe(assetLinkField)
    expect(resolveLinkInputMembers(members, {type: 'sms'}).linkField).toBe(smsField)
    expect(resolveLinkInputMembers(members, {type: 'whatsapp'}).linkField).toBe(whatsappField)
    expect(resolveLinkInputMembers(members, {type: 'fax'}).linkField).toBe(faxField)
  })

  it('excludes inactive new link-type fields from otherFields', () => {
    const typeField = fieldMember('type')
    const assetLinkField = fieldMember('assetLink')
    const smsField = fieldMember('sms')
    const blankField = fieldMember('blank')

    const result = resolveLinkInputMembers([typeField, assetLinkField, smsField, blankField], {
      type: 'asset',
    })

    expect(result.linkField).toBe(assetLinkField)
    expect(result.otherFields).toEqual([blankField])
  })
})
