// src\App.jsx

import { Outlet } from "react-router-dom";

import TopBar from "./components/AppBar";

import { Container } from "@mui/material";

function App() {
  return (
    <>
      <TopBar />
      <Container>
        <Outlet />
      </Container>
    </>
  );
}

export default App;
