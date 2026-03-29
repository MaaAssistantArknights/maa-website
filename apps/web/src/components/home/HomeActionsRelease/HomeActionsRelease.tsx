import { GlowButton } from '@/components/foundations/GlowButton/GlowButton'
import { useLayoutState } from '@/contexts/LayoutStateContext'
import { Release, useRelease } from '@/hooks/use-release'
import i18n, { getLanguageOption } from '@/i18n'
import { downloadBlob } from '@/utils/blob'
import { checkUrlConnectivity, checkUrlSpeed, download } from '@/utils/fetch'
import { formatBytes } from '@/utils/format'
import sleep from '@/utils/sleep'
import mdiAlertCircle from '@iconify/icons-mdi/alert-circle'
import mdiCheck from '@iconify/icons-mdi/check'
import mdiDownload from '@iconify/icons-mdi/download'
import mdiLoading from '@iconify/icons-mdi/loading'
import type { IconifyIcon } from '@iconify/react'
import { Icon } from '@iconify/react'

import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import {
  Component,
  FC,
  ReactNode,
  forwardRef,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  Trans,
  WithTranslation,
  useTranslation,
  withTranslation,
} from 'react-i18next'
import { useMount } from 'react-use'

import {
  DetectionFailedSymbol,
  PLATFORMS,
  ResolvedPlatform,
  detectPlatform,
} from './ReleaseModels'

type GITHUB_MIRROR_TYPE = {
  name: string
  transform: (original: URL) => string
}

const GITHUB_MIRRORS: GITHUB_MIRROR_TYPE[] = [
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
        <div className="text-sm transition-colors duration-300">
          {percentage.toFixed(0)}%
        </div>
        <div
          className={clsx(
            'w-12 h-1 rounded-full',
            'dark:bg-white/10',
            'bg-stone-800/10',
          )}
        >
          <div
            className={clsx(
              'h-full rounded-full',
              'dark:bg-white',
              'bg-stone-800',
            )}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
      <div className="flex flex-col items-end justify-center">
        <div className="text-sm transition-colors duration-300">
          {formatBytes(loaded, 1)}
        </div>
        <div className="text-sm transition-colors duration-300">
          {formatBytes(total, 1)}
        </div>
      </div>
    </div>
  )
}

interface DownloadStateProps {
  icon: IconifyIcon
  iconClassName?: string
  title: ReactNode
  className?: string
}

export const DownloadState: FC<DownloadStateProps> = forwardRef<
  HTMLDivElement,
  DownloadStateProps
>(({ icon, iconClassName, title, className }, ref) => {
  return (
    <motion.div
      className={clsx(
        'flex py-6 px-3 flex-col items-center justify-center font-normal transition-colors duration-300',
        'dark:text-white',
        'text-stone-800',
        className,
      )}
      {...{
        exit: {
          scale: 0.9,
          opacity: 0,
        },
        initial: {
          scale: 0,
          opacity: 0,
        },
        animate: {
          scale: 1,
          opacity: 1,
        },
        transition: {
          type: 'spring',
          stiffness: 500,
          damping: 30,
        },
      }}
      ref={ref}
    >
      <div className="flex items-center -ml-1">
        <Icon
          className={clsx(iconClassName, 'transition-colors duration-300')}
          icon={icon}
          fontSize="28px"
        />
        <span className="ml-2 transition-colors duration-300">{title}</span>
      </div>
    </motion.div>
  )
})
DownloadState.displayName = 'DownloadState'

