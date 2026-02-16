# Stock Prediction Application - Development Guide

## Project Architecture

```
stock-prediction-app/
├── frontend/                 # React Dashboard (Port 3000)
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API service layer
│   │   ├── store/          # Redux store
│   │   └── styles/         # CSS files
│   └── package.json
├── backend/                 # Node.js API Server (Port 5000)
│   ├── src/
│   │   ├── controllers/    # Request handlers
│   │   ├── routes/         # API routes
│   │   ├── services/       # Business logic
│   │   ├── middleware/     # Custom middleware
│   │   └── models/         # Database models
│   └── package.json
├── ml-service/              # Python ML Service (Port 5001)
│   ├── analyzers/          # ML analysis modules
│   │   ├── technical_analyzer.py
│   │   ├── sentiment_analyzer.py
│   │   └── ml_predictor.py
│   ├── utils/              # Utility functions
│   ├── app.py              # Flask application
│   └── requirements.txt
└── README.md
```

## Technology Stack

### Frontend
- **React 18**: UI framework
- **Redux**: State management
- **Tailwind CSS**: Styling
- **Chart.js**: Data visualization
- **Axios**: HTTP client

### Backend
- **Node.js + Express**: REST API
- **MongoDB**: NoSQL database
- **Redis**: Caching and real-time data
- **JWT**: Authentication

### ML Service
- **Flask**: Python web framework
- **Pandas**: Data analysis
- **TA-Lib**: Technical indicators
- **NLTK**: Natural language processing for sentiment
- **Scikit-learn**: Machine learning

## Getting Started

### Prerequisites
- Node.js 16+ & npm
- Python 3.8+
- MongoDB (or use Docker)
- Redis (or use Docker)

### Local Development Setup

#### 1. Clone and Navigate
```bash
cd stock-prediction-app
```

#### 2. Environment Setup

**Backend (.env)**
```bash
cd backend
cp .env.example .env
# Edit .env with your API keys
```

**ML Service (.env)**
```bash
cd ../ml-service
cp .env.example .env
# Edit .env with your API keys
```

#### 3. Install Dependencies

```bash
# From root directory
npm run install:all
```

#### 4. Start Services

**Option A: All services together (requires concurrently)**
```bash
npm start
```

**Option B: Individual terminals**
```bash
# Terminal 1 - Frontend
cd frontend && npm start

# Terminal 2 - Backend
cd backend && npm start

# Terminal 3 - ML Service
cd ml-service && python app.py
```

#### 5. Access Application
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000/health
- **ML Service**: http://localhost:5001/health

## API Documentation

### Stock Endpoints
```
GET  /api/stocks/top              # Get top stocks with predictions
GET  /api/stocks/:symbol          # Get specific stock
GET  /api/stocks/:symbol/historical # Get historical data
```

### Technical Analysis
```
GET  /api/analysis/technical/:symbol   # Full technical analysis
GET  /api/analysis/rsi/:symbol        # RSI analysis
GET  /api/analysis/macd/:symbol       # MACD analysis
GET  /api/analysis/volume/:symbol     # Volume analysis
GET  /api/analysis/bollinger/:symbol  # Bollinger Bands
```

### Sentiment Analysis
```
GET  /api/sentiment/:symbol          # Overall sentiment
GET  /api/sentiment/:symbol/news     # News sentiment
GET  /api/sentiment/:symbol/social   # Social media sentiment
```

### Predictions
```
GET  /api/predictions/:symbol        # Buy/Sell prediction
POST /api/predictions                # Custom prediction
GET  /api/predictions/portfolio/recommendations # Portfolio recommendations
```

## ML Service API

### Technical Analysis
```bash
POST /api/analyze/technical
Body: {
  "symbol": "AAPL",
  "prices": [100, 101, 102, ...],
  "volumes": [1000000, 1100000, ...]
}
```

### Sentiment Analysis
```bash
POST /api/analyze/sentiment
Body: {
  "text": "Apple stock shows strong momentum",
  "source": "news"
}
```

