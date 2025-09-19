import mongoose from "mongoose";


const StockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  name: { type: String, required: true },
  currency: { type: String, required: true },
  price: { type: Number, required: true },
  high: { type: Number, required: true },
  low: { type: Number, required: true },
  stockImage: { type: String, required: true },
});

const Stock = mongoose.model("Stock", StockSchema);
export default Stock;