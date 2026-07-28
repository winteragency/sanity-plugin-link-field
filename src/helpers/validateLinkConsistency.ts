import type {LinkValue} from '../types'

type LinkFields = {
  type?: string
  internalLink?: {_ref?: string}
  url?: string
}

function hasInternalReference(link: LinkFields): boolean {
  const ref = link.internalLink?._ref
  return typeof ref === 'string' && ref.length > 0
}

/**
 * Validates that the link `type` matches populated link value fields.
 */
export function validateLinkTypeConsistency(link: LinkValue | undefined): true | string {
  if (!link?.type) {
    return true
  }

  const fields = link as LinkFields
  const hasInternalRef = hasInternalReference(fields)
  const hasUrl = typeof fields.url === 'string' && fields.url.length > 0

  if (fields.type === 'external' && hasInternalRef && !hasUrl) {
    return 'Link type is URL but an internal document reference is set. Select Internal or clear the reference.'
  }

  if (fields.type === 'internal' && hasUrl && !hasInternalRef) {
    return 'Link type is Internal but a URL is set. Select URL or clear the URL.'
  }

  return true
}
