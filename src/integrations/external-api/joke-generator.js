/**
 * Joke Generator Adapter
 * Example external API integration using Official Joke API
 * Demonstrates modular adapter pattern
 */

const logger = require('../../core/logger');

class JokeGeneratorAdapter {
  constructor() {
    this.name = 'JokeAPI';
    this.apiUrl = 'https://official-joke-api.appspot.com/random_joke';
    this.fallbackJokes = [
      {
        type: 'general',
        setup: 'Why did the scarecrow win an award?',
        punchline: 'Because he was outstanding in his field!',
      },
      {
        type: 'general',
        setup: 'What did the ocean say to the beach?',
        punchline: 'Nothing, it just waved!',
      },
      {
        type: 'general',
        setup: 'Why don\'t scientists trust atoms?',
        punchline: 'Because they make up everything!',
      },
    ];
  }

  /**
   * Test external API connection
   */
  async testConnection() {
    try {
      logger.debug('Testing Joke API connection...');
      const response = await fetch(this.apiUrl);
      
      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const data = await response.json();
      logger.success('Joke API connection successful', { apiUrl: this.apiUrl });
      
      return {
        connected: true,
        provider: 'Official Joke API',
        endpoint: this.apiUrl,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.warn('Joke API connection failed, using fallback', { error: error.message });
      return {
        connected: false,
        provider: 'Official Joke API',
        error: error.message,
        fallback: 'Local jokes available',
      };
    }
  }

  /**
   * Generate a random joke
   */
  async generateJoke() {
    try {
      logger.info('Fetching joke from API');
      
      const response = await fetch(this.apiUrl);

      if (!response.ok) {
        throw new Error(`API returned status ${response.status}`);
      }

      const joke = await response.json();
      logger.success('Joke generated from API', { type: joke.type });

      return {
        status: 'success',
        source: 'Official Joke API',
        setup: joke.setup,
        punchline: joke.punchline,
        type: joke.type,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      logger.warn('Failed to fetch from API, using fallback joke', { error: error.message });
      
      // Use fallback joke
      const fallbackJoke = this.fallbackJokes[Math.floor(Math.random() * this.fallbackJokes.length)];
      
      return {
        status: 'success',
        source: 'Fallback (Local)',
        setup: fallbackJoke.setup,
        punchline: fallbackJoke.punchline,
        type: fallbackJoke.type,
        timestamp: new Date().toISOString(),
        note: 'Returned from fallback due to API unavailability',
      };
    }
  }

  /**
   * Generate multiple jokes
   */
  async generateMultipleJokes(count = 5) {
    logger.info('Generating multiple jokes', { count });
    const jokes = [];

    for (let i = 0; i < count; i++) {
      try {
        const joke = await this.generateJoke();
        jokes.push(joke);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 500));
      } catch (error) {
        logger.warn(`Failed to generate joke ${i + 1}`, { error: error.message });
      }
    }

    return {
      status: 'success',
      totalRequested: count,
      totalGenerated: jokes.length,
      jokes,
      timestamp: new Date().toISOString(),
    };
  }
}

module.exports = new JokeGeneratorAdapter();