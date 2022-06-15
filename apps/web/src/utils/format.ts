export const pad = (n: number, width?: number, z?: string) => {
  z = z || '0'
  width = width || 2
  const nstr = n.toString()
  return nstr.padStart(width, z)
}
export const formatDate = (date: string) => {
  const d = new Date(date)
  return `${d.getFullYear()}.${d.getMonth() + 1}.${d.getDate()} ${pad(
    d.getHours(),
  )}:${pad(d.getMinutes())}`
}
