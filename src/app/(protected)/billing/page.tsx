'use client'

import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { createCheckoutSession } from '@/lib/stripe'
import { api } from '@/trpc/react'
import { Info } from 'lucide-react'
import React from 'react'

const BillingPage = () => {
    const { data: user } = api.project.getMyCredits.useQuery()
    const [creditsToBuy, setCreditsToBuy] = React.useState<number []>([100])
    const creditsToBuyAmount = creditsToBuy[0]!
    const price = (creditsToBuyAmount / 50).toFixed(2)
    return (
        <div>
            <h1 className='text-xl text-semibold'>Billing</h1>
            <div className="h-2" />
            <p className='text-sm text-gray-500'>
                You currently have {user?.credits} Tamra.
            </p>
            <div className="h-2" />
            <div className="bg-blue-50 px-4 py-2 rounded-md border border-blue-200 text-blue-700">
                <div className="flex items-center gap-2">
                    <Info size={4} />
                    <p className='text-sm'>Each credit allows you to index 1 file in a repository.</p>
                </div>
                <p className='text-sm'>E.g. If your project has 100 files, you will need 100 credits to index it.</p>
            </div>
            <div className="h-4" />
            <Slider
                defaultValue={[100]}
                min={10}
                max={1000}
                step={10}
                value={creditsToBuy}
                onValueChange={value => setCreditsToBuy(value)} />
            <div className="h-4" />
            <Button onClick={() => {
                createCheckoutSession(creditsToBuyAmount)
            }}>
                Buy {creditsToBuyAmount} credits for ${price}
            </Button>
        </div>
    )
}

export default BillingPage