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

import { debounce } from './content-lib/debounce'
import { getSanitizedUrl } from './lib/getSanitizedUrl'
import { getDomainType } from './lib/getDomainType'
import { DomainType, PasswordContent, UsernameContent } from './types'
import { getConfig } from './config'
import { isBannedUrl, setBannedMessage } from './content-lib/bannedMessage'

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

const setStorage = (event: Event) => {
  const ptext = getElement('//*[@id="prompt-textarea"]/p', event.target as Node)
  chrome.storage.local.set({ 'chatgpt-input': ptext?.innerText || null })
}
const debouncedSetStorage = debounce(setStorage, 1000)

ready(() => {
  const findTextInput = () => {
    const textInput = getElement('//*[@id="prompt-textarea"]')
    console.log('textInput', textInput)
    if (textInput) {
      textInput.addEventListener('input', (event) => {
        console.log('input', event)
        debouncedSetStorage(event)
      })
      return true
    }
    return false
  }

  // Use MutationObserver to watch for the element to appear
  const observer = new MutationObserver(() => {
    if (findTextInput()) {
      observer.disconnect()
    }
  })
  observer.observe(document.body, {
    childList: true,
    subtree: true,
  })
})
