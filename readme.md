# Popup Search

A browser extension, made with Claude Sonnet 3.5 in Cursor, that enables quick popup
searching using keyboard shortcuts and configurable search engines. 

## Usage

### Demo
Below you can see me using the main access keys (1,2,3) to bring up popup searches on various highlighted pieces of text from an article.
I then use the selector to bring up even more options like HN Algolia and Youtube.

https://github.com/user-attachments/assets/771ceff2-2cb2-4b1b-817b-12d767844d4b

Among the configuration options, you can set a maximum number of windows constraint. Here you can see me setting it to 2, and then showing
how it automatically closes older windows you may have left open in order to prevent clutter.

https://github.com/user-attachments/assets/be51e538-5227-44c3-8cde-7f1050bacce5

### Basic Steps

1. Select any text on a webpage
2. Press `Alt + S` to bring up the selector
3. Press the corresponding assigned shortcut to bring up the search popup
4. You can also right-click and select the search option from the Popup Search context menu

## Features

- 🔍 Quick popup search from any webpage
- ⌨️ Customizable keyboard shortcuts for frequent use (`Alt + 1/2/3`)
- 🎯 Popup selector for even more options (`Alt + S`)
- ⚙️ Configurable search engines and settings

## Installation

1. Clone this repository or download the source code
2. Open Chrome/Edge and navigate to `chrome://extensions/` or `edge://extensions/`
3. Enable "Developer mode" in the top right (not needed in Edge)
4. Click "Load unpacked" and select the extension directory

### Default Keyboard Shortcuts

- `Esc`: Exit out of any popup (unless you've started navigating already)
- `Alt + 1`: Search with Kagi
- `Alt + 2`: Search with Oxford English Dictionary
- `Alt + 3`: Search with Webster's 1913
- `Alt + S`: Popup Search Selector

## Configuration

Access the extension settings by:

1. Going to your browser's extensions page
2. Finding "Popup Search"
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
