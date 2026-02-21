import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// export function generateRandomSeed(): string {
//   const array = new Uint8Array(32)
//   if (typeof window !== 'undefined' && window.crypto) {
//     window.crypto.getRandomValues(array)
//   } else {
//     for (let i = 0; i < 32; i++) {
//       array[i] = Math.floor(Math.random() * 256)
//     }
//   }
//   return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
// }


export function generateRandomSeed(): `0x${string}` {
  const array = new Uint8Array(32);

  if (typeof window !== 'undefined' && window.crypto) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < 32; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
  }

  const hex = Array.from(array, (byte) =>
    byte.toString(16).padStart(2, '0'),
  ).join('');

  return `0x${hex}`;
}

// Format balance to 2 decimal places
export function formatBalance(value: number | bigint | string, decimals: number = 2): string {
  const num = typeof value === 'bigint' ? Number(value) / 1e18 : Number(value);
  return num.toFixed(decimals);
}

// Format multiplier (handles both raw and scaled values)
export function formatMultiplier(value: number, isScaled: boolean = false): string {
  const num = isScaled ? value / 1e18 : value;
  return num.toFixed(2);
}

// Format MON amount with symbol
export function formatSTT(value: number | string, decimals: number = 2): string {
  return `${Number(value).toFixed(decimals)} MON`;
}

// Truncate address for display
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
