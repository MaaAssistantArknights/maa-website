module.exports = {
  root: true,
  extends: ['maa'],
  settings: {
    next: {
      rootDir: ['apps/*/'],
    },
  },
  ignorePatterns: ['*/node_modules/*', '*/dist/*', '*/build/*'],
};
