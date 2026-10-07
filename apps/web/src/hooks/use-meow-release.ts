import useSWR from 'swr'

import type { Release } from './use-release'

export const MEOW_RELEASES_PAGE =
  'https://github.com/Aliothmoon/MAA-Meow/releases/latest'

// GitHub API 匿名请求会被限流，需校验响应；且不走全局 suspense，避免失败时影响 MAA 本体
const fetchRelease = async (url: string): Promise<Release> => {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`GitHub API responded with ${response.status}`)
  }
  const data = await response.json()
  if (!Array.isArray(data?.assets)) {
    throw new Error('Unexpected GitHub release payload')
  }
  return data
}

export const useMeowRelease = () =>
  useSWR<Release>(
    'https://api.github.com/repos/Aliothmoon/MAA-Meow/releases/latest',
    fetchRelease,
    {
      suspense: false,
      revalidateOnFocus: false,
      shouldRetryOnError: false,
    },
  )
