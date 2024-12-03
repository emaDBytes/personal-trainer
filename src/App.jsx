// src\App.jsx

import { Outlet } from "react-router-dom";

import { Container } from "@mui/material";

import TopBar from "./components/AppBar";

// The main App component that renders the top bar and content
const App = () => {
  return (
    <>
      {/* Render the top navigation bar */}
      <TopBar />

      {/* Render the main content area */}
      <Container>
        <Outlet />
      </Container>
    </>
  );
};

export default App;
