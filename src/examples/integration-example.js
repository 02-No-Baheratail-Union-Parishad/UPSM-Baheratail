/**
 * Integration Example
 * Demonstrates how to use the modular integration system
 */

const logger = require('../core/logger');
const integrationManager = require('../integrations/adapter-manager');
const jokeAdapter = require('../integrations/external-api/joke-generator');

/**
 * Example 1: Generate a joke using external API
 */
async function exampleGenerateJoke() {
  console.log('\n=== Example 1: Generate Random Joke ===');
  try {
    const joke = await jokeAdapter.generateJoke();
    console.log('Setup:', joke.setup);
    console.log('Punchline:', joke.punchline);
    console.log('Source:', joke.source);
  } catch (error) {
    logger.error('Failed to generate joke', { error: error.message });
  }
}

/**
 * Example 2: Check integration status
 */
async function exampleCheckIntegrationStatus() {
  console.log('\n=== Example 2: Check Integration Status ===');
  try {
    const status = await integrationManager.getIntegrationStatus();
    console.log('Integration Status:', JSON.stringify(status, null, 2));
  } catch (error) {
    logger.error('Failed to get integration status', { error: error.message });
  }
}

/**
 * Example 3: Route AI task
 */
async function exampleRouteAITask() {
  console.log('\n=== Example 3: Route AI Task ===');
  try {
    const result = await integrationManager.routeAITask('generate_joke', {});
    console.log('Task Result:', JSON.stringify(result, null, 2));
  } catch (error) {
    logger.error('Failed to route AI task', { error: error.message });
  }
}

/**
 * Example 4: Multiple jokes
 */
async function exampleMultipleJokes() {
  console.log('\n=== Example 4: Generate Multiple Jokes ===');
  try {
    const jokes = await jokeAdapter.generateMultipleJokes(3);
    console.log(`Generated ${jokes.totalGenerated} jokes:`);
    jokes.jokes.forEach((joke, index) => {
      console.log(`\nJoke ${index + 1}:`);
      console.log('  Setup:', joke.setup);
      console.log('  Punchline:', joke.punchline);
    });
  } catch (error) {
    logger.error('Failed to generate multiple jokes', { error: error.message });
  }
}

/**
 * Run all examples
 */
async function runExamples() {
  logger.info('Starting integration examples...');
  await exampleGenerateJoke();
  await exampleCheckIntegrationStatus();
  await exampleRouteAITask();
  await exampleMultipleJokes();
  logger.info('Examples completed');
}

if (require.main === module) {
  runExamples().catch(logger.error);
}

module.exports = {
  exampleGenerateJoke,
  exampleCheckIntegrationStatus,
  exampleRouteAITask,
  exampleMultipleJokes,
};