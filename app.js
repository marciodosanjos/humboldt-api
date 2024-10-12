const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

app.use(cors()); // Adiciona o middleware CORS

app.get("/adsdata-gender", async (req, res) => {
  // Obtenha os parâmetros de paginação da query string (ou use valores padrão)
  const page = parseInt(req.query.page) || 1; // Página atual (default = 1)
  const limit = parseInt(req.query.limit) || 10; // Número de itens por página (default = 10)
  const offset = (page - 1) * limit; // Calcula o deslocamento para o slice dos dados

  const serviceAccountAuth = new JWT({
    email: process.env.GOOGLE_SHEET_CLIENT_EMAIL,
    key: process.env.GOOGLE_SHEET_PRIVATE_KEY.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(
    "1JlicWF4OP7qgyRXDR7UFp3zpjigT3Lx9DrqjF-8IlsU",
    serviceAccountAuth
  );

  try {
    // Carrega informações da planilha
    await doc.loadInfo();

    // Seleciona a planilha
    const adsAgePageSheet = doc.sheetsByIndex[4];

    // Carrega as linhas da planilha
    const rows = await adsAgePageSheet.getRows();

    // Extrai os cabeçalhos das colunas (nomes das colunas)
    const headers = adsAgePageSheet.headerValues;

    // Transforma as linhas em um array de objetos simples
    const items = rows.map((row) => {
      let rowData = {};
      headers.forEach((header, index) => {
        rowData[header] = row._rawData[index]; // Extrai o valor da célula
      });
      return rowData;
    });

    // Pagina os resultados com base nos parâmetros page e limit
    const paginatedItems = items.slice(offset, offset + limit);

    // Retorna os resultados paginados e informações de paginação
    res.json({
      page,
      limit,
      totalItems: items.length,
      totalPages: Math.ceil(items.length / limit),
      data: paginatedItems,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data");
  }
});

app.listen(3001, () => {
  console.log("Server running on port 3001");
});
