// src\components\TrainingList.jsx

import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

import {
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Button,
  Snackbar,
  Alert,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Stack,
} from "@mui/material";

import DeleteIcon from "@mui/icons-material/Delete";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";

/**
 * The TrainingList component displays a list of training sessions in a
 * highly customizable and interactive ag-grid table.
 */
function TrainingList() {
  // State variables for training data, delete dialog, and error handling
  const [trainings, setTrainings] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteTraining, setDeleteTraining] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch training data on component mount
  useEffect(() => {
    fetchTrainings();
  }, []);

  /**
   * Configuration for the ag-grid table columns.
   * Includes fields for activity, date, duration, customer, and a delete button.
   */
  const [columnDefs] = useState([
    {
      field: "activity",
      sortable: true,
      filter: true,
      width: 150,
    },
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
      width: 180,
    },
    {
      field: "duration",
      headerName: "Duration (min)",
      sortable: true,
      filter: true,
      width: 150,
    },
    {
      field: "customer",
      headerName: "Customer",
      valueGetter: (params) =>
        params.data.customer
          ? `${params.data.customer.firstname} ${params.data.customer.lastname}`
          : "",
      sortable: true,
      filter: true,
      width: 180,
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

  /**
   * Handles the delete button click by setting the deleteTraining state
   * and opening the confirmation dialog.
   */
  const handleDelete = (training) => {
    setDeleteTraining(training);
    setOpen(true);
  };

  /**
   * Closes the delete confirmation dialog and resets the deleteTraining state.
   */
  const handleClose = () => {
    setOpen(false);
    setDeleteTraining(null);
  };

  /**
   * Handles the confirmation of the delete operation. Sends a DELETE request
   * to the API and refreshes the training list after a successful deletion.
   */
  const handleConfirmDelete = () => {
    if (!deleteTraining?._links?.self?.href) {
      setError("No training URL found");
      return;
    }

    fetch(deleteTraining._links.self.href, { method: "DELETE" })
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in deletion: " + response.statusText);

        fetchTrainings();
        handleClose();
      })
      .catch((err) => {
        console.error(err);
        setError("Error deleting training");
      });
  };

  /**
   * Fetches the list of training sessions from the API and associates the
   * customer data with each training.
   */
  const fetchTrainings = () => {
    setLoading(true);
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
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching trainings");
        setLoading(false);
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header section */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <FitnessCenterIcon sx={{ fontSize: 35, color: "primary.main" }} />
        <Typography variant="h4" component="h1">
          Training Sessions
        </Typography>
      </Stack>

      {/* Main content */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          height: "100%",
        }}
      >
        {loading ? (
          // Display a loading spinner while data is being fetched
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        ) : (
          // Render the ag-grid table with the fetched training data
          <div
            className="ag-theme-material"
            style={{
              height: 600,
              width: "100%",
              margin: "auto",
            }}
          >
            <AgGridReact
              rowData={trainings}
              columnDefs={columnDefs}
              pagination={true}
              paginationPageSize={10}
              paginationPageSizeSelector={[10, 20, 50, 100]}
              domLayout="autoHeight"
              suppressColumnVirtualisation={true}
              onGridReady={(params) => {
                params.api.sizeColumnsToFit();
              }}
              onFirstDataRendered={(params) => {
                params.api.sizeColumnsToFit();
              }}
            />
          </div>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
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

      {/* Error Snackbar */}
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
    </Box>
  );
}

export default TrainingList;
