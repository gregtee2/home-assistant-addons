# T2AutoTron Documentation

Welcome to T2AutoTron! This is a visual node-based automation editor for Home Assistant that runs **24/7 on your server** - your automations keep running even when you close the browser.

![T2AutoTron Main Interface](https://raw.githubusercontent.com/gregtee2/T2AutoTron/stable/screenshots/Main_Canvas.png)

---

## 🌟 What Makes T2AutoTron Different

### ⚡ 24/7 Backend Engine
Unlike browser-based automation tools, T2AutoTron has a **server-side engine** that runs continuously:
- **Close your browser** → automations keep running
- **Restart Home Assistant** → engine auto-restarts with your last graph
- **No more "automations stopped when I closed the tab"**

### 🎨 Visual Node Editor
Build automations by connecting nodes visually - no YAML or coding required. Just drag, drop, and connect.

### 🔌 Plugin System
Add new node types without rebuilding. Community plugins can be dropped into the plugins folder and work immediately.

---

## 🚀 Quick Start

### Step 1: Open T2AutoTron
After installation, click **Open Web UI** or find T2AutoTron in your HA sidebar.

### Step 2: Add Your First Node
**Right-click** anywhere on the canvas to open the node menu.

![Context Menu](https://raw.githubusercontent.com/gregtee2/T2AutoTron/stable/screenshots/Context_Menu.png)

### Step 3: Connect a Device
1. Right-click → **Home Assistant** → **HA Generic Device**
2. Click **+ Add Device** on the node
3. Select your devices from the dropdown (auto-populated from HA)
4. Use the toggle buttons to test control

### Step 4: Create an Automation
Connect nodes together! For example:
1. Add a **Sunrise/Sunset** node (Timer/Event category)
2. Connect its `trigger_on` output → device's `trigger` input
3. Your lights now turn on at sunrise automatically!

### Step 5: Save Your Work
Click the **💾 Save** button in the Control Panel (right side). Your graph is saved to the server and will auto-load next time.

---

## 🏗️ Understanding the Architecture

### The Canvas
- **Center**: Main editing area - drag nodes here
- **Right Panel**: Control Panel with save/load, status indicators
- **Left Panel**: Favorites - drag nodes here for quick access

### How Nodes Work

Every node has:
- **Input sockets** (left side, colored circles) - receive data from other nodes
- **Output sockets** (right side) - send data to other nodes
- **Properties/Controls** - configure the node's behavior

**The key insight:** The real power comes from connecting nodes. While you can manually click buttons, automations work by having one node's output drive another node's input.

### Frontend vs Backend

| Frontend (Browser) | Backend (Server) |
|-------------------|------------------|
| Visual editor UI | 24/7 automation engine |
| Preview/test automations | Actually controls devices |
| Optional - close anytime | Always running |
| Great for editing | Great for production |

When you save a graph, it's loaded into the backend engine which runs continuously.

---

## 📦 Node Categories

### 🏠 Home Assistant
Control any HA entity - lights, switches, sensors, climate, media players, etc.

| Node | Purpose |
|------|---------|
| **HA Generic Device** | Control any HA device (recommended for most uses) |
| **HA Device Automation** | Create automations that follow device state changes |

### ⏱️ Timer/Event
Schedule and time-based triggers.

| Node | Purpose |
|------|---------|
| **Current Time** | Outputs current hour/minute/second |
| **Time of Day** | Define periods (Morning, Day, Evening, Night) |
| **Sunrise/Sunset** | Trigger at sun events (uses your HA location) |
| **Delay** | Delay a signal by X seconds |
| **Debounce** | Only trigger after input stops changing |
| **Retriggerable Timer** | Stay on while triggered, turn off after timeout |

### 🔀 Logic
Combine and process signals.

| Node | Purpose |
|------|---------|
| **AND / OR / NOT** | Boolean logic gates |
| **Compare** | Compare numbers (>, <, ==, etc.) |
| **Threshold** | Output true when value crosses threshold |
| **Conditional Switch** | Route signals based on conditions |
| **Latch / Toggle** | Memory and toggle behavior |

### 🎨 Color
Control light colors.

| Node | Purpose |
|------|---------|
| **HSV Control** | Manual color picker with sliders |
| **Timeline Color** | Schedule colors throughout the day |
| **Color Gradient** | Blend between colors |
| **HSV Modifier** | Adjust hue/saturation/brightness |

### 📥 Inputs
Manual controls and constants.

| Node | Purpose |
|------|---------|
| **Toggle** | Manual on/off button |
| **Number Slider** | Adjustable numeric value |
| **Integer Selector** | Pick from a list of numbers |

### 🔧 Utility
Helper nodes.

| Node | Purpose |
|------|---------|
| **Sender / Receiver** | Pass values between disconnected parts of your graph |
| **Display** | Show values for debugging |
| **Counter** | Count triggers |
| **State Machine** | Complex multi-state logic |

### 💡 Direct Devices
Control devices without Home Assistant.

| Node | Purpose |
|------|---------|
| **Hue Light** | Control Philips Hue directly via bridge API |
| **Kasa Plug/Light** | Control TP-Link Kasa devices directly |

---

## ⚙️ Configuration

### Settings Panel
Click **⚙️ Settings** in the Control Panel to configure:

| Setting | Purpose |
|---------|---------|
| **Home Assistant** | URL and token (usually auto-detected in add-on) |
| **Philips Hue** | Bridge IP and username for direct Hue control |
| **Ambient Weather** | API keys for personal weather station integration |
| **Telegram** | Bot token for notifications |
| **Location** | City for sunrise/sunset calculations |

### Weather Integration

T2AutoTron supports two weather sources:

1. **Open-Meteo** (default, free, no API key needed)
   - 5-day forecast
   - Basic current conditions
   - Works out of the box!

2. **Ambient Weather** (optional, for weather station owners)
   - Requires Ambient Weather personal weather station
   - Get API keys from [ambientweather.net/account](https://ambientweather.net/account)
   - Enter in Settings: API Key, Application Key, Device MAC Address
   - The **Weather Logic Node** uses this for real-time local conditions

---

## 💾 Saving & Loading

### Auto-Save
Your work is automatically saved every 2 minutes.

### Manual Save
Click **💾 Save** to save with a custom filename. You can:
- Type a new filename
- Click an existing graph to overwrite it

### Loading Graphs
Click **📂 Load** to see saved graphs. Click one to load it.

### Graph Storage
Graphs are stored in `/data/graphs/` inside the add-on container. This persists across add-on updates.

---

## 🔌 Engine Status

The **Engine Status** indicator in the Control Panel shows:
- 🟢 **Green** - Engine running, automations active
- ⚪ **Gray** - Engine stopped

Click the indicator to start/stop the engine manually.

### Engine Uptime
The engine shows uptime in the Control Panel. If automations aren't working, check that the engine is running!

---

## 🛠️ Troubleshooting

### No Devices Showing
1. Check HA connection status (green indicator in Control Panel)
2. Click **Settings** → **Test Connection** for Home Assistant
3. Make sure your HA token is valid

### Automations Not Running
1. Check Engine Status is green (running)
2. Make sure you've saved your graph (auto-saves every 2 min)
3. Check node connections - inputs must be connected to work

### Devices Not Responding
1. Test manual control first (toggle buttons on device nodes)
2. Check the specific device in Home Assistant directly
3. For Hue/Kasa: verify Settings have correct credentials

### Graph Loading Slowly
- Normal for complex graphs (20+ nodes)
- Device data is cached after first load
- Subsequent loads are faster

### Colors Not Changing (Timeline Color)
1. Make sure HSV output is connected to device's HSV input
2. Verify the Timeline has colors defined for current time period
3. Check that Time of Day node is providing start/end times

---

## 📚 Examples

### Sunset Lights On
```
[Sunrise/Sunset] --trigger_off--> [HA Generic Device]
```
Lights turn on automatically at sunset.

### Motion-Activated with Timeout
```
[HA Sensor (motion)] --state--> [Retriggerable Timer] --output--> [HA Light]
```
Light turns on when motion detected, stays on while motion continues, turns off 5 minutes after motion stops.

### Color Schedule
```
[Time of Day] --startTime/endTime--> [Timeline Color] --hsv_info--> [HA Light]
```
Lights automatically change color based on time: warm in morning, cool during day, dim at night.

### Weather-Based Automation
```
[Weather Logic] --isRaining--> [HA Switch (dehumidifier)]
```
Turn on dehumidifier when it's raining (requires Ambient Weather setup).

---

## 🔄 Updating

### Plugin Updates (Fast)
Click **🔌 Update Plugins** to download the latest node plugins without rebuilding.

### Full Updates
When a new version is available:
1. Go to **Settings** → **Add-ons** → **T2AutoTron**
2. Click **Update** if available
3. Wait for rebuild (5-10 minutes on Raspberry Pi)

---

## 📖 More Resources

- [GitHub Repository](https://github.com/gregtee2/T2AutoTron)
- [Getting Started Guide](https://github.com/gregtee2/T2AutoTron/blob/stable/v3_migration/GETTING_STARTED.md)
- [Plugin Development](https://github.com/gregtee2/T2AutoTron/blob/stable/v3_migration/PLUGIN_ARCHITECTURE.md)
- [Report Issues](https://github.com/gregtee2/T2AutoTron/issues)
