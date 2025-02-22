const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const stegoRoutes = require("./routes/stegoRoutes");

const app = express();

// ✅ Allow CORS from any network device (Frontend Access)
app.use(cors({ origin: "*" }));

// ✅ Middleware for JSON and URL-encoded form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ✅ Log Incoming Requests (Placed Before Routes)
app.use((req, res, next) => {
    console.log("🔹 Incoming Request:", req.method, req.url);
    console.log("🔹 Headers:", req.headers);
    console.log("🔹 Body:", req.body);
    console.log("🔹 Files:", req.files);
    console.log("🔹 File:", req.file);
    next();
});

// ✅ Routes
app.use("/api", stegoRoutes);

// ✅ Start Server and Listen on All Network Interfaces
const PORT = 5000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`🚀 Server running on: http://0.0.0.0:${PORT}`);
    console.log(`🌍 Access from another device: http://<YOUR_IP>:${PORT}`);
});
