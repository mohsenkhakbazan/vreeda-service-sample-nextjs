import { DeviceRequestModel, DeviceRequestStateModel, DeviceResponseModel } from '@/types/vreedaApi';
import { Box, Card, CardContent, Checkbox, FormControlLabel, Slider, Switch, Typography } from '@mui/material';
import { useState } from 'react';

export default function DeviceControl({ id, model, selected, onSelectionChange }: { id: string, model: DeviceResponseModel, selected: boolean, onSelectionChange: (id: string, selected: boolean) => void }) {
  const [isOn, setIsOn] = useState(model.states?.on?.value);
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
      console.log('Error updating device:', error);
      throw error;
    }
  }

  const toggleDevice = async () => {
    try {
      await updateDevice(id, {
        states: { on: !isOn },
      });
      setIsOn(!isOn);
    } catch (error) {
      console.log('Failed to update device state:', error);
    }
  };

  const handleSliderChange = async (type: 'v' | 'h' | 's', value: number) => {
    const newState: DeviceRequestStateModel = {};

    // Update the local state
    if (type === 'v') {
      newState.v = value;
      setBrightness(value)
    }
    else if (type === 'h') {
      newState.h = value; 
      newState.program = "color";
      setHue(value); 
    } else if (type === 's') { 
      newState.s = value;
      newState.program = "color";
      setSaturation(value); 
    }
  

    // Send the updated state to the server
    try {
      await updateDevice(id, { states: newState });
    } catch (error) {
      console.log(`Failed to update ${type} value:`, error);
    }
  };

  const handleSelectionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const isChecked = event.target.checked;
    onSelectionChange(id, isChecked);
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
                onChange={handleSelectionChange}
                color="primary"
              />
            }
            label=""
            sx={{ mr: 1 }}
          />
          <Typography variant="h6">
            {model.tags?.customDeviceName || 'Unnamed Device'}
          </Typography>
          {/* Switch positioned at top-right corner */}
          <FormControlLabel
            control={
              <Switch
                checked={isOn || false}
                onChange={toggleDevice}
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
            aria-labelledby="brightness-slider"
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
            max={1} // Assuming hue is in degrees
            step={0.01}
            color="primary"
            aria-labelledby="hue-slider"
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
            aria-labelledby="saturation-slider"
          />
        </Box>
      </CardContent>
    </Card>
  );
}