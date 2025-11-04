const fs = require('fs')
const path = require('path')

const prettierJsonPath = path.resolve('./.prettierrc')
const prettierJson = JSON.parse(fs.readFileSync(prettierJsonPath, 'utf-8'))

const modules = (prettierJson.plugins || []).map((p) => require(p))

module.exports = {
  ...prettierJson,
  plugins: modules,
}
