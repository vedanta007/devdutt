import { GithubRepoLoader } from '@langchain/community/document_loaders/web/github'
import { Document } from '@langchain/core/documents'
import { summariseCode, generateEmbedding } from './gemini'
import { db } from '@/server/db'

export const loadGithubRepository = async (githubUrl: string, githubToken?: string) => {
    const loader = new GithubRepoLoader(githubUrl, {
        accessToken: githubToken || '',
        branch: 'main',
        ignoreFiles: ['package.json', 'package-lock.json', 'node_modules', 'dist', 'build', 'coverage', 'test', 'tests', 'docs', 'doc', 'example', 'examples', 'CHANGELOG.md', 'CHANGELOG', 'LICENSE', 'LICENSE.md', 'README.md', 'README', 'CONTRIBUTING.md', 'CONTRIBUTING', 'CODE_OF_CONDUCT.md', 'CODE_OF_CONDUCT', 'SECURITY.md', 'SECURITY', 'PULL_REQUEST_TEMPLATE.md', 'PULL_REQUEST_TEMPLATE', 'ISSUE_TEMPLATE.md', 'yarn.lock', 'pnpn-lock.yarn'],
        recursive: true,
        unknown: 'warn',
        maxConcurrency: 5
    })
    const docs = await loader.load()
    return docs
}

export const indexGithubRepo = async (projectId: string, githubUrl: string, githubToken?: string) => {
    const docs = await loadGithubRepository(githubUrl, githubToken)
    const allEmbeddings = await generateEmbeddings(docs)
    await Promise.allSettled(allEmbeddings.map(async (embedding, index) => {
        if (!embedding) return
            const sourceCodeEmbedding = await db.sourceCodeEmbedding.create({
                data: {
                    summary: embedding.summary,
                    sourceCode: embedding.sourceCode,
                    fileName: embedding.fileName,
                    projectId,
                }
            })
            await db.$executeRaw`
                UPDATE "SourceCodeEmbedding"
                SET "SummaryEmbedding" = ${embedding.embedding}::vector
                WHERE "id" = ${sourceCodeEmbedding.id}
        `
    }))
}

const generateEmbeddings = async (docs: Document[]) => {
    return await Promise.all(docs.map(async (doc) => {
        const summary = await summariseCode(doc)
        const embedding = await generateEmbedding(summary)
        return {
            summary,
            embedding,
            sourceCode: JSON.parse(JSON.stringify(doc.pageContent)),
            fileName: doc.metadata.source,
        }
    }))
}