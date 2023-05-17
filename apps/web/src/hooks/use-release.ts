import type { Endpoints } from '@octokit/types'

import useSWR from 'swr'

export type Release =
  Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data']

export type ReleaseAsset = Release['assets'][number]

export const useRelease = () => {
  const { data, ...rest } = useSWR<{
    details: Release
  }>('https://ota.maa.plus/MaaAssistantArknights/api/version/stable.json')

  return {
    data: data?.details,
    ...rest,
  }
}
