import { DetailsIcon, GithubIcon } from '@app/assets/icons'
import { Tooltip } from '@app/components/ui'
import { Button, CopyTextButton } from '@app/components/ui/buttons'
import { Routes } from '@app/router'
import { ASSETS_ISSUER_ADDRESS } from '@app/utils/qubic-ts'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'

type Props = {
  asset: string
  code: string
  githubUrl: string
  proposalUrl?: string
}

export default function ContractActions({ asset, code, githubUrl, proposalUrl }: Props) {
  const { t } = useTranslation('network-page')
  return (
    <div className="flex gap-6 self-end">
      <Tooltip content={t('checkContractShareholders')} tooltipId="check-shareholders">
        <Button
          className="h-[30px] w-fit"
          size="xs"
          variant="outlined"
          color="secondary"
          as={Link}
          to={Routes.NETWORK.ASSETS.RICH_LIST(ASSETS_ISSUER_ADDRESS, asset)}
        >
          {t('shareholders')}
        </Button>
      </Tooltip>
      <a
        href={githubUrl}
        aria-label="Open GitHub code file"
        className="rounded-8 border border-primary-60 p-5 hover:bg-primary-60"
        target="_blank"
        rel="noreferrer"
      >
        <Tooltip content={t('checkSourceCode')} tooltipId="check-source-code">
          <GithubIcon className="size-18" />
        </Tooltip>
      </a>
      {proposalUrl && (
        <a
          href={proposalUrl}
          aria-label="Open GitHub proposal file"
          className="rounded-8 border border-primary-60 p-5 hover:bg-primary-60"
          target="_blank"
          rel="noreferrer"
        >
          <Tooltip content={t('checkContractProposal')} tooltipId="check-proposal">
            <DetailsIcon className="size-18" />
          </Tooltip>
        </a>
      )}
      <CopyTextButton
        text={code}
        className="border border-primary-60 p-7 text-white hover:bg-primary-60"
      />
    </div>
  )
}
