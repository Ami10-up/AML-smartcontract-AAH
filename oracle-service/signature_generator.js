const { toUtf8, fromHex } = require("@cosmjs/encoding");
const { Secp256k1, Sha256 } = require("@cosmjs/crypto");

async function main() {
  const privKeyHex = "5d15d29334a93b59afe3b87511fbb311ffc10cf7f5400661f6c941d164621111";
  const privKey = fromHex(privKeyHex);

  const data = '{"address":"wasm1ga4d4tsxrk6na6ehttwvdfmn2ejy4gwfxpt2m7","risk_score":6}';

  const msgHash = new Sha256(toUtf8(data)).digest();
  const sig = await Secp256k1.createSignature(msgHash, privKey);

  const rs = sig.toFixedLength().slice(0, 64);
  const signatureBase64 = Buffer.from(rs).toString("base64");

  console.log("signature:", signatureBase64);
}

main().catch(console.error);
