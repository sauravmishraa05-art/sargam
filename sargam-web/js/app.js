/**
 * Sargam Web - Application Entry Point
 * Initializes data, Audius API, UI components, and player defaults.
 */

document.addEventListener('DOMContentLoaded', async () => {
  console.log('🎶 Sargam Web initialized with Audius Engine');

  // Initialize UI event listeners & static views
  UI.init();

  // Load live trending tracks from Audius API
  await UI.loadTrendingContent();
});
