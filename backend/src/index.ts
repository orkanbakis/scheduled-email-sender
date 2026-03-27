import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';

const app = express();
const port = process.env.PORT ?? 3001;

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ?? false }));
app.use(express.json());

app.listen(port, () => {
  console.log(`Backend running on port ${port}`);
});
