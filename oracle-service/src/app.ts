import express ,{json,urlencoded} from 'express';
import router from './routes';
import  errorHandler from "./errorMiddleware";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT;

app.use(json())
app.use(urlencoded({ extended: true }));

app.use("/oracle", router);
app.use(errorHandler);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});

// const addresses = [
//   "wasm1ga4d4tsxrk6na6ehttwvdfmn2ejy4gwfxpt2m7",
//   "wasm12gcpk8rsezs5lfjq2xmp0rd69e6k8gx02u7yv5",
//   "wasm18thxpksjlupr6szqctcjvj0mmhkr0suj5t3xnj",
//   "wasm1sse6pdmn5s7epjycxadjzku4qfgs604cgur6me",
//   "wasm19weunt25ekfqe5v7mj0k69dwzhdt8qfa0uawuz"
// ];


import { processAddresses, getAllActiveAddresses } from "./fetch_txs";

const UPDATE_INTERVAL = 2 * 60 * 1000; // every 2 min

async function updateRiskScores() {
  try {
    const addresses = await getAllActiveAddresses(); // all chain accounts
    console.log(`[${new Date().toISOString()}] Starting oracle risk score update...`);
    await processAddresses(addresses);
    console.log(`[${new Date().toISOString()}] Oracle risk score update completed.`);
  } catch (err) {
    console.error("Error during risk score update:", err);
  }
}

async function main() {
  await updateRiskScores(); // run once immediately
  setInterval(updateRiskScores, UPDATE_INTERVAL); // schedule
}

main().catch(console.error);