### Prediction
```bash
POST /api/predict
Body: {
  "symbol": "AAPL",
  "technical_score": 0.8,
  "sentiment_score": 0.6,
  "volume_score": 0.5
}
```

## Features

### 1. Technical Analysis
- **RSI (14)**: Momentum oscillator (0-100)
- **MACD**: Trend-following momentum indicator
- **Bollinger Bands**: Volatility and price levels
- **Volume Analysis**: Trading volume patterns
- **Moving Averages**: SMA 20/50/200, EMA 12/26
- **Stochastic**: Price momentum indicator
- **ATR**: Average True Range for volatility

### 2. Sentiment Analysis
- **News Sentiment**: Analyze financial news
- **Social Media Sentiment**: Twitter, Reddit monitoring
- **Composite Score**: Combined sentiment scoring
- **Real-time Updates**: Live sentiment tracking

### 3. ML Prediction
- **Buy/Sell Signals**: Actionable trading signals
- **Confidence Scores**: Prediction reliability (0-1)
- **Risk Assessment**: Identify potential risks
- **Portfolio Recommendations**: Optimized holdings

## Configuration

### Stock Symbols Supported
- Tech: AAPL, GOOGL, MSFT, AMZN, TSLA, META, NVDA
- Finance: JPM, BAC, GS, WFC
- Healthcare: JNJ, UNH, PFE, AZN
- Energy: XOM, CVX, COP
- Retail: WMT, AMZN, HD, TGT

### Analysis Parameters

#### RSI Settings
- Period: 14 days
- Overbought: > 70
- Oversold: < 30

#### MACD Settings
- Fast EMA: 12 days
- Slow EMA: 26 days
- Signal EMA: 9 days

#### Bollinger Bands
- Period: 20 days
- Standard Deviations: 2

## Deployment

### Using Docker Compose
```bash
# Start all services
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f [service-name]
```

### Production Deployment
1. Set environment variables in production
2. Use gunicorn for Python (included in requirements)
3. Use PM2 for Node.js process management
4. Configure nginx as reverse proxy
5. Enable HTTPS/SSL
6. Set up monitoring and logging

## Testing

### Frontend Tests
```bash
cd frontend
npm test
```

### Backend Tests
```bash
cd backend
npm test
```

### ML Service Tests
```bash
cd ml-service
pytest tests/
```

## Troubleshooting

### Port Already in Use
```bash
# Find process using port
lsof -i :3000  # Frontend
lsof -i :5000  # Backend
lsof -i :5001  # ML Service

# Kill process
kill -9 <PID>
```

### MongoDB Connection Issues
```bash
# Check MongoDB is running
mongosh

# Or use Docker
docker run -d -p 27017:27017 mongo
```

### Python Dependencies
```bash
# Upgrade pip
python -m pip install --upgrade pip

# Reinstall requirements
pip install -r requirements.txt --force-reinstall
```

## Performance Optimization

1. **Caching**: Redis caches frequently accessed data
2. **Pagination**: API results are paginated
3. **Lazy Loading**: Frontend components load on demand
4. **Database Indexing**: Optimize MongoDB queries
5. **ML Model Caching**: Pre-compute common predictions

## Security Considerations

1. **API Authentication**: Implement JWT tokens
2. **Input Validation**: Validate all user inputs
3. **Rate Limiting**: Prevent abuse with rate limits
4. **CORS**: Configure cross-origin policies
5. **Environment Variables**: Keep secrets out of code
6. **HTTPS**: Use SSL/TLS in production

## Contributing

1. Create feature branches: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open pull request

## Future Enhancements

- [ ] Real-time WebSocket updates
- [ ] Advanced ML models (LSTM, Transformer)
- [ ] Portfolio backtesting
- [ ] Options trading analysis
- [ ] Crypto support
- [ ] Mobile app version
- [ ] Advanced charting (TradingView)
- [ ] Custom indicators builder

## License

MIT License - See LICENSE file for details

## Support

For issues and questions:
1. Check existing documentation
2. Search GitHub issues
3. Create new issue with details
4. Contact development team

---

**Last Updated**: February 15, 2026
**Version**: 1.0.0
