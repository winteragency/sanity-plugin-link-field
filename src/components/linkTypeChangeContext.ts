import {createContext} from 'react'

/**
 * Object-scoped type-change handler provided by {@link LinkInput}.
 * Using the link object's onChange keeps unset patches on sibling fields
 * (`url`, `internalLink`, …) instead of nesting them under `type`.
 */
export const LinkTypeChangeContext = createContext<((nextType: string) => void) | null>(null)
