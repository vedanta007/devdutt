'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import useRefetch from '@/hooks/use-refetch'
import { api } from '@/trpc/react'
import { Info } from 'lucide-react'
import React from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'

type FormInput = {
    repoUrl: string
    repoName: string
    githubToken?: string
}

const CreatePage = () => {
    const { register,handleSubmit,reset } = useForm<FormInput>()
    const createProject = api.project.createProject.useMutation()
    const checkCredits = api.project.checkCredits.useMutation()
    const refetch = useRefetch()

    function onSubmit(data: FormInput) {
        if(!!checkCredits.data){
            createProject.mutate({
                githubToken: data.githubToken,
                repoName: data.repoName,
                repoUrl: data.repoUrl
            }, {
                onSuccess: ()=>{
                    toast.success('Project created successfully')
                    refetch()
                    reset()
                },
                onError: ()=>{
                    toast.error('Failed to create project')
                }
            })
        } else {
            checkCredits.mutate({
                githubToken: data.githubToken,
                githubUrl: data.repoUrl
            })
        }
    }

    const hasEnoughCredits = checkCredits?.data?.userCredits ? checkCredits.data.fileCount <= checkCredits.data.userCredits : true

    return (
        <div className='flex items-center gap-12 h-full justify-center'>
            <img src='/undraw_github.svg' className='h-56 w-auto' />
            <div>
                <div>
                    <h1 className='font-semibold text-2xl'>
                        Link your GitHub Repository
                    </h1>
                    <p className='text-sm text-muted-foreground'>
                        Connect your GitHub repository to get started with Devdutt
                    </p>
                </div>
                <div className='h-4' />
                <div>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Input
                            {...register('repoName',{required:true})}
                            placeholder='Project Name'
                            required/>
                        <div className='h-4' />
                        <Input
                            {...register('repoUrl',{required:true})}
                            placeholder='GitHub Repository URL'
                            type='url'
                            required/>
                        <div className='h-4' />
                        <Input
                            {...register('githubToken')}
                            placeholder='GitHub Token (Optional)'
                            required/>
                        {!!checkCredits.data && (
                            <>
                                <div className="mt-4 bg-orange-50 px-4 py-2 rounded-md border border-orange-200 text-orange-700">
                                    <div className="flex items-center gap-2">
                                        <Info size={4} />
                                        <p className='text-sm'>
                                            You will be charged <strong>{checkCredits.data?.fileCount} credits for this repository.</strong>
                                        </p>
                                    </div>
                                    <p className='text-sm text-blue-600 ml-6'>
                                        You have <strong>{checkCredits.data?.userCredits} credits</strong> remaining.
                                    </p>
                                </div>
                            </>
                        )}
                        <div className='h-4' />
                        <Button type='submit' disabled={createProject.isPending || checkCredits.isPending || !hasEnoughCredits}>
                            {!!checkCredits.data ? 'Create Project' : 'Check Credits'}
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default CreatePage