const dbConnect = require("../config/dbConnect");
const AdsGenderData = require("../Model/AdsGenderData.js");
const { GoogleSpreadsheet } = require("google-spreadsheet");
const { JWT } = require("google-auth-library");
const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");

//db connect
dbConnect();

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
      .sort({ date_start: -1 }) // Ordena pela data (decrescente)
      .limit(1); // Limita a um resultado

    if (mostRecentRecord) {
      console.log(mostRecentRecord.date_start);

      // Extrai o dia, mês e ano da data
      const day = mostRecentRecord.date_start.getDate() + 1; // Método correto para obter o dia e add um dia a mais
      const month = mostRecentRecord.date_start.getMonth() + 1; // Método correto para obter o mês (0-11)
      const year = mostRecentRecord.date_start.getFullYear(); // Obtém o ano

      // Formata a data com zero à esquerda, se necessário
      const newDate = `${day.toString().padStart(2, "0")}.${month
        .toString()
        .padStart(2, "0")}.${year}`;

      console.log(`Buscando dados para a data: ${newDate}`);

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

      if (googleSheetData.length > 0) {
        console.log(
          `Para a data ${newDate}, foram encontrados ${googleSheetData.length}`
        );
        //save the data on mongo db
        console.log(
          `Salvando ${googleSheetData.length} item para a data ${newDate}`
        );

        await AdsGenderData.create(googleSheetData);
        console.log(
          `${googleSheetData.length} itens salvos para a data ${newDate}`
        );
        process.exit(0);
      }

      if (googleSheetData.length === 0) {
        console.log(`Para a data ${newDate}, nao foram encontrados registros`);
        let incrementedDate = new Date(mostRecentRecord.date_start);
        while (googleSheetData.length === 0) {
          // Enquanto não encontrar dados na planilha, adicionar dias à data
          console.log(`Adicionando um dia à data`);

          // Incrementar o dia corretamente
          incrementedDate.setDate(incrementedDate.getDate() + 1); // Adiciona um dia

          // Extrair dia, mês e ano da variável incrementedDate (não newDate)
          let day = incrementedDate.getDate();
          let month = incrementedDate.getMonth() + 1; // Mês começa em 0
          let year = incrementedDate.getFullYear();

          // Formatar a data no formato DD.MM.YYYY
          let formattedDate = `${day.toString().padStart(2, "0")}.${month
            .toString()
            .padStart(2, "0")}.${year}`;

          console.log(`A nova data agora é: ${formattedDate}`);

          // Filtrar novamente os dados da planilha para encontrar a nova data
          const googleSheetData = items.filter(
            (row) => row.date_start === formattedDate
          );

          if (googleSheetData.length === 0) {
            console.log(`Nao há dados para a data: ${formattedDate}`);
          }

          // Se encontrar dados, salvar no MongoDB
          if (googleSheetData.length > 0) {
            console.log(`Encontramos dados para o dia: ${formattedDate}`);
            console.log(googleSheetData[0]);
            await AdsGenderData.create(googleSheetData);
            console.log(
              `Dados para o dia carregados com sucesso: ${formattedDate}`
            );
            process.exit(0);
            break;
          }
        }
      }
    } else {
      console.log("Nenhum registro encontrado no mongo db.");
      // Transforma as linhas em um array de objetos simples
      let items = rows.map((row) => {
        let rowData = {};
        headers.forEach((header, index) => {
          rowData[header] = row._rawData[index]; // Extrai o valor da célula
        });
        return rowData;
      });

      const googleSheetData = items.filter((row, index) => {
        return row.date_start === "01.01.2024";
      });

      //save the data on mongo db
      await AdsGenderData.create(googleSheetData);
      console.log("Dados carregados na db vazia com sucesso");
      process.exit(0);
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

writeAdsGenderData();
