import { DeviceRequestModel, DeviceResponseModel } from '@/types/vreedaApi';
import { Box, Card, CardContent, Checkbox, FormControlLabel, Slider, Switch, Typography, Button } from '@mui/material';
import { useState } from 'react';

export default function DeviceControl({
  id,
  model,
  selected,
  onSelectionChange,
}: {
  id: string;
  model: DeviceResponseModel;
  selected: boolean;
  onSelectionChange: (id: string, selected: boolean) => void;
}) {
  const [isOn, setIsOn] = useState(model.states?.on?.value || false);
  const [brightness, setBrightness] = useState(model.states?.v?.value || 0);
  const [hue, setHue] = useState(model.states?.h?.value || 0);
  const [saturation, setSaturation] = useState(model.states?.s?.value || 0);

  async function updateDevice(deviceId: string, request: DeviceRequestModel) {
    try {
      const response = await fetch('/api/vreeda/patch-device', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deviceId, request }),
      });

      if (!response.ok) {
        throw new Error('Failed to update device');
      }

      const data = await response.json();
      console.log('Device updated successfully:', data);
      return data;
    } catch (error) {
      console.error('Error updating device:', error);
      throw error;
    }
  }

  const handleSliderChange = async (type: 'v' | 'h' | 's', value: number) => {
    // Local state update
    if (type === 'v') setBrightness(value);
    if (type === 'h') setHue(value);
    if (type === 's') setSaturation(value);

    // Server state update
    const updatedState: Record<string, any> = {
      h: type === 'h' ? value : hue,
      s: type === 's' ? value : saturation,
      v: type === 'v' ? value : brightness,
      program: 'color',
    };

    try {
      await updateDevice(id, { states: updatedState });
    } catch (error) {
      console.error(`Failed to update ${type} value:`, error);
    }
  };

  const setPresetFitGuard = async () => {
    const h = 0.43999999;
    const s = 1;
    const v = 1;

    setHue(h);
    setSaturation(s);
    setBrightness(v);

    try {
      await updateDevice(id, { states: { h, s, v, program: 'color' } });
    } catch (error) {
      console.error('Failed to set FitGuard preset:', error);
    }
  };

  const setPresetDefault = async () => {
    const s = 0;

    setSaturation(s);

    try {
      await updateDevice(id, { states: { h: hue, s, v: brightness, program: 'color' } });
    } catch (error) {
      console.error('Failed to set Default preset:', error);
    }
  };

  return (
    <Card variant="outlined" sx={{ mb: 2, p: 2, backgroundColor: '#2A1D24' }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {/* Selection Checkbox */}
          <FormControlLabel
            control={
              <Checkbox
                checked={selected}
                onChange={(event) => onSelectionChange(id, event.target.checked)}
                color="primary"
              />
            }
            label=""
            sx={{ mr: 1 }}
          />
          <Typography variant="h6">{model.tags?.customDeviceName || 'Unnamed Device'}</Typography>
          {/* On/Off Switch */}
          <FormControlLabel
            control={
              <Switch
                checked={isOn}
                onChange={async () => {
                  const newIsOn = !isOn;
                  setIsOn(newIsOn);
                  try {
                    await updateDevice(id, { states: { on: newIsOn } });
                  } catch (error) {
                    console.error('Failed to toggle device:', error);
                  }
                }}
                color="primary"
                disabled={!model.connected?.value}
              />
            }
            label=""
          />
        </Box>
        <Typography variant="body2" color="text.secondary">
          Device ID: {id}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Status: {model.connected?.value ? 'Online' : 'Offline'}
        </Typography>

        {/* Brightness Slider */}
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Brightness
          </Typography>
          <Slider
            value={brightness}
            onChange={(event, value) => handleSliderChange('v', value as number)}
            min={0}
            max={1}
            step={0.1}
            color="primary"
          />
        </Box>

        {/* Hue Slider */}
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Hue
          </Typography>
          <Slider
            value={hue}
            onChange={(event, value) => handleSliderChange('h', value as number)}
            min={0}
            max={1}
            step={0.01}
            color="primary"
          />
        </Box>

        {/* Saturation Slider */}
        <Box mt={2}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Saturation
          </Typography>
          <Slider
            value={saturation}
            onChange={(event, value) => handleSliderChange('s', value as number)}
            min={0}
            max={1}
            step={0.1}
            color="primary"
          />
        </Box>

        {/* Buttons for Presets */}
        <Box mt={3} display="flex" gap={2}>
          <Button variant="contained" color="primary" onClick={setPresetFitGuard}>
            FitGuard
          </Button>
          <Button variant="contained" color="secondary" onClick={setPresetDefault}>
            Default
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}