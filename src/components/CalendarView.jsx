// src\components\CalendarView.jsx

import { useState, useEffect } from "react";

import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";

function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    fetchTrainings();
  }, []);

  const fetchTrainings = () => {
    fetch(
      "https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings"
    )
      .then((response) => {
        if (!response.ok)
          throw new Error("Error in fetch: " + response.statusText);
        return response.json();
      })
      .then(async (responseData) => {
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
      })
      .catch((err) => console.error(err));
  };

  return (
    <div style={{ marginTop: 20, height: "80vh" }}>
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
      />
    </div>
  );
}

export default CalendarView;
