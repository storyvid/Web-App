import React, { useState } from "react";
import { Box, ThemeProvider, CssBaseline } from "@mui/material";
import { Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { Sidebar, Header } from "../DashboardComponents";
import { SidebarProvider } from "../ui/sidebar";
import { theme, styles } from "../../pages/dashboardStyles";

const AppLayout = () => {
  const { user } = useAuth();

  // For real accounts, don't show mock notifications
  // TODO: Replace with real notification service
  const activityNotifications = [];

  // Combine role-based notifications with activity notifications
  const [data] = useState({
    user: user || {},
    notifications: [
      ...activityNotifications, // Only activity notifications (currently empty)
    ],
  });

  return (
    <SidebarProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={styles.dashboardContainer} styles={{ width: "100%" }}>
          {/* Persistent Sidebar - Never re-renders */}
          <Sidebar userRole={user?.role || "client"} user={user} />

          <Box sx={styles.mainContent}>
            {/* Persistent Header - Never re-renders */}
            <Header user={data.user} notifications={data.notifications} />

            {/* Dynamic Content Area - Only this changes between routes */}
            <Box sx={styles.contentWrapper}>
              <Box sx={styles.leftContent}>
                {/* This is where each page's content will be rendered */}
                <Outlet />
              </Box>
            </Box>
          </Box>
        </Box>
      </ThemeProvider>
    </SidebarProvider>
  );
};

export default AppLayout;
