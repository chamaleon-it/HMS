"use client";

import InvoiceView from './Content'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function BillingPageContent() {
    const searchParams = useSearchParams()
    const id = searchParams.get("id") as string
    
    return (
        <InvoiceView id={id} />
    )
}

export default function page() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BillingPageContent />
        </Suspense>
    )
}
