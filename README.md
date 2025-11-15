# Stock Portfolio Social Network

A full-stack web application that combines portfolio management with social networking features, allowing users to track stock investments, analyze performance, and share insights with friends.

## 🎯 Overview

This application provides a comprehensive platform for stock portfolio management with integrated social features. Users can manage multiple portfolios, track stock performance, analyze historical data, create and share stock lists, and connect with other investors to exchange insights.

Built as a database-driven application, it demonstrates advanced database design, query optimization, and modern full-stack development practices.

## ✨ Key Features

### Portfolio Management
- **Multi-Portfolio Support**: Create and manage multiple investment portfolios
- **Real-Time Tracking**: Monitor stock holdings with current market values
- **Transaction History**: Complete record of all buy/sell transactions
- **Cash Management**: Track cash balances and portfolio liquidity
- **Performance Analytics**: View portfolio statistics including volatility (coefficient of variation) and beta coefficients

### Stock Analytics
- **Historical Data**: Access 5 years of S&P 500 historical stock data
- **Price Predictions**: Machine learning-based stock price forecasting
- **Custom Data Integration**: Add and integrate new daily stock data
- **Statistical Analysis**: Calculate correlations and covariance matrices for portfolio stocks
- **Interactive Charts**: Visualize stock performance over customizable time periods

### Social Features
- **Friend Network**: Send, accept, and manage friend connections
- **Stock Lists**: Create curated lists of stocks with share allocations
- **Sharing & Privacy**: Share stock lists privately with friends or publicly with all users
- **Review System**: Write and read reviews on stock lists (up to 4,000 characters)
- **Collaborative Analysis**: View statistics on stock lists shared by friends

### Advanced Functionality
- **Smart Request Management**: Prevents duplicate friend requests with 5-minute cooldown after rejection
- **Access Control**: Granular privacy controls for portfolios and stock lists
- **Database Optimization**: Indexed queries and caching for performance
- **Data Normalization**: Properly normalized relational schema to BCNF

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **Database**: PostgreSQL with asyncpg for async operations
- **Data Analysis**: pandas, numpy, scipy, statsmodels
- **API Architecture**: RESTful API with JSON responses
- **Environment Management**: python-dotenv for configuration

### Frontend
- **Framework**: React 19.1
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS with custom configurations
- **UI Components**: Heroicons for icons
- **State Management**: Context API for authentication

### Development Tools
- **Testing**: Jest, React Testing Library
- **Build Tool**: Create React App
- **API Client**: Fetch API
- **Code Quality**: ESLint

## 📁 Project Structure

```
c43_project/
├── backend/
│   ├── main.py                 # FastAPI application entry point
│   ├── models.py              # Pydantic models for request/response
│   ├── dependencies.py        # Database connection pooling
│   ├── requirements.txt       # Python dependencies
│   └── routes/
│       ├── loginregister.py   # Authentication endpoints
│       ├── portfolio.py       # Portfolio management
│       ├── portfolioholdings.py # Stock transactions
│       ├── stocks.py          # Stock data and predictions
│       ├── stocklist.py       # Stock list management
│       └── friendship.py      # Social networking features
│
└── frontend/
    ├── public/
    │   └── index.html         # HTML template
    └── src/
        ├── App.js             # Main application component
        ├── index.js           # React entry point
        ├── components/        # Reusable UI components
        │   ├── Navbar.js
        │   ├── PortfolioCard.js
        │   ├── StockCard.js
        │   ├── FriendCard.js
        │   └── ...
        ├── pages/             # Route-level components
        │   ├── DashboardPage.jsx
        │   ├── PortfolioDetails.jsx
        │   ├── StockListPage.jsx
        │   ├── FriendsPage.jsx
        │   └── ...
        ├── context/           # React Context providers
        │   └── AuthContext.js
        └── services/          # API integration
            ├── api.js
            └── auth.js
```

## 🚀 Getting Started

### Prerequisites
- Python 3.10+
- Node.js 16+ and npm
- PostgreSQL 14+

### Database Setup

1. **Install PostgreSQL** and create a database:
```bash
createdb stock_social_network
```

