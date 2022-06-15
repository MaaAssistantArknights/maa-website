import React from 'react'
import ReactDOM from 'react-dom/client'
import { SWRConfig } from 'swr'

import App from './App'
import { fetch } from './utils/fetch'

import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <SWRConfig
      value={{ fetcher: (url: string) => fetch(url).then((r) => r.json()) }}
    >
      <App />
    </SWRConfig>
  </React.StrictMode>,
)
