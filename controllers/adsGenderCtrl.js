const AdsGenderData = require("../model/AdsGenderData");
const moment = require("moment");

const fetchAdsGenderData = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  // Função para converter a data recebida em um objeto Date
  function parseDate(dateString) {
    return moment(dateString, "DD-MM-YYYY").toDate(); // Converte para objeto Date no formato correto
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

    const stats = await AdsGenderData.aggregate([
      {
        $match: query,
      },
      {
        $group: {
          _id: null,
          sumReach: { $sum: "$reach" }, // Calcula o total do campo "reach"
          sumImpressions: { $sum: "$impressions" }, // Calcula o total do campo "impressions"
        },
      },
    ]);

    // Retorna os dados e informações adicionais
    res.json({
      page,
      limit,
      totalItems: data.length,
      totalPages: Math.ceil(data.length / limit),
      stats,
      startDate,
      endDate,
      data,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("An error occurred while fetching data");
  }
};

module.exports = fetchAdsGenderData;