type DownloadDetectionStates =
  | {
      state: 'idle'
    }
  | {
      state: 'detecting'
      detected: number
    }
  | {
      state: 'speedTesting'
      mirrorIndex: number
    }
  | {
      state: 'detected'
      availableMirror: number
      canTestSpeed: boolean
      cantTestSpeedReason: 'saveData' | 'mobile' | 'ok'
    }
  | {
      state: 'connecting'
      mirrorIndex: number
      mirrorLatency: number
      mirrorSpeed: number
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

const DownloadButton: FC<{
  platform: ResolvedPlatform
  releaseName: string | null
}> = ({ platform, releaseName }) => {
  const { t } = useTranslation()
  const href = platform.asset.browser_download_url

  const [loadState, setLoadState] = useState<DownloadDetectionStates>({
    state: 'idle',
  })
  const mirrorsTemplate = useMemo(() => {
    const baseMirrors = [
      ...platform.asset.mirrors.map((url) => ({
        transform: () => url,
        name: new URL(url).hostname,
      })),
      ...GITHUB_MIRRORS,
    ]

    // Windows x64 优先使用国内镜像
    if (platform.platform.id === 'windows-x64' && releaseName) {
      return [
        {
          name: 'download.maa.plus',
          transform: () =>
            `https://download.maa.plus/MAA/MAA-${releaseName}-win-x64.zip`,
        },
        ...baseMirrors,
      ]
    }

    return baseMirrors
  }, [platform.asset.mirrors, platform.platform.id, releaseName])

  const detectDownload = useCallback(async () => {
    setLoadState({ state: 'detecting', detected: 0 })
    const original = new URL(href)
    const mirrors: [number, string, DOMHighResTimeStamp, number][] = []
    await Promise.all(
      mirrorsTemplate.map(async (mirror, index) => {
        const mirrorUrl = mirror.transform(original)
        const result = await checkUrlConnectivity(mirrorUrl)
        if (typeof result === 'number') {
          mirrors.push([index, mirrorUrl, result, -1])
        }
        setLoadState((prev) => {
          if (prev.state === 'detecting') {
            return {
              ...prev,
              detected: prev.detected + 1,
            }
          }
          return prev
        })
      }),
    )
    setLoadState({ state: 'detecting', detected: mirrorsTemplate.length })
    await sleep(300)
    mirrors.sort(([, , a], [, , b]) => a - b)
    try {
      if (Reflect.has(navigator, 'connection')) {
        if (navigator.connection?.saveData) {
          setLoadState({
            state: 'detected',
            availableMirror: mirrors.length,
            canTestSpeed: false,
            cantTestSpeedReason: 'saveData',
          })
        } else if (
          ['slow-2g', '2g', '3g'].includes(
            navigator.connection?.effectiveType || '4g',
          ) ||
          ['bluetooth', 'cellular', 3, 4].includes(
            navigator.connection?.type || 'unknown',
          )
        ) {
          setLoadState({
            state: 'detected',
            availableMirror: mirrors.length,
            canTestSpeed: false,
            cantTestSpeedReason: 'mobile',
          })
        } else {
          throw new Error()
        }
      } else {
        throw new Error()
      }
    } catch {
      for (const [i, [index, mirror]] of mirrors.entries()) {
        setLoadState({
          state: 'speedTesting',
          mirrorIndex: index + 1,
        })
        const mirrorSpeed = await checkUrlSpeed(mirror)
        mirrors[i][3] = mirrorSpeed
      }
      setLoadState({
        state: 'detected',
        availableMirror: mirrors.length,
        canTestSpeed: true,
        cantTestSpeedReason: 'ok',
      })
    }
    mirrors.sort(([, , , a], [, , , b]) => b - a)
    await sleep(500)
    for (const [index, mirror, mirrorLatency, mirrorSpeed] of mirrors) {
      try {
        setLoadState({
          state: 'connecting',
          mirrorIndex: index + 1,
          mirrorLatency,
          mirrorSpeed,
        })
        await sleep(1000)
        await download(mirror, {
          ttfbTimeout: 3500,
          onProgress: (progressEvent) => {
            setLoadState({
              state: 'downloading',
              mirrorIndex: index + 1,
              progressDownloaded: progressEvent.loaded,
              progressTotal: progressEvent.total,
            })
          },
        }).then((blob) => {
          downloadBlob(blob, href.split('/').pop()!)

          setLoadState({ state: 'downloaded' })
        })

        break
      } catch (err) {
        console.warn(
          'download mirror detection: unable to detect download to mirror',
          err,
        )
      }
    }
    setLoadState((prev) => {
      if (prev.state !== 'downloaded') {
        return {
          state: 'fallback',
        }
      }
      return prev
    })
  }, [href, mirrorsTemplate])

  useEffect(() => {
    if (loadState.state === 'fallback') {
      console.warn('no mirrors responded correctly; fallback to original URL')
      window.location.href = href
    }
  }, [loadState, href])

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
        <div className="flex flex-col items-start whitespace-nowrap">
          <div className="flex items-center -ml-1">
            <Icon icon={platform.platform.icon} fontSize="28px" />
            <span className="ml-2">
              {t(platform.platform.title)}
              <span className="mx-1 text-sm">
                {t(platform.platform.subtitle)}
              </span>
              {t('release.buttonLabels.download')}
            </span>
          </div>
          <div className="flex items-center mt-1 mb-0.5 ml-8 text-sm">
            <span>{releaseName}</span>
            {platform.asset.download_count && (
              <>
                <Icon icon={mdiDownload} className="ml-2 mr-0.5" />
                <span>
                  {platform.asset.download_count
                    ? platform.asset.download_count.toLocaleString()
                    : '—'}
                </span>
              </>
            )}
          </div>
        </div>
      </GlowButton>
    )
  } else if (loadState.state === 'detecting') {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={t('release.mirrorDetect.detecting', {
          current: loadState.detected,
          total: mirrorsTemplate.length,
        })}
      />
    )
  } else if (loadState.state === 'speedTesting') {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={t('release.speedTest.testing', { index: loadState.mirrorIndex })}
      />
    )
  } else if (loadState.state === 'detected') {
    const title = loadState.canTestSpeed
      ? t('release.speedTest.success', { count: loadState.availableMirror })
      : t('release.speedTest.failure', {
          count: loadState.availableMirror,
          reason: t(
            `release.speedTest.reasons.${loadState.cantTestSpeedReason}`,
          ),
        })

    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={title}
      />
    )
  } else if (loadState.state === 'connecting') {
    const title =
      loadState.mirrorSpeed > 0
        ? t('release.download.connectingWithSpeed', {
            index: loadState.mirrorIndex,
            latency: loadState.mirrorLatency.toFixed(3),
            speed: ((loadState.mirrorSpeed / 1024 / 1024) * 1000).toFixed(3),
          })
        : t('release.download.connectingWithoutSpeed', {
            index: loadState.mirrorIndex,
            latency: loadState.mirrorLatency.toFixed(3),
          })

    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={title}
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
              {t('release.download.downloadingFromMirror', {
                index: loadState.mirrorIndex,
              })}
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
        title={t(platform.platform.messages.downloaded)}
      />
    )
  } else if (loadState.state === 'fallback') {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={t('release.download.downloadingFallback')}
      />
    )
  } else {
    return (
      <DownloadState
        icon={mdiAlertCircle}
        title={t('release.download.invalidState')}
      />
    )
  }
}

