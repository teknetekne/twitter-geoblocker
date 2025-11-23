# Twitter Geoblocker

Chrome extension that displays country flag emojis next to Twitter/X usernames based on account location and allows blocking content from specific countries.

## Features

- **Country Flags**: Automatically displays country flag emojis next to usernames based on the account's location data from Twitter/X profiles
- **Country Blocking**: Select countries to hide posts and user content from
- **Soft Blocking**: Blocked content shows a placeholder with a "View" button to reveal content when needed
- **Theme Support**: Fully compatible with Twitter's Light, Dim, and Lights Out themes
- **Smart Caching**: Caches location data for 30 days to minimize API requests
- **Rate Limiting**: Built-in rate limiting and queue management to respect Twitter API limits
- **Dynamic Content**: Automatically processes new content as you scroll using MutationObserver

## How It Works

The extension uses Twitter's GraphQL API (`AboutAccountQuery`) to fetch account location data. It intercepts Twitter's own API calls to capture authentication headers, then makes requests to get the `account_based_in` field from user profiles. Location data is cached locally to reduce API calls and improve performance.

## Installation

1. Clone this repository:
   ```bash
   git clone https://github.com/teknetekne/twitter-geoblocker.git
   cd twitter-geoblocker
   ```

2. Open Chrome and navigate to `chrome://extensions/`

3. Enable "Developer mode" in the top right corner

4. Click "Load unpacked"

5. Select the `twitter-geoblocker` directory

## Usage

1. Click the extension icon in the Chrome toolbar
2. **Enable Extension**: Toggle the main switch to turn the extension on/off
3. **Show Country Flags**: Toggle to show/hide flag emojis next to usernames (blocking still works when flags are hidden)
4. **Block Countries**:
   - Use the "All Countries" tab to search and select countries to block
   - Use the "Blocked" tab to view and manage your blocked countries list
5. Browse X (Twitter) - flags will appear next to usernames and blocked content will be hidden with a placeholder

## Privacy

This extension:
- Only runs on `x.com` and `twitter.com` domains
- Uses Twitter's own GraphQL API endpoints (no external servers)
- Stores location cache and preferences locally in Chrome's storage
- Captures authentication headers from Twitter's own requests (no manual login required)
- Does not send any data to external servers
- Respects Twitter's rate limits to avoid API abuse

## Technical Details

- **Manifest Version**: 3
- **API Endpoint**: Twitter GraphQL API (`AboutAccountQuery`)
- **Cache Duration**: 30 days
- **Rate Limiting**: 2 second intervals between requests, max 2 concurrent requests
- **Supported Platforms**: Chrome/Chromium-based browsers

## Credits

Based on [twitter-account-location-in-username](https://github.com/RhysSullivan/twitter-account-location-in-username) by [RhysSullivan](https://github.com/RhysSullivan).
