exports.getSentimentAnalysis = async (symbol) => {
  try {
    return {
      symbol,
      overallScore: 0.68,
      newsSentiment: {
        positive: 65,
        neutral: 25,
        negative: 10
      },
      socialSentiment: {
        positive: 72,
        neutral: 20,
        negative: 8
      },
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    throw error;
  }
};

exports.getNewsSentiment = async (symbol, limit = 10) => {
  try {
    const mockNews = [
      {
        id: 1,
        title: `${symbol} Reports Strong Earnings`,
        sentiment: 'positive',
        score: 0.85,
        source: 'Reuters',
        date: new Date().toISOString()
      },
      {
        id: 2,
        title: `${symbol} Faces Market Challenges`,
        sentiment: 'negative',
        score: -0.45,
        source: 'Bloomberg',
        date: new Date(Date.now() - 3600000).toISOString()
      }
    ];
    
    return mockNews.slice(0, limit);
  } catch (error) {
    throw error;
  }
};

exports.getSocialMediaSentiment = async (symbol) => {
  try {
    return {
      symbol,
      overallScore: 0.72,
      twitter: {
        positive: 75,
        neutral: 18,
        negative: 7,
        mentionCount: 24500
      },
      reddit: {
        positive: 68,
        neutral: 22,
        negative: 10,
        discussionCount: 1250
      },
      trendingUp: true,
      momentum: 'Strong Positive'
    };
  } catch (error) {
    throw error;
  }
};
