import {
  AtSignIcon,
  FileIcon,
  GlobeIcon,
  LinkIcon,
  type LucideIcon,
  MessageCircle,
  PhoneIcon,
  Printer,
  SmartphoneIcon,
} from 'lucide-react'
import {type ComponentType} from 'react'

import type {BuiltInLinkType, CustomLinkType, LinkType} from '../types'

const ICON_SIZE = 16
const sizedLucideIconCache = new WeakMap<LucideIcon, ComponentType>()

/**
 * Wrap a lucide ForwardRefExoticComponent in a plain function component
 * so Sanity's preview system recognises it as renderable media
 * (`typeof fn === 'function'`).
 */
export const wrapIcon = (Icon: LucideIcon): ComponentType => {
  function PreviewIcon() {
    return <Icon />
  }
  PreviewIcon.displayName = Icon.displayName || Icon.name
  return PreviewIcon
}

/**
 * Canonical list of built-in link types and their icons.
 * Used by the Studio type selector and preview media fallbacks.
 */
export const DEFAULT_LINK_TYPES: LinkType[] = [
  {title: 'Internal', value: 'internal', icon: LinkIcon},
  {title: 'URL', value: 'external', icon: GlobeIcon},
  {title: 'Email', value: 'email', icon: AtSignIcon},
  {title: 'Phone', value: 'phone', icon: PhoneIcon},
  {title: 'Asset', value: 'asset', icon: FileIcon},
  {title: 'SMS', value: 'sms', icon: MessageCircle},
  {title: 'WhatsApp', value: 'whatsapp', icon: SmartphoneIcon},
  {title: 'Fax', value: 'fax', icon: Printer},
]

export const BUILT_IN_LINK_TYPE_ICONS: Record<BuiltInLinkType, ComponentType> = {
  internal: wrapIcon(LinkIcon),
  external: wrapIcon(GlobeIcon),
  email: wrapIcon(AtSignIcon),
  phone: wrapIcon(PhoneIcon),
  asset: wrapIcon(FileIcon),
  sms: wrapIcon(MessageCircle),
  whatsapp: wrapIcon(SmartphoneIcon),
  fax: wrapIcon(Printer),
}

function isLucideIcon(icon: ComponentType): boolean {
  return DEFAULT_LINK_TYPES.some((type) => type.icon === icon)
}

function createSizedIcon(Icon: LucideIcon): ComponentType {
  function SizedIcon(props: Record<string, unknown>) {
    return <Icon size={ICON_SIZE} {...props} />
  }
  SizedIcon.displayName = `SizedIcon(${Icon.displayName || Icon.name || 'Unknown'})`
  return SizedIcon
}

function getSizedIcon(Icon: LucideIcon): ComponentType {
  const cachedIcon = sizedLucideIconCache.get(Icon)
  if (cachedIcon) return cachedIcon

  const sizedIcon = createSizedIcon(Icon)
  sizedLucideIconCache.set(Icon, sizedIcon)
  return sizedIcon
}

/**
 * Get the icon component for a link type option, wrapping lucide icons to set size.
 */
export function getLinkTypeOptionIcon(type: LinkType): ComponentType {
  if (isLucideIcon(type.icon)) {
    return getSizedIcon(type.icon as LucideIcon)
  }
  return type.icon
}

/**
 * Resolve a preview/media icon for a stored link type value.
 */
export function getIconForLinkType(
  type: string | undefined,
  customLinkTypes: CustomLinkType[],
): ComponentType {
  if (type && type in BUILT_IN_LINK_TYPE_ICONS) {
    return BUILT_IN_LINK_TYPE_ICONS[type as BuiltInLinkType]
  }
  return customLinkTypes.find((ct) => ct.value === type)?.icon ?? BUILT_IN_LINK_TYPE_ICONS.internal
}