export const DownloadButtons: FC<{ release: Release }> = ({ release }) => {
  const { t } = useTranslation()
  const { isWidthOverflow } = useLayoutState()

  const [viewAll, setViewAll] = useState(false)
  const [envPlatformId, setCurrentPlatformId] = useState<
    string | typeof DetectionFailedSymbol | null
  >(null)

  useMount(async () => {
    const platformId = await detectPlatform()
    setCurrentPlatformId(platformId ?? null)
  })

  const validPlatforms = useMemo(
    () =>
      PLATFORMS.reduce((acc, platform) => {
        const asset = platform.assetMatcher(release)
        if (asset)
          acc.push({
            asset,
            platform,
          })
        return acc
      }, [] as ResolvedPlatform[]),
    [release],
  )

  const renderPlatformButton = useCallback(
    (platform: ResolvedPlatform) => {
      const isCurrentPlatform = platform.platform.id === envPlatformId
      return (
        <motion.div layout key={platform.platform.id}>
          <div className="flex flex-col items-center gap-1">
            <DownloadButton platform={platform} releaseName={release.name} />
            <div className="min-h-5 mt-1 text-xs">
              {!isCurrentPlatform ? (
                <motion.span
                  className="inline-flex items-center whitespace-nowrap text-red-500 dark:text-red-400"
                  initial={{ opacity: 0, y: -10 }}
                  animate={
                    viewAll ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 }
                  }
                  transition={{
                    duration: 0.4,
                    ease: 'easeOut',
                    delay: viewAll ? 0.3 : 0,
                  }}
                  style={{ display: 'inline-flex' }}
                >
                  <Icon
                    icon={mdiAlertCircle}
                    className="mr-1 shrink-0"
                    width="14"
                    height="14"
                  />
                  {t('release.platformDetect.archIncompatible')}
                </motion.span>
              ) : (
                // 占位保持高度一致
                <span className="opacity-0">
                  {t('release.platformDetect.archIncompatible')}
                </span>
              )}
            </div>
          </div>
        </motion.div>
      )
    },
    [envPlatformId, release.name, viewAll, t],
  )

  const innerContent = useMemo<React.ReactNode>(() => {
    if (!envPlatformId || envPlatformId === DetectionFailedSymbol) {
      // 检测失败
      return (
        <DownloadState
          key="detect-failed"
          icon={mdiAlertCircle}
          title={t('release.platformDetect.failure')}
        />
      )
    }

    const platform = validPlatforms.find(
      (platform) => platform.platform.id === envPlatformId,
    )

    if (!platform) {
      // 检测到但不支持
      return (
        <DownloadState
          key="unsupported"
          icon={mdiAlertCircle}
          title={t('release.platformDetect.failure')}
        />
      )
    }

    // 检测成功且支持
    return renderPlatformButton(platform)
  }, [validPlatforms, envPlatformId, renderPlatformButton, t])

  const [os, arch] = useMemo(() => {
    if (!envPlatformId) return ['unknown', 'unknown']
    return envPlatformId
      .toString()
      .replace(/macos-universal/i, 'macos-arm64')
      .split('-')
  }, [envPlatformId])

  const mirrorchyanAvailable = useMemo(() => {
    return os === 'windows' || os === 'macos'
  }, [os])

  if (!envPlatformId) {
    return (
      <DownloadState
        iconClassName="animate-spin"
        icon={mdiLoading}
        title={t('release.platformDetect.detecting')}
      />
    )
  }

  const mirrorchyanLang = getLanguageOption(i18n.language).mirrorchyanLang

  // 原来的逻辑是 当`ViewAll=true`时使用`allPlatformDownloadBtns`进行替换，把整个第一行（下载，查看全部，mirror酱）替换为全部平台的下载渠道按钮。
  // 下面的按钮因为`!viewAll`便不再渲染。我将渲染逻辑进行了修改，`ViewAll=true`时不再进行替换，而是根据其值展示和收起相关按钮。
  // 对原来的进行排版，原来只用一个`motion.div`将所有按钮放在了一起，现在将组件使用`AnimatePresence`进行分组并设置对应的动画。
  // 去掉了条件渲染，改为隐藏和显示相关按钮。
  return (
    // 外层容器：改为纵向排列 (flex-col)，负责控制上下两排的整体高度和间距
    <motion.div
      layout="position" // ✅ 防止高度参与 layout 计算
      className="w-full flex flex-col justify-center items-center gap-x-4 max-h-[50vh]"
    >
      {/* 第一排 */}
      <motion.div
        layout
        className="w-full flex flex-wrap justify-center items-center gap-4"
      >
        <AnimatePresence mode="popLayout">
          {innerContent}

          {/* view all 按钮 */}
          <motion.div
            layout
            key="view-all-switch"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`flex items-center gap-4 ${isWidthOverflow ? 'flex-col w-full' : ''}`}
          >
            <GlowButton bordered onClick={() => setViewAll((prev) => !prev)}>
              <div className="text-base">
                {viewAll
                  ? t('release.buttonLabels.collapse')
                  : t('release.buttonLabels.viewAll')}
              </div>
            </GlowButton>
          </motion.div>

          {mirrorchyanAvailable && (
            <motion.div
              layout
              key="mirrorchyan"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              <GlowButton
                bordered
                href={`https://mirrorchyan.com/${mirrorchyanLang}/projects?rid=MAA&os=${os}&arch=${arch}&channel=stable&source=maaplus-download`}
              >
                <div className="text-sm">
                  <p>
                    <i>{t('release.buttonLabels.mirrorchyanCDKPrompt')}</i>
                  </p>
                  <p>
                    <i>{t('release.buttonLabels.mirrorchyanDownload')}</i>
                  </p>
                </div>
              </GlowButton>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      {/* 原先的条件渲染会导致dom出现和消失，因此父容器在做layout动画的同时，子元素在做height动画。动画结束后，dom消失，layout再次计算位置进行跳跃。*/}
      {/*这里便把条件渲染给去掉了，改成根据`viewAll`的值使用不同的动画。*/}
      <motion.div
        key="view-all-content"
        initial={false} // ✅ 防止首次动画
        animate={
          viewAll
            ? { opacity: 1, height: 'auto', overflow: 'visible' }
            : { opacity: 0, height: 0, overflow: 'hidden' }
        }
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="w-full flex flex-wrap justify-center gap-4"
      >
        {validPlatforms
          .filter((p) => p.platform.id !== envPlatformId)
          .map(renderPlatformButton)}
      </motion.div>
    </motion.div>
  )
}

interface Props extends WithTranslation {
  children?: React.ReactNode
}

export const HomeActionsReleaseErrorBoundary = withTranslation()(
  class HomeActionsReleaseErrorBoundary extends Component<Props> {
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
                <Trans
                  key={i18n.language}
                  i18nKey="release.buttonLabels.versionInfoLoadingError"
                  components={{
                    1: <span className="mb-2 block text-center" />,
                    2: (
                      <GlowButton
                        className="mb-2"
                        translucent
                        bordered
                        href="https://github.com/MaaAssistantArknights/MaaAssistantArknights/releases"
                      >
                        <span className="text-sm" />
                      </GlowButton>
                    ),
                  }}
                />
              </div>
            }
          />
        )
      }

      return this.props.children
    }
  },
)

export const HomeActionsRelease: FC = () => {
  const { data } = useRelease()
  return <>{data && <DownloadButtons release={data} />}</>
}
