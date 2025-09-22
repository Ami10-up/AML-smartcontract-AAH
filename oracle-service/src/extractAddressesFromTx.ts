// src/extractAddressesFromTx.ts
export function extractAddressesFromTx(tx: any): string[] {
  const addresses: Set<string> = new Set();

  try {
    // --- 1. From events ---
    if (tx.events) {
      tx.events.forEach((event: any) => {
        event.attributes?.forEach((attr: any) => {
          if (attr.key && attr.value) {
            if (
              attr.key === "sender" ||
              attr.key === "recipient" ||
              attr.key === "fee_payer" ||
              attr.key.includes("address")
            ) {
              addresses.add(attr.value);
            }
          }
        });
      });
    }

    // --- 2. From tx.body.messages ---
    const msgs = tx?.tx?.body?.messages || [];
    msgs.forEach((msg: any) => {
      if (msg.sender) addresses.add(msg.sender);
      if (msg.from_address) addresses.add(msg.from_address);
      if (msg.to_address) addresses.add(msg.to_address);
      if (msg.admin) addresses.add(msg.admin);
    });

  } catch (err) {
    console.error("Error extracting addresses:", err);
  }

  return Array.from(addresses);
}
