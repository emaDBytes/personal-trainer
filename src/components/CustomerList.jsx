// src\components\CustomerList.jsx

import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import IconButton from "@mui/material/IconButton";
import EditIcon from "@mui/icons-material/Edit";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [openAdd, setOpenAdd] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [error, setError] = useState("");
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

  const [columnDefs] = useState([
    { field: "firstname", sortable: true, filter: true },
    { field: "lastname", sortable: true, filter: true },
    { field: "email", sortable: true, filter: true },
    { field: "phone", sortable: true, filter: true },
    { field: "streetaddress", sortable: true, filter: true },
    { field: "postcode", sortable: true, filter: true },
    { field: "city", sortable: true, filter: true },
    {
      headerName: "",
      field: "id",
      width: 90,
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

      <Button
        variant="contained"
        onClick={handleAddOpen}
        startIcon={<AddIcon />}
        style={{ marginBottom: 20 }}
      >
        Add Customer
      </Button>

      <div
        className="ag-theme-material"
        style={{
          height: "70vh",
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
