import { Box, Typography, Card, CardContent, Button, TextField, Switch, FormControlLabel } from '@mui/material';
import { useState } from 'react';

const SuperAdminSettings = () => {
  const [settings, setSettings] = useState({
    allowSchoolRegistration: true,
    defaultMaxStudents: 5000,
    enableSMSService: false,
    enableEmailService: true,
  });

  const handleSave = () => {
    alert('Settings saved successfully!');
  };

  return (
    <Box>
      <Typography variant="h5" className="mb-6">
        System Settings
      </Typography>

      <Card className="mb-4">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            General Settings
          </Typography>
          
          <Box className="space-y-4">
            <FormControlLabel
              control={
                <Switch
                  checked={settings.allowSchoolRegistration}
                  onChange={(e) => setSettings({...settings, allowSchoolRegistration: e.target.checked})}
                />
              }
              label="Allow New School Registration"
            />
            
            <TextField
              fullWidth
              label="Default Max Students Per School"
              type="number"
              value={settings.defaultMaxStudents}
              onChange={(e) => setSettings({...settings, defaultMaxStudents: parseInt(e.target.value)})}
            />
          </Box>
        </CardContent>
      </Card>

      <Card className="mb-4">
        <CardContent>
          <Typography variant="h6" className="mb-4">
            Notification Settings
          </Typography>
          
          <Box className="space-y-4">
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableSMSService}
                  onChange={(e) => setSettings({...settings, enableSMSService: e.target.checked})}
                />
              }
              label="Enable SMS Service (Twilio)"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={settings.enableEmailService}
                  onChange={(e) => setSettings({...settings, enableEmailService: e.target.checked})}
                />
              }
              label="Enable Email Service"
            />
          </Box>
        </CardContent>
      </Card>

      <Button variant="contained" onClick={handleSave}>
        Save Settings
      </Button>
    </Box>
  );
};

export default SuperAdminSettings;
