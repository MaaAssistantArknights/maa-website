import fs from 'fs'
import path from 'path'

const prettierJsonPath = path.resolve('./.prettierrc')
const prettierJson = JSON.parse(fs.readFileSync(prettierJsonPath, 'utf-8'))

const loadModules = async () => {
  const modules = await Promise.all(
    (prettierJson.plugins || []).map(async (m) => {
      const module = await import(m)
      return module.default || module
    }),
  )
  return modules
}

const modules = await loadModules()
export default {
  ...prettierJson,
  plugins: modules,
}
