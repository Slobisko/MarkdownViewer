<div align="center">

<img src="icon.png" alt="Markdown Viewer logo" width="96" height="96">

# Markdown Viewer

**A fast, minimal desktop viewer for Markdown files, with tabs.**

[![Version](https://img.shields.io/github/package-json/v/Slobisko/MarkdownViewer?color=0969da)](https://github.com/Slobisko/MarkdownViewer/releases)
[![Platform](https://img.shields.io/badge/platform-Windows-0078D6?logo=windows)](https://github.com/Slobisko/MarkdownViewer/releases)
[![Electron](https://img.shields.io/badge/Electron-44-47848F?logo=electron&logoColor=white)](https://www.electronjs.org/)
[![License: ISC](https://img.shields.io/badge/license-ISC-green.svg)](#license)

</div>

---

Markdown Viewer is a lightweight Electron app for **reading** `.md` files. No editor, no clutter: open a file, read it rendered, and keep several documents side by side in tabs. It remembers what you had open, follows links between documents and reloads a file automatically when you come back to the window.

## Features

- **Tabs.** Open as many documents as you like and switch between them with the mouse or keyboard.
- **Single instance.** Double-clicking another `.md` file in Explorer adds a tab to the running window instead of starting a new one.
- **Session restore.** Open tabs, the active tab and the chosen theme are restored on the next start.
- **Live reload.** The current document is re-read whenever the window regains focus, or on demand with `F5`. Scroll position is preserved.
- **Smart links.**
  - Links to other `.md` / `.markdown` files open in a new tab.
  - `#anchor` links scroll within the document.
  - All other links open in your default browser or application.
- **Relative images and links** resolve against the document's own folder.
- **Copy button** on every code block.
- **Light and dark themes** (the dark theme is based on Catppuccin), toggled with a single click.
- **Drag and drop** files straight into the window.
- **File association.** The installer registers the app as a viewer for `.md` and `.markdown` files.

## Installation

### Windows installer

1. Download the latest `Markdown Viewer Setup x.y.z.exe` from the [Releases](https://github.com/Slobisko/MarkdownViewer/releases) page.
2. Run the installer. You can choose the installation directory.
3. Open any `.md` file with **Markdown Viewer** (right-click → *Open with*), or launch the app and press `Ctrl+O`.

### From source

Requirements: [Node.js](https://nodejs.org/) 18 or newer and npm.

```bash
git clone https://github.com/Slobisko/MarkdownViewer.git
cd MarkdownViewer
npm install
npm start
```

You can also pass files on the command line:

```bash
npx electron . path/to/README.md path/to/CHANGELOG.md
```

## Usage

| Action                     | How                                                   |
| -------------------------- | ----------------------------------------------------- |
| Open file(s)               | `Ctrl+O`, the **+** button, or drag and drop          |
| Next / previous tab        | `Ctrl+Tab` / `Ctrl+Shift+Tab`                         |
| Close tab                  | `Ctrl+W`, the **×** button, or middle-click the tab   |
| Reload current document    | `F5` (also happens automatically on window focus)     |
| Toggle light / dark theme  | Moon / sun button in the top-right corner             |
| Copy a code block          | Copy button in the corner of the block                |

## Building

The app is packaged with [electron-builder](https://www.electron.build/) into an NSIS installer for Windows:

```bash
npm run dist
```

The installer is written to the `dist/` folder.

## Project structure

```
MarkdownViewer/
├── main.js        # Electron main process: window, IPC API, single-instance lock, file access
├── preload.js     # Safe bridge between the renderer and the main process (contextBridge)
├── app.js         # Renderer: tabs, rendering, links, shortcuts, session state
├── index.html     # Application shell
├── style.css      # Styles and light/dark color tokens
├── icon.png       # Application icon
└── package.json   # Scripts, dependencies and electron-builder config
```

### How it works

- **Rendering** is handled by [marked](https://marked.js.org/).
- **IPC.** Everything the UI can do through the main process is a function in the `api` object in [`main.js`](main.js). The renderer calls it with `call('name', ...args)`. To add a feature, add a function there and call it from [`app.js`](app.js).
- **State** (open files, active tab and theme) is stored as `state.json` in Electron's `userData` directory, e.g. `%APPDATA%\markdown-viewer\state.json` on Windows.

## Tech stack

- [Electron](https://www.electronjs.org/): desktop runtime
- [marked](https://marked.js.org/): Markdown parser
- [electron-builder](https://www.electron.build/): packaging and installer
- Plain HTML, CSS and JavaScript, with no framework and no bundler

## Contributing

Bug reports and pull requests are welcome. For larger changes, please [open an issue](https://github.com/Slobisko/MarkdownViewer/issues) first so the change can be discussed.

1. Fork the repository
2. Create a branch: `git checkout -b feature/my-feature`
3. Commit your changes and push the branch
4. Open a pull request

## License

Released under the [ISC License](https://opensource.org/licenses/ISC).
Copyright © 2026 Jan Oršl.
