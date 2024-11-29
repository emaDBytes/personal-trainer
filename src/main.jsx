// src\main.jsx

import React from "react";
import ReactDOM from "react-dom/client";

import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import CustomerList from "./components/CustomerList.jsx";
import TrainingList from "./components/TrainingList.jsx";

import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        element: <CustomerList />,
        index: true,
      },
      {
        path: "customers",
        element: <CustomerList />,
      },
      {
        path: "trainings",
        element: <TrainingList />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router}></RouterProvider>
  </React.StrictMode>
);
