import { db } from "@/server/db";
import { headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
    apiVersion: '2024-12-18.acacia',
})

export async function POST(req: Request) {
    const body = await req.text()
    const sig = (await headers()).get("stripe-Signature") as string;
    let event: Stripe.Event
    try {
        event = Stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
    } catch (error) {
        return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }
    const session = event.data.object as Stripe.Checkout.Session
    console.log(event.type)
    if (event.type === 'checkout.session.completed') {
        const credits = Number(session.metadata?.['credits'])
        const userId = session.client_reference_id
        if(!userId || !credits) {
            return NextResponse.json({ error: 'Missing userId or credits' }, { status: 400 })
        }
        await db.stripeTransaction.create({
            data: {
                userId,
                credits,
            }
        })
        await db.user.update({
            data: {
                credits: {
                    increment: credits
                },
            },
            where: {
                id: userId
            }
        })
        return NextResponse.json({ message: 'Transaction completed' }, { status: 200 })
    }
    return NextResponse.json({ message: "Stripe Webhook received" });
}