// src\components\StatisticsView.jsx

import { useState, useEffect } from "react";

import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

import _ from "lodash";

function StatisticsView() {
  const [stats, setStats] = useState([]);

  useEffect(() => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings"
    )
      .then((response) => response.json())
      .then((data) => {
        const groupedData = _.groupBy(data._embedded.trainings, "activity");
        const stats = Object.entries(groupedData).map(
          ([activity, trainings]) => ({
            activity,
            minutes: _.sumBy(trainings, "duration"),
          })
        );
        setStats(stats);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={{ marginTop: 20 }}>
      <h2>Training Minutes by Activity</h2>
      <BarChart width={800} height={400} data={stats}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="activity" />
        <YAxis
          label={{ value: "Minutes", angle: -90, position: "insideLeft" }}
        />
        <Tooltip />
        <Bar dataKey="minutes" fill="#8884d8" />
      </BarChart>
    </div>
  );
}

export default StatisticsView;
