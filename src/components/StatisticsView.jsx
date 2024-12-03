// src\components\StatisticsView.jsx

import { useState, useEffect } from "react";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts";

import _ from "lodash";

import BarChartIcon from "@mui/icons-material/BarChart";
import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";

/**
 * The StatisticsView component displays a bar chart visualization of total training
 * minutes and session counts by activity.
 */
function StatisticsView() {
  // State for storing training statistics, loading status, and error messages
  const [stats, setStats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch training data on component mount
  useEffect(() => {
    fetchStats();
  }, []);

  /**
   * Fetches training data from the API and transforms it into a statistics object
   * with total minutes and session counts per activity.
   */
  const fetchStats = () => {
    setLoading(true);
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings"
    )
      .then((response) => {
        if (!response.ok) throw new Error("Error fetching data");
        return response.json();
      })
      .then((data) => {
        // Group training data by activity
        const groupedData = _.groupBy(data._embedded.trainings, "activity");

        // Transform grouped data into statistics object
        const stats = Object.entries(groupedData).map(
          ([activity, trainings]) => ({
            activity,
            minutes: _.sumBy(trainings, "duration"),
            sessions: trainings.length,
          })
        );

        // Sort statistics by total minutes in descending order
        const sortedStats = _.orderBy(stats, ["minutes"], ["desc"]);
        setStats(sortedStats);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching statistics");
        setLoading(false);
      });
  };

  /**
   * Custom tooltip component for the bar chart, displaying the activity name,
   * total training minutes, and session count.
   */
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" color="primary">
            {label}
          </Typography>
          <Typography variant="body2">
            Total Time: {payload[0].value} minutes
          </Typography>
          <Typography variant="body2">
            Sessions: {payload[0].payload.sessions}
          </Typography>
        </Paper>
      );
    }
    return null;
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header section */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <BarChartIcon sx={{ fontSize: 35, color: "primary.main" }} />
        <Typography variant="h4" component="h1">
          Training Statistics
        </Typography>
      </Stack>

      {/* Main content */}
      <Paper
        elevation={2}
        sx={{
          p: 3,
          borderRadius: 2,
          height: "600px",
          backgroundColor: "#fff",
        }}
      >
        {loading ? (
          // Show a loading spinner if data is being fetched
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100%"
          >
            <CircularProgress />
          </Box>
        ) : (
          // Render the bar chart with the fetched statistics
          <>
            <Typography variant="h6" gutterBottom sx={{ mb: 3 }}>
              Total Training Minutes by Activity
            </Typography>
            <ResponsiveContainer width="100%" height="90%">
              <BarChart
                data={stats}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="activity"
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                />
                <YAxis
                  label={{
                    value: "Minutes",
                    angle: -90,
                    position: "insideLeft",
                    style: { textAnchor: "middle" },
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar
                  dataKey="minutes"
                  fill="#1976d2"
                  name="Total Minutes"
                  radius={[4, 4, 0, 0]} // Rounded corners on top
                />
              </BarChart>
            </ResponsiveContainer>
          </>
        )}
      </Paper>

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

export default StatisticsView;
