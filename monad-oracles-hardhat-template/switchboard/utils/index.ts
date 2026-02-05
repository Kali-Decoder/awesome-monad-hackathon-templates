export function normalizeFeedHash(hash: string): string {
    return hash.startsWith('0x') ? hash : '0x' + hash;
}

export function formatValue(value: bigint, decimals: number = 18): string {
    const divisor = 10n ** BigInt(decimals);
    const whole = value / divisor;
    const fraction = value % divisor;
  
    if (fraction === 0n) {
      return whole.toString();
    }
  
    const fractionStr = fraction.toString().padStart(decimals, '0');
    const trimmed = fractionStr.replace(/0+$/, '');
    return `${whole}.${trimmed}`;
  }