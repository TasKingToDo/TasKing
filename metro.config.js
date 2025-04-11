const { getDefaultConfig } = require('metro-config');

module.exports = (async () => {
  const {
    resolver: { sourceExts, assetExts }
  } = await getDefaultConfig();

    const { getDefaultConfig } = require("expo/metro-config");

    const defaultConfig = getDefaultConfig(__dirname);
    defaultConfig.resolver.assetExts = defaultConfig.resolver.assetExts.filter(ext => ext !== "svg");
    defaultConfig.resolver.sourceExts.push("svg");
    defaultConfig.transformer.babelTransformerPath = require.resolve("react-native-svg-transformer");

    module.exports = defaultConfig;


  return {
    transformer: {
      // Enable inline requires for better cold start on production
      inlineRequires: true,
      // Enable minification (default)
      minifierConfig: {
        mangle: {
          toplevel: true,
        },
        output: {
          ascii_only: true,
          quote_style: 3,
        },
        compress: {
          unused: true,
          dead_code: true,
          toplevel: true,
        },
      }
    },
    resolver: {
      assetExts: assetExts.filter(ext => ext !== 'svg'),
      sourceExts: [...sourceExts, 'svg', 'cjs'],
    },
  };
})();
