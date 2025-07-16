import CryptoJS from "crypto-js";

const key = CryptoJS.enc.Utf8.parse("advanproyX29fQkPz7eM1LtRsTg4HcVu");
const iv = CryptoJS.enc.Utf8.parse("initADVANP7890Q1");

export function decryptAES(encryptedBase64) {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedBase64, key, {
      iv: iv,
      mode: CryptoJS.mode.CBC,
      padding: CryptoJS.pad.Pkcs7,
    });

    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    return "";
  }
}
