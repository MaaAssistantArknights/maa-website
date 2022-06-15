import type { Endpoints } from '@octokit/types';
import useSWR from 'swr';

export type Release =
  Endpoints['GET /repos/{owner}/{repo}/releases/latest']['response']['data'];

export type ReleaseAsset = Release['assets'][number];

export const useRelease = () => {
  return useSWR<Release>(
    'https://api.github.com/repos/MaaAssistantArknights/MaaAssistantArknights/releases/latest'
  );
};
