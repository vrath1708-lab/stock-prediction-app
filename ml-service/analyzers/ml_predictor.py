import numpy as np
import logging
from sklearn.preprocessing import StandardScaler

logger = logging.getLogger(__name__)

class MLPredictor:
    """
    Machine Learning model for stock prediction
    Combines technical, sentiment, and volume signals
    """
    
    def __init__(self):
        self.scaler = StandardScaler()
        self.logger = logger
        self.weights = {
            'technical': 0.40,
            'sentiment': 0.30,
            'volume': 0.20,
            'momentum': 0.10
        }
    
    def predict(self, symbol, technical_score, sentiment_score, volume_score, momentum_score=0):
        """
        Predict buy/sell signal based on multiple factors
        
        Args:
            symbol: Stock symbol
            technical_score: Technical analysis score (-1 to 1)
            sentiment_score: Sentiment analysis score (-1 to 1)
            volume_score: Volume analysis score (-1 to 1)
            momentum_score: Momentum score (-1 to 1)
        
        Returns:
            {
                'symbol': str,
                'signal': 'BUY' | 'SELL' | 'HOLD',
                'confidence': float (0-1),
                'composite_score': float (-1 to 1),
                'reasoning': list
            }
        """
        try:
            # Normalize scores
            scores = self._normalize_scores([
                technical_score,
                sentiment_score,
                volume_score,
                momentum_score
            ])
            
            technical_norm, sentiment_norm, volume_norm, momentum_norm = scores
            
            # Calculate weighted composite score
            composite_score = (
                self.weights['technical'] * technical_norm +
                self.weights['sentiment'] * sentiment_norm +
                self.weights['volume'] * volume_norm +
                self.weights['momentum'] * momentum_norm
            )
            
            # Generate signal
            if composite_score > 0.3:
                signal = 'BUY'
            elif composite_score < -0.3:
                signal = 'SELL'
            else:
                signal = 'HOLD'
            
            # Calculate confidence
            confidence = min(abs(composite_score), 0.99)
            
            # Generate reasoning
            reasoning = self._generate_reasoning(
                signal,
                technical_norm,
                sentiment_norm,
                volume_norm,
                momentum_norm
            )
            
            return {
                'symbol': symbol,
                'signal': signal,
                'confidence': float(confidence),
                'composite_score': float(composite_score),
                'scores': {
                    'technical': float(technical_norm),
                    'sentiment': float(sentiment_norm),
                    'volume': float(volume_norm),
                    'momentum': float(momentum_norm)
                },
                'reasoning': reasoning
            }
        except Exception as e:
            self.logger.error(f"Prediction error: {str(e)}")
            raise
    
    def _normalize_scores(self, scores):
        """Normalize scores to -1 to 1 range"""
        try:
            normalized = []
            for score in scores:
                # Clip to -1 to 1 range
                clipped = max(-1, min(1, score))
                normalized.append(clipped)
            return normalized
        except:
            return scores
    
    def _generate_reasoning(self, signal, technical, sentiment, volume, momentum):
        """Generate reasoning for the prediction"""
        reasons = []
        
        # Technical reasons
        if technical > 0.3:
            reasons.append('Strong technical uptrend signals')
        elif technical < -0.3:
            reasons.append('Significant technical downtrend signals')
        else:
            reasons.append('Mixed technical indicators')
        
        # Sentiment reasons
        if sentiment > 0.3:
            reasons.append('Positive sentiment from news and social media')
        elif sentiment < -0.3:
            reasons.append('Negative sentiment from news and social media')
        else:
            reasons.append('Neutral market sentiment')
        
        # Volume reasons
        if volume > 0.3:
            reasons.append('Above-average trading volume supporting movement')
        elif volume < -0.3:
            reasons.append('Low trading volume indicates weak interest')
        else:
            reasons.append('Normal trading volume')
        
        # Momentum reasons
        if momentum > 0.3:
            reasons.append('Strong positive momentum')
        elif momentum < -0.3:
            reasons.append('Declining momentum')
        
        # Risk warnings
        if signal == 'BUY' and technical < 0:
            reasons.append('⚠️ Caution: Buying against technical trend')
        elif signal == 'SELL' and technical > 0:
            reasons.append('⚠️ Caution: Selling against technical trend')
        
        return reasons
