// Copyright 2021 Palantir Technologies
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
import { App } from './react-popup/app'
import { createRoot } from 'react-dom/client'

function ready(callbackFunc: () => void) {
  if (document.readyState !== 'loading') {
    callbackFunc()
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', callbackFunc)
  }
}

ready(() => {
  createRoot(document.getElementById('root')!).render(<App />)
})
