import pandas as pd
import numpy as np
from ta import trend, momentum, volatility
import logging

logger = logging.getLogger(__name__)

class TechnicalAnalyzer:
    """
    Analyzes technical indicators for stock prediction:
    - RSI (Relative Strength Index)
    - MACD (Moving Average Convergence Divergence)
    - Volume analysis
    - Bollinger Bands
    - Moving Averages
    """
    
    def __init__(self):
        self.logger = logger
    
    def analyze(self, symbol, prices, volumes):
        """
        Perform comprehensive technical analysis
        """
        try:
            df = pd.DataFrame({
                'close': prices,
                'volume': volumes
            })
            
            analysis = {
                'symbol': symbol,
                'rsi': self.calculate_rsi(df),
                'macd': self.calculate_macd(df),
                'bollinger_bands': self.calculate_bollinger_bands(df),
                'moving_averages': self.calculate_moving_averages(df),
                'volume_analysis': self.analyze_volume(df),
                'stochastic': self.calculate_stochastic(df),
                'composite_score': self.calculate_composite_score(df)
            }
            
            return analysis
        except Exception as e:
            self.logger.error(f"Technical analysis error: {str(e)}")
            raise
    
    def calculate_rsi(self, df, period=14):
        """Calculate Relative Strength Index"""
        try:
            rsi = momentum.RSIIndicator(close=df['close'], window=period).rsi()
            return float(rsi.iloc[-1]) if not rsi.empty else 50.0
        except:
            return 50.0
    
    def calculate_macd(self, df):
        """Calculate MACD"""
        try:
            macd = trend.MACD(close=df['close'])
            return {
                'macd': float(macd.macd().iloc[-1]),
                'signal': float(macd.macd_signal().iloc[-1]),
                'histogram': float(macd.macd_diff().iloc[-1])
            }
        except:
            return {'macd': 0, 'signal': 0, 'histogram': 0}
    
    def calculate_bollinger_bands(self, df, period=20):
        """Calculate Bollinger Bands"""
        try:
            bb = volatility.BollingerBands(close=df['close'], window=period)
            return {
                'upper': float(bb.bollinger_hband().iloc[-1]),
                'middle': float(bb.bollinger_mavg().iloc[-1]),
                'lower': float(bb.bollinger_lband().iloc[-1]),
                'current_position': float(df['close'].iloc[-1])
            }
        except:
            return None
    
    def calculate_moving_averages(self, df):
        """Calculate Simple and Exponential Moving Averages"""
        try:
            return {
                'sma_20': float(df['close'].rolling(window=20).mean().iloc[-1]),
                'sma_50': float(df['close'].rolling(window=50).mean().iloc[-1]),
                'sma_200': float(df['close'].rolling(window=200).mean().iloc[-1]),
                'ema_12': float(df['close'].ewm(span=12).mean().iloc[-1]),
                'ema_26': float(df['close'].ewm(span=26).mean().iloc[-1])
            }
        except:
            return None
    
    def analyze_volume(self, df):
        """Analyze trading volume patterns"""
        try:
            avg_volume = df['volume'].rolling(window=20).mean().iloc[-1]
            current_volume = df['volume'].iloc[-1]
            volume_change = ((current_volume - avg_volume) / avg_volume) * 100
            
            return {
                'current': int(current_volume),
                'average_20d': int(avg_volume),
                'change_percent': float(volume_change),
                'signal': 'High' if volume_change > 15 else 'Normal' if volume_change > -15 else 'Low'
            }
        except:
            return None
    
    def calculate_stochastic(self, df, period=14):
        """Calculate Stochastic Oscillator"""
        try:
            low_min = df['close'].rolling(window=period).min()
            high_max = df['close'].rolling(window=period).max()
            stochastic = 100 * ((df['close'] - low_min) / (high_max - low_min))
            return float(stochastic.iloc[-1]) if not stochastic.empty else 50.0
        except:
            return 50.0
    
    def calculate_composite_score(self, df):
        """Calculate overall technical score (-1 to 1)"""
        try:
            rsi = self.calculate_rsi(df)
            score = 0
            
            # RSI component
            if rsi > 70:
                score -= 0.2
            elif rsi < 30:
                score += 0.2
            else:
                score += (rsi - 50) / 250
            
            # MACD component
            macd = self.calculate_macd(df)
            if macd['histogram'] > 0:
                score += 0.2
            else:
                score -= 0.2
            
            # Bollinger Bands component
            bb = self.calculate_bollinger_bands(df)
            if bb and bb['current_position'] > bb['middle']:
                score += 0.1
            
            return max(-1, min(1, score))
        except:
            return 0
