// src\components\CustomerList.jsx

import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import FileDownloadIcon from "@mui/icons-material/FileDownload";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import { DateTimePicker } from "@mui/x-date-pickers/DateTimePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

import dayjs from "dayjs";

import { utils as XLSXUtils, write as XLSXWrite } from "xlsx";
import { saveAs } from "file-saver";

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [error, setError] = useState("");
  const [openTraining, setOpenTraining] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [newTraining, setNewTraining] = useState({
    date: dayjs(),
    duration: "",
    activity: "",
  });
  const [newCustomer, setNewCustomer] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phone: "",
    streetaddress: "",
    postcode: "",
    city: "",
  });

  const handleDelete = (customer) => {
    console.log("Delete clicked for customer:", customer);
    setDeleteCustomer(customer);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setDeleteCustomer(null);
  };

  const handleConfirmDelete = () => {
    console.log("Confirmed delete for customer:", deleteCustomer);
    if (!deleteCustomer?._links?.self?.href) {
      setError("No customer URL found");
      return;
    }

    fetch(deleteCustomer._links.self.href, { method: "DELETE" })
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in deletion: " + response.statusText);

        // Refresh the grid data
        fetchCustomers();
        handleClose();
      })
      .catch((err) => {
        console.error(err);
        setError("Error deleting customer");
      });
  };

  const fetchCustomers = () => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers"
    )
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in fetch: " + response.statusText);
        return response.json();
      })
      .then((data) => {
        setCustomers(data._embedded.customers);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching customers");
      });
  };

  const handleInputChange = (event) => {
    setNewCustomer({
      ...newCustomer,
      [event.target.name]: event.target.value,
    });
  };

  const handleAddOpen = () => {
    setOpenAdd(true);
  };

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

  const handleSave = () => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newCustomer),
      }
    )
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in addition: " + response.statusText);

        fetchCustomers();
        handleAddClose();
      })
      .catch((err) => {
        console.error(err);
        setError("Error adding customer");
      });
  };

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

  const handleUpdate = () => {
    if (!editCustomer?._links?.self?.href) {
      setError("No customer URL found");
      return;
    }

    fetch(editCustomer._links.self.href, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstname: editCustomer.firstname,
        lastname: editCustomer.lastname,
        email: editCustomer.email,
        phone: editCustomer.phone,
        streetaddress: editCustomer.streetaddress,
        postcode: editCustomer.postcode,
        city: editCustomer.city,
      }),
    })
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in update: " + response.statusText);

        fetchCustomers();
        handleEditClose();
      })
      .catch((err) => {
        console.error(err);
        setError("Error updating customer");
      });
  };

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

  const handleTrainingSave = () => {
    // First check if we have all required data
    if (!selectedCustomer?._links?.self?.href) {
      setError("No customer link found");
      return;
    }

    const trainingData = {
      date: newTraining.date.toISOString(), // Convert the date to ISO format
      duration: newTraining.duration,
      activity: newTraining.activity,
      customer: selectedCustomer._links.self.href,
    };

    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(trainingData),
      }
    )
      .then((response) => {
        if (!response.ok)
          throw new Error("Error adding training: " + response.statusText);

        // Close the dialog and reset form
        handleTrainingClose();
        // Show success message
        setError("Training added successfully"); // You might want to create a separate success message state
      })
      .catch((err) => {
        console.error(err);
        setError("Error adding training");
      });
  };

  const exportToCSV = () => {
    // Filter out unnecessary data and links
    const exportData = customers.map((customer) => ({
      firstname: customer.firstname,
      lastname: customer.lastname,
      email: customer.email,
      phone: customer.phone,
      streetaddress: customer.streetaddress,
      postcode: customer.postcode,
      city: customer.city,
    }));

    // Create worksheet and workbook
    const ws = XLSXUtils.json_to_sheet(exportData);
    const wb = XLSXUtils.book_new();
    XLSXUtils.book_append_sheet(wb, ws, "Customers");

    // Generate buffer
    const excelBuffer = XLSXWrite(wb, { bookType: "csv", type: "array" });

    // Create blob and save file
    const data = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(data, "customers.csv");
  };

  const [columnDefs] = useState([
    { field: "firstname", sortable: true, filter: true, width: 130 },
    { field: "lastname", sortable: true, filter: true, width: 130 },
    { field: "email", sortable: true, filter: true, width: 200 },
    { field: "phone", sortable: true, filter: true, width: 130 },
    { field: "streetaddress", sortable: true, filter: true, width: 200 },
    { field: "postcode", sortable: true, filter: true, width: 100 },
    { field: "city", sortable: true, filter: true, width: 130 },
    {
      headerName: "",
      field: "id",
      width: 70,
      cellRenderer: (params) => (
        <IconButton
          onClick={() => handleAddTraining(params.data)}
          size="small"
          color="primary"
        >
          <FitnessCenterIcon />
        </IconButton>
      ),
    },
    {
      headerName: "",
      field: "id",
      width: 70,
      cellRenderer: (params) => (
        <IconButton
          onClick={() => handleEditOpen(params.data)}
          size="small"
          color="primary"
        >
          <EditIcon />
        </IconButton>
      ),
    },
    {
      headerName: "",
      field: "id",
      width: 70,
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

  useEffect(() => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers"
    )
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in fetch: " + response.statusText);

        return response.json();
      })
      .then((responseData) => {
        setCustomers(responseData._embedded.customers);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h2>Customers</h2>

      <div style={{ marginBottom: 20, display: "flex", gap: "10px" }}>
        <Button
          variant="contained"
          onClick={handleAddOpen}
          startIcon={<AddIcon />}
        >
          Add Customer
        </Button>
        <Button
          variant="outlined"
          onClick={exportToCSV}
          startIcon={<FileDownloadIcon />}
        >
          Export to CSV
        </Button>
      </div>

      <div
        className="ag-theme-material"
        style={{ height: 600, width: "95%", margin: "auto" }}
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

      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Confirm Delete"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
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

      <Dialog
        open={openAdd}
        onClose={handleAddClose}
        aria-labelledby="add-customer-dialog-title"
      >
        <DialogTitle id="add-customer-dialog-title">New Customer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="firstname"
            value={newCustomer.firstname}
            onChange={handleInputChange}
            label="First Name"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="lastname"
            value={newCustomer.lastname}
            onChange={handleInputChange}
            label="Last Name"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="email"
            value={newCustomer.email}
            onChange={handleInputChange}
            label="Email"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="phone"
            value={newCustomer.phone}
            onChange={handleInputChange}
            label="Phone"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="streetaddress"
            value={newCustomer.streetaddress}
            onChange={handleInputChange}
            label="Street Address"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="postcode"
            value={newCustomer.postcode}
            onChange={handleInputChange}
            label="Postcode"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="city"
            value={newCustomer.city}
            onChange={handleInputChange}
            label="City"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleAddClose}>Cancel</Button>
          <Button onClick={handleSave}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openEdit}
        onClose={handleEditClose}
        aria-labelledby="edit-customer-dialog-title"
      >
        <DialogTitle id="edit-customer-dialog-title">Edit Customer</DialogTitle>
        <DialogContent>
          <TextField
            margin="dense"
            name="firstname"
            value={editCustomer?.firstname || ""}
            onChange={handleEditChange}
            label="First Name"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="lastname"
            value={editCustomer?.lastname || ""}
            onChange={handleEditChange}
            label="Last Name"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="email"
            value={editCustomer?.email || ""}
            onChange={handleEditChange}
            label="Email"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="phone"
            value={editCustomer?.phone || ""}
            onChange={handleEditChange}
            label="Phone"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="streetaddress"
            value={editCustomer?.streetaddress || ""}
            onChange={handleEditChange}
            label="Street Address"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="postcode"
            value={editCustomer?.postcode || ""}
            onChange={handleEditChange}
            label="Postcode"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="city"
            value={editCustomer?.city || ""}
            onChange={handleEditChange}
            label="City"
            fullWidth
            variant="standard"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEditClose}>Cancel</Button>
          <Button onClick={handleUpdate}>Save</Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={openTraining}
        onClose={handleTrainingClose}
        aria-labelledby="add-training-dialog-title"
      >
        <DialogTitle id="add-training-dialog-title">
          Add Training for {selectedCustomer?.firstname}{" "}
          {selectedCustomer?.lastname}
        </DialogTitle>
        <DialogContent>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DateTimePicker
              label="Date and Time"
              value={newTraining.date}
              onChange={handleDateChange}
              fullWidth
              sx={{ width: "100%", mt: 2 }}
            />
          </LocalizationProvider>
          <TextField
            margin="dense"
            name="activity"
            value={newTraining.activity}
            onChange={handleTrainingChange}
            label="Activity"
            fullWidth
            variant="standard"
          />
          <TextField
            margin="dense"
            name="duration"
            value={newTraining.duration}
            onChange={handleTrainingChange}
            label="Duration (minutes)"
            fullWidth
            variant="standard"
            type="number"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleTrainingClose}>Cancel</Button>
          <Button onClick={handleTrainingSave}>Save</Button>
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

export default CustomerList;
