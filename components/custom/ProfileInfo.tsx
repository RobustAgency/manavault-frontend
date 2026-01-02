import { useAuth } from '@/providers/AuthProvider'
import Image from 'next/image'
import Link from 'next/link'
import React, { useEffect } from 'react'

const ProfileInfo = () => {
    const { profile, fetchProfile, user } = useAuth()
    const avatarUrl = profile?.avatar_url
    const displayName = profile?.full_name ?? "User"
    const role = user?.user_metadata?.role ?? "user"

    useEffect(() => {
        if (!profile) {
            fetchProfile()
        }
    }, [profile, fetchProfile])

    return (
        <div className="flex items-center gap-3 justify-end px-4">
            <Link href="/settings" className="relative h-10 w-10 overflow-hidden rounded-full bg-muted">
                {avatarUrl ? (
                    <Image src={avatarUrl} alt={displayName} fill sizes="40px" className="object-cover object-top" unoptimized />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-sm font-medium">
                        {displayName.slice(0, 2).toUpperCase()}
                    </div>
                )}
            </Link>
            <div className="min-w-0">
                <div className="truncate text-sm font-medium">{displayName}</div>
                <div className="text-xs capitalize text-muted-foreground">
                    {role.replace(/_/g, " ")}

                </div>
            </div>
        </div>
    )
}

export default ProfileInfo