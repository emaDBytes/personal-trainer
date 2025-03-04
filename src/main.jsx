// src\main.jsx

import React from "react";

import ReactDOM from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

import App from "./App.jsx";
import CustomerList from "./components/CustomerList.jsx";
import TrainingList from "./components/TrainingList.jsx";
import CalendarView from "./components/CalendarView.jsx";
import StatisticsView from "./components/StatisticsView.jsx";

import "./index.css";

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      errorElement: <div>Error: Page Not Found</div>,
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
        {
          path: "calendar",
          element: <CalendarView />,
        },
        {
          path: "statistics",
          element: <StatisticsView />,
        },
      ],
    },
  ],
  {
    basename: import.meta.env.BASE_URL,
  }
);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <RouterProvider router={router} />
  </React.StrictMode>
);
