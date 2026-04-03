import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Box, Toolbar, useMediaQuery, useTheme } from '@mui/material';
import Sidebar, { DRAWER_WIDTH } from './Sidebar';
import Topbar from './Topbar';

const MainLayout = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box className="flex min-h-screen">
      <Topbar onMenuClick={() => setMobileOpen(!mobileOpen)} />

      {isMobile ? (
        <Sidebar
          open={mobileOpen}
          onClose={() => setMobileOpen(false)}
          variant="temporary"
        />
      ) : (
        <Sidebar open variant="permanent" />
      )}

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
        }}
        className="bg-gray-50 min-h-screen"
      >
        <Toolbar />
        <Box className="p-4 md:p-6">
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
