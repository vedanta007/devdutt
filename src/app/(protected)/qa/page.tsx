'use client'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import useProject from '@/hooks/use-project'
import { api } from '@/trpc/react'
import React from 'react'
import AskQuestionCard from '../dashboard/ask-question-card'
import MDEditor from '@uiw/react-md-editor'
import CodeReferences from '../dashboard/code-references'

const QAPage = () => {
  const { projectId } = useProject()
  const { data: questions } = api.project.getQuestions.useQuery({ projectId })
  const [selectedQuestion, setSelectedQuestion] = React.useState(0)
  const question = questions?.[selectedQuestion]
  return (
    <Sheet>
      <AskQuestionCard />
      <div className="h-4"></div>
      <h1 className='text-xl font-semibold'>Saved Questions</h1>
      <div className="h-2"></div>
      <div className="flex flex-col gap-2">
        {questions?.map((question, index) => {
          return <React.Fragment key={question.id}>
            <SheetTrigger onClick={() => setSelectedQuestion(index)}>
              <div className="flex items-center gap-4 rounded-lg bg-white p-4 shadow border">
                <img className='rounded-full' height={30} width={30} src={question.user.imageUrl ?? ''}/>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <p className='text-gray-700 line-clamp-1 text-lg font-medium'>
                      {question.question}
                    </p>
                    <span className='text-gray-400 text-xs whitespace-nowrap'>
                      {question.createdAt.toLocaleDateString()}
                    </span>
                  </div>
                  <p className='line-clmap-1 text-gray-500 text-sm'>
                    {question.answer}
                  </p>
                </div>
              </div>
            </SheetTrigger>
          </React.Fragment>
        })}
      </div>
      {question && (
        <SheetContent className='sm:max-w-[80vw]'>
          <SheetHeader>
            <SheetTitle>
              {question.question}
            </SheetTitle>
            <MDEditor.Markdown source={question.answer} />
            <CodeReferences filesReferenced={(question.filesReferenced ?? []) as any} />
          </SheetHeader>
        </SheetContent>
      )}
    </Sheet>
  )
}

export default QAPage