const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const moment = require("moment");

//mongoose
const AdsGenderData = require("./Model/AdsGenderData.js");
const dbConnect = require("./config/dbConnect");
//db connect
dbConnect();

app.use(cors());

app.get("/adsgender", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Função para converter a data recebida em um objeto Date
  function parseDate(dateString) {
    return moment(dateString, "YYYY-MM-DD").toDate(); // Converte para objeto Date no formato correto
  }

  // Converte a data de query para um objeto Date
  const startDate = req.query.startDate ? parseDate(req.query.startDate) : null;
  const endDate = req.query.endDate ? parseDate(req.query.endDate) : null;

  // Construção da query para MongoDB
  const query = {};
  if (startDate && endDate) {
    query.date_start = { $gte: startDate, $lte: endDate };
  } else if (startDate) {
    query.date_start = { $gte: startDate };
  }

  try {
    // Busca os dados baseados na query de data
    const data = await AdsGenderData.find(query).skip(offset).limit(limit);

    // Retorna os dados e informações adicionais
    res.json({
      page,
      limit,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / limit),
      startDate,
      endDate,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data");
  }
});

//delete all data from AdsGenderData
app.get("/delete", async (req, res) => {
  try {
    await AdsGenderData.deleteMany({});

    res.json({
      status: "Success",
      message: "Data succefully deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).send("An error occurred while deleting data");
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
