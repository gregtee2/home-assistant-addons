## [2.1.150] - 2025-12-31
### Added
- **ElevenLabs TTS Integration**: TTS Announcement node now supports ElevenLabs AI voices (Charlotte, etc.) in addition to HA's built-in TTS services
- ElevenLabs API key and PUBLIC_URL settings in Settings panel

### Fixed
- **ElevenLabs Model Update**: Changed from deprecated `eleven_monolingual_v1` to `eleven_multilingual_v2` for free tier compatibility
- **TTS Socket Listener Stacking**: Fixed bug where test button would fire multiple times (stacking announcements)
- **Kasa TCP Timeout Spam**: Silenced the tplink-smarthome-api library's internal stack trace logging for device timeouts

# Changelog

## [2.1.147] - 2025-12-31

### Added
- **Sync New Device on Add**: When you add a new device to an HA Generic Device node, it now automatically syncs to match the current trigger state. If the trigger is ON but the new device is OFF, the device will be turned ON immediately. This only applies to "Follow" mode and only when adding new devices - manual changes to existing devices are still respected.

## [2.1.146] - 2025-12-30

### Added
- **Startup State Reconciliation**: Engine now queries actual HA device states before starting, then compares to what the graph expects. Devices already in the correct state won't receive unnecessary commands at startup. This prevents spurious OFF commands to devices that are already OFF, and reduces startup API spam.

### Changed
- **Engine Start is Async**: The `start()` method now awaits state reconciliation before processing the first tick. This adds ~1-2 seconds to startup but ensures clean state.

## [2.1.145] - 2025-12-30

### Fixed
- **Reduced Addon Log Noise**: Removed excessive per-tick logging from engine nodes. Previously, nodes like SplineTimelineColorNode, HADeviceStateNode, and HADeviceAutomationNode were logging every 100ms (70,000+ lines/day). Now only essential events are logged. Debug logs can still be enabled via `VERBOSE_LOGGING=true` environment variable.
- **BulkStateCache Log Frequency**: Reduced "Cache refreshed" log from every 30 seconds to every 10 minutes.

### Added
- **Command Tracking System**: New `/api/engine/commands` endpoint tracks all device commands with origin info (T2AutoTron, HA User, HA Automation, External). Helps answer "who changed that device and why?" Tracks both outgoing commands and incoming state changes with correlation.

## [2.1.144] - 2025-12-30

### Added
- **Device Audit System**: Engine now automatically compares its intended device states vs actual HA states every 5 minutes. Mismatches are logged to help debug "wrong state" issues. Check addon logs for `[AUDIT]` entries showing any devices that aren't matching expectations.
- **Audit API Endpoints**: Added `/api/engine/audit` to run an on-demand audit, and `/api/engine/audit/tracked` to see what devices are being tracked.

## [2.1.143] - 2025-12-29

### Fixed
- **WiZ Effect 400 Errors**: Fixed 400 Bad Request errors when triggering WiZ effects via Home Assistant.

## [2.1.142] - 2025-12-29

### Added
- **WiZ Effect Speed Control**: Added speed slider for animated WiZ effects (Ocean, Fireplace, Party, etc.) where applicable.

## [2.1.141] - 2025-12-29

### Improved
- **WiZ Effect Input Socket**: Replaced cycle mode with `effect_name` input socket for scheduled effect changes. Connect a Switch or Timeline node to change effects at different times (e.g., Ocean at 9pm, Fireplace at 10pm).

## [2.1.140] - 2025-12-29

### Added
- **WiZ Effect Cycle Mode**: Added optional cycling through effects on each trigger.

## [2.1.139] - 2025-12-29

### Improved
- **WiZ Effect Visual Preview**: Added animated color preview bar that shows what the selected effect looks like (flicker for Fireplace, waves for Ocean, strobing for Party, etc.). Changes in real-time as you select different effects.
- **Fixed Output Socket Alignment**: Output sockets now correctly appear to the right of labels (HSV Out, Active, Applied).

## [2.1.138] - 2025-12-29

### Added
- **WiZ Effect Node (Full)**: Frontend plugin for WiZ light effects! Select your WiZ lights, pick from 35+ effects (Fireplace, Ocean, Party, Christmas, Club, etc.), and trigger them on schedules or events. Works just like the Hue Effect node but for WiZ bulbs.

## [2.1.137] - 2025-12-29

### Added
- **Backend WizEffectNode**: WiZ Effect node for triggering built-in WiZ scenes (Fireplace, Ocean, Party, Christmas, etc.) via Home Assistant. Works in headless 24/7 mode just like HueEffectNode. Supports 35+ effects including Candlelight, Club, Deep dive, and more.

## [2.1.136] - 2025-12-29

