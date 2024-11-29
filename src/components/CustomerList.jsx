// src\components\CustomerList.jsx

import { useState, useEffect } from "react";
import { AgGridReact } from "ag-grid-react";

import "ag-grid-community/styles/ag-grid.css";
import "ag-grid-community/styles/ag-theme-material.css";

function CustomerList() {
  const [customers, setCustomers] = useState([]);

  const columns = [
    { field: "firstname", sortable: true, filter: true },
    { field: "lastname", sortable: true, filter: true },
    { field: "email", sortable: true, filter: true },
    { field: "phone", sortable: true, filter: true },
    { field: "streetaddress", sortable: true, filter: true },
    { field: "postcode", sortable: true, filter: true },
    { field: "city", sortable: true, filter: true },
  ];

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
          columnDefs={columns}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 20, 50, 100]}
        />
      </div>
    </div>
    // <div>
    //   <h2>Customers</h2>
    //   <table>
    //     <thead>
    //       <tr>
    //         <th>First Name</th>
    //         <th>Last Name</th>
    //         <th>Email</th>
    //         <th>Phone</th>
    //         <th>Address</th>
    //         <th>Postcode</th>
    //         <th>City</th>
    //       </tr>
    //     </thead>
    //     <tbody>
    //       {customers?.map((customer) => (
    //         <tr key={customer._links.customer.href.split("/").pop()}>
    //           <td>{customer.firstname}</td>
    //           <td>{customer.lastname}</td>
    //           <td>{customer.email}</td>
    //           <td>{customer.phone}</td>
    //           <td>{customer.streetaddress}</td>
    //           <td>{customer.postcode}</td>
    //           <td>{customer.city}</td>
    //         </tr>
    //       ))}
    //     </tbody>
    //   </table>
    // </div>
  );
}

export default CustomerList;
