"use client";
import './globals.css';
import '@dialectlabs/blinks/index.css';
import { Action, Blink, ActionsRegistry, useAction } from "@dialectlabs/blinks";
import { useActionSolanaWalletAdapter } from "@dialectlabs/blinks/hooks/solana"
import { useEffect, useState } from 'react';

const actionApiUrl = 'https://blinks.dramsky.io/api/actions/nftmint';

export default function Home() {
  const { adapter } = useActionSolanaWalletAdapter(process.env.NEXT_PUBLIC_SOLANA_RPC!);
  const { action } = useAction({ url: actionApiUrl, adapter });
  // const [action, setAction] = useState<Action | null>(null);
  const [items, setItems] = useState(0)

  useEffect(() => {
    const getItems = async () => {
      console.log('getting items')
      try {
        const response = await fetch('/api/items')
        if (!response.ok) {
          throw new Error('Failed to fetch items')
        }
        const data = await response.json()
        setItems(data.items)
      } catch (error) {
        console.error('Error fetching items:', error)
      }
    }

    getItems()

    // Set up an interval to fetch items every 15 seconds
    const intervalId = setInterval(getItems, 15000) // Fetch every 15 seconds

    // Cleanup function to clear the interval when the component unmounts
    return () => clearInterval(intervalId)
  }, [])

  return (
    <main className="flex min-h-screen flex-col items-center justify-start gap-4 p-24 ">
      <div>
        {action ?
          <div style={{ minWidth: '28rem', maxWidth: '28rem' }}>
            <Blink action={action} websiteText={new URL(actionApiUrl).hostname} />
          </div>
          : <div className="info-box">Pouring the finest whisky... Sip back and relax while we get things ready.</div>}
      </div>
      <div className='text-white italic align-middle text-center'>
        Crafted from carefully sourced subtropical grains and aged in handpicked bourbon casks, this Single Malt Whisky offers a bouquet of floral aromas and tropical fruits. The palate is a blend of soft oak, fresh hay, and a hint of vanilla, leading to a smooth, mellow finish.

        <br />
        <br />
        Aged 15 years
        <br />
        <br />

        Distilled & Bottled in Taiwan
        <br />
        Items Redeemed: {items}
      </div>
    </main>
  );
}