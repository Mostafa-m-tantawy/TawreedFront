import CryptoJS from "crypto-js";

const SECRET_KEY = `~16z71*deZ,)0']K6Hp#`; // process.env.NEXT_PUBLIC_ENC_SECRET_KEY;

// Encrypt text
export function encrypt(value: string): string {
  if (!SECRET_KEY) return value;
  const ciphertext = CryptoJS.AES.encrypt(value, SECRET_KEY).toString();
  return ciphertext;
}

// Decrypt text
export function decrypt(ciphertext: string): string {
  if (!SECRET_KEY) return ciphertext;

  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    // console.log("Decryption failed:", error);
    return "";
  }
}
