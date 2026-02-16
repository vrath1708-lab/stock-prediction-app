# Architecture Overview

## System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                           │
│                   (http://localhost:3000)                    │
└──────────────────────────┬──────────────────────────────────┘
                           │
                    React Frontend
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
        ▼                  ▼                  ▼
   ┌─────────┐        ┌─────────┐      ┌──────────┐
   │Dashboard│        │Analysis │      │Portfolio │
   └─────────┘        └─────────┘      └──────────┘
        │                  │                  │
        └──────────────────┼──────────────────┘
                           │
                   API Calls (Axios)
                           │
                           ▼
        ┌──────────────────────────────────────┐
        │   Backend API Server                 │
        │   (Express.js:5000)                  │
        │                                      │
        │  ┌────────────────────────────────┐  │
        │  │ /api/stocks                    │  │
        │  │ /api/analysis                  │  │
        │  │ /api/sentiment                 │  │
        │  │ /api/predictions               │  │
        │  └────────────────────────────────┘  │
        └──────────────┬───────────────────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   ┌────────┐    ┌────────┐    ┌──────────┐
   │MongoDB │    │ Redis  │    │ ML Service│
   │Database│    │ Cache  │    │(Python)  │
   └────────┘    └────────┘    └────┬─────┘
                                     │
                        ┌────────────┼────────────┐
                        │            │            │
                        ▼            ▼            ▼
                    Technical    Sentiment      ML
                    Analysis     Analysis     Predictions
```

## Data Flow

### 1. Stock Analysis Flow
```
User Request → Frontend → Backend API → ML Service
                                    ↓
                          Technical Analysis
                          (RSI, MACD, Bollinger)
                                    ↓
                            Return Analysis → Frontend Display
```

### 2. Prediction Flow
```
Technical Indicators ──→ ┐
Sentiment Scores ────→ ML Predictor → Buy/Sell Signal
Volume Data ─────────→ ┘         Confidence Score
```

### 3. Sentiment Flow
```
News Articles ──→ ┐
                 Sentiment Analyzer → Composite Score
Social Media ──→ ┘                  (Positive/Negative/Neutral)
```

## Component Interactions

### Frontend Components
```
App (Root)
├── Navbar (Navigation)
├── Dashboard Page
│   ├── SearchBar
│   └── StockGrid
│       └── StockCard (x N)
├── StockAnalysis Page
│   ├── TechnicalIndicators
│   ├── TechnicalChart
│   └── SentimentAnalysis
├── Predictions Page
└── Portfolio Page
```

### Backend Services
```
Express Server
├── Routes
│   ├── /stocks
│   ├── /analysis
│   ├── /sentiment
│   └── /predictions
├── Controllers (Handle requests)
├── Services (Business logic)
├── Middleware (Error handling, CORS)
└── Database Models
```

### ML Service Modules
```
Flask Server
├── Analyzers
│   ├── TechnicalAnalyzer
│   ├── SentimentAnalyzer
│   └── MLPredictor
└── Utils
    └── DataFetcher
```

## API Communication

### Request/Response Flow

#### 1. Get Stock Analysis
```
Request:  GET /api/analysis/technical/AAPL
Response: {
  "symbol": "AAPL",
  "rsi": 58.5,
  "macd": {...},
  "bollinger_bands": {...},
  "volume_analysis": {...}
}
```

#### 2. Get Prediction
```
Request:  GET /api/predictions/MSFT
Response: {
  "symbol": "MSFT",
  "signal": "BUY",
  "confidence": 0.82,
  "composite_score": 0.45,
  "reasoning": [...]
}
```

#### 3. Analyze Sentiment
```
Request:  POST /api/sentiment/
Body: {
  "text": "Apple reports strong earnings",
  "source": "news"
}
Response: {
  "positive": 0.85,
  "negative": 0.05,
  "neutral": 0.10,
  "compound": 0.81
}
```

## Database Schema

### Stock Collection
```javascript
{
  symbol: String,
  name: String,
  price: Number,
  change: Number,
  technicalScore: Number,
  sentimentScore: Number,
  prediction: String,
  confidence: Number,
  lastUpdated: Date
}
```

### Analysis Collection
```javascript
{
  symbol: String,
  type: String, // 'technical' | 'sentiment'
  indicators: Object,
  scores: Object,
  timestamp: Date
}
```

## Performance Considerations

### Caching Strategy
- **Redis**: Cache analysis results (30 min TTL)
- **Frontend**: Redux state for UI data
- **Browser**: LocalStorage for user preferences

### Data Processing
1. **Technical Analysis**: Computed on demand or cached
2. **Sentiment Analysis**: Batch processed every hour
3. **ML Predictions**: Generated when requested
4. **Historical Data**: Fetched from external APIs asynchronously

## Security Layers

```
┌─────────────────┐
│   Client        │ CORS Policy
├─────────────────┤
│   Frontend      │ Input Validation, XSS Protection
├─────────────────┤
│   API Gateway   │ Rate Limiting, HTTPS
├─────────────────┤
│   Backend       │ JWT Authentication, Input Validation
├─────────────────┤
│   Database      │ MongoDB Security, Encryption
└─────────────────┘
```

## Deployment Architecture

### Development
```
localhost:3000 (Frontend)
localhost:5000 (Backend)
localhost:5001 (ML Service)
```

### Production (Docker)
```
Docker Container 1: Frontend (nginx)
Docker Container 2: Backend (Node)
Docker Container 3: ML Service (Python)
Docker Container 4: MongoDB
Docker Container 5: Redis
```

## Scalability

### Horizontal Scaling
- Multiple backend instances behind load balancer
- Separate ML service instances for heavy computation
- Distributed Redis cluster for caching

### Vertical Scaling
- MongoDB replica sets for high availability
- Redis clustering for in-memory scaling
- PM2 for process management (Node.js)

---

See [DEVELOPMENT.md](DEVELOPMENT.md) for detailed setup instructions.
