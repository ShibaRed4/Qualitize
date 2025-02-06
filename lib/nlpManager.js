const { NlpManager } = require('node-nlp');

// Create and configure the NLP Manager
const manager = new NlpManager({ languages: ['en'], forceNER: true });

(async () => {
  console.log("Training NLP Model...");
  
  // Add training data for the "readPage" intent
  manager.addDocument('en', 'Hey, can you read this page for me?', 'action.readPage');
  manager.addDocument('en', 'Can you read this text?', 'action.readPage');
  manager.addDocument('en', 'Read this page.', 'action.readPage');
  manager.addDocument('en', 'Can you help me read this?', 'action.readPage');
  manager.addDocument('en', 'Please read this.', 'action.readPage');
  manager.addAnswer('en', 'action.readPage', 'Sure! Please provide the page or text you want me to read.');

  // Train and save the model
  await manager.train();
  manager.save();
})();


// Export the manager to be used elsewhere
module.exports = manager;
