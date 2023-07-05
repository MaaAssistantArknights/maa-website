import { Dispatch } from 'react'
import unfetch from 'unfetch'

export const fetch = window.fetch || unfetch

export type RequestInitWithTimeout = RequestInit & {
  timeout?: number
}

export async function fetchWithTimeout(
  input: RequestInfo,
  init?: RequestInitWithTimeout,
) {
  const { timeout, ...options } = init || {}

  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeout)
  const response = await fetch(input, {
    ...options,
    signal: controller.signal,
  }).finally(() => clearTimeout(id))
  return response
}

// yes i know, download uses XHR, but only XHR provides onprogress callbacks...
export type DownloadOptions = {
  onProgress?: Dispatch<ProgressEvent>

  // ttfb timeout in ms; ttfb is the time between the request being sent and the first byte being received
  ttfbTimeout?: number
}
export async function download(
  url: string,
  options: DownloadOptions = {},
): Promise<Blob> {
  const { onProgress, ttfbTimeout } = options

  const xhr = new XMLHttpRequest()
  xhr.open('GET', url, true)
  xhr.responseType = 'blob'
  xhr.withCredentials = false

  let ttfbTimeoutTimer = ttfbTimeout
    ? setTimeout(() => {
        xhr.abort()
      }, ttfbTimeout)
    : null

  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response)
      } else {
        reject(xhr.statusText)
      }
    }

    xhr.onerror = () => {
      reject(xhr.statusText)
    }

    xhr.ontimeout = () => {
      reject('timeout')
    }

    xhr.onabort = () => {
      reject('abort')
    }

    xhr.onloadstart = () => {
      if (ttfbTimeoutTimer) {
        clearTimeout(ttfbTimeoutTimer)
        ttfbTimeoutTimer = null
      }
    }

    if (onProgress) {
      xhr.onprogress = onProgress
    }

    xhr.send()
  })
}

function randomSeed() {
  try {
    return crypto.randomUUID()
  } catch {
    return Math.random().toString(36).substring(2)
  }
}

export async function checkUrlConnectivity(
  url: string,
  timeout = 5000,
): Promise<DOMHighResTimeStamp | false> {
  try {
    const measureName = `checkUrlConnectivity-${randomSeed()}`
    const controller = new AbortController()
    const signal = controller.signal
    setTimeout(() => controller.abort(), Math.max(timeout, 5000))
    performance.mark(`${measureName}-start`)
    const response = await fetch(url, {
      method: 'HEAD',
      signal,
    })
    performance.mark(`${measureName}-end`)
    if (!response.ok) {
      return false
    }

    // 测量两个不同的标志。
    performance.measure(
      measureName,
      `${measureName}-start`,
      `${measureName}-end`,
    )

    // 获取所有的测量输出。
    // 在这个例子中只有一个。
    var measures = performance.getEntriesByName(measureName)
    var measure = measures[0]
    return measure.duration
  } catch {
    return false
  }
}
