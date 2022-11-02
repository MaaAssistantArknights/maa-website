import moment from 'moment'

export const pad = (n: number, width?: number, z?: string) => {
  z = z || '0'
  width = width || 2
  const nstr = n.toString()
  return nstr.padStart(width, z)
}

export const formatDate = (date: string) =>
  moment(date).format('YYYY-MM-DD HH:mm')
