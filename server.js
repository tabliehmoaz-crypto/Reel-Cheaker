import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static(__dirname));

app.get('/health', (_req, res) => {
  res.json({
    ok: true,
    product: 'MTI',
    version: '4.0.0',
    analysis: 'local-first',
    externalAI: false
  });
});

app.listen(PORT, () => {
  console.log(`MTI V4 running on port ${PORT}`);
});
