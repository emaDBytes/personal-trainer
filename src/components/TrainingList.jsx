// src\components\TrainingList.jsx

import { useState, useEffect } from "react";

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
      .then((responseData) => {
        console.log("API Response:", responseData);
        console.log("Trainings:", responseData._embedded.trainings);

        setTrainings(responseData._embedded.trainings);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div>
      <h2>Trainings</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Duration</th>
            <th>Activity</th>
            <th>Training</th>
            <th>Customer</th>
          </tr>
        </thead>
        <tbody></tbody>
      </table>
    </div>
  );
}

export default TrainingList;
