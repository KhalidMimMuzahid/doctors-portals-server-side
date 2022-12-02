const express = require("express");
const cors = require("cors");
const { MongoClient, ServerApiVersion } = require("mongodb");
require("dotenv").config();
const app = express();
const port = process.env.port || 5000;
app.use(cors());
app.use(express.json());
const user = process.env.DB_USER;
const password = process.env.DB_PASS;
const uri = `mongodb+srv://${user}:${password}@cluster0.8rvhoda.mongodb.net/?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});

app.get("/", async (req, res) => {
  res.send("server is running");
});

async function run() {
  try {
    const appointmentOptions = client
      .db("appointments")
      .collection("appointmentOptions");
    const bookings = client.db("bookings").collection("bookings");
    app.get("/appointments", async (req, res) => {
      const date = req.query.date;
      console.log(date);
      const query = {};

      const options = await appointmentOptions.find(query).toArray();
      const alreadyBooked = await bookings.find(query).toArray();
      // console.log(options);
      // console.log("booked", alreadyBooked);
      options.forEach((option) => {
        const bookedInfo = alreadyBooked.filter(
          (book) => book.treatmentName === option.name
        );
        const bookedSlots = bookedInfo.map((booking) => booking.slot);
        const remainingSlots = option.slots.filter(
          (slot) => !bookedSlots.includes(slot)
        );
        option.slots = remainingSlots;
        // console.log(option.name, remainingSlots);
      });
      res.send(options);
    });
    app.post("/bookings", async (req, res) => {
      const bookingInfo = req.body;
      const result = await bookings.insertOne(bookingInfo);
      res.send(result);
    });
  } finally {
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log("listening on port", port);
});
