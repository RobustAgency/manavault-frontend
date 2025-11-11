import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div className='relative flex flex-col h-svh items-center justify-center'>
            <Link href="/" className='absolute top-4 left-4'>
                <div className='text-2xl font-bold'>Mana Vault</div>
            </Link>
            {children}
        </div>
    )
}

export default AuthLayout