### Fixed
- **Kasa Offline Log Spam Eliminated**: Fixed massive log spam where Kasa devices were incorrectly marked as "offline" every few seconds when they were just turned off. The library's UDP discovery events were unreliable - now we only detect offline via TCP polling failures. Devices must fail 3+ consecutive polls before being logged as offline (once).
- **Duplicate Notification Logs Removed**: Silenced "Skipped duplicate ON/OFF" log messages that cluttered the console.

## [2.1.135] - 2025-12-29

### Added
- **Backend HueEffectNode**: Hue Effect nodes now work in headless 24/7 mode. The engine can trigger Hue effects (candle, fire, prism, etc.) on schedules without the UI. Previously, Hue Effect nodes only worked when the browser was open.

## [2.1.134] - 2025-12-29

### Fixed
- **Backend Engine Label Mappings**: Added missing label-to-node mappings for `HA Lock Control` → `HALockNode`, `Stock Price` → `StockPriceNode`, and marked `HA Device Field` and `Hue Effect` as UI-only. Previously these nodes were skipped on engine startup with "Skipping unregistered node type" warnings.

## [2.1.133] - 2025-12-29

### Fixed
- **Engine Auto-Start Env Var**: Fixed mismatch between `ENGINE_AUTOSTART` (set in run.sh) and `ENGINE_AUTO_START` (checked in code). Now accepts both variants.
- **Auto-Start Diagnostic Logging**: Added detailed startup logs to diagnose when engine doesn't auto-load graph. Look for `[Engine] Auto-start check:` in addon logs to see exactly why engine did/didn't start.

## [2.1.132] - 2025-12-22

### Added
- **Lock Telegram Notifications**: HALockNode now sends Telegram notifications when lock state changes are verified. Messages include: `🔒 *Front Door* locked at 10:00 PM` or `⚠️ *Front Door* failed to lock after 3 attempts!`
- **Telegram Send API**: New `POST /api/telegram/send` endpoint for sending custom Telegram messages

## [2.1.131] - 2025-12-22

### Fixed
- **Lock Node Pulse Mode**: Fixed HALockNode not responding to first pulse. The "don't act on first value" logic was blocking pulse-triggered commands. Now correctly treats `undefined → false/true` as a valid state change.
- **Lock Command Verify & Retry**: Lock node now verifies command success after 5 seconds and automatically retries up to 3 times if the lock didn't respond. Provides console feedback with ✅/❌/🔄 status.

## [2.1.128] - 2025-12-22

### Fixed
- **Inject Node Pulse Mode (Backend)**: Backend engine now fully supports pulse mode and scheduled triggers. Previously the backend had a stripped-down InjectNode that lacked schedule time, day-of-week, and pulse mode support - causing scheduled automations to fail in headless mode.
- **Lock Node Pulse Detection**: HALockNode now properly resets trigger state when input returns to undefined, enabling reliable pulse-based automation.

## [2.1.122] - 2025-12-21

### Fixed
- **New Entity Auto-Discovery**: Entities added to Home Assistant after server start are now automatically discovered via WebSocket. Previously required server restart to see new devices.

## [2.1.121] - 2025-12-21

### Added
- **HA Lock Control Node**: New node for controlling smart locks (Kwikset, Schlage, August, etc.) via Home Assistant. Features Lock/Unlock buttons, real-time status display (🔒/🔓), device search, and trigger input for automation (true=unlock, false=lock). Outputs `state` and `is_locked` for logic gates.
- **Lock Domain Support**: HA Device Field node now supports lock entities with state, is_locked, and is_unlocked fields
- **Additional Device Domains**: Climate, Vacuum, and Camera entities now available in HA Device Field node

## [2.1.120] - 2025-12-21

### Added
- **Theme Presets System**: 6 built-in themes (Tron, Midnight, Sunset, Forest, Monochrome, High Contrast) with instant switching - no reload required!
- **Custom Theme Save**: Create your own color schemes and save them with custom names for later recall
- **Categorized Theme Editor**: Theme settings now organized into 5 categories:
  - 🎨 Core Colors (Primary, Background, Surface, Text)
  - 🚦 Status Colors (Success, Warning, Error)
  - 🔌 Socket Colors (Boolean, Number, String, HSV, Object, Light)
  - ✨ Node Glow Colors (per-category glow colors)
  - 📐 Editor (Border/Glow/Grid opacity sliders)
- **Live Preview**: All color changes apply instantly as you pick them
- **Transparent Settings Overlay**: Can see UI behind settings panel while choosing themes

### Fixed
- **Theme Color Picker**: Individual color picker overrides now work correctly and apply in real-time
- **UI Panel Theming**: Dock, Favorites Panel, and Forecast Panel now all respect theme colors

## [2.1.119] - 2025-12-21

### Fixed
- **HA Device Field Node Serialization**: Node now properly saves/restores all settings (device, field, filters) when copy/pasting or saving graphs. Uses same serialization pattern as HA Device State Output node.

