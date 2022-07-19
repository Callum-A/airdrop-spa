import {
  useAccount,
  useDisconnect,
  useSigningClient,
  useConnect,
  useClient,
} from 'graz'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { AirdropFileEntry, generateProof } from '../util/airdrop'
import { chain, microDenomToDenom } from '../util/config'
import receivers from '../public/airdrop.json'
import { Box, Button, Heading, Text } from '@chakra-ui/react'

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_MERKLE_AIRDROP_ADDRESS || ''

const Home: NextPage = () => {
  const [userAirdropDetails, setUserAirdropDetails] =
    useState<AirdropFileEntry | null>(null)
  const [hasClaimed, setHasClaimed] = useState(false)
  const { connect } = useConnect()
  const { disconnect } = useDisconnect({
    onSuccess: () => {
      setUserAirdropDetails(null)
      setHasClaimed(false)
    },
  })
  const { data: account } = useAccount()
  const { data: signingClient } = useSigningClient()
  const { data: nonSigningClient } = useClient()
  const toggleConnect = () => {
    if (!account) {
      connect(chain)
    } else {
      disconnect()
    }
  }

  const claimAirdrop = async () => {
    if (!userAirdropDetails || !account || !signingClient) {
      return
    }
    console.log('gen proof')
    const proof = generateProof(
      account.bech32Address,
      userAirdropDetails.amount
    )
    console.log('proof', proof)
    const msg = {
      claim: { stage: 1, amount: userAirdropDetails.amount, proof },
    }
    console.log('msg', msg)
    try {
      await signingClient.execute(
        account.bech32Address,
        CONTRACT_ADDRESS,
        msg,
        'auto'
      )
      console.log('successfully claimed!')
    } catch (err) {
      // todo add pop up
      console.log('failed with', err)
    }
  }

  useEffect(() => {
    const main = async () => {
      if (account && nonSigningClient) {
        const addr = account.bech32Address
        const casted = receivers as {
          address: string
          amount: string
        }[]
        const filt = casted.filter((drop) => drop.address === addr)
        if (filt.length === 0) {
          // Not eligible
          setUserAirdropDetails(null)
        } else {
          // Eligible
          const drop = filt[0]
          setUserAirdropDetails(drop)
          console.log('dropped: ', drop)
          const resp: { is_claimed: boolean } =
            await nonSigningClient?.queryContractSmart(CONTRACT_ADDRESS, {
              is_claimed: { stage: 1, address: drop.address },
            })
          setHasClaimed(resp.is_claimed)
        }
      }
    }
    main()
  }, [account, nonSigningClient])

  return (
    <Box>
      <Heading>Howl Airdrop</Heading>
      <Box>
        <Button
          colorScheme={account ? 'orange' : 'blue'}
          onClick={toggleConnect}
        >
          {account ? 'Disconnect wallet' : 'Connect wallet'}
        </Button>
      </Box>
      {!account && (
        <Heading>Connect your wallet to see your airdrop amount</Heading>
      )}
      {account && (
        <>
          {!userAirdropDetails && (
            <Box>
              <Heading>
                {account.bech32Address} was not eligible for the Howl airdrop
              </Heading>
              <Text>See the airdrop criteria here</Text>
            </Box>
          )}
          {userAirdropDetails && (
            <div>
              {hasClaimed && (
                <Heading>
                  {account.bech32Address} has already claimed{' '}
                  {microDenomToDenom(
                    Number.parseInt(userAirdropDetails.amount),
                    6
                  )}{' '}
                  HOWL
                </Heading>
              )}
              {!hasClaimed && (
                <Box>
                  <Text>
                    {account.bech32Address} has{' '}
                    {microDenomToDenom(
                      Number.parseInt(userAirdropDetails.amount),
                      6
                    )}
                    HOWL to claim
                  </Text>
                  <Button colorScheme="blue" onClick={claimAirdrop}>
                    Claim
                  </Button>
                </Box>
              )}
            </div>
          )}
        </>
      )}
    </Box>
  )
}

export default Home
