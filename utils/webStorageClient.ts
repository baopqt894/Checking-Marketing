// utils/webStorageClient.ts
import Cookies from "js-cookie";

const webStorageClient = {
  set(key: string, rawValue: any, option?: Cookies.CookieAttributes) {
    const value =
      typeof rawValue === "string" ? rawValue : JSON.stringify(rawValue);
    Cookies.set(key, value, option);
  },

  get(key: string) {
    const value = Cookies.get(key) || "";
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  },

  remove(key: string) {
    Cookies.remove(key);
  },

  setAdmobToken(tokens: any) {
    this.set("admob_token", tokens, {
      path: "/", 
      sameSite: "Lax", 
    });
  },

  getAdmobToken() {
    return this.get("admob_token");
  },

  removeAdmobToken() {
    this.remove("admob_token");
  },
};

export default webStorageClient;
