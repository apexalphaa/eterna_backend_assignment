
import MockDex from "./mockDexRouter";
const dex = new MockDex();

export default {
  async route() {
    const [r, m] = await Promise.all([
      dex.getRaydiumQuote(),
      dex.getMeteoraQuote()
    ]);
    return { r, m, best: r.price < m.price ? r : m };
  },

  async execute(dexName: string, price: number) {
    return dex.executeSwap(dexName, price);
  }
};
