module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [["inline-import", { extensions: [".sql"] }]],
  };
};

// npx eas build --platform android --profile preview
// npx eas update --channel preview --message "new 1.0.1 version" -p android
