import { GrazChain } from 'graz'
import type { AppCurrency } from '@keplr-wallet/types'

export const MAIN_DENOM: AppCurrency = {
  coinDenom: process.env.NEXT_PUBLIC_COIN_DENOM || '',
  coinMinimalDenom: process.env.NEXT_PUBLIC_COIN_MINIMAL_DENOM || '',
  coinDecimals: Number.parseInt(process.env.NEXT_PUBLIC_COIN_DECIMALS || '6'),
  coinGeckoId: process.env.NEXT_PUBLIC_COIN_GECKO_ID || '',
  coinImageUrl: process.env.NEXT_PUBLIC_COIN_IMAGE_URL || '',
}

export const chain: GrazChain = {
  chainId: process.env.NEXT_PUBLIC_CHAIN_ID || 'uni-3',
  rest: process.env.NEXT_PUBLIC_CHAIN_REST_ENDPOINT || '',
  rpc: process.env.NEXT_PUBLIC_CHAIN_RPC_ENDPOINT || '',
  currencies: [MAIN_DENOM],
  gas: {
    denom: process.env.NEXT_PUBLIC_COIN_MINIMAL_DENOM || '',
    price: '0.025',
  },
}

export const denomToMicroDenom = (amount: number, decimals: number) => {
  return amount * Math.pow(10, decimals)
}

export const microDenomToDenom = (amount: number, decimals: number) => {
  return amount / Math.pow(10, decimals)
}
