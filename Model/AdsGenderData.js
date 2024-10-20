const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

// Função para converter a data de DD.MM.YYYY para YYYY-MM-DD
function parseDate(dateString) {
  return moment(dateString, "DD.MM.YYYY").toDate(); // Converte para objeto Date
}

const AdsGenderDataSchema = new Schema({
  ad_id: {
    required: true,
    type: String,
  },
  date_start: {
    required: true,
    type: Date,
    set: (value) => parseDate(value), // Converte a string antes de salvar
  },
  date_stop: {
    required: true,
    type: Date,
    set: (value) => parseDate(value), // Converte a string antes de salvar
  },
  ad_name: {
    required: true,
    type: String,
  },
  adset_name: {
    required: true,
    type: String,
  },
  campaign_name: {
    required: true,
    type: String,
  },
  objective: {
    required: true,
    type: String,
  },
  optimization_goal: {
    required: true,
    type: String,
  },
  spend: {
    required: true,
    type: String,
  },
  frequency: {
    required: true,
    type: String,
  },
  reach: {
    required: true,
    type: Number,
  },
  impressions: {
    required: true,
    type: Number,
  },
  age: {
    required: true,
    type: String,
  },
  gender: {
    required: true,
    type: String,
  },
  link_clicks: {
    required: true,
    type: Number,
  },
  post_reaction: {
    required: true,
    type: Number,
  },
  pageview_br: {
    required: true,
    type: Number,
  },
  pageview_latam: {
    required: true,
    type: Number,
  },
  comments: {
    required: true,
    type: Number,
  },
  page_engagement: {
    required: true,
    type: Number,
  },
  post_engagement: {
    required: true,
    type: Number,
  },
  shares: {
    required: true,
    type: Number,
  },
  video_views: {
    required: true,
    type: Number,
  },
});

//compile the schema to model
const AdsGenderData = mongoose.model(
  "AdsGenderDataSchema",
  AdsGenderDataSchema
);

module.exports = AdsGenderData;
