// Duro is linked from ../../packages, whose own node_modules hold the
// workspace's copies of React and react-strict-dom. Resolve the runtime peers
// from this app instead, as Happier's resolveRequest does, so the bundle has
// one React renderer and one react-strict-dom (its theme context and
// css.defineVars registry). No babel config: babel-preset-expo is Expo's
// default and compiles Duro's source alone (react-strict-dom's preset adds
// nothing on native, measured in Happier's N0.0 build check).
import path from 'node:path'
import {fileURLToPath} from 'node:url'
import expoMetroConfig from 'expo/metro-config.js'

const appRoot = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(appRoot, '../..')
const config = expoMetroConfig.getDefaultConfig(appRoot)

config.watchFolders = [path.join(repoRoot, 'packages/ui'), path.join(repoRoot, 'packages/tokens')]

// The native peers (react-native-*, Skia) also come from the app, which links
// their native code: a copy resolved from packages/ui would be a second one.
const pinned =
  /^(react|react-dom|react-native(?:-[a-z-]+)?|@shopify\/react-native-skia|react-strict-dom|react-hook-form|@duro-app\/[^/]+)(?:\/|$)/u
const appEntry = path.join(appRoot, 'package.json')
const defaultResolveRequest = config.resolver.resolveRequest

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const from = pinned.test(moduleName) ? {...context, originModulePath: appEntry} : context
  return defaultResolveRequest
    ? defaultResolveRequest(from, moduleName, platform)
    : from.resolveRequest(from, moduleName, platform)
}

export default config
