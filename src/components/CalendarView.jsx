// src\components\CalendarView.jsx

import { useState, useEffect } from "react";

import FullCalendar from "@fullcalendar/react";

import dayGridPlugin from "@fullcalendar/daygrid";

import timeGridPlugin from "@fullcalendar/timegrid";

import interactionPlugin from "@fullcalendar/interaction";

import {
  Typography,
  Paper,
  Box,
  CircularProgress,
  Stack,
  Snackbar,
  Alert,
} from "@mui/material";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

// The CalendarView component displays a calendar of training sessions
function CalendarView() {
  // State for storing training events, loading status, and error messages
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch training data on component mount
  useEffect(() => {
    fetchTrainings();
  }, []);

  // Fetch training data from the API
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
        // Fetch customer data for each training session
        const trainingsWithCustomers = await Promise.all(
          responseData._embedded.trainings.map(async (training) => {
            const customerResponse = await fetch(training._links.customer.href);
            const customerData = await customerResponse.json();

            return {
              title: `${customerData.firstname} ${customerData.lastname} / ${training.activity}`,
              start: new Date(training.date),
              end: new Date(
                new Date(training.date).getTime() + training.duration * 60000
              ),
              extendedProps: {
                duration: training.duration,
                customer: customerData,
              },
            };
          })
        );
        setEvents(trainingsWithCustomers);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Error fetching training sessions");
        setLoading(false);
      });
  };

  return (
    <Box sx={{ p: 3 }}>
      {/* Header section */}
      <Stack direction="row" alignItems="center" spacing={1} mb={3}>
        <CalendarMonthIcon sx={{ fontSize: 35, color: "primary.main" }} />
        <Typography variant="h4" component="h1">
          Training Calendar
        </Typography>
      </Stack>

      {/* Main content */}
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          height: "80vh",
          backgroundColor: "#fff",
        }}
      >
        {loading ? (
          // Show a loading spinner if data is being fetched
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            minHeight="400px"
          >
            <CircularProgress />
          </Box>
        ) : (
          // Render the FullCalendar component with the fetched events
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="dayGridMonth"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventTimeFormat={{
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            }}
            height="100%"
            // Additional styling for better visual appearance
            eventDisplay="block"
            eventColor="#1976d2" // MUI primary color
            eventTextColor="#fff"
            dayMaxEvents={true} // Allow "more" link when too many events
            // Custom styles for the calendar
            eventDidMount={(info) => {
              info.el.style.fontSize = "0.875rem";
              info.el.style.padding = "2px 4px";
              info.el.style.borderRadius = "4px";
            }}
          />
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

export default CalendarView;
