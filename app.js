const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const adsGenderRouter = require("./routes/adsGenderRoute.js");

//mongoose
const dbConnect = require("./config/dbConnect");

//db connect
dbConnect();

app.use(cors()); //allows any client side to access to the api

//routes
app.use("/adsgender", adsGenderRouter);

// //delete all data from AdsGenderData
// app.get("/delete", async (req, res) => {
//   try {
//     await AdsGenderData.deleteMany({});

//     res.json({
//       status: "Success",
//       message: "Data succefully deleted",
//     });
//   } catch (error) {
//     console.error(error);

//     res.status(500).send("An error occurred while deleting data");
//   }
// });

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
