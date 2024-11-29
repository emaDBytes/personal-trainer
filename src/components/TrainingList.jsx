// src\components\TrainingList.jsx

import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

function TrainingList() {
  const [trainings, setTrainings] = useState([]);

  useEffect(() => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings"
    )
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in fetch: " + response.statusText);
        return response.json();
      })
      .then(async (responseData) => {
        const trainingsWithCustomers = await Promise.all(
          responseData._embedded.trainings.map(async (training) => {
            const customerResponse = await fetch(training._links.customer.href);
            const customerData = await customerResponse.json();
            return { ...training, customer: customerData };
          })
        );
        setTrainings(trainingsWithCustomers);
      })
      .catch((err) => console.error(err));
  }, []);

  const [columnDefs] = useState([
    { field: "activity", sortable: true, filter: true },
    {
      field: "date",
      headerName: "Date",
      valueFormatter: (params) => {
        const date = new Date(params.value);
        return date.toLocaleString("en-US", {
          day: "2-digit",
          month: "2-digit",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        });
      },
      sortable: true,
      filter: true,
    },
    { field: "duration", sortable: true, filter: true },
    {
      field: "customer",
      headerName: "Customer",
      valueGetter: (params) =>
        params.data.customer
          ? `${params.data.customer.firstname} ${params.data.customer.lastname}`
          : "",
      sortable: true,
      filter: true,
    },
  ]);

  return (
    <div
      className="ag-theme-material"
      style={{ height: 600, width: "90%", margin: "auto" }}
    >
      <AgGridReact
        rowData={trainings}
        columnDefs={columnDefs}
        pagination={true}
        paginationPageSize={10}
        paginationPageSizeSelector={[10, 20, 50, 100]}
      />
    </div>
  );
}

export default TrainingList;
