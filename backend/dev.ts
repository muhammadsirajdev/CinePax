import dotenv from 'dotenv';
import app from './app';

dotenv.config();                         // load .env for local dev

const PORT = process.env.PORT || 3000;   // pick any port you like

app.listen(PORT, () => {
  console.log(`🚀  Server running at http://localhost:${PORT}`);
});
