module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^react-native$': '<rootDir>/test-mocks/react-native.js',
    '^react-native-svg$': '<rootDir>/test-mocks/react-native-svg.js',
    '^react-native-webview$': '<rootDir>/test-mocks/react-native-webview.js',
  },
};
