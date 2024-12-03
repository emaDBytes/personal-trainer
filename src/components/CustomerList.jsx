// src\components\CustomerList.jsx

/**
 * CustomerList Component
 *
 * A comprehensive customer management interface that provides CRUD operations
 * for customer data and allows adding training sessions to customers.
 *
 * Features:
 * - Display customers in a sortable/filterable grid
 * - Add/Edit/Delete customer operations
 * - Add training sessions to customers
 * - Export customer data to CSV
 * - Loading states and error handling
 *
 * @component
 */

// React and hooks
import { useState, useEffect } from "react";

// Grid component and styles
import { AgGridReact } from "ag-grid-react";
import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

// Material-UI components
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  TextField,
  Snackbar,
  Alert,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Stack,
} from "@mui/material";

// Material-UI icons
import {
  Delete as DeleteIcon,
  Add as AddIcon,
  Edit as EditIcon,
  FitnessCenter as FitnessCenterIcon,
  FileDownload as FileDownloadIcon,
} from "@mui/icons-material";

// Date handling
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

// Export utilities
import { utils as XLSXUtils, write as XLSXWrite } from "xlsx";
import { saveAs } from "file-saver";

// API configuration
const API_URL =
  "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api";

function CustomerList() {
  // =============== State Definitions ===============

  // Main data and UI states
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dialog control states
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [openTraining, setOpenTraining] = useState(false);

  // Selected item states
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  // Form data states
  const [newCustomer, setNewCustomer] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    streetaddress: "",
    postcode: "",
    city: "",
  });

  const [newTraining, setNewTraining] = useState({
    date: dayjs(),
    duration: "",
    activity: "",
  });

  // =============== Grid Configuration ===============

  const [columnDefs] = useState([
    {
      field: "firstname",
      headerName: "First Name",
      sortable: true,
      filter: true,
      width: 130,
    },
    {
      field: "lastname",
      headerName: "Last Name",
      sortable: true,
      filter: true,
      width: 130,
    },
    {
      field: "email",
      headerName: "Email",
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      field: "phone",
      headerName: "Phone",
      sortable: true,
      filter: true,
      width: 130,
    },
    {
      field: "streetaddress",
      headerName: "Address",
      sortable: true,
      filter: true,
      width: 200,
    },
    {
      field: "postcode",
      headerName: "Postcode",
      sortable: true,
      filter: true,
      width: 100,
    },
    {
      field: "city",
      headerName: "City",
      sortable: true,
      filter: true,
      width: 130,
    },
    {
      headerName: "Training",
      width: 70,
      cellRenderer: (params) => (
        <IconButton
          onClick={() => handleAddTraining(params.data)}
          size="small"
          color="primary"
          title="Add Training"
        >
          <FitnessCenterIcon />
        </IconButton>
      ),
    },
    {
      headerName: "Edit",
      width: 70,
      cellRenderer: (params) => (
        <IconButton
          onClick={() => handleEditOpen(params.data)}
          size="small"
          color="primary"
          title="Edit Customer"
        >
          <EditIcon />
        </IconButton>
      ),
    },
    {
      headerName: "Delete",
      width: 70,
      cellRenderer: (params) => (
        <IconButton
          onClick={() => handleDelete(params.data)}
          size="small"
          color="error"
          title="Delete Customer"
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ]);

  // =============== Data Fetching ===============

  /**
   * Fetches customers from the API
   * Includes error handling and loading state management
   */
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/customers`);
      if (!response.ok)
        throw new Error("Error in fetch: " + response.statusText);

      const data = await response.json();
      setCustomers(data._embedded.customers);
    } catch (err) {
      console.error(err);
      setError("Error fetching customers");
    } finally {
      setLoading(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    fetchCustomers();
  }, []);

  // =============== Customer CRUD Handlers ===============

  /**
   * Handles customer deletion
   */
  const handleDelete = (customer) => {
    setDeleteCustomer(customer);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteCustomer(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteCustomer?._links?.self?.href) {
      setError("No customer URL found");
      return;
    }

    try {
      const response = await fetch(deleteCustomer._links.self.href, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Error in deletion");

      await fetchCustomers();
      handleClose();
    } catch (err) {
      console.error(err);
      setError("Error deleting customer");
    }
  };

  /**
   * Handles customer addition
   */
  const handleInputChange = (event) => {
    setNewCustomer({
      ...newCustomer,
      [event.target.name]: event.target.value,
    });
  };

  const handleAddOpen = () => setOpenAdd(true);

  const handleAddClose = () => {
    setOpenAdd(false);
    setNewCustomer({
      firstname: "",
      lastname: "",
      email: "",
      phone: "",
      streetaddress: "",
      postcode: "",
      city: "",
    });
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`${API_URL}/customers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCustomer),
      });

      if (!response.ok) throw new Error("Error in addition");

      await fetchCustomers();
      handleAddClose();
    } catch (err) {
      console.error(err);
      setError("Error adding customer");
    }
  };

  /**
   * Handles customer editing
   */
  const handleEditOpen = (customer) => {
    setEditCustomer(customer);
    setOpenEdit(true);
  };

  const handleEditClose = () => {
    setOpenEdit(false);
    setEditCustomer(null);
  };

  const handleEditChange = (event) => {
    setEditCustomer({
      ...editCustomer,
      [event.target.name]: event.target.value,
    });
  };

  const handleUpdate = async () => {
    if (!editCustomer?._links?.self?.href) {
      setError("No customer URL found");
      return;
    }

    try {
      const response = await fetch(editCustomer._links.self.href, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editCustomer),
      });

      if (!response.ok) throw new Error("Error in update");

      await fetchCustomers();
      handleEditClose();
    } catch (err) {
      console.error(err);
      setError("Error updating customer");
    }
  };

  // =============== Training Handlers ===============

  const handleAddTraining = (customer) => {
    setSelectedCustomer(customer);
    setOpenTraining(true);
  };

  const handleTrainingClose = () => {
    setOpenTraining(false);
    setSelectedCustomer(null);
    setNewTraining({
      date: dayjs(),
      duration: "",
      activity: "",
    });
  };

  const handleTrainingChange = (event) => {
    setNewTraining({
      ...newTraining,
      [event.target.name]: event.target.value,
    });
  };

  const handleDateChange = (newDate) => {
    setNewTraining({
      ...newTraining,
      date: newDate,
    });
  };

  const handleTrainingSave = async () => {
    if (!selectedCustomer?._links?.self?.href) {
      setError("No customer link found");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/trainings`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newTraining.date.toISOString(),
          duration: newTraining.duration,
          activity: newTraining.activity,
          customer: selectedCustomer._links.self.href,
        }),
      });

      if (!response.ok) throw new Error("Error adding training");

      handleTrainingClose();
      setError("Training added successfully");
    } catch (err) {
      console.error(err);
      setError("Error adding training");
    }
  };

  // =============== Export Functionality ===============

  const exportToCSV = () => {
    const exportData = customers.map(
      ({
        firstname,
        lastname,
        email,
        phone,
        streetaddress,
        postcode,
        city,
      }) => ({
        firstname,
        lastname,
        email,
        phone,
        streetaddress,
        postcode,
        city,
      })
    );

    const ws = XLSXUtils.json_to_sheet(exportData);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Customers");

    const excelBuffer = XLSXWrite(wb, { bookType: "csv", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "customers.csv");
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* ========== Header Section ========== */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        mb={3}
      >
        <Typography variant="h4" component="h1">
          Customer Management
        </Typography>

        <Stack direction="row" spacing={2}>
          <Button
            variant="contained"
            onClick={handleAddOpen}
            startIcon={<AddIcon />}
            size="large"
          >
            Add Customer
          </Button>
          <Button
            variant="outlined"
            onClick={exportToCSV}
            startIcon={<FileDownloadIcon />}
            size="large"
          >
            Export to CSV
          </Button>
        </Stack>
      </Stack>

      {/* ========== Main Grid Section ========== */}
      <Paper elevation={2} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
        {loading ? (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        ) : (
          <div
            className="ag-theme-material"
            style={{
              height: 600,
              width: "100%",
              margin: "auto",
            }}
          >
            <AgGridReact
              rowData={customers}
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

      {/* ========== Dialog Section - Customer Delete ========== */}
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="delete-dialog-title"
      >
        <DialogTitle id="delete-dialog-title">Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete {deleteCustomer?.firstname}{" "}
            {deleteCustomer?.lastname}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleConfirmDelete} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== Dialog Section - Add Customer ========== */}
      <Dialog
        open={openAdd}
        onClose={handleAddClose}
        aria-labelledby="add-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="add-dialog-title">Add New Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="firstname"
              label="First Name"
              value={newCustomer.firstname}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="lastname"
              label="Last Name"
              value={newCustomer.lastname}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="email"
              label="Email"
              value={newCustomer.email}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
              type="email"
            />
            <TextField
              name="phone"
              label="Phone"
              value={newCustomer.phone}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="streetaddress"
              label="Street Address"
              value={newCustomer.streetaddress}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="postcode"
              label="Postcode"
              value={newCustomer.postcode}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="city"
              label="City"
              value={newCustomer.city}
              onChange={handleInputChange}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancel</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== Dialog Section - Edit Customer ========== */}
      <Dialog
        open={openEdit}
        onClose={handleEditClose}
        aria-labelledby="edit-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="edit-dialog-title">Edit Customer</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 2 }}>
            <TextField
              name="firstname"
              label="First Name"
              value={editCustomer?.firstname || ""}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="lastname"
              label="Last Name"
              value={editCustomer?.lastname || ""}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="email"
              label="Email"
              value={editCustomer?.email || ""}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
              type="email"
            />
            <TextField
              name="phone"
              label="Phone"
              value={editCustomer?.phone || ""}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="streetaddress"
              label="Street Address"
              value={editCustomer?.streetaddress || ""}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="postcode"
              label="Postcode"
              value={editCustomer?.postcode || ""}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="city"
              label="City"
              value={editCustomer?.city || ""}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleUpdate} variant="contained" color="primary">
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== Dialog Section - Add Training ========== */}
      <Dialog
        open={openTraining}
        onClose={handleTrainingClose}
        aria-labelledby="training-dialog-title"
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle id="training-dialog-title">
          Add Training for {selectedCustomer?.firstname}{" "}
          {selectedCustomer?.lastname}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, display: "flex", flexDirection: "column", gap: 3 }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateTimePicker
                label="Date and Time"
                value={newTraining.date}
                onChange={handleDateChange}
                renderInput={(params) => <TextField {...params} />}
                fullWidth
              />
            </LocalizationProvider>
            <TextField
              name="activity"
              label="Activity"
              value={newTraining.activity}
              onChange={handleTrainingChange}
              fullWidth
              variant="outlined"
            />
            <TextField
              name="duration"
              label="Duration (minutes)"
              value={newTraining.duration}
              onChange={handleTrainingChange}
              fullWidth
              variant="outlined"
              type="number"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTrainingClose}>Cancel</Button>
          <Button
            onClick={handleTrainingSave}
            variant="contained"
            color="primary"
          >
            Add Training
          </Button>
        </DialogActions>
      </Dialog>

      {/* ========== Snackbar for Notifications ========== */}
      <Snackbar
        open={Boolean(error)}
        autoHideDuration={6000}
        onClose={() => setError("")}
      >
        <Alert
          onClose={() => setError("")}
          severity={error.includes("success") ? "success" : "error"}
          sx={{ width: "100%" }}
        >
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
}

export default CustomerList;
