import { GlowButton } from '@/components/foundations/GlowButton/GlowButton'
import { Release, ReleaseAsset, useRelease } from '@/hooks/use-release'
import mdiAlertCircle from '@iconify/icons-mdi/alert-circle'
import mdiCheck from '@iconify/icons-mdi/check'
import mdiLoading from '@iconify/icons-mdi/loading'
import mdiWindows from '@iconify/icons-mdi/windows'
import type { IconifyIcon } from '@iconify/react'
import { Icon } from '@iconify/react'

import clsx from 'clsx'
import moment from 'moment'
import {
  Component,
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'

import { downloadBlob } from '../../../utils/blob'
import { download } from '../../../utils/fetch'
import { formatBytes } from '../../../utils/format'

const GITHUB_MIRRORS = [
  // {
  //   name: '99988866',
  //   transform: (original: URL) =>
  //     `https://gh.api.99988866.xyz/${original.toString()}`,
  // },
  {
    name: 'agent.imgg.dev',
    transform: (original: URL) => `https://agent.imgg.dev${original.pathname}`,
  },
  {
    name: 'maverick',
    transform: (original: URL) => `https://qz.minasan.xyz${original.pathname}`,
  },
  {
    name: 'ghproxy',
    transform: (original: URL) => `https://ghproxy.com/${original.toString()}`,
  },
  {
    name: 'origin',
    transform: (original: URL) => original.toString(),
  },
]

const DataLoadRate: FC<{ loaded: number; total: number }> = ({
  loaded,
  total,
}) => {
  const percentage = useMemo(() => {
    const percentage = (loaded / total) * 100
    return percentage > 100 ? 100 : percentage
  }, [loaded, total])

  return (
    <div className="flex flex-row items-center justify-center gap-2 font-mono">
      <div className="flex flex-col items-start justify-center gap-1">
        <div className="text-sm">{percentage.toFixed(0)}%</div>
        <div className="w-12 h-1 bg-white/10 rounded-full">
          <div
            className="h-full rounded-full bg-white"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col items-end justify-center">
        <div className="text-sm">{formatBytes(loaded, 1)}</div>
        <div className="text-sm">{formatBytes(total, 1)}</div>
      </div>
    </div>
  )
}

export const DownloadState: FC<{
  icon: IconifyIcon
  iconClassName?: string
  title: ReactNode
  className?: string
}> = ({ icon, iconClassName, title, className }) => {
  return (
    <div
      className={clsx(
        'flex py-6 px-3 flex-col items-center justify-center text-white font-normal',
        className,
      )}
    >
      <div className="flex items-center -ml-1">
        <Icon className={iconClassName} icon={icon} fontSize="28px" />
        <span className="ml-2">{title}</span>
      </div>
    </div>
  )
}

interface PlatformPredicate {
  icon: IconifyIcon
  title: string
  assetMatcher: (release: Release) => ReleaseAsset | undefined
}

const predicates: PlatformPredicate[] = [
  {
    icon: mdiWindows,
    title: 'Windows',
    assetMatcher: (release) => {
      return release.assets.find((el) => /^MAA-v.*\.zip/.test(el.name))
    },
  },
]

interface ResolvedPlatform {
  asset: ReleaseAsset
  platform: PlatformPredicate
}

type DownloadDetectionStates =
  | {
      state: 'idle'
    }
  | {
      state: 'detecting'
      detected: number
    }
  | {
      state: 'downloading'
      mirrorIndex: number
      progressDownloaded: number
      progressTotal: number
    }
  | {
      state: 'downloaded'
    }
  | {
      state: 'fallback'
    }

const DownloadButton: FC<{ href: string; children: ReactNode }> = ({
  href,
  children,
}) => {
  const [loadState, setLoadState] = useState<DownloadDetectionStates>({
    state: 'idle',
  })

  const detectDownload = useCallback(async () => {
    setLoadState({ state: 'detecting', detected: 0 })

    const original = new URL(href)

    for (const [index, mirror] of GITHUB_MIRRORS.entries()) {
      try {
        await download(mirror.transform(original), {
          ttfbTimeout: 3500,
          onProgress: (progressEvent) => {
            setLoadState({
              state: 'downloading',
              mirrorIndex: index + 1,
              progressDownloaded: progressEvent.loaded,
              progressTotal: progressEvent.total,
            })
          },
        })
          .then((blob) => {
            downloadBlob(blob, href.split('/').pop()!)

            setLoadState({ state: 'downloaded' })
          })
          .finally(() => {
            setLoadState((prev) => {
              if (prev.state === 'detecting') {
                return {
                  ...prev,
                  detected: index + 1,
                }
              }
              return prev
            })
          })

        break
      } catch (err) {
        console.warn(
          'download mirror detection: unable to detect download to mirror',
          err,
        )
      }
    }
  }, [href])

  useEffect(() => {
    if (
      loadState.state === 'detecting' &&
      loadState.detected === GITHUB_MIRRORS.length
    ) {
      console.warn('no mirrors responded correctly; fallback to original URL')
      window.location.href = href
      setLoadState({ state: 'fallback' })
    }
  }, [loadState])

  useEffect(() => {
    if (loadState.state === 'downloading') {
      window.onbeforeunload = () => {
        // this is basically useless lol. all you need is a non-null value to the window.onbeforeunload property
        return 'Please do not close this window until the download is complete.'
      }
    } else {
      window.onbeforeunload = null
    }

    return () => {
      window.onbeforeunload = null
    }
  }, [loadState])

  if (loadState.state === 'idle') {
    return (
      <GlowButton bordered onClick={detectDownload}>
        {children}
      </GlowButton>
    )
  } else if (loadState.state === 'detecting') {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={`正在检测下载镜像 (${loadState.detected}/${GITHUB_MIRRORS.length})...`}
      />
    )
  } else if (loadState.state === 'downloading') {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={
          <div className="flex items-center">
            <span className="mr-4">
              正在从镜像 #{loadState.mirrorIndex} 下载...
            </span>
            <DataLoadRate
              loaded={loadState.progressDownloaded}
              total={loadState.progressTotal}
            />
          </div>
        }
        className="tabular-nums"
      />
    )
  } else if (loadState.state === 'downloaded') {
    return (
      <DownloadState
        icon={mdiCheck}
        title="下载完成，解压后运行 MAA.exe 即可"
      />
    )
  } else if (loadState.state === 'fallback') {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title="下载失败，正在尝试直接下载..."
      />
    )
  } else {
    return (
      <DownloadState
        icon={mdiAlertCircle}
        title="无效的下载状态，请刷新页面重试"
      />
    )
  }
}

