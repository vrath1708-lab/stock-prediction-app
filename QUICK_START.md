# Getting Started with Stock Prediction App

## ⚡ Quick Start (5 minutes)

### 1. Verify Workspace
```bash
cd f:\Stock2026\stock-prediction-app
```

### 2. Install Dependencies
```bash
# All dependencies at once
npm run install:all
```

### 3. Start Development Environment

**Option 1: All services in one command**
```bash
npm start
```

**Option 2: Separate terminals**
```bash
# Terminal 1: Frontend (http://localhost:3000)
cd frontend && npm start

# Terminal 2: Backend (http://localhost:5000)
cd backend && npm start

# Terminal 3: ML Service (http://localhost:5001)
cd ml-service && python app.py
```

## 📋 System Requirements

| Component | Requirement | Check Command |
|-----------|-------------|---------------|
| Node.js | v16+ | `node --version` |
| npm | v7+ | `npm --version` |
| Python | v3.8+ | `python --version` |
| MongoDB | v4.4+ (optional) | `mongosh` |
| Redis | v6+ (optional) | `redis-cli ping` |

## 🏗️ Project Structure

```
stock-prediction-app/
├── frontend/          React UI (Port 3000)
├── backend/           Node.js API (Port 5000)
├── ml-service/        Python ML (Port 5001)
├── docker-compose.yml Docker deployment
├── README.md          Overview
└── DEVELOPMENT.md     Detailed guide
```

## 🚀 What's Included

### ✅ Frontend Features
- Stock dashboard with real-time updates
- Technical analysis visualization
- Sentiment analysis charts
- Buy/Sell recommendations
- Portfolio management interface

### ✅ Backend Features
- RESTful API for all data
- Technical indicator calculations
- Sentiment analysis integration
- ML-based predictions
- Caching with Redis

### ✅ ML Service Features
- RSI, MACD, Bollinger Bands analysis
- VADER sentiment analysis
- Machine learning predictions
- Volume pattern recognition
- Composite scoring system

## 📊 Key Indicators Analyzed

| Indicator | Purpose | Signal |
|-----------|---------|--------|
| **RSI** | Momentum | > 70: Overbought, < 30: Oversold |
| **MACD** | Trend | Crossover points |
| **Volume** | Interest | Above/Below average |
| **Bollinger** | Volatility | Band breakouts |
| **Sentiment** | Market | Positive/Negative/Neutral |

## 🔌 API Endpoints Quick Reference

### Stocks
- `GET /api/stocks/top` - Top stocks with predictions
- `GET /api/stocks/:symbol` - Single stock details

### Analysis
- `GET /api/analysis/technical/:symbol` - Full technical analysis
- `GET /api/analysis/rsi/:symbol` - RSI values
- `GET /api/analysis/macd/:symbol` - MACD signals

### Predictions
- `GET /api/predictions/:symbol` - Buy/Sell signal
- `POST /api/predictions` - Custom prediction
- `GET /api/predictions/portfolio/recommendations` - Portfolio advice

### Sentiment
- `GET /api/sentiment/:symbol` - Overall sentiment
- `GET /api/sentiment/:symbol/news` - News sentiment
- `GET /api/sentiment/:symbol/social` - Social media sentiment

## 🐳 Using Docker (Recommended)

### Start All Services
```bash
docker-compose up -d
```

### Check Service Status
```bash
docker-compose ps
```

### View Logs
```bash
docker-compose logs -f backend    # Backend logs
docker-compose logs -f ml-service # ML logs
docker-compose logs -f frontend   # Frontend logs
```

### Stop Services
```bash
docker-compose down
```

## 🎯 Next Steps

1. **Explore Frontend**: Open http://localhost:3000
2. **Test APIs**: Visit http://localhost:5000/health
3. **Check ML Service**: Visit http://localhost:5001/health
4. **Read Documentation**: See [DEVELOPMENT.md](DEVELOPMENT.md)

## ⚙️ Configuration

### Default Settings
- **Frontend Port**: 3000
- **Backend Port**: 5000
- **ML Service Port**: 5001
- **Database**: MongoDB on 27017
- **Cache**: Redis on 6379

### Change Configuration
Create `.env` files:

```bash
# backend/.env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/stock_db
ML_SERVICE_URL=http://localhost:5001

# ml-service/.env
PORT=5001
FLASK_ENV=development
```

## 📈 Sample Usage

### Get Stock Analysis
```bash
# Using curl
curl http://localhost:5000/api/analysis/technical/AAPL

# Using frontend - Click "View Analysis" on dashboard
```

### Get Prediction
```bash
curl http://localhost:5000/api/predictions/MSFT
```

### Custom Prediction
```bash
curl -X POST http://localhost:5000/api/predictions \
  -H "Content-Type: application/json" \
  -d '{
    "symbol": "GOOGL",
    "rsi": 65,
    "macd": 0.5,
    "volume": 100000000,
    "sentiment": 0.7
  }'
```

## 🛠️ Common Commands

```bash
# Install all dependencies
npm run install:all

# Start all services
npm start

# Build for production
npm run build:frontend
npm run build:backend

# Run ML service only
npm run start:ml

# View project status
docker-compose ps
```

## 💡 Tips

- **Save Port Numbers**: Bookmark localhost:3000/5000/5001
- **Hot Reload**: Frontend and backend auto-reload on file changes
- **Mock Data**: App includes mock data for testing without APIs
- **Error Logs**: Check terminal for detailed error messages
- **Database**: Optional - app works with or without MongoDB

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Find and kill process
lsof -i :3000
kill -9 <PID>
```

### Module Not Found
```bash
# Reinstall node modules
rm -rf node_modules package-lock.json
npm install
```

### Python Errors
```bash
# Upgrade pip and reinstall
python -m pip install --upgrade pip
pip install -r ml-service/requirements.txt
```

### MongoDB Connection
```bash
# Use Docker instead
docker run -d -p 27017:27017 mongo:latest
```

## 📚 Learn More

- [Full Development Guide](DEVELOPMENT.md)
- [Frontend Documentation](frontend/README.md)
- [Backend Documentation](backend/README.md)
- [ML Service Guide](ml-service/README.md)

## 🎓 Key Concepts

### Technical Analysis
Uses historical price and volume to identify trends and trading signals.

### Sentiment Analysis
Analyzes financial news and social media to gauge market sentiment about specific stocks.

### Machine Learning
Combines technical indicators and sentiment scores to predict buy/sell opportunities.

### Confidence Score
Higher confidence (closer to 1.0) means stronger signal reliability.

## ✨ Features in Development

- Real-time WebSocket updates
- Advanced ML models (LSTM networks)
- Portfolio backtesting
- Cryptocurrency support
- Mobile app version

## 📝 License

MIT License - Free for educational and commercial use

---

**Ready to predict stocks?** 🚀
Start with: `npm start`
