// src\components\AppBar.jsx

import { useState } from "react";

import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
} from "@mui/material";

import { Link, useLocation } from "react-router-dom";

import {
  Menu as MenuIcon,
  People as PeopleIcon,
  FitnessCenter as FitnessCenterIcon,
  CalendarMonth as CalendarMonthIcon,
  BarChart as BarChartIcon,
} from "@mui/icons-material";

// Top navigation bar component
function TopBar() {
  // Get location and media query context
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // State for mobile drawer toggle
  const [mobileOpen, setMobileOpen] = useState(false);

  // Navigation items
  const navItems = [
    { text: "Customers", path: "/", icon: <PeopleIcon /> },
    { text: "Trainings", path: "/trainings", icon: <FitnessCenterIcon /> },
    { text: "Calendar", path: "/calendar", icon: <CalendarMonthIcon /> },
    { text: "Statistics", path: "/statistics", icon: <BarChartIcon /> },
  ];

  // Toggle mobile drawer
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  // Mobile drawer content
  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: "center" }}>
      <Typography variant="h6" sx={{ my: 2 }}>
        Personal Trainer
      </Typography>
      <List>
        {navItems.map((item) => (
          <ListItem
            key={item.text}
            component={Link}
            to={item.path}
            selected={location.pathname === item.path}
            sx={{
              color:
                location.pathname === item.path
                  ? "primary.main"
                  : "text.primary",
              "&:hover": {
                backgroundColor: "rgba(0, 0, 0, 0.04)",
              },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <>
      {/* Top app bar */}
      <AppBar position="static">
        <Toolbar>
          {/* Mobile menu toggle */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          {/* App title */}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Personal Trainer
          </Typography>

          {/* Desktop navigation */}
          {!isMobile && (
            <Box sx={{ display: "flex" }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    mx: 1,
                    color:
                      location.pathname === item.path
                        ? "#fff"
                        : "rgba(255, 255, 255, 0.7)",
                    "&:hover": {
                      color: "#fff",
                      backgroundColor: "rgba(255, 255, 255, 0.08)",
                    },
                    borderBottom:
                      location.pathname === item.path
                        ? "2px solid #fff"
                        : "none",
                    borderRadius: 0,
                    paddingBottom: "4px",
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile navigation drawer */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better mobile performance
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": { boxSizing: "border-box", width: 240 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}

export default TopBar;
