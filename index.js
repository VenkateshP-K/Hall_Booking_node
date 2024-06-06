const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

const rooms = [];
const bookings = [];
const customers = [];

let bookingIdCounter = 1;

app.get('/', (req, res) => {
    res.send('Welcome!');
  });

//create a room
app.post('/rooms',  (req, res) => {
    const { name, amenities, pricePerHour, seatsAvailable } = req.body;
    const newRoom = { id: rooms.length + 1, name, amenities, pricePerHour, seatsAvailable, booked: false };
    rooms.push(newRoom);
    res.status(201).json({ message: 'Room created successfully', room: newRoom });
  });

  // Book a room with customer name, date, start time, end time, roomId
app.post('/book', (req, res) => {
    const { customerName, date, startTime, endTime, roomId } = req.body;
    const room = rooms.find(room => room.id === roomId && !room.booked);
    if (!room) return res.status(400).json({ error: 'Room not available' });
  
    const newBooking = {
      id: bookingIdCounter++,
      customerName,
      date,
      startTime,
      endTime,
      roomId,
      bookingDate: new Date().toISOString(),
      status: 'booked'
    };
  
    bookings.push(newBooking);
    room.booked = true;
  
    const customer = customers.find(cust => cust.name === customerName);
    if (!customer) {
      customers.push({ name: customerName, bookings: [newBooking] });
    } else {
      customer.bookings.push(newBooking);
    }
  
    res.status(201).json({ message: 'Room booked successfully' });
  });
  
  // List all rooms 
app.get('/rooms', (req, res) => {
    const roomsWithBookingData = rooms.map(room => {
      const booking = bookings.find(booking => booking.roomId === room.id);
      return {
        ...room,
        booked: !!booking,
        customerName: booking ? booking.customerName : null,
        date: booking ? booking.date : null,
        startTime: booking ? booking.startTime : null,
        endTime: booking ? booking.endTime : null,
      };
    });
    res.status(200).json(roomsWithBookingData);
  });


  // List all customers with booked data
app.get('/customers', (req, res) => {
    const customersWithBookingData = customers.map(customer => ({
      name: customer.name,
      bookings: customer.bookings.map(booking => {
        const room = rooms.find(room => room.id === booking.roomId);
        return {
          roomName: room.name,
          date: booking.date,
          startTime: booking.startTime,
          endTime: booking.endTime,
        };
      })
    }));
    res.status(200).json(customersWithBookingData);
  });


  // List how many times a customer has booked the room with detailed booking info
app.get('/customers/:name/bookings', (req, res) => {
    const customerName = req.params.name;
    const customer = customers.find(cust => cust.name === customerName);
    if (!customer) return res.status(404).json({ error: 'Customer not found' });
  
    const detailedBookings = customer.bookings.map(booking => {
      const room = rooms.find(room => room.id === booking.roomId);
      return {
        bookingId: booking.id,
        roomName: room.name,
        date: booking.date,
        startTime: booking.startTime,
        endTime: booking.endTime,
        status: booking.status,
        bookingDate: booking.bookingDate
      };
    });

    res.status(200).json({ customerName, bookings: detailedBookings, totalBookings: detailedBookings.length });
});

app.listen(3500, () => {
  console.log('Server is running on port 3500');
});