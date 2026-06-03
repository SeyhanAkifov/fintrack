import type { Config } from "jest";

const config: Config = {
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
    "^.+\\.css$": "<rootDir>/__mocks__/styleMock.js",
  },
  transform: {
    "^.+\\.(t|j)sx?$": [
      "ts-jest",
      {
        tsconfig: {
          jsx: "react-jsx",
          esModuleInterop: true,
          rootDir: ".",
          paths: { "@/*": ["./src/*"] },
          moduleResolution: "bundler",
          module: "esnext",
          ignoreDeprecations: "6.0",
        },
      },
    ],
  },
  testMatch: ["**/__tests__/**/*.test.(ts|tsx)"],
};

export default config;
