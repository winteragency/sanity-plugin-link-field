import {useEffect, useState} from 'react'
import {type Path, type SanityDocument, useFormValue, useWorkspace} from 'sanity'

import {CustomLinkType, CustomLinkTypeOptions} from '../types'

/**
 * Render a list of options for a custom link type.
 * Handles both static and dynamic options.
 */
export function CustomLinkOptions({
  options,
  path,
  value,
}: {
  options: CustomLinkType['options']
  path: Path
  value: string
}) {
  const workspace = useWorkspace()
  const document = useFormValue([]) as SanityDocument

  const [renderedOptions, setRenderedOptions] = useState<CustomLinkTypeOptions[] | null>(null)

  useEffect(() => {
    if (Array.isArray(options)) {
      setRenderedOptions(options)
    } else {
      options(document, path, workspace.currentUser).then((options) => setRenderedOptions(options))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, path, workspace.currentUser])

  return renderedOptions ? (
    <>
      <option value="" selected={value === ''} disabled hidden />
      {renderedOptions.map((option) => (
        <option key={option.value} value={option.value} selected={value === option.value}>
          {option.title}
        </option>
      ))}
    </>
  ) : null
}
