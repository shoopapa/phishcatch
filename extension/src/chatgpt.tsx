// Copyright 2025 Joe Technologies
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import * as React from 'react'
import { createRoot } from 'react-dom/client'

const getElement = (selector: string, parent: Node = document) => {
  let element =
    selector.startsWith('//') || selector.startsWith('(//')
      ? (document.evaluate(selector, parent, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
          .singleNodeValue as HTMLElement | null)
      : (document.querySelector(selector) as HTMLElement | null)

  if (!element) {
    return null
  }

  return element
}

// wait for page to load before doing anything
function ready(callbackFunc: () => void) {
  if (document.readyState !== 'loading') {
    callbackFunc()
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callbackFunc)
  }
}

const setStorage = () => {
  // Search from document root to find the textarea content
  const ptext = getElement('//*[@id="prompt-textarea"]/p')
  const text = ptext?.innerText || null
  console.log('Setting storage with text:', text)
  chrome.storage.local.set({ 'chatgpt-input': text })
}

ready(() => {
  const attachedElements = new WeakSet<HTMLElement>()

  const attachListener = (element: HTMLElement) => {
    // Skip if we've already attached a listener to this element
    if (attachedElements.has(element)) {
      return
    }

    element.addEventListener('paste', (event) => {
      console.log('Paste event detected')
      // Wait for the pasted content to be inserted into the DOM
      setTimeout(() => {
        setStorage()
      }, 50)
    })

    attachedElements.add(element)
  }

  const findAndAttachTextInput = () => {
    const textInput = getElement('//*[@id="prompt-textarea"]')
    if (textInput) {
      attachListener(textInput)
    }
  }

  findAndAttachTextInput()
  const observer = new MutationObserver(findAndAttachTextInput)
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
})

/**
 * Generates a style element with CSS scoped to the Shadow DOM.
 * This ensures that our styles are isolated from the host page and vice versa.
 */
const getStyle = (): HTMLStyleElement => {
  const styleElement = document.createElement('style')

  // Base styles scoped to :host to ensure isolation
  const cssText = `
    :host {
      all: initial;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      line-height: 1.5;
      color: #333;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    .phish-window {
      position: fixed;
      top: 16px;
      right: 16px;
      z-index: 999999;
      background: white;
      border: 1px solid #d1d5db;
      border-radius: 6px;
      padding: 14px 16px;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
      max-width: 320px;
      font-family: inherit;
    }

    .phish-header {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 12px;
    }

    .phish-content {
      flex: 1;
    }

    .phish-title {
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin-bottom: 4px;
    }

    .phish-message {
      font-size: 13px;
      color: #6b7280;
      line-height: 1.4;
    }

    .phish-close-btn {
      background: none;
      border: none;
      color: #9ca3af;
      cursor: pointer;
      font-size: 18px;
      padding: 0;
      width: 20px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .phish-close-btn:hover {
      color: #4b5563;
    }
  `

  styleElement.textContent = cssText
  return styleElement
}

export const useLocalStorage = <T extends string | number | boolean | null | undefined>(
  key: string,
  initialValue: T,
) => {
  const [value, setStateValue] = React.useState<T>()
  const isWriting = React.useRef(false)

  React.useEffect(() => {
    chrome.storage.local.get(key).then((storage) => {
      const storedValue = (storage ?? {})[key] as T
      if (storedValue !== undefined) {
        return setStateValue(storedValue)
      }
      setStateValue(initialValue)
      isWriting.current = true
      chrome.storage.local
        .set({ [key]: initialValue })
        .then(() => (isWriting.current = false))
        .catch(() => (isWriting.current = false))
    })
    type Listener = Parameters<typeof chrome.storage.onChanged.addListener>[0]
    const listener: Listener = (changes) => {
      // If the 'isWriting' flag is set, this change came from this instance, no need to set the state again.
      if (isWriting.current || !changes[key]) {
        return
      }
      setStateValue(changes[key].newValue as T)
    }

    chrome.storage.onChanged.addListener(listener)

    return () => {
      chrome.storage.onChanged.removeListener(listener)
    }
  }, [])

  const setValue = (v: T) => {
    setStateValue(v)
    isWriting.current = true
    chrome.storage.local
      .set({ [key]: v })
      .then(() => (isWriting.current = false))
      .catch(() => (isWriting.current = false))
  }

  return [value, setValue] as const
}

const App = () => {
  const [value, setValue] = useLocalStorage<string>('chatgpt-input', '')

  const handleDismiss = () => {
    setValue('')
  }

  if (!value) return null

  return (
    <div className="phish-window">
      <div className="phish-header">
        <div className="phish-content">
          <div className="phish-title">⚠️ Paste Detected</div>
          <div className="phish-message">
            You just pasted text into ChatGPT. Are you sure you want to share this data? It may contain sensitive
            company information.
          </div>
        </div>
        <button className="phish-close-btn" onClick={handleDismiss}>
          x
        </button>
      </div>
    </div>
  )
}

if (document.getElementById('phish-inject-all')) {
  document.getElementById('phish-inject-all')?.remove()
}

const root = document.createElement('div')
root.id = 'phish-inject-all'
document.body.appendChild(root)

const shadowRoot = root.attachShadow({ mode: 'open' })

// Inject styles into shadow root for proper isolation
const styleElement = getStyle()
shadowRoot.appendChild(styleElement)

const mountPoint = document.createElement('div')
mountPoint.id = 'phish-inject-all-mount-point'
shadowRoot.appendChild(mountPoint)

createRoot(mountPoint).render(<App />)