## [2.1.118] - 2025-12-21

### Added
- **HA Device Field Node**: New simplified node that combines HA Device State Output + HA Device Automation into one easy-to-use package. Pick a device, pick a field (like `state`, `is_home`, `zone`), get the value. Perfect for presence detection! Includes type filter (Light, Switch, Sensor, Person, Device Tracker) and letter filter (ABC, DEF, etc.) to quickly find devices.

## [2.1.117] - 2025-12-21

### Fixed
- **Debug Dashboard False Positives**: Color mismatches are now only flagged when the light is actually ON. Previously, the dashboard would report "Engine sending Green, light shows Red" for lights that were OFF - which is expected behavior (HSV commands to OFF lights are harmless and ignored by HA).

## [2.1.116] - 2025-12-20

### Fixed
- **Comparison Node Re-evaluation**: The Comparison node now properly re-evaluates when you type in the Compare Value field. Previously, typing a new value wouldn't trigger the comparison to run - you had to reconnect a wire to force it. Now it updates instantly as you type.

## [2.1.115] - 2025-12-20

### Added
- **Device Tracker & Person Entity Support**: You can now use your iPhone (or any phone with HA Companion App) for presence detection! Select "Device Tracker" or "Person" in the HA Device State Output filter dropdown. New fields available: `state` (returns "home"/"not_home"), `zone` (current zone name), and `is_home` (boolean for logic gates). Perfect for "turn on lights when I get home" automations!

## [2.1.114] - 2025-12-20

### Fixed
- **Node Drag Improvements**: Multiple nodes can now be dragged from anywhere on their body, not just the title bar. Fixed: Weather Logic, Sunrise/Sunset, Time of Day, Color Gradient, and Spline Timeline Color nodes. Interactive controls (sliders, checkboxes, dropdowns) still work normally.

## [2.1.113] - 2025-12-20

### Fixed
- **Nested Backdrop Size Check**: Fixed bug where dragging a small (unlocked) backdrop inside a larger (locked) backdrop would incorrectly drag the parent too. Now only larger backdrops can "contain" smaller ones - a child can't capture its parent!

## [2.1.112] - 2025-12-20

### Fixed
- **Nested Backdrop Groups**: Backdrop nodes can now be nested inside other backdrop nodes! When you move the outer group, the inner group (and all its contents) now moves with it. Previously, nested backdrops would get left behind when moving the parent group.

## [2.1.111] - 2025-12-20