export const DownloadButtons: FC<{ release: Release }> = ({ release }) => {
  const platforms = useMemo(() => {
    return predicates.reduce((acc, platform) => {
      const asset = platform.assetMatcher(release)
      if (asset)
        acc.push({
          asset,
          platform,
        })
      return acc
    }, [] as ResolvedPlatform[])
  }, [release])

  return (
    <>
      {platforms.length ? (
        platforms.map((platform) => (
          <DownloadButton
            href={platform.asset.browser_download_url}
            key={platform.platform.title}
          >
            <div className="flex flex-col items-start">
              <div className="flex items-center -ml-1">
                <Icon icon={platform.platform.icon} fontSize="28px" />
                <span className="ml-2">{platform.platform.title} 下载</span>
              </div>
              <div className="flex mt-1 mb-0.5 ml-8">
                <span className="text-xs">
                  {release.name} (
                  {moment(release.created_at).format('[build] YYYYMMDD')})
                </span>
              </div>
            </div>
          </DownloadButton>
        ))
      ) : (
        <DownloadState icon={mdiAlertCircle} title="未找到可用的下载链接" />
      )}
    </>
  )
}

export class HomeActionsReleaseErrorBoundary extends Component<{
  children?: React.ReactNode
}> {
  state = {
    error: null as Error | null,
  }

  componentDidCatch(error: Error) {
    this.setState({ error })
  }

  render() {
    const { error } = this.state
    if (error) {
      return (
        <DownloadState
          icon={mdiAlertCircle}
          title={
            <div className="flex flex-col ml-4">
              <span className="mb-2">载入版本信息失败。您可尝试</span>
              <GlowButton
                translucent
                bordered
                href="https://github.com/MaaAssistantArknights/MaaAssistantArknights/releases"
              >
                <span className="text-sm">前往 GitHub Releases 下载</span>
              </GlowButton>
            </div>
          }
        />
      )
    }

    return this.props.children
  }
}

export const HomeActionsRelease: FC = () => {
  const { data } = useRelease()
  return <>{data && <DownloadButtons release={data} />}</>
}
