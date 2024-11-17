# Kagi Split Search

A browser extension, made with Claude Sonnet 3.5 in Cursor, that enables quick popup
searching using Kagi and other search engines. Select text on any webpage and search
it in a convenient popup window.

## Features

- 🔍 Quick popup search from any webpage
- ⌨️ Customizable keyboard shortcuts (Alt + K/O/W/U)
- 🎯 Context menu integration for easy access and more search options
- ⚙️ Configurable search engines and settings

## Installation

1. Clone this repository or download the source code
2. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the top right (not needed in Edge)
4. Click "Load unpacked" and select the extension directory

## Usage

### Context Menu Search

1. Select any text on a webpage
2. Right-click and select the search option from the Kagi Split Search context menu

### Keyboard Shortcuts

- `Alt + K`: Search with Kagi
- `Alt + O`: Search with Oxford English Dictionary
- `Alt + W`: Search with Webster's 1913
- `Alt + U`: Search with UCSB Library

### Default Search Engines

- Kagi Search
- Oxford English Dictionary
- Webster's 1913 Dictionary
- UCSB Library Search

## Configuration

Access the extension settings by:

1. Going to your browser's extensions page
2. Finding "Kagi Split Search"
3. Clicking "Options"

### Customizable Settings

- Maximum number of open search windows (oldest window will close when limit is reached)
- Window close key (Escape, Q, or W)
- Custom search engines
  - Name
  - URL
  - Keyboard shortcut

### Project Structure

- `manifest.json`: Extension configuration
- `background.js`: Background service worker
- `options.html/js`: Settings page
- `popup.html/js`: Search window interface

### Requirements

- Chrome/Edge browser with support for Manifest V3
- Basic understanding of browser extensions

## Permissions

This extension requires the following permissions:

- `contextMenus`: For right-click menu integration
- `tabs`: For window management
- `windows`: For split-view functionality
- `scripting`: For content script injection
- `storage`: For saving settings
- `<all_urls>`: For accessing selected text on any webpage

## License

This project is open source and available under the MIT License.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