### Fixed
- **WeatherLogicNode Canvas Freeze**: Fixed bug where dropping a Weather Logic node in the add-on would freeze the canvas (couldn't move or delete). Was caused by accessing undefined output sockets before the node fully initialized. Added defensive checks to prevent crash.

## [2.1.110] - 2025-12-20

### Added
- **Ambient Weather Test Connection**: Added "Test Connection" button to the Ambient Weather settings section. Now you can verify your API Key, Application Key, and MAC Address are working before saving. Shows current temperature and humidity on success.

## [2.1.109] - 2025-12-20

### Fixed
- **HueEffectNode Light Discovery in Add-on**: Fixed bug where HueEffectNode couldn't discover Hue lights when running in the HA add-on environment. Was using raw `fetch()` instead of `window.apiFetch()` which handles the HA ingress URL correctly.

## [2.1.108] - 2025-12-20

### Fixed
- **Group Navigation Zoom Centering**: Fixed issue where clicking a group button didn't properly center the viewport on the group. Now uses manual zoom calculation for accurate centering.
- **Console Log Spam**: Removed debug logging from DeviceStateControl that was spamming the browser console.
- **Improved BackdropNode Detection**: Group buttons now detect backdrops more reliably using triple-check method.

## [2.1.107] - 2025-12-20

### Added
- **Group Navigation Buttons**: Quick-jump buttons in Event Log header for each Backdrop group. Click to zoom the canvas to that group. Buttons auto-update when groups are created, renamed, recolored, or deleted. Great for navigating large graphs!

## [2.1.106] - 2025-12-20

### Added
- **HueEffectNode**: New node to trigger built-in Hue light effects (candle, fire, prism, sunrise, etc.). Select multiple lights, wire inline with your color flow. Effects take priority over HSV commands automatically.
- **Smart HSV Exclusion**: When HueEffectNode is active, its selected lights are automatically excluded from downstream HSV commands via metadata. Other lights in the same HA Generic Device continue receiving colors normally.
- **HSV Passthrough Pattern**: HueEffectNode sits inline in color flow (Timeline → HueEffect → HA Device). Passes HSV through when inactive, runs effect when triggered.

## [2.1.105] - 2025-12-20

### Fixed
- **Reduced API Spam**: Removed 60-second forced update that was sending unnecessary commands every minute per device (~60 API calls/hour per light). Engine is now reliable enough that this LiteGraph-era workaround is no longer needed. Commands only sent when color actually changes.

## [2.1.104] - 2025-12-19

### Added
- **Debug Dashboard Button**: Added 🔍 Debug Dashboard button to Control Panel. Opens the debug dashboard in a new tab - no more remembering IP addresses or ports.

## [2.1.103] - 2025-12-19

### Fixed
- **HADeviceAutomationNode Not Working in Engine**: Backend engine was instantiating the wrong node class for "HA Device Automation" nodes. Registry mapped to `HAGenericDeviceNode` instead of `HADeviceAutomationNode`, causing numerical Timeline Color nodes to receive `null` values. Now correctly creates the field-extraction node.

## [2.1.102] - 2025-12-19

### Fixed
- **LOG_LEVEL Crash**: Add-on would crash on startup if `.env` had an invalid `LOG_LEVEL` value. Now accepts any string instead of crashing.

## [2.1.101] - 2025-12-19

### Fixed
- **Telegram Spam Fix**: Telegram notifications now only send on ON/OFF state changes, not on every brightness/color/HSV change. Previously, continuous color cycling would flood Telegram with thousands of messages per day.
- **Cleaner Telegram Messages**: New format: `💡 *Living Room* turned *OFF*` instead of verbose multi-line updates.
- **Debug Logging Gated**: HSV summary and recovery logs now only appear when `VERBOSE_LOGGING=true` in `.env`.

## [2.1.100] - 2025-12-19

### Fixed
- **HADeviceStateNode Retry Logic**: Instead of just keeping stale data on poll failure (band-aid), now actively retries failed polls with exponential backoff. First poll is immediate, then retries at 1s and 3s delays. Also adds 10-second fetch timeout to prevent hanging connections.
- **Dynamic Poll Backoff**: When HA polls fail, the node gradually increases poll interval (up to 30s) to reduce load on a struggling HA server, then returns to normal speed once connection recovers.
- **Error Categorization**: Poll failures now categorize error types (AUTH_FAILED, ENTITY_NOT_FOUND, TIMEOUT, DNS_FAILED, etc.) for better debugging.
- **Recovery Logging**: Console shows clear "✅ Recovered" message when connection comes back after failures.

## [2.1.99] - 2025-12-19

### Fixed
- **Numerical Mode "Goes to Sleep" Bug**: Timeline Color nodes in numerical mode were stopping after hours in headless engine mode. Root cause: if HADeviceStateNode's API poll failed once, it would overwrite the cached state with `null` and downstream nodes would get no data. Now keeps last known good state on poll failures.
- **Added Diagnostic Logging**: Engine now logs health check every 10 minutes. HADeviceStateNode, HADeviceAutomationNode, and SplineTimelineColorNode now log warnings when inputs go null (helps diagnose data flow issues).

## [2.1.98] - 2025-12-19

### Fixed
- **Brightness Bar 39% Bug**: Color bars in HAGenericDeviceNode and KasaLightNode now render correctly. Previously showed 39% when brightness was 100% due to Rete's RefComponent not calling the custom component. Fixed by rendering the bar inline instead of through RefComponent.

## [2.1.97] - 2025-12-19

### Fixed
- **HAGenericDeviceNode HA-Only Refactor**: Removed ~120 lines of unused Kasa/Hue direct API code. Node now only speaks Home Assistant format - HA handles device translation.
- **Auto-Refresh Removal**: Removed 30-second polling interval from HAGenericDeviceNode. With 20 nodes, that was 2,400 API calls/hour for no reason. Real-time updates come via WebSocket push instead.
- **Brightness Scale Fix**: Fixed double-normalization where 100 was divided by 255 again (100/255=39%).

## [2.1.94-96] - 2025-12-19

### Fixed
- **Memory Leaks in HA Nodes**: Socket listeners now properly cleaned up on component unmount
- **DelayNode Memory Leak**: Countdown interval now cleaned up via destroy() method

## [2.1.93] - 2025-12-18

### Added
- **Download Graph Feature**: New "📥 Download Graph" button lets you export the current graph as a JSON file. Also added download buttons to the Load Graph modal for saved graphs. Perfect for backing up or transferring graphs between Pi and Windows.

## [2.1.92] - 2025-12-18

### Fixed
- **Timeline Color Broken After Performance Fix**: Restored engine update interval for Timeline Color nodes. The performance fix in v2.1.91 accidentally removed the engine updates - now has dedicated interval when timer/preview is active.

## [2.1.91] - 2025-12-18

### Fixed
- **Memory Leak / Performance**: TimeRangeNode, DayOfWeekComparisonNode, and SplineTimelineColorNode now only trigger changeCallback when their output values actually change. Reduced redundant calls from 100+/second to only when needed.

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
