import type { Config } from "jest";

const config: Config = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testRegex: "__tests__/.*.e2e.test.ts$",
  // testTimeout: 100000,
  modulePaths: ["<rootDir>src"],
  reporters: [
    "default",
    [
      "./node_modules/jest-html-reporters",
      {
        publicPath: "<rootDir>/reports/unit",
        filename: "report.html",
        openReport: true,
        inlineSource: true,
      },
    ],
  ],
};

export default config;