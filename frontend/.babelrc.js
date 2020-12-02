module.exports = {
    presets: [
        [
          '@babel/preset-env',
          {
            modules: false,
            targets: {
              browsers: ['> 1% in KR']
            }
          }
        ],
      '@babel/preset-typescript'
    ],
    env: {
      test: {
        presets: [["@babel/preset-env"], "@babel/preset-typescript"]
      }
    },
    plugins: ['@babel/plugin-transform-runtime','@babel/plugin-proposal-class-properties', '@babel/proposal-object-rest-spread']
}
