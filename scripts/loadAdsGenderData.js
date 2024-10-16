const dbConnect = require("../config/dbConnect");
const AdsGenderData = require("../Model/AdsGenderData");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

//db connect
dbConnect();

const testData = {
  adId: "2322",
  dateStart: "2023-01-12",
  dateStop: "2023-01-12",
  adName: "Lorem",
  adsetName: "Lorem",
  campaignName: "Lorem",
  objective: "Lorem",
  optimizationGoal: "Lorem",
  spend: 0,
  frequency: 0,
  reach: 0,
  impressions: 0,
  age: "Lorem",
  gender: "Lorem",
  linkClicks: 0,
  postReaction: 0,
  pageviewBr: 0,
  pageviewLatam: 0,
  comments: 0,
  pageEngagement: 0,
  postEngagement: 0,
  shares: 0,
  videoViews: 0,
};

const writeAdsGenderData = async () => {
  //get the data from google sheet
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
    //carregar google sheet
    await doc.loadInfo();
    const adsAgePageSheet = doc.sheetsByIndex[4];
    const rows = await adsAgePageSheet.getRows();
    const headers = adsAgePageSheet.headerValues;

    //pegar data mais recente no mongo db
    const mostRecentRecord = await AdsGenderData.findOne()
      .sort({ dateStart: -1 }) // Ordena pela data (decrescente)
      .limit(1); // Limita a um resultado

    if (mostRecentRecord) {
      console.log(mostRecentRecord.date_start);

      // Extrai o dia, mês e ano da data
      const day = mostRecentRecord.date_start.getDate() + 1; // Método correto para obter o dia
      const month = mostRecentRecord.date_start.getMonth() + 1; // Método correto para obter o mês (0-11)
      const year = mostRecentRecord.date_start.getFullYear(); // Obtém o ano

      // Formata a data com zero à esquerda, se necessário
      const newDate = `${day.toString().padStart(2, "0")}.${month
        .toString()
        .padStart(2, "0")}.${year}`;

      console.log(newDate);

      // Transforma as linhas em um array de objetos simples
      let items = rows.map((row) => {
        let rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row._rawData[index]; // Extrai o valor da célula
        });
        return rowData;
      });

      const googleSheetData = items.filter((row, index) => {
        return row.date_start === newDate;
      });

      // console.log(googleSheetData);

      //   //save the data on mongo db
      //   await AdsGenderData.create(googleSheetData);
      //   console.log("Dados carregados com sucesso");
    } else {
      console.log("Nenhum registro encontrado no mongo db.");
      return null;
    }
  } catch (error) {
    console.error(error);
  }
};

writeAdsGenderData();
