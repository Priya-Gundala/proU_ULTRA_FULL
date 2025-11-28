const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", require("./routes/auth"));
app.use("/employees", require("./routes/employees"));
app.use("/tasks", require("./routes/tasks"));

app.get("/", (req, res) => {
  res.send("Backend Running OK");
});

app.listen(5000, () => console.log("Server running on port 5000"));