2. **Set up the schema** by running the SQL scripts (see database documentation in project files)

3. **Load historical data**: Import the S&P 500 historical stock data (instructions in dataset documentation)

### Backend Setup

1. **Navigate to the backend directory**:
```bash
cd backend
```

2. **Create a virtual environment**:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. **Install dependencies**:
```bash
pip install -r requirements.txt
```

4. **Configure environment variables** - Create a `.env` file:
```env
DATABASE_URL=postgresql://username:password@localhost/stock_social_network
```

5. **Run the server**:
```bash
uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory**:
```bash
cd frontend
```

2. **Install dependencies**:
```bash
npm install
```

3. **Start the development server**:
```bash
npm start
```

The application will open at `http://localhost:3000`

## 📊 Database Design

The application implements a normalized relational schema with the following key entities:

- **Users**: Authentication and profile information
- **Portfolios**: User-owned investment portfolios
- **Holdings**: Stock positions within portfolios
- **Transactions**: Historical buy/sell records
- **StockLists**: Curated collections of stocks
- **StockPrices**: Historical and current stock data
- **Friendships**: Social connections between users
- **Reviews**: User reviews on stock lists
- **SharePermissions**: Access control for stock lists

### Key Design Features
- **Normalization**: Schema normalized to Boyce-Codd Normal Form (BCNF)
- **Referential Integrity**: Foreign key constraints ensure data consistency
- **Indexing**: Strategic indexes on frequently queried columns
- **Async Operations**: Connection pooling for efficient database access

## 🔐 API Documentation

### Authentication
- `POST /login` - User authentication
- `POST /register` - New user registration
- `GET /user-id` - Get user ID by username

### Portfolio Management
- `GET /portfolios/{user_id}` - List user portfolios
- `POST /portfolios` - Create new portfolio
- `GET /portfolio/{portfolio_id}` - Get portfolio details
- `POST /transactions` - Record stock transaction
- `GET /portfolio/{portfolio_id}/value` - Get current portfolio value

### Stock Operations
- `GET /stocks/{symbol}/latest` - Latest stock price
- `POST /stocks/add` - Add new stock data
- `GET /stocks/{symbol}/history` - Historical prices
- `GET /stocks/{symbol}/predict` - Price predictions

### Social Features
- `GET /friends/{user_id}` - List friends
- `POST /send-friend-request` - Send friend request
- `POST /accept-friend-request` - Accept request
- `DELETE /friends` - Remove friend
- `GET /stocklists/{user_id}` - User's stock lists
- `POST /stocklists` - Create stock list
- `POST /reviews` - Add review to stock list

## 🎓 Academic Context

This project was developed for CSCC43: Introduction to Databases at the University of Toronto (Winter 2025). It demonstrates:

- **Database Design**: Entity-Relationship modeling and schema normalization
- **SQL Proficiency**: Complex queries with joins, aggregations, and subqueries
- **Query Optimization**: Use of indexes, caching, and efficient query patterns
- **Full-Stack Development**: Integration of database with modern web technologies
- **Data Analysis**: Statistical calculations performed within the database
- **Software Engineering**: Modular architecture and clean code practices

## 🔮 Future Enhancements

Potential improvements for future iterations:

1. **Real-Time Data**: Integration with live stock market APIs (Alpha Vantage, Yahoo Finance)
2. **Advanced Analytics**: More sophisticated prediction models using machine learning
3. **Portfolio Optimization**: Automated portfolio rebalancing based on risk tolerance
4. **Mobile App**: React Native application for iOS and Android
5. **WebSocket Integration**: Real-time updates for stock prices and friend activities
6. **Export Features**: Generate PDF reports of portfolio performance
7. **Multi-Currency Support**: Track international stocks and forex
8. **Tax Reporting**: Generate tax documents for capital gains/losses

## 📝 License

This project was created for educational purposes as part of a university course.

## 👤 Author

Zuhair - [GitHub Profile](https://github.com/zuhair-mzk)

---

**Note**: This application is designed for educational purposes only. No investment advice is offered or should be inferred from any aspect of this project. Historical stock performance does not guarantee future results.
