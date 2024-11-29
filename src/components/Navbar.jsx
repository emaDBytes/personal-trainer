// src\components\Navbar.jsx

import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav style={{ marginBottom: "20px" }}>
      <h3>Personal Trainer</h3>
      <Link to="/customers" style={{ marginRight: "10px" }}>
        Customers
      </Link>
      <Link to="/trainings">Trainings</Link>
    </nav>
  );
}

export default Navbar;
