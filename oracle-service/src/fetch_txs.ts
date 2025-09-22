import axios from "axios";
import * as dotenv from "dotenv";
import { StargateClient, IndexedTx } from "@cosmjs/stargate";
import { toUtf8, fromHex } from "@cosmjs/encoding";
import { Secp256k1, sha256 } from "@cosmjs/crypto";
import { getClient } from "./setup";
import { extractAddressesFromTx } from "./extractAddressesFromTx";

dotenv.config();

const restEndpoint = process.env.REST_URL!; // http://localhost:1317
const rpcEndpoint = process.env.RPC_URL!;   // ws://localhost:26657
const oraclePrivKey = process.env.ORACLE_PRIVKEY!;

// ---------------- Risk Score ----------------
function calculateRiskScore(txs: any[]): number {
  return Math.min(txs.length, 10); // dummy logic
}

// ---------------- Transactions ----------------
async function fetchTxs(address: string, field: "sender" | "recipient") {
  const url = `${restEndpoint}/cosmos/tx/v1beta1/txs?query=transfer.${field}='${address}'`;
  try {
    const resp = await axios.get(url);
    return resp.data.tx_responses || [];
  } catch (err) {
    console.error(`Error fetching ${field} txs for ${address}:`, err);
    return [];
  }
}

export async function getTransactionsByAddress(address: string) {
  const senderTxs = await fetchTxs(address, "sender");
  const recipientTxs = await fetchTxs(address, "recipient");

  // Deduplicate by txhash
  const map = new Map();
  [...senderTxs, ...recipientTxs].forEach((tx: any) => map.set(tx.txhash, tx));

  const allTxs = Array.from(map.values());
  console.log(`Txs for ${address}: ${allTxs.length}`);
  return allTxs;
}

// ---------------- Oracle ----------------
async function waitForTx(txHash: string) {
  const client = await StargateClient.connect(rpcEndpoint);
  let tx: IndexedTx | null = null;
  while (!tx) {
    tx = await client.getTx(txHash);
    if (!tx) await new Promise(res => setTimeout(res, 1000));
  }
  return tx;
}

export async function updateRiskScore(address: string, score: number, oracleClient: any) {
  const data = JSON.stringify({ address, risk_score: score });
  const msgBytes = toUtf8(data);
  const msgHash = sha256(msgBytes);

  const signatureRaw = await Secp256k1.createSignature(msgHash, fromHex(oraclePrivKey));
  const rs = signatureRaw.toFixedLength().slice(0, 64);
  const signatureBase64 = Buffer.from(rs).toString("base64");

  const result = await oracleClient.oracleDataUpdate({ data, signature: signatureBase64 });
  console.log(`Sent oracle update tx for ${address}: ${result.transactionHash}`);

  await waitForTx(result.transactionHash);

  const updated = await oracleClient.getRiskScore({ address });
  console.log(`Validated risk score for ${address}:`, updated);
}

// ---------------- Processing ----------------
export async function processAddresses(addresses: string[]) {
  const oracleClient = await getClient();

  for (const addr of addresses) {
    if (!addr) {
      console.warn("Skipping undefined address");
      continue;
    }
    const txs = await getTransactionsByAddress(addr);

    // Print in sender → recipient : amount
    txs.forEach((tx: any) => {
      tx.logs?.forEach((log: any) => {
        log.events?.forEach((event: any) => {
          if (event.type === "transfer") {
            const sender = event.attributes.find((a: any) => a.key === "sender")?.value;
            const recipient = event.attributes.find((a: any) => a.key === "recipient")?.value;
            const amount = event.attributes.find((a: any) => a.key === "amount")?.value;
            if (sender && recipient && amount) {
              console.log(`${sender} → ${recipient} : ${amount}`);
            }
          }
        });
      });
    });

    const riskScore = calculateRiskScore(txs);
    await updateRiskScore(addr, riskScore, oracleClient);
  }

  console.log("All addresses processed.");
}

// ---------------- Accounts ----------------
export async function getAllActiveAddresses(): Promise<string[]> {
  console.log("Fetching all accounts...");
  try {
    const url = `${restEndpoint}/cosmos/auth/v1beta1/accounts`;
    const resp = await axios.get(url);
    const accounts = resp.data.accounts || [];
    const addresses = accounts.map((acc: any) => acc.address);
    console.log(`Found ${addresses.length} accounts`);
    return addresses;
  } catch (err) {
    console.error("Error fetching accounts:", err);
    return [];
  }
}
