'use client'
import React from 'react'
import ProfileForm from '@/components/settings/ProfileForm'
import ChangePasswordForm from '@/components/settings/ChangePasswordForm'
import ProfilePhoto from '@/components/settings/ProfilePhoto'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

const SettingsPage = () => {
    
    return (
        <div className='flex flex-col justify-center gap-4'>
        <div>   <Button
        type="button"
        variant={"outline"}
        onClick={() => window.history.back()}
    >
       <ArrowLeft />
        Back
    </Button></div>
        <div className='grid grid-cols-1 xl:grid-cols-3 gap-4'>
      
            <div className='col-span-1 xl:col-span-2 order-3 xl:order-1 space-y-5'>
         
                <ProfileForm />
                <ChangePasswordForm />
            </div>
            <div className='col-span-1 xl:col-span-1 order-1 xl:order-2'>
             
                <ProfilePhoto />
            </div>
        </div>
        </div>
    )
}

export default SettingsPage