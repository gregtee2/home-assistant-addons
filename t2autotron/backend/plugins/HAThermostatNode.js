/**
 * HAThermostatNode.js - Control Home Assistant Climate/Thermostat entities
 * 
 * Supports: Nest, Ecobee, Honeywell, and any HA climate entity
 * 
 * Features:
 * - Visual temperature display with current/target
 * - Mode selector (Heat/Cool/Auto/Off)
 * - Temperature slider with configurable range
 * - Real-time state updates via Socket.IO
 * - Outputs for automation: current_temp, target_temp, hvac_action, etc.
 */

(function() {
    if (!window.Rete || !window.React || !window.RefComponent || !window.sockets) {
        console.error("[HAThermostatNode] Missing dependencies");
        return;
    }

    if (!window.T2Controls) {
        console.error("[HAThermostatNode] Missing T2Controls - ensure 00_SharedControlsPlugin.js loads first");
        return;
    }
    if (!window.T2HAUtils) {
        console.error("[HAThermostatNode] Missing T2HAUtils - ensure 00_HABasePlugin.js loads first");
        return;
    }

    const { ClassicPreset } = window.Rete;
    const React = window.React;
    const { useState, useEffect, useRef, useCallback } = React;
    const RefComponent = window.RefComponent;
    const sockets = window.sockets;
    const socket = window.socket;

    const { HelpIcon, NodeHeader, stopPropagation } = window.T2Controls;
    const { normalizeDeviceId, stripDevicePrefix, isSameDevice } = window.T2HAUtils;

    // -------------------------------------------------------------------------
    // TOOLTIPS
    // -------------------------------------------------------------------------
    const tooltips = {
        node: "Control Home Assistant thermostats and climate devices.\n\nSupports Nest, Ecobee, Honeywell, and any HA climate entity.\n\nConnect target_temp input to automate temperature setpoint.\nConnect hvac_mode input to automate mode changes.",
        inputs: {
            target_temp: "Set the target temperature.\n\nNumber value in your configured unit (°F or °C).\n\nExample: 72 for 72°F",
            hvac_mode: "Set the HVAC mode.\n\nAccepted values:\n• heat - Heating only\n• cool - Cooling only\n• heat_cool - Auto (heat or cool as needed)\n• off - System off\n• auto - Let thermostat decide"
        },
        outputs: {
            current_temp: "Current temperature reading from the thermostat.\n\nUpdates in real-time.",
            target_temp: "Current target/setpoint temperature.\n\nThis is what the thermostat is trying to reach.",
            hvac_mode: "Current HVAC mode:\n• heat, cool, heat_cool, off, auto",
            hvac_action: "What the system is doing RIGHT NOW:\n• heating - Actively heating\n• cooling - Actively cooling\n• idle - At target, doing nothing\n• off - System is off",
            humidity: "Current humidity reading (if available).\n\nNot all thermostats report this."
        }
    };

    // -------------------------------------------------------------------------
    // CONSTANTS
    // -------------------------------------------------------------------------
    const HVAC_MODES = ['off', 'heat', 'cool', 'heat_cool', 'auto'];
    const HVAC_MODE_LABELS = {
        'off': '⏹️ Off',
        'heat': '🔥 Heat',
        'cool': '❄️ Cool',
        'heat_cool': '⚡ Auto',
        'auto': '🤖 Auto'
    };
    const HVAC_ACTION_ICONS = {
        'heating': '🔥',
        'cooling': '❄️',
        'idle': '😴',
        'off': '⏹️',
        'drying': '💧',
        'fan': '🌀'
    };

    // -------------------------------------------------------------------------
    // NODE CLASS
    // -------------------------------------------------------------------------
    class HAThermostatNode extends ClassicPreset.Node {
        constructor(changeCallback) {
            super("Thermostat");
            this.width = 320;
            this.height = 380;
            this.changeCallback = changeCallback;

            // Inputs
            this.addInput("target_temp", new ClassicPreset.Input(sockets.number, "Target Temp"));
            this.addInput("hvac_mode", new ClassicPreset.Input(sockets.any, "HVAC Mode"));

            // Outputs
            this.addOutput("current_temp", new ClassicPreset.Output(sockets.number, "Current Temp"));
            this.addOutput("target_temp_out", new ClassicPreset.Output(sockets.number, "Target Temp"));
            this.addOutput("hvac_mode_out", new ClassicPreset.Output(sockets.any, "HVAC Mode"));
            this.addOutput("hvac_action", new ClassicPreset.Output(sockets.any, "HVAC Action"));
            this.addOutput("humidity", new ClassicPreset.Output(sockets.number, "Humidity"));

            this.properties = {
                deviceId: null,
                deviceName: 'Select Thermostat',
                currentTemp: null,
                targetTemp: null,
                targetTempHigh: null,  // For heat_cool mode
                targetTempLow: null,   // For heat_cool mode
                hvacMode: 'off',
                hvacAction: 'idle',
                humidity: null,
                tempUnit: '°F',
                minTemp: 50,
                maxTemp: 90,
                tempStep: 1,
                supportedModes: HVAC_MODES,
                lastCommandTime: 0
            };
        }

        data(inputs) {
            // Handle input-driven automation
            const targetTempInput = inputs.target_temp?.[0];
            const hvacModeInput = inputs.hvac_mode?.[0];

            // These would trigger API calls in the component
            // Store them for the component to read
            this._pendingTargetTemp = targetTempInput;
            this._pendingHvacMode = hvacModeInput;

            return {
                current_temp: this.properties.currentTemp,
                target_temp_out: this.properties.targetTemp,
                hvac_mode_out: this.properties.hvacMode,
                hvac_action: this.properties.hvacAction,
                humidity: this.properties.humidity
            };
        }

        serialize() {
            return {
                deviceId: this.properties.deviceId,
                deviceName: this.properties.deviceName,
                minTemp: this.properties.minTemp,
                maxTemp: this.properties.maxTemp,
                tempStep: this.properties.tempStep
            };
        }

        restore(state) {
            const props = state.properties || state;
            if (props) {
                Object.assign(this.properties, props);
            }
        }
    }

    // -------------------------------------------------------------------------
    // COMPONENT
    // -------------------------------------------------------------------------
    function HAThermostatNodeComponent({ data, emit }) {
        const [climateDevices, setClimateDevices] = useState([]);
        const [state, setState] = useState({
            deviceId: data.properties.deviceId,
            deviceName: data.properties.deviceName,
            currentTemp: data.properties.currentTemp,
            targetTemp: data.properties.targetTemp,
            targetTempHigh: data.properties.targetTempHigh,
            targetTempLow: data.properties.targetTempLow,
            hvacMode: data.properties.hvacMode,
            hvacAction: data.properties.hvacAction,
            humidity: data.properties.humidity,
            tempUnit: data.properties.tempUnit,
            supportedModes: data.properties.supportedModes,
            minTemp: data.properties.minTemp,
            maxTemp: data.properties.maxTemp
        });
        const [isLoading, setIsLoading] = useState(false);
        const [error, setError] = useState(null);
        const lastCommandRef = useRef(0);
        const pendingCommandRef = useRef(null);

        // Fetch climate devices on mount
        useEffect(() => {
            fetchClimateDevices();
            
            // Listen for device state updates
            const handleStateUpdate = (update) => {
                if (!state.deviceId) return;
                const entityId = stripDevicePrefix(state.deviceId);
                if (update.entity_id === entityId || isSameDevice(update.entity_id, state.deviceId)) {
                    updateStateFromHA(update);
                }
            };

            socket?.on('device-state-update', handleStateUpdate);
            
            return () => {
                socket?.off('device-state-update', handleStateUpdate);
            };
        }, [state.deviceId]);

        // Fetch initial device state when device is selected
        useEffect(() => {
            if (state.deviceId) {
                fetchDeviceState();
            }
        }, [state.deviceId]);

        // Handle input-driven automation
        useEffect(() => {
            if (data._pendingTargetTemp !== undefined && data._pendingTargetTemp !== null) {
                const temp = Number(data._pendingTargetTemp);
                if (!isNaN(temp) && temp !== state.targetTemp) {
                    setTemperature(temp);
                }
            }
            if (data._pendingHvacMode && data._pendingHvacMode !== state.hvacMode) {
                setHvacMode(data._pendingHvacMode);
            }
        }, [data._pendingTargetTemp, data._pendingHvacMode]);

        const fetchClimateDevices = async () => {
            try {
                const fetchFn = window.apiFetch || fetch;
                const response = await fetchFn('/api/devices');
                if (response.ok) {
                    const data = await response.json();
                    // API returns object with grouped arrays, flatten all HA devices
                    let allDevices = [];
                    if (Array.isArray(data)) {
                        allDevices = data;
                    } else if (data.ha_) {
                        allDevices = data.ha_ || [];
                    } else {
                        // Flatten all keys that start with ha_
                        Object.keys(data).forEach(key => {
                            if (key.startsWith('ha_') && Array.isArray(data[key])) {
                                allDevices = allDevices.concat(data[key]);
                            }
                        });
                    }
                    
                    // Filter to only climate entities
                    const climate = allDevices.filter(d => {
                        const id = d.entity_id || d.id || '';
                        return id.includes('climate.');
                    });
                    console.log('[HAThermostatNode] Found climate devices:', climate.length, climate);
                    setClimateDevices(climate);
                }
            } catch (e) {
                console.error('[HAThermostatNode] Failed to fetch devices:', e);
            }
        };

        const fetchDeviceState = async () => {
            if (!state.deviceId) return;
            
            setIsLoading(true);
            try {
                const entityId = stripDevicePrefix(state.deviceId);
                const fetchFn = window.apiFetch || fetch;
                const response = await fetchFn(`/api/ha/states/${entityId}`);
                
                if (response.ok) {
                    const stateData = await response.json();
                    updateStateFromHA(stateData);
                    setError(null);
                } else {
                    setError('Failed to fetch state');
                }
            } catch (e) {
                console.error('[HAThermostatNode] Failed to fetch state:', e);
                setError(e.message);
            } finally {
                setIsLoading(false);
            }
        };

        const updateStateFromHA = (haState) => {
            const attrs = haState.attributes || {};
            const newState = {
                currentTemp: attrs.current_temperature ?? null,
                targetTemp: attrs.temperature ?? null,
                targetTempHigh: attrs.target_temp_high ?? null,
                targetTempLow: attrs.target_temp_low ?? null,
                hvacMode: haState.state || 'off',
                hvacAction: attrs.hvac_action || 'idle',
                humidity: attrs.current_humidity ?? null,
                tempUnit: attrs.temperature_unit || '°F',
                supportedModes: attrs.hvac_modes || HVAC_MODES,
                minTemp: attrs.min_temp || 50,
                maxTemp: attrs.max_temp || 90
            };

            setState(prev => ({ ...prev, ...newState }));
            Object.assign(data.properties, newState);
            
            if (data.changeCallback) data.changeCallback();
        };

        const setTemperature = async (temp) => {
            if (!state.deviceId) return;
            
            // Throttle commands
            const now = Date.now();
            if (now - lastCommandRef.current < 1000) {
                // Queue the command
                pendingCommandRef.current = temp;
                return;
            }
            lastCommandRef.current = now;

            const entityId = stripDevicePrefix(state.deviceId);
            try {
                const fetchFn = window.apiFetch || fetch;
                await fetchFn('/api/ha/service', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        domain: 'climate',
                        service: 'set_temperature',
                        entity_id: entityId,
                        data: { temperature: temp }
                    })
                });

                // Optimistic update
                setState(prev => ({ ...prev, targetTemp: temp }));
                data.properties.targetTemp = temp;
                if (data.changeCallback) data.changeCallback();
            } catch (e) {
                console.error('[HAThermostatNode] Failed to set temperature:', e);
            }
        };

        const setHvacMode = async (mode) => {
            if (!state.deviceId || !mode) return;

            const entityId = stripDevicePrefix(state.deviceId);
            try {
                const fetchFn = window.apiFetch || fetch;
                await fetchFn('/api/ha/service', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        domain: 'climate',
                        service: 'set_hvac_mode',
                        entity_id: entityId,
                        data: { hvac_mode: mode }
                    })
                });

                // Optimistic update
                setState(prev => ({ ...prev, hvacMode: mode }));
                data.properties.hvacMode = mode;
                if (data.changeCallback) data.changeCallback();
            } catch (e) {
                console.error('[HAThermostatNode] Failed to set HVAC mode:', e);
            }
        };

        const selectDevice = (deviceId, deviceName) => {
            setState(prev => ({ ...prev, deviceId, deviceName }));
            data.properties.deviceId = deviceId;
            data.properties.deviceName = deviceName;
            if (data.changeCallback) data.changeCallback();
        };

        // Get display values
        const currentTemp = state.currentTemp !== null ? Math.round(state.currentTemp) : '--';
        const targetTemp = state.targetTemp !== null ? Math.round(state.targetTemp) : '--';
        const actionIcon = HVAC_ACTION_ICONS[state.hvacAction] || '❓';
        const actionText = state.hvacAction ? state.hvacAction.charAt(0).toUpperCase() + state.hvacAction.slice(1) : 'Unknown';

        // Temperature ring color based on action
        let ringColor = '#666';
        if (state.hvacAction === 'heating') ringColor = '#ff6b35';
        else if (state.hvacAction === 'cooling') ringColor = '#4dabf7';
        else if (state.hvacAction === 'idle') ringColor = '#51cf66';

        return React.createElement('div', {
            className: 'thermostat-node',
            style: {
                padding: '12px',
                background: 'linear-gradient(180deg, rgba(20,25,35,0.95) 0%, rgba(15,20,30,0.98) 100%)',
                borderRadius: '8px',
                minWidth: '280px'
            }
        }, [
            // Header
            NodeHeader && React.createElement(NodeHeader, {
                key: 'header',
                icon: '🌡️',
                title: data.label || 'Thermostat',
                tooltip: tooltips.node
            }),

            // Device selector
            React.createElement('div', {
                key: 'device-select',
                style: { marginBottom: '12px' }
            }, [
                React.createElement('select', {
                    key: 'dropdown',
                    value: state.deviceId || '',
                    onChange: (e) => {
                        const device = climateDevices.find(d => (d.id || d.entity_id) === e.target.value);
                        if (device) {
                            selectDevice(device.id || device.entity_id, device.name || device.entity_id);
                        }
                    },
                    onPointerDown: stopPropagation,
                    style: {
                        width: '100%',
                        padding: '8px',
                        background: 'rgba(0,0,0,0.3)',
                        border: '1px solid rgba(0,243,255,0.3)',
                        borderRadius: '4px',
                        color: '#fff',
                        fontSize: '13px'
                    }
                }, [
                    React.createElement('option', { key: 'empty', value: '' }, '-- Select Thermostat --'),
                    ...climateDevices.map(d => React.createElement('option', {
                        key: d.id || d.entity_id,
                        value: d.id || d.entity_id
                    }, d.name || d.entity_id))
                ])
            ]),

            // Temperature display ring
            state.deviceId && React.createElement('div', {
                key: 'temp-display',
                style: {
                    display: 'flex',
                    justifyContent: 'center',
                    marginBottom: '16px'
                }
            },
                React.createElement('div', {
                    style: {
                        width: '140px',
                        height: '140px',
                        borderRadius: '50%',
                        border: `4px solid ${ringColor}`,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,0,0,0.4)',
                        boxShadow: `0 0 20px ${ringColor}40`,
                        transition: 'border-color 0.3s, box-shadow 0.3s'
                    }
                }, [
                    React.createElement('div', {
                        key: 'current',
                        style: { fontSize: '36px', fontWeight: 'bold', color: '#fff' }
                    }, `${currentTemp}${state.tempUnit}`),
                    React.createElement('div', {
                        key: 'target',
                        style: { fontSize: '14px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }
                    }, `Target: ${targetTemp}${state.tempUnit}`),
                    React.createElement('div', {
                        key: 'action',
                        style: { fontSize: '13px', color: ringColor, marginTop: '8px' }
                    }, `${actionIcon} ${actionText}`)
                ])
            ),

            // Mode buttons
            state.deviceId && React.createElement('div', {
                key: 'mode-buttons',
                style: {
                    display: 'flex',
                    gap: '4px',
                    marginBottom: '12px',
                    flexWrap: 'wrap',
                    justifyContent: 'center'
                }
            }, state.supportedModes.filter(m => HVAC_MODE_LABELS[m]).map(mode =>
                React.createElement('button', {
                    key: mode,
                    onClick: () => setHvacMode(mode),
                    onPointerDown: stopPropagation,
                    style: {
                        padding: '6px 10px',
                        background: state.hvacMode === mode ? 'rgba(0,243,255,0.3)' : 'rgba(0,0,0,0.3)',
                        border: state.hvacMode === mode ? '1px solid rgba(0,243,255,0.8)' : '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '4px',
                        color: state.hvacMode === mode ? '#00f3ff' : '#fff',
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                    }
                }, HVAC_MODE_LABELS[mode])
            )),

            // Temperature slider
            state.deviceId && state.hvacMode !== 'off' && React.createElement('div', {
                key: 'temp-slider',
                style: { marginBottom: '12px' }
            }, [
                React.createElement('div', {
                    key: 'label',
                    style: { display: 'flex', justifyContent: 'space-between', marginBottom: '4px', fontSize: '12px', color: 'rgba(255,255,255,0.7)' }
                }, [
                    React.createElement('span', { key: 'min' }, `${state.minTemp}${state.tempUnit}`),
                    React.createElement('span', { key: 'target' }, `Set: ${state.targetTemp || '--'}${state.tempUnit}`),
                    React.createElement('span', { key: 'max' }, `${state.maxTemp}${state.tempUnit}`)
                ]),
                React.createElement('input', {
                    key: 'slider',
                    type: 'range',
                    min: state.minTemp,
                    max: state.maxTemp,
                    step: data.properties.tempStep || 1,
                    value: state.targetTemp || state.minTemp,
                    onChange: (e) => setTemperature(Number(e.target.value)),
                    onPointerDown: stopPropagation,
                    style: {
                        width: '100%',
                        accentColor: ringColor
                    }
                })
            ]),

            // Humidity display (if available)
            state.humidity !== null && React.createElement('div', {
                key: 'humidity',
                style: {
                    textAlign: 'center',
                    fontSize: '12px',
                    color: 'rgba(255,255,255,0.6)',
                    marginTop: '8px'
                }
            }, `💧 Humidity: ${Math.round(state.humidity)}%`),

            // Error display
            error && React.createElement('div', {
                key: 'error',
                style: {
                    marginTop: '8px',
                    padding: '8px',
                    background: 'rgba(255,0,0,0.2)',
                    borderRadius: '4px',
                    fontSize: '11px',
                    color: '#ff6b6b'
                }
            }, `⚠️ ${error}`),

            // Sockets
            React.createElement('div', {
                key: 'sockets',
                style: { display: 'flex', justifyContent: 'space-between', marginTop: '12px' }
            }, [
                // Inputs
                React.createElement('div', { key: 'inputs', style: { display: 'flex', flexDirection: 'column', gap: '4px' } }, [
                    data.inputs?.target_temp && React.createElement(RefComponent, {
                        key: 'target_temp',
                        init: ref => emit({ type: 'render', data: { type: 'socket', side: 'input', key: 'target_temp', node: data, element: ref, payload: data.inputs.target_temp.socket } })
                    }),
                    data.inputs?.hvac_mode && React.createElement(RefComponent, {
                        key: 'hvac_mode',
                        init: ref => emit({ type: 'render', data: { type: 'socket', side: 'input', key: 'hvac_mode', node: data, element: ref, payload: data.inputs.hvac_mode.socket } })
                    })
                ]),
                // Outputs
                React.createElement('div', { key: 'outputs', style: { display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' } }, [
                    data.outputs?.current_temp && React.createElement(RefComponent, {
                        key: 'current_temp',
                        init: ref => emit({ type: 'render', data: { type: 'socket', side: 'output', key: 'current_temp', node: data, element: ref, payload: data.outputs.current_temp.socket } })
                    }),
                    data.outputs?.target_temp_out && React.createElement(RefComponent, {
                        key: 'target_temp_out',
                        init: ref => emit({ type: 'render', data: { type: 'socket', side: 'output', key: 'target_temp_out', node: data, element: ref, payload: data.outputs.target_temp_out.socket } })
                    }),
                    data.outputs?.hvac_mode_out && React.createElement(RefComponent, {
                        key: 'hvac_mode_out',
                        init: ref => emit({ type: 'render', data: { type: 'socket', side: 'output', key: 'hvac_mode_out', node: data, element: ref, payload: data.outputs.hvac_mode_out.socket } })
                    }),
                    data.outputs?.hvac_action && React.createElement(RefComponent, {
                        key: 'hvac_action',
                        init: ref => emit({ type: 'render', data: { type: 'socket', side: 'output', key: 'hvac_action', node: data, element: ref, payload: data.outputs.hvac_action.socket } })
                    }),
                    data.outputs?.humidity && React.createElement(RefComponent, {
                        key: 'humidity',
                        init: ref => emit({ type: 'render', data: { type: 'socket', side: 'output', key: 'humidity', node: data, element: ref, payload: data.outputs.humidity.socket } })
                    })
                ])
            ])
        ]);
    }

    // -------------------------------------------------------------------------
    // REGISTER
    // -------------------------------------------------------------------------
    window.nodeRegistry.register('HAThermostatNode', {
        label: "Thermostat",
        category: "Home Assistant",
        nodeClass: HAThermostatNode,
        component: HAThermostatNodeComponent,
        factory: (changeCallback) => new HAThermostatNode(changeCallback)
    });

    console.log('[HAThermostatNode] ✓ Registered');
})();
