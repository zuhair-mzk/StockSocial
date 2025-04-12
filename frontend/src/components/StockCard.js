import React from "react";

const StockCard = ({ stock }) => (
  <div>
    <h4>{stock.symbol} - {stock.company}</h4>
    <p>Shares: {stock.shares}</p>
    <p>Market Value: ${stock.marketValue}</p>
  </div>
);

export default StockCard;
