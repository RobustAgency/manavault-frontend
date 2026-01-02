"use client"

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Image from 'next/image'

import { createClient } from '@/lib/supabase/client'
import { useAuth } from '@/providers/AuthProvider'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload } from 'lucide-react'

const PLACEHOLDER = '/placeholders/user_placeholder.png'
const BUCKET = 'avatars'

const ProfilePhoto = () => {
    const { user, fetchProfile } = useAuth()
    const supabase = useMemo(() => createClient(), [])
    const fileInputRef = useRef<HTMLInputElement | null>(null)
    const [image, setImage] = useState<string>(PLACEHOLDER)
    const [file, setFile] = useState<File | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(null)
    const hasLocalPreviewRef = useRef<boolean>(false)
    const previewUrlRef = useRef<string | null>(null)

    useEffect(() => {
        const loadProfile = async () => {
            if (!user?.id) return
            const { data, error } = await supabase
                .from('profiles')
                .select('avatar_url')
                .eq('id', user.id)
                .single()
            if (error) return
            const url = (data?.avatar_url as string | null) ?? null
            setCurrentAvatarUrl(url)
            if (!hasLocalPreviewRef.current) {
                setImage(url ?? PLACEHOLDER)
            }
        }
        void loadProfile()
    }, [supabase, user])

    const openFileDialog = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const validateFile = (f: File) => {
        const isImage = f.type.startsWith('image/')
        if (!isImage) return 'Only image files are allowed'
        const maxBytes = 2 * 1024 * 1024
        if (f.size > maxBytes) return 'Max size is 2MB'
        return null
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0]
        if (!f) return
        const validation = validateFile(f)
        if (validation) {
            setError(validation)
            return
        }
        setError(null)
        setFile(f)
        if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrlRef.current)
        }
        const blobUrl = URL.createObjectURL(f)
        previewUrlRef.current = blobUrl
        hasLocalPreviewRef.current = true
        setImage(blobUrl)
    }

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault()
        e.stopPropagation()
        const f = e.dataTransfer.files?.[0]
        if (!f) return
        const validation = validateFile(f)
        if (validation) {
            setError(validation)
            return
        }
        setError(null)
        setFile(f)
        if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
            URL.revokeObjectURL(previewUrlRef.current)
        }
        const blobUrl = URL.createObjectURL(f)
        previewUrlRef.current = blobUrl
        hasLocalPreviewRef.current = true
        setImage(blobUrl)
    }

    const deleteIfStoredInBucket = async (url: string | null) => {
        if (!url) return
        const marker = `/object/public/${BUCKET}/`
        const idx = url.indexOf(marker)
        if (idx === -1) return
        const key = url.substring(idx + marker.length)
        await supabase.storage.from(BUCKET).remove([key])
    }

    const handleDelete = async () => {
        if (!user?.id || loading) return
        try {
            setLoading(true)
            await deleteIfStoredInBucket(currentAvatarUrl)
            const { error } = await supabase
                .from('profiles')
                .update({ avatar_url: null })
                .eq('id', user.id)
            if (error) throw error
            setCurrentAvatarUrl(null)
            setFile(null)
            if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrlRef.current)
            }
            previewUrlRef.current = null
            hasLocalPreviewRef.current = false
            setImage(PLACEHOLDER)
            fetchProfile()
            toast.success('Photo removed')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to remove photo'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async () => {
        if (!user?.id) return
        if (!file) {
            toast.error('Please select an image first')
            return
        }
        try {
            setLoading(true)
            const ext = file.name.split('.').pop()?.toLowerCase() || 'png'
            const path = `${user.id}/${Date.now()}.${ext}`
            const { error: uploadError } = await supabase.storage
                .from(BUCKET)
                .upload(path, file, { cacheControl: '3600', upsert: true })
            if (uploadError) throw uploadError

            const { data: publicData } = supabase.storage.from(BUCKET).getPublicUrl(path)
            const publicUrl = publicData.publicUrl

            const { error: updateError } = await supabase
                .from('profiles')
                .update({ avatar_url: publicUrl })
                .eq('id', user.id)
            if (updateError) throw updateError

            if (currentAvatarUrl && currentAvatarUrl !== publicUrl) {
                await deleteIfStoredInBucket(currentAvatarUrl)
            }

            setCurrentAvatarUrl(publicUrl)
            setFile(null)
            if (previewUrlRef.current && previewUrlRef.current.startsWith('blob:')) {
                URL.revokeObjectURL(previewUrlRef.current)
            }
            previewUrlRef.current = null
            hasLocalPreviewRef.current = false
            setImage(publicUrl)
            fetchProfile()
            toast.success('Photo updated')
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to update photo'
            toast.error(errorMessage)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-2xl">Profile Photo</CardTitle>
                <CardDescription>Upload or change your profile picture.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-4 mb-4">
                    <Image
                        src={image || PLACEHOLDER}
                        alt="Profile Preview"
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover object-top border-2 border-gray-200"
                        unoptimized
                    />
                    <div>
                        <div className="font-medium">Edit your photo</div>
                        {image && image !== PLACEHOLDER && (
                            <button
                                className="cursor-pointer text-sm text-[#64748B] mr-2"
                                onClick={handleDelete}
                                type="button"
                                disabled={loading}
                            >
                                Delete
                            </button>
                        )}
                        <button
                            className="cursor-pointer text-sm text-[#29527D]"
                            onClick={openFileDialog}
                            type="button"
                            disabled={loading}
                        >
                            Update
                        </button>
                    </div>
                </div>
                <input
                    type="file"
                    accept="image/png, image/jpeg, image/svg+xml, image/gif"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                />
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-primary rounded-xl p-8 text-center text-[#7A7A7A] mb-6 bg-muted cursor-pointer select-none"
                    onClick={openFileDialog}
                >
                    <div className='bg-white w-max rounded-full p-2 mx-auto mb-2'>
                        <Upload className='size-5 text-primary' />
                    </div>
                    <div>
                        <span className="text-primary cursor-pointer">Click to upload</span> or drag and drop
                    </div>
                    <div className="text-sm mt-1">SVG, PNG, JPG or GIF<br />(max 2 MB, 800 X 800px)</div>
                </div>
                {error && <div className="text-red-500 text-sm mb-4 text-left">{error}</div>}
                <div className="flex justify-end">
                    <Button
                        onClick={handleSave}
                        className="min-w-[100px] min-h-[40px]"
                        disabled={loading}
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </Button>
                </div>
            </CardContent>
        </Card>
    )
}

export default ProfilePhoto