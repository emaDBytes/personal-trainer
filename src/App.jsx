// src\App.jsx

import { Routes, Route } from "react-router-dom";

import CustomerList from "./components/CustomerList";
import TrainingList from "./components/TrainingList";
import TopBar from "./components/AppBar";

import { Container } from "@mui/material";

function App() {
  return (
    <>
      <TopBar />
      <Container>
        <Routes>
          <Route path="/" element={<CustomerList />} />
          <Route path="/trainings" element={<TrainingList />} />
        </Routes>
      </Container>
    </>
  );
}

export default App;
