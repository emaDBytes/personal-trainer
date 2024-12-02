// src\components\CustomerList.jsx

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

function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [open, setOpen] = useState(false);
  const [deleteCustomer, setDeleteCustomer] = useState(null);
  const [error, setError] = useState("");

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
