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

## Configuration

| Option | Description | Default |
|--------|-------------|---------|
| `log_level` | Logging verbosity (debug, info, warning, error) | `info` |

## Access

Once running, T2AutoTron is available:
- Via the **sidebar** (if ingress is enabled)
- Directly at `http://your-ha-ip:3000`

## Saved Graphs

Your automation graphs are saved in `/data/graphs` which persists across add-on updates.

## Support

- [GitHub Issues](https://github.com/gregtee2/T2AutoTron/issues)
- [Documentation](https://github.com/gregtee2/T2AutoTron#readme)

## License

MIT License - See [LICENSE](https://github.com/gregtee2/T2AutoTron/blob/main/LICENSE)
