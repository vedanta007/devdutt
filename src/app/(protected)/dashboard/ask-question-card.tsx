'use client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import useProject from '@/hooks/use-project'
import Image from 'next/image'
import React from 'react'
import { askQuestion } from './actions'
import { readStreamableValue } from 'ai/rsc'

const AskQuestionCard = () => {
    const { project } = useProject()
    const [open, setOpen] = React.useState(false)
    const [question, setQuestion] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const [filesReferenced, setFilesReferenced] = React.useState<{ fileName: string, sourceCode: string, summary: string }[]>([])
    const [answer, setAnswer] = React.useState('')
    const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if(!project?.id) return
        setOpen(true)
        setLoading(true)
        const { output, filesReferenced } = await askQuestion(question, project.id)
        setFilesReferenced(filesReferenced)

        for await (const delta of readStreamableValue(output)) {
            if(delta) {
                setAnswer(ans => ans+delta)
            }
        }
        setLoading(false)
    }
    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            <Image src="/logo.svg" alt='Logo' width={40} height={40} />
                        </DialogTitle>
                    </DialogHeader>
                    {answer}
                    <h1>FIles References</h1>
                    {filesReferenced.map(file => {
                        return <span>{file.fileName}</span>
                    })}
                </DialogContent>
            </Dialog>
            <Card className='relative col-span-3'>
                <CardHeader>
                    <CardTitle>Ask a Question</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={onSubmit}>
                        <Textarea placeholder='Which file should I edit to change the home page?' value={question} onChange={e => setQuestion(e.target.value)}/>
                        <div className='h-4'></div>
                        <Button type='submit'>Ask Devdutt!</Button>
                    </form>
                </CardContent>
            </Card>
        </>
    )
}

export default AskQuestionCard