// connect_chain.ts
import { StargateClient } from "@cosmjs/stargate";

async function main() {
  const rpcEndpoint = "http://localhost:26657"; // replace if needed
  try {
    const client = await StargateClient.connect(rpcEndpoint);
    const height = await client.getHeight();
    console.log(`✅ Connected to chain at height: ${height}`);
    const chainId = await client.getChainId();
    console.log(`Chain ID: ${chainId}`);
  } catch (error) {
    console.error("❌ Failed to connect to chain:", error);
  }
}

main();
