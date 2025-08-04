# ClearLabel - Ethical Brand Scanner

A Chrome extension that helps users make informed decisions by identifying and flagging brands with ethical concerns. Built with React and Manifest V3, it scans webpages for brand names and highlights them based on various ethical categories.

## Features

- 🔍 **Smart Detection**: Scans visible text on any webpage to detect brand names
- 🏷️ **Category Filters**: Toggle highlighting for different categories (BDS, Environmental, Labor)
- ⚡ **React Popup**: Beautiful, responsive popup interface built with React and Tailwind CSS
- 💾 **Persistent Settings**: User preferences saved via chrome.storage.local
- 🚀 **Manifest V3**: Built with the latest Chrome extension standards
- 📱 **Local Data**: No API calls - all brand data stored locally
- 🔗 **Detailed Information**: Provides links to sources and detailed explanations for each flagged brand

## Installation

### Development Setup

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the extension:
   ```bash
   npm run build:extension
   ```

4. Load the extension in Chrome:
   - Open Chrome and go to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the `dist` folder

### Usage

1. Navigate to any webpage
2. Click the Brand Scanner extension icon in your toolbar
3. Select which categories you want to monitor
4. Click "Start Scanning" to highlight brands on the page
5. Hover over highlighted brands to see why they're flagged

## Brand Categories

- **BDS**: Brands associated with BDS (Boycott, Divestment, Sanctions) campaigns and violations in occupied territories
- **Environmental**: Companies with poor environmental practices, pollution, or climate change denial
- **Labor**: Brands with poor labor conditions, worker exploitation, or union suppression

## Technical Details

- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn/ui components
- **Extension**: Manifest V3 Chrome Extension
- **Storage**: chrome.storage.local for user preferences
- **Build**: Vite for bundling

## Project Structure

```
├── public/
│   ├── manifest.json          # Chrome extension manifest
│   ├── popup.html            # Extension popup HTML
│   ├── brandList.json        # Local brand database
│   ├── content-script.js     # Content script for page scanning
│   └── content-styles.css    # Styles for highlighted brands
├── src/
│   ├── components/
│   │   └── ExtensionPopup.tsx # Main popup React component
│   ├── popup.tsx             # Popup entry point
│   └── pages/Index.tsx       # Landing page with instructions
└── scripts/
    └── build-extension.js    # Extension build script
```

## Development

To work on this project:

1. Run the development server for the landing page:
   ```bash
   npm run dev
   ```

2. For extension development, build and reload:
   ```bash
   npm run build:extension
   ```

3. Reload the extension in Chrome after making changes

## Brand Database

The extension uses a local JSON file (`public/brandList.json`) containing brand information:

```json
[
  { 
    "name": "Nestlé", 
    "categories": ["BDS", "Environmental"] 
  },
  { 
    "name": "Amazon", 
    "categories": ["Labor", "Environmental"] 
  }
]
```

To add new brands, simply edit this file and rebuild the extension.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test the extension thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details.