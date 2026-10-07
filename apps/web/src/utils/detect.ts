import { MEOW_RELEASES_PAGE } from '@/hooks/use-meow-release'
import { Release, ReleaseAsset } from '@/hooks/use-release'
import mdiAndroid from '@iconify/icons-mdi/android'
import mdiApple from '@iconify/icons-mdi/apple'
import mdiLinux from '@iconify/icons-mdi/linux'
import mdiWindows from '@iconify/icons-mdi/windows'
import type { IconifyIcon } from '@iconify/react'

export type ReleaseSource = 'maa' | 'meow'

export interface PlatformPredicate {
  id: string
  // 未指定时为 MAA 本体
  source?: ReleaseSource
  icon: IconifyIcon
  title: string
  subtitle: string
  assetMatcher: (release: Release) => ReleaseAsset | undefined
  fallbackHref?: string
}

export const PLATFORMS: PlatformPredicate[] = [
  {
    id: 'windows-x64',
    icon: mdiWindows,
    title: 'platforms.windows-x64.title',
    subtitle: 'platforms.windows-x64.subtitle',
    assetMatcher: (release) => {
      return release.assets.find((el) => /^MAA-v.*-win-x64\.zip/.test(el.name))
    },
  },
  {
    id: 'windows-arm64',
    icon: mdiWindows,
    title: 'platforms.windows-arm64.title',
    subtitle: 'platforms.windows-arm64.subtitle',
    assetMatcher: (release) => {
      return release.assets.find((el) =>
        /^MAA-v.*-win-arm64\.zip/.test(el.name),
      )
    },
  },
  {
    id: 'macos-universal',
    icon: mdiApple,
    title: 'platforms.macos-universal.title',
    subtitle: 'platforms.macos-universal.subtitle',
    assetMatcher: (release) => {
      return release.assets.find((el) =>
        /^MAA-v.*-macos-universal\.dmg/.test(el.name),
      )
    },
  },
  {
    id: 'linux-x64',
    icon: mdiLinux,
    title: 'platforms.linux-x64.title',
    subtitle: 'platforms.linux-x64.subtitle',
    assetMatcher: (release) => {
      return release.assets.find((el) =>
        /^MAA-v.*-linux-x86_64\.tar\.gz/.test(el.name),
      )
    },
  },
  {
    id: 'linux-aarch64',
    icon: mdiLinux,
    title: 'platforms.linux-aarch64.title',
    subtitle: 'platforms.linux-aarch64.subtitle',
    assetMatcher: (release) => {
      return release.assets.find((el) =>
        /^MAA-v.*-linux-aarch64\.tar\.gz/.test(el.name),
      )
    },
  },
  {
    id: 'android-universal',
    source: 'meow',
    icon: mdiAndroid,
    title: 'platforms.android-universal.title',
    subtitle: 'platforms.android-universal.subtitle',
    assetMatcher: (release) => {
      return release.assets.find((el) =>
        /^MaaMeow-v.*-universal\.apk$/.test(el.name),
      )
    },
    fallbackHref: MEOW_RELEASES_PAGE,
  },
]

// detectPlatform detects the platform of the current user and returns the
// corresponding platform ID. The detector should be as accurate as possible,
// and it should take account the user's architecture and OS.
// The more modern navigator.userAgentData should be used if available.
export const DetectionFailedSymbol = Symbol('detectionFailed')
export const detectPlatform = async (): Promise<
  string | typeof DetectionFailedSymbol
> => {
  if (typeof navigator === 'undefined') {
    return DetectionFailedSymbol
  }

  let userAgentData:
    | {
        platform: string
        architecture: string
      }
    | undefined

  try {
    userAgentData = await navigator.userAgentData?.getHighEntropyValues([
      'platform',
      'architecture',
    ])
  } catch {
    // Some browsers expose userAgentData but reject high-entropy hints.
    // Continue with the User-Agent fallback below instead of leaving the
    // download area stuck in the detecting state.
  }

  if (userAgentData) {
    const { platform, architecture } = userAgentData

    if (platform === 'Android') {
      return 'android-universal'
    }

    if (platform === 'macOS') {
      return 'macos-universal'
    }

    if (platform === 'Windows') {
      if (architecture.startsWith('arm')) {
        return 'windows-arm64'
      }
      return 'windows-x64'
    }

    if (platform === 'Linux') {
      if (architecture.startsWith('arm')) {
        return 'linux-aarch64'
      }
      return 'linux-x64'
    }
  }

  const { userAgent } = navigator

  const lowerCaseUA = userAgent.toLowerCase()

  if (lowerCaseUA.includes('windows')) {
    if (lowerCaseUA.includes('arm')) {
      return 'windows-arm64'
    }
    return 'windows-x64'
  }

  if (lowerCaseUA.includes('macintosh')) {
    return 'macos-universal'
  }

  // Android 的 UA 通常也包含 Linux，需要先于 Linux 判断
  if (lowerCaseUA.includes('android')) {
    return 'android-universal'
  }

  if (lowerCaseUA.includes('linux')) {
    if (lowerCaseUA.includes('aarch64') || lowerCaseUA.includes('arm64')) {
      return 'linux-aarch64'
    }
    return 'linux-x64'
  }

  return DetectionFailedSymbol
}

export interface ResolvedPlatform {
  platform: PlatformPredicate
  href: string
  releaseName: string | null
  downloadCount?: number
}
