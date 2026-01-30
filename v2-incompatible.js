import {createRequire} from 'module'

import {showIncompatiblePluginDialog} from '@sanity/incompatible-plugin'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

export default showIncompatiblePluginDialog({
  name: pkg.name,
  versions: {
    v3: pkg.version,
    v2: undefined,
  },
  sanityExchangeUrl: pkg.sanityExchangeUrl,
})
