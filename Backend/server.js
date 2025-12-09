import express from 'express';
import { config } from './config/env.js';

const app = express();

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'TruckTrack connect done'
  });
});

app.listen(config.port, () => {
  console.log(`Server running on port ${config.port}`);
});

export default app;
