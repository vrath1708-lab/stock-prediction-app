from flask import Flask, request, jsonify
from flask_cors import CORS
from analyzers.technical_analyzer import TechnicalAnalyzer
from analyzers.sentiment_analyzer import SentimentAnalyzer
from analyzers.ml_predictor import MLPredictor
from datetime import datetime
import logging

app = Flask(__name__)
CORS(app)

# Initialize analyzers
technical_analyzer = TechnicalAnalyzer()
sentiment_analyzer = SentimentAnalyzer()
ml_predictor = MLPredictor()

# Logging setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'ML Service is running',
        'timestamp': datetime.utcnow().isoformat()
    })

@app.route('/api/analyze/technical', methods=['POST'])
def analyze_technical():
    try:
        data = request.json
        symbol = data.get('symbol')
        prices = data.get('prices')
        volumes = data.get('volumes')
        
        analysis = technical_analyzer.analyze(symbol, prices, volumes)
        return jsonify(analysis)
    except Exception as e:
        logger.error(f"Technical analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/analyze/sentiment', methods=['POST'])
def analyze_sentiment():
    try:
        data = request.json
        text = data.get('text')
        source = data.get('source', 'unknown')
        
        sentiment = sentiment_analyzer.analyze(text)
        return jsonify({
            'sentiment': sentiment,
            'source': source,
            'timestamp': datetime.utcnow().isoformat()
        })
    except Exception as e:
        logger.error(f"Sentiment analysis error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/predict', methods=['POST'])
def predict_signal():
    try:
        data = request.json
        symbol = data.get('symbol')
        technical_score = data.get('technical_score')
        sentiment_score = data.get('sentiment_score')
        volume_score = data.get('volume_score')
        
        prediction = ml_predictor.predict(
            symbol, 
            technical_score, 
            sentiment_score, 
            volume_score
        )
        return jsonify(prediction)
    except Exception as e:
        logger.error(f"Prediction error: {str(e)}")
        return jsonify({'error': str(e)}), 400

@app.route('/api/model/status', methods=['GET'])
def model_status():
    return jsonify({
        'model_ready': True,
        'version': '1.0.0',
        'analyzers': {
            'technical': 'ready',
            'sentiment': 'ready',
            'predictor': 'ready'
        }
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001, debug=True)
