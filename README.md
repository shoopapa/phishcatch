# PhishCatch

See the wiki for documentation: https://github.com/palantir/phishcatch/wiki

The PhishCatch extension is available in the Chrome Web Store: https://chrome.google.com/webstore/detail/phishcatch/jgegnlkclgfifjphjmijnkmicfgckmah

Read our blog post about why we built PhishCatch and the problems it is designed to solve: https://blog.palantir.com/phishcatch-detecting-password-reuse-from-the-inside-out-77aa93e3e6fb

---

# Joe’s Features

## Refactors

- Updated to MV3 manifest and formatting
- Updated React and Chrome/React type definitions
- Fixed type errors so the app can build (not yet regression-tested)
- Removed `vendor.js`, which was causing issues with the content script (can be reintroduced later)
- Converted `background.ts` to a service worker

## Features

### Network Interception

- Added host permissions for ChatGPT
- Added `webRequest` to extension permissions
- Implemented a simple listener to reconstruct the payload from raw request data
- Used Zod for fast-fail parsing; would add alerting if Zod parsing begins to fail
- Currently logs parsed values to the service worker console

**Potential Improvements**

- Add a backend to store user queries
- Detect file uploads
- Research ChatGPT payload structure to identify edge cases
- Ensure full payload coverage, currently only the first part is parsed

---

### Security Modal

- Built a feature that persistently attaches a listener to the chat’s paste event
- Uses a MutationObserver to handle transitions between “new chat” and “in-progress” views (since the element gets replaced)
- Stores values in localStorage to avoid interruptions on page reload
- While localStorage isn’t strictly required, it improves user experience during refresh
- Shows a warning modal nudging users not to paste sensitive data into ChatGPT

**Potential Improvements**

- Detect file uploads and warn the user before sending
- Require justifications if the user continues despite the warning
- Disable the send button until the pasted value is removed
- Send pasted values to a backend for security auditing and training insights

---

## Conclusion

Network interception is the most reliable way to determine—beyond doubt—whether a user has sent sensitive information to ChatGPT.
The popup cannot detect whether the user ultimately sends the message, but it gives users an opportunity to behave securely without being intrusive.
