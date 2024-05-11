const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const port = 3000;
const cors = require("cors");
const app = express();

const uri = "mongodb+srv://jeevanand:582004@cluster0.qrmugpb.mongodb.net/FoodBite";

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
const {User} = require("./Food_Bite/FB_Login&SignUp")
app.get("/api/users", async (req, res) => {
  try {
    const users = await User.find({}, "username email"); // Selecting only 'username' and 'email' fields
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
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
    const { usernameOrEmail, password } = req.body;
    // Find user by username or email
    const user = await User.findOne({
      $or: [{ username: usernameOrEmail }, { email: usernameOrEmail }],
    });

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
const { orderModel } = require("./Food_Bite/FB_Order");

app.post("/talkOrder", async (req, res) => {
  try {
    const {username,email, number, foodItems, Address} =req.body;
    const orderDoc = await orderModel.create({
      username,
      email,
      number,
      foodItems,
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
app.get("/getTotalOrders", async (req, res) => {
  try {
    // Query the database to get the count of orders
    const totalOrders = await orderModel.countDocuments();
    res.json({ totalOrders });
  } catch (error) {
    console.error("Error fetching total orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
app.delete("/deleteOrder/:reserveid", async (req, res) => {
  try {
    const { reserveid } = req.params;
    await orderModel.deleteOne({ _id: reserveid });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/editOrder/:reserveid", async (req, res) => {
  const { reserveid } = req.params;
  const { email,number, foodItems, Address } = req.body;
  try {
    const updatedOrder = await orderModel.findByIdAndUpdate(
      reserveid,
      { email,number, foodItems, Address },
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
  from: String,
  to: String,
  subject: String,
  text: String,
  html:String,
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
    pass: 'fcyt xkfk khzt emab',
  },
});

// Express route for sending email
app.post('/send-email', async (req, res) => {
  try {
    const { from,to, subject, text, html } = req.body;

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
const { Reservation } = require("./Food_Bite/FB_Reserve");

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
app.delete("/deleteReserve/:reserveid", async (req, res) => {
  try {
    const { reserveid } = req.params;
    await Reservation.deleteOne({ _id: reserveid });
    res.json({ message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.put("/editReserve/:reserveid", async (req, res) => {
  const { reserveid } = req.params;
  const { email,name,number, numberOfPeople,date, time } = req.body;
  try {
    const updatedOrder = await Reservation.findByIdAndUpdate(
      reserveid,
      {email,name,number, numberOfPeople,date, time },
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
app.get("/getAllReservation", async (req, res) => {
  try {
    const allReservation = await Reservation.find({});
    res.json(allReservation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
app.get("/getTotalReserve", async (req, res) => {
  try {
    // Query the database to get the count of orders
    const totalReservation = await Reservation.countDocuments();
    res.json({ totalReservation });
  } catch (error) {
    console.error("Error fetching total orders:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// AdminLogin

const { Admin } = require("./Food_Bite/AdminLogin_SignUp");

app.post("/adminSignup", async (req, res) => {
  try {
    const { adminname, email, password } = req.body;
    const newAdmin = new Admin({ adminname, email, password });
    await newAdmin.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Login
app.post("/adminLogin", async (req, res) => {
  try {
    const { adminnameOrEmail, password } = req.body;
    const admin = await Admin.findOne({
      $or: [{ adminname: adminnameOrEmail }, { email: adminnameOrEmail }],
    });

    if (!admin) {
      return res.status(404).json({ error: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, admin.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid password" });
    }


    res.json({ message: "Login successful" });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Gallary

const Product = require('./Food_Bite/Products');
app.post('/create-product', async (req, res) => {
  try {
    const { productImage,title, price, description } = req.body;

    // Create a new product document
    const product = new Product({
      productImage,
      title,
      price,
      description,
      createdAt: new Date(),
    });

    // Save the product to the database
    const savedProduct = await product.save();

    // Send the saved product as the response
    res.status(201).json(savedProduct);
  } catch (error) {
    // If an error occurs, send a 500 status code and an error message
    res.status(500).json({ message: error.message });
  }
});
app.get('/get-all-products', async (req, res) => {
  try {
    // Retrieve all products from the database
    const products = await Product.find();

    // Send the retrieved products as the response
    res.status(200).json(products);
  } catch (error) {
    // If an error occurs, send a 500 status code and an error message
    res.status(500).json({ message: error.message });
  }
});
// Delete a product by ID
app.delete('/delete-product/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // Find the product by ID and delete it from the database
    await Product.findByIdAndDelete(id);

    // Send a success message as the response
    res.status(200).json({ message: 'Product deleted successfully.' });
  } catch (error) {
    // If an error occurs, send a 500 status code and an error message
    res.status(500).json({ message: error.message });
  }
});

// Edit a product by ID
app.put('/edit-product/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { productImage, title, price, description } = req.body;

    // Find the product by ID and update its fields with the new values
    const updatedProduct = await Product.findByIdAndUpdate(id, {
      productImage,
      title,
      price,
      description
    }, { new: true });

    // If the product was successfully updated, send it as the response
    res.status(200).json(updatedProduct);
  } catch (error) {
    // If an error occurs, send a 500 status code and an error message
    res.status(500).json({ message: error.message });
  }
});

app.listen(3000, () => {
  console.log(`Example app listening on port 3000`);
});
