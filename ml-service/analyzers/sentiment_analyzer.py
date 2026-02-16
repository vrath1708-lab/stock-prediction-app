from nltk.sentiment import SentimentIntensityAnalyzer
import nltk
import logging

# Download required VADER resources
try:
    nltk.data.find('sentiment/vader_lexicon')
except LookupError:
    nltk.download('vader_lexicon')

logger = logging.getLogger(__name__)

class SentimentAnalyzer:
    """
    Analyzes sentiment from news and social media using VADER
    """
    
    def __init__(self):
        self.sia = SentimentIntensityAnalyzer()
        self.logger = logger
    
    def analyze(self, text):
        """
        Analyze sentiment of given text
        Returns: {
            'positive': float (0-1),
            'negative': float (0-1),
            'neutral': float (0-1),
            'compound': float (-1 to 1),
            'label': 'positive' | 'neutral' | 'negative'
        }
        """
        try:
            if not text or len(text.strip()) == 0:
                return {
                    'positive': 0,
                    'negative': 0,
                    'neutral': 1,
                    'compound': 0,
                    'label': 'neutral'
                }
            
            scores = self.sia.polarity_scores(text)
            
            # Determine sentiment label
            if scores['compound'] >= 0.05:
                label = 'positive'
            elif scores['compound'] <= -0.05:
                label = 'negative'
            else:
                label = 'neutral'
            
            return {
                'positive': round(scores['pos'], 3),
                'negative': round(scores['neg'], 3),
                'neutral': round(scores['neu'], 3),
                'compound': round(scores['compound'], 3),
                'label': label
            }
        except Exception as e:
            self.logger.error(f"Sentiment analysis error: {str(e)}")
            return {
                'positive': 0,
                'negative': 0,
                'neutral': 1,
                'compound': 0,
                'label': 'neutral'
            }
    
    def analyze_batch(self, texts):
        """
        Analyze sentiment of multiple texts
        """
        try:
            results = []
            for text in texts:
                results.append(self.analyze(text))
            
            # Calculate aggregate sentiments
            positive_avg = sum(r['positive'] for r in results) / len(results)
            negative_avg = sum(r['negative'] for r in results) / len(results)
            neutral_avg = sum(r['neutral'] for r in results) / len(results)
            compound_avg = sum(r['compound'] for r in results) / len(results)
            
            return {
                'individual_results': results,
                'aggregate': {
                    'positive': round(positive_avg, 3),
                    'negative': round(negative_avg, 3),
                    'neutral': round(neutral_avg, 3),
                    'compound': round(compound_avg, 3),
                    'positive_percentage': round(positive_avg * 100, 1),
                    'negative_percentage': round(negative_avg * 100, 1),
                    'neutral_percentage': round(neutral_avg * 100, 1)
                }
            }
        except Exception as e:
            self.logger.error(f"Batch sentiment analysis error: {str(e)}")
            raise
