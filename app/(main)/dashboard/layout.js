import React, { Suspense } from 'react'
import DashboardPage from './page'
import { BarLoader } from 'react-spinners'

const DashboardLayout = () => {
    return (
        <div className='px-5'>
            <h1 className='text-3xl md:text-4xl font-bold gradient-title mb-5'>Dashboard</h1>

            {/* Dashboard Page  */}
            <Suspense fallback={<BarLoader className='mt-4' width={"100%"} color='#9333ea' />}>
                <DashboardPage />
            </Suspense>
        </div>
    )
}

export default DashboardLayout
