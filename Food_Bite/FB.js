const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const port = 3000;
const cors = require("cors");
const app = express();

const uri = "mongodb+srv://jeevanand:582004@cluster0.qrmugpb.mongodb.net/";

async function connect() {
  try {
    await mongoose.connect(uri);
    console.log("connected to mongoDB");
  } catch (error) {
    console.error(error);
  }
}
connect();
app.use(express.json());
app.use(cors());

// Login and SignUp
const {User} = require("./FB_Login&SignUp")

// SignUp 
app.post("/signup", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const newUser = new User({ username, email, password });
    await newUser.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Here you can generate and send a JWT token for authentication

    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// ADD ORDERS
const { orderModel } = require("./FB_Order");

app.post("/talkOrder", async (req, res) => {
  try {
    const {email, number, foodName, Address} =req.body;
    const orderDoc = await orderModel.create({
      email,
      number,
      foodName,
      Address,
      createdAt: new Date(),
    });
    res.json(orderDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/getAllOrders", async (req, res) => {
  try {
    const allOrders = await orderModel.find({});
    res.json(allOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.delete("/deleteOrder/:orderid", async (req, res) => {
  try {
    const { orderid } = req.params;
    await orderModel.deleteOne({ _id: orderid });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/editOrder/:orderid", async (req, res) => {
  const { orderid } = req.params;
  const { email,number, foodName, Address } = req.body;
  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      orderid,
      { email,number, foodName, Address },
      { new: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/getOrdersByEmail/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const order = await orderModel.find({ email });
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ........ |- Email -| .........

const emailSchema = new mongoose.Schema({
  sender: String,
  recipient: String,
  subject: String,
  body: String,
  sentAt: {
    type: Date,
    default: Date.now,
  },
});

const Email = mongoose.model('Email', emailSchema);

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'jeevanand5804@gmail.com',
    pass: '01govtjob',
  },
});

// Express route for sending email
app.post('/send-email', async (req, res) => {
  try {
    const { to, subject, text, html } = req.body;

    const mailOptions = {
      from: 'jeevanand5804@gmail.com',
      to,
      subject,
      text,
      html,
    };

    const newEmail = new Email(mailOptions);
    await newEmail.save();

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
      } else {
        console.log('Email sent: ' + info.response);
        res.status(200).send('Email forwarded successfully');
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal Server Error');
  }
});

// Reservation
const { Reservation } = require("./FB_Reserve");

app.post('/reserve-table', async (req, res) => {
  try {
    const {email, name, number, numberOfPeople, date, time } = req.body;
    const orderDoc = await Reservation.create({
      email,
      name,
      number,
      numberOfPeople,
      date,
      time,
      createdAt: new Date(),
    });
    res.json(orderDoc);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/getReserveByEmail/:email", async (req, res) => {
  const { email } = req.params;
  try {
    const order = await Reservation.find({ email });
    if (!order) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});
