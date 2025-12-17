# T2AutoTron Home Assistant Add-on

Visual node-based smart home automation editor with a **24/7 backend engine** - your automations run even when you close the browser!

![T2AutoTron Editor](https://raw.githubusercontent.com/gregtee2/T2AutoTron/stable/screenshots/Main_Canvas.png)

## 🤔 Why T2AutoTron?

Back in 2003, I got into home automation. Every app I found was menu-driven - you'd click through screens to set up rules, but you couldn't *see* the logic flow. As a visual effects artist running **Nuke** (a node-based compositing tool), I kept thinking: *"Why can't I just connect device nodes, trigger nodes, and logic nodes together?"*

Nothing like that existed, and I wasn't a programmer. Fast forward 20 years - LLMs changed everything. I could finally design the app I'd always wanted while AI handled the code.

**T2AutoTron is that app.** A visual-first automation editor where you *see* your automations flow in real-time.

### Not a Node-RED replacement - a visual alternative

| | T2AutoTron | Node-RED |
|-|-----------|----------|
| **Philosophy** | See data flow live on nodes | Debug via text sidebar |
| **Learning curve** | Lower - no msg.payload | Steeper |
| **Color tools** | Built-in HSV, timelines | Manual setup |

See the [full comparison](DOCS.md) in the Documentation tab.

### Why share this?

I'm sure there are others who'd appreciate a visual approach. But this is **beta software** - I need testers! Click the 🐛 **Report Bug** button in the app to help make it better.

## ✨ Features

- 🎨 **Visual Node Editor** - Drag-and-drop automation building with Rete.js
- ⚡ **24/7 Backend Engine** - Automations run on the server, not in your browser
- 🏠 **Native HA Integration** - Direct access to all Home Assistant entities
- 💡 **Multi-Platform Device Support:**
  - Home Assistant (all entities)
  - Philips Hue (direct bridge API - no HA required)
  - TP-Link Kasa (direct local API - no HA required)
  - Shelly (via Home Assistant)
- 🔌 **50+ Node Types** - Time, logic, color, weather, and more
- 🔄 **Hot Plugin Updates** - Add new nodes without rebuilding
- 💾 **Auto-Save** - Never lose your work

## 🚀 Installation

1. Add this repository to Home Assistant:
   - Go to **Settings** → **Add-ons** → **Add-on Store**
   - Click the **⋮** menu → **Repositories**
   - Add: `https://github.com/gregtee2/home-assistant-addons`

2. Find "T2AutoTron" in the add-on store and click **Install**

3. Wait for the build to complete (5-10 minutes on Raspberry Pi)

4. Start the add-on and click **Open Web UI**

## 🎯 Quick Start

1. **Right-click** on the canvas to add nodes
2. Add an **HA Generic Device** node and select your devices
3. Add a **Sunrise/Sunset** node
4. Connect `trigger_off` → device's `trigger` input
5. **Save** your graph - it now runs 24/7!

![Building Automations](https://raw.githubusercontent.com/gregtee2/T2AutoTron/stable/screenshots/Flow_Exmaple.png)

## 🔧 Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `log_level` | Logging verbosity (debug, info, warning, error) | `info` |

### Optional Integrations

Configure in **Settings** within the app:

| Integration | Purpose | Required? |
|-------------|---------|-----------|
| **Philips Hue** | Direct bridge control (no HA) | Optional |
| **Ambient Weather** | Personal weather station data | Optional |
| **Telegram** | Notification alerts | Optional |

## 🌤️ Weather Support

- **Open-Meteo** (default): Works out of the box, no API key needed
- **Ambient Weather** (optional): For personal weather station owners
  - Get API keys from [ambientweather.net/account](https://ambientweather.net/account)
  - Required for Weather Logic Node

## 📦 Node Categories

| Category | Examples |
|----------|----------|
| **Home Assistant** | HA Generic Device, HA Device Automation |
| **Timer/Event** | Sunrise/Sunset, Time of Day, Delay, Debounce |
| **Logic** | AND, OR, NOT, Compare, Threshold, Switch |
| **Color** | HSV Control, Timeline Color, Color Gradient |
| **Inputs** | Toggle, Number Slider, Trigger Button |
| **Utility** | Sender/Receiver, Display, Counter |
| **Direct Devices** | Hue Light, Kasa Plug |

## 💾 Data Persistence

Your graphs are saved in `/data/graphs/` and persist across add-on updates and restarts.

## 🔄 Updates

- **Plugin Updates**: Click "🔌 Update Plugins" in the Control Panel (fast, no rebuild)
- **Full Updates**: Use the add-on Update button when new versions are available

## 📖 Documentation

See the **Documentation** tab for detailed guides, or visit:
- [Full Documentation](https://github.com/gregtee2/T2AutoTron)
- [Getting Started Guide](https://github.com/gregtee2/T2AutoTron/blob/stable/v3_migration/GETTING_STARTED.md)
- [Report Issues](https://github.com/gregtee2/T2AutoTron/issues)

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| No devices showing | Check HA connection in Control Panel → Settings → Test Connection |
| Automations not running | Check Engine Status is green (running) in Control Panel |
| Slow graph loading | Normal for 20+ nodes; caches after first load |
| Build failed | Check add-on logs; report issue on GitHub |

## Support

- [GitHub Issues](https://github.com/gregtee2/T2AutoTron/issues)
- [Discussions](https://github.com/gregtee2/T2AutoTron/discussions)

## License

MIT License
