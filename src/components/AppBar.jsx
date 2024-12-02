// src\components\AppBar.jsx

import { AppBar, Toolbar, Typography, Button } from "@mui/material";

import { Link, useLocation } from "react-router-dom";

function TopBar() {
  const location = useLocation();

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Personal Trainer
        </Typography>
        <Button
          color="inherit"
          component={Link}
          to="/"
          sx={{
            color:
              location.pathname === "/" ? "#fff" : "rgba(255, 255, 255, 0.7)",
          }}
        >
          Customers
        </Button>
        <Button
          color="inherit"
          component={Link}
          to="/trainings"
          sx={{
            color:
              location.pathname === "/trainings"
                ? "#fff"
                : "rgba(255, 255, 255, 0.7)",
          }}
        >
          Trainings
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default TopBar;