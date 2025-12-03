import React, { Suspense } from 'react'
import PharmacyReturnPage from './PharmacyReturnPage'

export default function page() {
    return (
        <Suspense>
            <PharmacyReturnPage />
        </Suspense>
    )
}
