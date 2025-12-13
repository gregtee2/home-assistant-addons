# T2AutoTron Home Assistant Add-on

Visual node-based smart home automation editor that runs as a Home Assistant add-on.

## Features

- 🎨 **Visual Node Editor** - Drag-and-drop automation building with Rete.js
- 🏠 **Native HA Integration** - Direct access to all Home Assistant entities
- 💡 **Multi-Platform Device Support:**
  - Home Assistant (all entities)
  - Philips Hue (direct bridge API)
  - TP-Link Kasa (direct local API)
  - Shelly (via Home Assistant)
- ⚡ **Real-time** - Socket.IO for instant device state updates
- 🔌 **Plugin System** - Extensible with custom nodes
- 🔄 **Hot Plugin Updates** - Update plugins without rebuilding

## Installation

1. Add this repository to Home Assistant:
   - Go to **Settings** → **Add-ons** → **Add-on Store**
   - Click the **⋮** menu → **Repositories**
   - Add: `https://github.com/gregtee2/home-assistant-addons`

2. Find "T2AutoTron" in the add-on store and click **Install**

3. Start the add-on and click **Open Web UI**

> **Note:** First build takes 5-10 minutes on Raspberry Pi as it compiles the frontend.

## Quick Start Guide

### The Canvas

When you open T2AutoTron, you'll see:
- **Canvas** (center) - Where you build automations by connecting nodes
- **Control Panel** (right) - Graph controls, connection status, settings
- **Favorites Panel** (left) - Quick access to frequently-used nodes

**Right-click** on the canvas to open the node menu and add nodes.

### Essential Nodes

#### 🏠 HA Generic Device Node
**The backbone of device control.** This single node can control ANY Home Assistant entity.

1. Right-click → **Home Assistant** → **HA Generic Device**
2. Click **+ Add Device** to add devices
3. Select devices from the dropdown (auto-populated from HA)
4. Use the built-in controls or connect inputs

**Inputs:**
- `trigger` → Turn devices on (true) or off (false)
- `hsv_info` → Control light color `{ hue: 0-1, saturation: 0-1, brightness: 0-254 }`

#### ⏰ Sunrise/Sunset Node
Automatically triggers based on sun position at your location.

1. Right-click → **Timer/Event** → **Sunrise/Sunset**
2. Location auto-detects from Home Assistant
3. Connect outputs to device triggers

**Outputs:**
- `is_daytime` → true during day, false at night
- `trigger_on` → Pulses true at sunrise
- `trigger_off` → Pulses true at sunset

#### 🎨 Color/HSV Nodes
Control light colors with visual color pickers.

- **HSV Control** - Manual color picker with sliders
- **Timeline Color** - Schedule colors throughout the day
- **Spline Curve** - Create smooth color transitions

### Your First Automation

**Example: Turn on lights at sunset**

1. Add a **Sunrise/Sunset** node
2. Add an **HA Generic Device** node
3. Select your lights in the device node
4. Connect `trigger_off` (sunset) → `trigger` input
5. Click **▶ Run** in the Control Panel

**Example: Color lights based on time of day**

1. Add a **Timeline Color** node
2. Add an **HA Generic Device** node with lights
3. Connect `hsv_info` output → `hsv_info` input
4. Configure colors for different times of day
5. Click **▶ Run**

### Node Categories

| Category | Purpose |
|----------|---------|
| **Home Assistant** | Device control, state monitoring, automations |
| **Timer/Event** | Schedules, delays, sunrise/sunset, debounce |
| **Logic** | AND, OR, NOT, comparisons, conditions |
| **Color** | HSV control, color mixing, timeline colors |
| **Inputs** | Manual triggers, sliders, toggles |
| **Utility** | Math, buffers, state machines |

### Tips

- **Save often** - Click 💾 Save in the Control Panel
- **Use Favorites** - Drag nodes to the left panel for quick access
- **Test incrementally** - Build and test small sections before connecting everything
- **Check status** - The Control Panel shows connection status for HA, Hue, Kasa

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `log_level` | Logging verbosity (debug, info, warning, error) | `info` |

## Updating

### Plugin Updates (Fast - No Rebuild)
Click **🔌 Update Plugins** in the Control Panel to download latest plugin fixes.

### Full Updates (Rebuild Required)
For major updates, rebuild the add-on from the Add-on page.

## Saved Graphs

Your automation graphs are saved in `/data/graphs` which persists across add-on updates.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| No devices showing | Check HA connection status in Control Panel |
| Devices not responding | Verify HA token is valid in Settings |
| Graph not running | Click **▶ Run** in Control Panel |
| UI frozen | Press **F5** to reset the editor view |

## Support

- [GitHub Issues](https://github.com/gregtee2/T2AutoTron/issues)
- [Full Documentation](https://github.com/gregtee2/T2AutoTron#readme)
- [Getting Started Guide](https://github.com/gregtee2/T2AutoTron/blob/main/v3_migration/GETTING_STARTED.md)

## License

MIT License - See [LICENSE](https://github.com/gregtee2/T2AutoTron/blob/main/LICENSE)
