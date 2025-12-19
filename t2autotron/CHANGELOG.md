# Changelog

## [2.1.90] - 2025-12-18

### Fixed
- **AND Gate 30-Second Delay**: TimeRangeNode and DayOfWeekComparisonNode now have continuous update intervals. Previously, these nodes only updated when you changed a slider - now they tick automatically (1 second for TimeRange, 1 minute for DayOfWeek) so downstream logic gates respond instantly.

## [2.1.89] - 2025-12-18

### Added
- **Stock Price Node**: New node fetches real-time stock quotes from Yahoo Finance. Outputs symbol, price, change amount, change percent, and up/down indicator.
- **Timeline Color Negative Values**: Numerical mode now supports negative values (e.g., -5 to +5 for stock market mood lighting)

### Fixed
- **CORS for Stock API**: Added backend proxy `/api/stock/:symbol` to avoid Yahoo Finance CORS blocks

## [2.1.77] - 2025-12-18

### Fixed
- **Device Timeline Empty**: Debug Dashboard now finds actual log categories instead of obsolete names

## [2.1.76] - 2025-12-18

### Fixed
- **Update Button False Positive**: "Check for Updates" no longer shows false positives in add-on

## [2.1.75] - 2025-12-18

### Fixed
- **HSV-Only Device Display**: Dashboard correctly shows HSV-only nodes as ON when sending colors

## [2.1.73] - 2025-12-18

### Added
- **Device States API**: New `/api/engine/device-states` endpoint for comparing engine vs HA state
- **Debug Dashboard Split View**: Separates anomalies from expected activity notes

## [2.1.68] - 2025-12-17

### Fixed
- **Kasa Discovery in Add-on**: Added `host_network: true` so Kasa UDP broadcasts work in Docker

## [2.1.64-67] - 2025-12-17

### Fixed
- **HA Device Dropdown Race Condition**: Multiple fixes for dropdowns showing empty after graph load
  - Added RAF timing and retry logic (up to 10 retries)
  - Added HTTP fallback if socket cache is empty
  - Added delayed engine processing after graph load

## [2.1.61] - 2024-12-17

### Added
- **24/7 Backend Engine** - Automations now run on the server continuously, even when browser is closed
- **Save Modal** - Named graph saves with file browser
- **Socket-based device cache** - Faster graph loading (reduced from 2+ minutes to ~10 seconds)
- **Engine status indicator** - Shows running/stopped state in Control Panel
- **Uptime tracking** - See how long the engine has been running

### Fixed
- Graph loading performance (deferred API calls during restore)
- Timeline Color nodes now work in headless mode
- Zigbee light flashing reduced (increased command throttling to 3s)
- Import path fix for SaveModal component

### Changed
- Disabled auto-load for HA ingress (now uses manual "Load Last" button)
- Improved device caching across all HA nodes

## [2.1.58] - 2024-12-16

### Fixed
- Debug dashboard light display
- Color indicators for lights
- HA device log spam reduced

## [2.1.55] - 2024-12-14

### Fixed
- CORS issues for HA add-on ingress mode
- 400/404 errors on device API calls in add-on
- Server early exit issue (keep-alive interval added)

### Added
- Add-on mode detection for CORS handling

## [2.1.0] - 2024-12-13

### Added
- Initial Home Assistant add-on release
- Ingress support for sidebar access
- Automatic Home Assistant API token via Supervisor
- Persistent graph storage in /data/graphs
- Multi-architecture support (amd64, aarch64, armv7)

### Features from T2AutoTron 2.1.0
- Visual node-based automation editor
- Home Assistant entity control
- Philips Hue integration (direct bridge API)
- TP-Link Kasa integration (direct local API)
- Shelly device support (via HA)
- Real-time device state updates via Socket.IO
- Auto-save and graph management
- Plugin system for custom nodes (50+ included)
- Favorites panel for quick node access
- Backdrop nodes for visual organization
- Settings panel with connection testing
