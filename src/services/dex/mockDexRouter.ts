
import { sleep } from '../../utils/sleep';
import { v4 as uuidv4 } from 'uuid';

export default class MockDexRouter {

  async getRaydiumQuote() {
    await sleep(200);
    return { dex: "raydium", price: 1.0 * (0.98 + Math.random() * 0.04) };
  }

  async getMeteoraQuote() {
    await sleep(200);
    return { dex: "meteora", price: 1.0 * (0.97 + Math.random() * 0.05) };
  }

  async executeSwap(dex: string, price: number) {
    await sleep(2000 + Math.random() * 500);
    return {
      txHash: "mock_" + uuidv4(),
      executedPrice: price * (1 + (Math.random() - 0.5) * 0.01)
    };
  }
}
