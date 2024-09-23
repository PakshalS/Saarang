const express = require('express');

const app = express();
const port = 3000;

// Middleware
app.use(express.json());


// Default Route
app.get('/', (req, res) => {
  res.send('Hello, world!');
});

// Start the server
  app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
  });
