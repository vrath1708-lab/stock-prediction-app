# Stock Prediction Application

A comprehensive full-stack application for predicting stock prices using:
- **Technical Analysis**: RSI, MACD, Volume, Moving Averages, Bollinger Bands, and more
- **Sentiment Analysis**: Social Media and News sentiment analysis
- **Machine Learning**: ML models for buy/sell recommendations

## Project Structure

```
├── frontend/              # React application (UI Dashboard)
├── backend/               # Node.js Express API server
├── ml-service/            # Python ML service for analysis
└── README.md
```

## Features

### Technical Analysis
- **RSI** (Relative Strength Index) - Momentum indicator
- **MACD** (Moving Average Convergence Divergence) - Trend indicator
- **Volume Analysis** - Trading volume patterns
- **Moving Averages** - SMA, EMA
- **Bollinger Bands** - Volatility indicator
- **Stochastic Oscillator** - Price momentum
- **ATR** (Average True Range) - Volatility measurement

### Sentiment Analysis
- Real-time news sentiment analysis
- Social media sentiment tracking
- Impact scoring on stock prices

### Predictions
- Buy/Sell signal generation
- Risk assessment
- Confidence scores
- Portfolio recommendations

## Getting Started

### Prerequisites
- Node.js 16+
- Python 3.8+
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install:all
```

### Running the Application

**Development mode (all services):**
```bash
npm start
```

**Individual services:**
```bash
# Frontend only (port 3000)
npm run start:frontend

# Backend API (port 5000)
npm run start:backend

# ML Service (port 5001)
npm run start:ml
```

## API Endpoints

### Technical Analysis
- `GET /api/analysis/technical/:symbol` - Get technical indicators
- `GET /api/analysis/rsi/:symbol` - Get RSI analysis
- `GET /api/analysis/macd/:symbol` - Get MACD analysis
- `GET /api/analysis/volume/:symbol` - Get volume analysis

### Sentiment Analysis
- `GET /api/sentiment/:symbol` - Get sentiment score
- `GET /api/news/:symbol` - Get latest news
- `GET /api/social/:symbol` - Get social media sentiment

### Predictions
- `GET /api/predictions/:symbol` - Get buy/sell recommendations
- `POST /api/predict` - Custom prediction with parameters
- `GET /api/portfolio/recommendations` - Get portfolio recommendations

## Configuration

Create `.env` files in `backend/` and `ml-service/` directories:

### Backend (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock_db
API_KEY=your_api_key
NEWS_API_KEY=your_news_api_key
TWITTER_API_KEY=your_twitter_api_key
```

### ML Service (.env)
```
PORT=5001
REDIS_URL=redis://localhost:6379
MODEL_PATH=./models
```

## Technology Stack

### Frontend
- React 18
- Redux for state management
- Tailwind CSS
- Chart.js for visualizations
- Axios for API calls

### Backend
- Node.js + Express
- MongoDB for data storage
- Redis for caching
- JWT for authentication

### ML Service
- Python 3.8+
- TensorFlow/Keras for ML models
- Pandas for data analysis
- TA-Lib for technical indicators
- VADER for sentiment analysis
- Tweepy for social media
- NewsAPI for news data

## License

MIT

## Support

For issues and suggestions, please open an issue in the repository.
