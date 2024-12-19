'use client'

import { Card } from '@/components/ui/card'
import { useDropzone } from 'react-dropzone'
import React from 'react'
import { uploadFile } from '@/lib/firebase'
import { Presentation, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar'
import { api } from '@/trpc/react'
import useProject from '@/hooks/use-project'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

const MeetingCard = () => {
    const { project } = useProject()
    const router = useRouter()
    const [isUploading, setIsUploading] = React.useState(false)
    const [progress, setProgress] = React.useState(0)
    const uploadMeeting = api.project.uploadMeeting.useMutation()
    const { getRootProps, getInputProps } = useDropzone({
        accept: {
            'audio/*': ['.mp3', '.wav', '.m4a'],
        },
        multiple: false,
        maxSize: 50_000_000,
        onDrop: async acceptedFiles => {
            if(!project) return
            setIsUploading(true)
            console.log(acceptedFiles)
            const file = acceptedFiles[0]
            if(!file) return
            const downloadUrl = await uploadFile(file as File, setProgress) as string
            uploadMeeting.mutate({
                meetingUrl: downloadUrl,
                name: file.name,
                projectId: project.id,
            }, {
                onSuccess: () => {
                    toast.success('Meeting uploaded successfully')
                    router.push('/meetings')
                },
                onError: (error) => {
                    toast.error(error.message)
                }
            })
            setIsUploading(false)
        }
    })
    return (
        <Card className='col-span-2 flex flex-col items-center justify-center p-10' {...getRootProps()}>
            {isUploading && (
                <>
                    <Presentation className='w-10 h-10 animate-bounce' />
                    <h3 className='mt-2 text-sm font-semibold text-gray-900'>
                        Create a new meeting
                    </h3>
                    <p className='mt-1 text-center text-sm text-gray-500'>
                        Analyse your meeting with Devdutt
                        <br />
                        Powered by AI
                    </p>
                    <div className="mt-6">
                        <Button disabled={isUploading}>
                            <Upload className='w-5 h-5 mr-1.5 -ml-0.5' aria-hidden="true" />
                            Upload Meeting
                            <input className='hidden' {...getInputProps()} />
                        </Button>
                    </div>
                </>
            )}
            {!isUploading && (
                <div>
                    <CircularProgressbar value={progress} text={`${progress}%`} className='size-20' styles={
                        buildStyles({
                            pathColor: '#2563eb',
                            textColor: '#2563eb',
                        })
                    }/>
                    <p className='text-sm text-gray-500 text-center'>Uploading your meeting...</p>
                </div>
            )}
        </Card>
    )
}

export default MeetingCard