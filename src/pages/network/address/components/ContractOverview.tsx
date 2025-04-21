import { Alert } from '@app/components/ui'
import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import SyntaxHighlighter from 'react-syntax-highlighter'
import { githubGist } from 'react-syntax-highlighter/dist/esm/styles/hljs'
import { LoadingSpinner } from '../../../../components/ui/loaders'
import ContractActions from './ContractActions'

const makeGithubRawUrl = (url: string) => {
  if (!url) return ''
  return `https://raw.githubusercontent.com/qubic/core${url.split('blob')[1]}`
}

type Props = {
  asset: string
  githubUrl: string
  proposalUrl?: string
}

export default function ContractOverview({ asset, githubUrl, proposalUrl }: Props) {
  const { t } = useTranslation('network-page')
  const [code, setCode] = useState<string>('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  const rawUrl = makeGithubRawUrl(githubUrl)

  useEffect(() => {
    const fetchCode = async () => {
      try {
        const res = await fetch(rawUrl)
        if (!res.ok) throw new Error('Failed to fetch code')
        const text = await res.text()
        setCode(text)
      } catch (err) {
        setError('Could not load the code file.')
      } finally {
        setLoading(false)
      }
    }

    fetchCode()
  }, [rawUrl])

  const renderContractCode = useCallback(() => {
    if (error)
      return (
        <Alert variant="error" className="mb-8 h-fit">
          {t('smartContractCodeLoadError')}
        </Alert>
      )

    if (loading) return <LoadingSpinner className="m-auto" />

    return (
      <SyntaxHighlighter
        language="cpp"
        style={{
          ...githubGist,
          'hljs-keyword': { color: '#F47067' },
          'hljs-title': { color: '#D0A6FC' },
          'hljs-comment': { color: '#848A93' },
          'hljs-number': { color: '#6DB7FF' }
        }}
        showLineNumbers
        customStyle={{
          background: '#101820',
          width: '100%',
          maxWidth: '890px',
          maxHeight: '400px',
          fontSize: '12px',
          color: '#ADBAC7'
        }}
        lineNumberStyle={{ color: '#888' }}
      >
        {code}
      </SyntaxHighlighter>
    )
  }, [code, error, loading, t])

  return (
    <div className="grid gap-8 rounded-lg border border-primary-60 p-20">
      <div className="grid gap-6">
        <div className="flex flex-col justify-between gap-6 sm:flex-row">
          <p className="font-space">
            <span className="text-gray-50">{t('contractName')}: </span>
            <span className="font-bold text-gray-100">{asset}</span>
          </p>

          <ContractActions
            asset={asset}
            code={code}
            githubUrl={githubUrl}
            proposalUrl={proposalUrl}
          />
        </div>

        <div className="flex h-400 w-full overflow-hidden rounded border border-gray-800 bg-[#101820] p-4 text-sm">
          {renderContractCode()}
        </div>
      </div>
    </div>
  )
}
