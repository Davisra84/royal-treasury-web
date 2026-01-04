import { generateKeyPair, exportJWK } from "jose";

const kid = "rtf-unit-key-1";

// Generate an EXTRACTABLE key pair so we can export JWKs safely
const { publicKey, privateKey } = await generateKeyPair("RS256", {
  extractable: true,
});

const priv = await exportJWK(privateKey);
const pub = await exportJWK(publicKey);

priv.kid = kid;
pub.kid = kid;

console.log("UNIT_PRIVATE_JWK=" + JSON.stringify(priv));
console.log("\nPublic JWKS (your app will host this at /.well-known/jwks.json):\n");
console.log(JSON.stringify({ keys: [pub] }, null, 2));