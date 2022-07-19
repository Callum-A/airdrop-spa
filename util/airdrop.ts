import sha256 from 'crypto-js/sha256'
import { MerkleTree } from 'merkletreejs'
import receivers from '../public/airdrop.json'

export interface AirdropFileEntry {
  address: string
  amount: string
}

export const generateProof = (address: string, amount: string) => {
  let casted = receivers as AirdropFileEntry[]
  console.log(casted[0])
  let airdrop = new Airdrop(casted)
  let proof = airdrop.getMerkleProof({
    address,
    amount,
  })
  return proof
}

class Airdrop {
  private tree: MerkleTree

  constructor(accounts: Array<{ address: string; amount: string }>) {
    const leaves = accounts.map((a) => sha256(a.address + a.amount))
    this.tree = new MerkleTree(leaves, sha256, { sort: true })
  }

  public getMerkleRoot(): string {
    return this.tree.getHexRoot().replace('0x', '')
  }

  public getMerkleProof(account: {
    address: string
    amount: string
  }): string[] {
    return this.tree
      .getHexProof(sha256(account.address + account.amount).toString())
      .map((v) => v.replace('0x', ''))
  }

  public verify(
    proof: string[],
    account: { address: string; amount: string }
  ): boolean {
    let hashBuf = Buffer.from(
      sha256(account.address + account.amount).toString()
    )

    proof.forEach((proofElem) => {
      const proofBuf = Buffer.from(proofElem, 'hex')
      if (hashBuf < proofBuf) {
        hashBuf = Buffer.from(
          sha256(Buffer.concat([hashBuf, proofBuf]).toString()).words
        )
      } else {
        hashBuf = Buffer.from(
          sha256(Buffer.concat([proofBuf, hashBuf]).toString()).words
        )
      }
    })

    return this.getMerkleRoot() === hashBuf.toString('hex')
  }
}

export { Airdrop }
