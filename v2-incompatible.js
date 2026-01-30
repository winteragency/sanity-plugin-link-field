import {showIncompatiblePluginDialog} from '@sanity/incompatible-plugin'
import pkg from './package.json' with {type: 'json'}

export default showIncompatiblePluginDialog({
  name: pkg.name,
  versions: {
    v3: pkg.version,
    v2: undefined,
  },
  sanityExchangeUrl: pkg.sanityExchangeUrl,
})
