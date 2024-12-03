// src\components\TrainingList.jsx

import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

import DeleteIcon from "@mui/icons-material/Delete";
import IconButton from "@mui/material/IconButton";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function TrainingList() {
  const [trainings, setTrainings] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteTraining, setDeleteTraining] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTrainings();
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
    {
      headerName: "",
      field: "id",
      width: 90,
      cellRenderer: (params) => (
        <IconButton
          onClick={() => handleDelete(params.data)}
          size="small"
          color="error"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ]);

  const handleDelete = (training) => {
    setDeleteTraining(training);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteTraining(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTraining?._links?.self?.href) {
      setError("No training URL found");
      return;
    }

    fetch(deleteTraining._links.self.href, { method: "DELETE" })
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in deletion: " + response.statusText);

        // Refresh the grid data
        fetchTrainings();
        handleClose();
      })
      .catch((err) => {
        console.error(err);
        setError("Error deleting training");
      });
  };

  const fetchTrainings = () => {
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
      .catch((err) => {
        console.error(err);
        setError("Error fetching trainings");
      });
  };

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

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this training session?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert
          onClose={() => setError("")}
          severity="error"
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
}

export default TrainingList;
