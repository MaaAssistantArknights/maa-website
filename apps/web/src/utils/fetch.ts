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
