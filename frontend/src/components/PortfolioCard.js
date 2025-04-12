import React from "react";

const PortfolioCard = ({ portfolio }) => (
  <div>
    <h3>{portfolio.name}</h3>
    <p>Cash: ${portfolio.cash_balance}</p>
    <p>Market Value: ${portfolio.market_value}</p>
  </div>
);

export default PortfolioCard;
