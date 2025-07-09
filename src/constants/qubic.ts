import type { ExchangeWallet } from '@app/types'

export const QUBIC_PROJECTS_URLS = {
  QX: 'https://qx.qubic.org',
  QUOTTERY: 'https://quottery.org',
  QEARN: 'https://qearn.org'
} as const

export const EXPLORER_NETWORK_URLS = {
  MAINNET: { networkId: 'mainnet', label: 'Mainnet', url: 'https://explorer.qubic.org' },
  TESTNET: { networkId: 'testnet', label: 'Testnet', url: 'https://testnet.explorer.qubic.org' }
} as const

export enum SmartContracts {
  Qx = 'BAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAARMID',
  Quottery = 'CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACNKL',
  Random = 'DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAANMIG',
  QUtil = 'EAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVWRF',
  MyLastMatch = 'FAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAYWJB',
  GeneralQuorumProposal = 'GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQGNM',
  SupplyWatcher = 'HAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHYCM',
  ComputorControlledFund = 'IAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABXSH',
  QEarn = 'JAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVKHO',
  QVault = 'KAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXIUO',
  MSVault = 'LAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAKPTJ',
  Qbay = 'MAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWLWD'
}

export const SMART_CONTRACTS: Record<
  SmartContracts,
  { name: string; label: string; website?: string; githubUrl: string; proposalUrl?: string }
> = {
  [SmartContracts.Qx]: {
    name: 'QX',
    label: 'Qx',
    website: QUBIC_PROJECTS_URLS.QX,
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/Qx.h'
  },
  [SmartContracts.Quottery]: {
    name: 'QTRY',
    label: 'Quottery',
    website: QUBIC_PROJECTS_URLS.QUOTTERY,
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/Quottery.h'
  },
  [SmartContracts.Random]: {
    name: 'RANDOM',
    label: 'Random',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/Random.h'
  },
  [SmartContracts.QUtil]: {
    name: 'QUTIL',
    label: 'QUtil',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/QUtil.h'
  },
  [SmartContracts.MyLastMatch]: {
    name: 'MLM',
    label: 'My Last Match',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/MyLastMatch.h'
  },
  [SmartContracts.GeneralQuorumProposal]: {
    name: 'GQMPROP',
    label: 'General Quorum Proposal',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/GeneralQuorumProposal.h'
  },
  [SmartContracts.SupplyWatcher]: {
    name: 'SWATCH',
    label: 'Supply Watcher',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/SupplyWatcher.h'
  },
  [SmartContracts.ComputorControlledFund]: {
    name: 'CCF',
    label: 'Computor Controlled Fund',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/ComputorControlledFund.h',
    proposalUrl:
      'https://github.com/qubic/proposal/blob/e305392f2084dc72b4958c1a62d5af9cfa55785f/SmartContracts/2024-09-09-CCF.md'
  },
  [SmartContracts.QEarn]: {
    name: 'QEARN',
    label: 'QEarn',
    website: QUBIC_PROJECTS_URLS.QEARN,
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/Qearn.h',
    proposalUrl:
      'https://github.com/qubic/proposal/blob/e305392f2084dc72b4958c1a62d5af9cfa55785f/SmartContracts/2024-11-14-QEarn.md'
  },
  [SmartContracts.QVault]: {
    name: 'QVAULT',
    label: 'QVault',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/QVAULT.h',
    proposalUrl:
      'https://github.com/qubic/proposal/blob/e305392f2084dc72b4958c1a62d5af9cfa55785f/SmartContracts/2024-11-14-QEarn.md'
  },
  [SmartContracts.MSVault]: {
    name: 'MSVAULT',
    label: 'MSVault',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/MsVault.h',
    proposalUrl:
      'https://github.com/qubic/proposal/blob/e305392f2084dc72b4958c1a62d5af9cfa55785f/SmartContracts/2025-02-09-MSVAULT.md'
  },
  [SmartContracts.Qbay]: {
    name: 'QBAY',
    label: 'QBay',
    githubUrl: 'https://github.com/qubic/core/blob/main/src/contracts/Qbay.h',
    proposalUrl:
      'https://github.com/qubic/proposal/blob/e305392f2084dc72b4958c1a62d5af9cfa55785f/SmartContracts/2025-03-11-Qbay.md'
  }
} as const

export enum Tokens {
  QFT = 'TFUYVBXYIYBVTEMJHAJGEJOOZHJBQFVQLTBBKMEHPEVIZFXZRPEYFUWGTIWG',
  CFB = 'CFBMEMZOIDEXQAUXYYSZIURADQLAPWPMNJXQSNVQZAHYVOPYUKKJBJUCTVJL',
  QWALLET = 'QWALLETSGQVAGBHUCVVXWZXMBKQBPQQSHRYKZGEJWFVNUFCEDDPRMKTAUVHA',
  QCAP = 'QCAPWMYRSHLBJHSTTZQVCIBARVOASKDENASAKNOBRGPFWWKRCUVUAXYEZVOG',
  VSTB001 = 'VALISTURNWYFQAMVLAKJVOKJQKKBXZZFEASEYCAGNCFMZARJEMMFSESEFOWM',
  MATILDA = 'ZWQHZOEAWYKSGDPWWAQBAOKECCSASFCMLYZOJGBXNABXVZJZXKXOWRTFIQHC'
}

export const TOKENS: Record<Tokens, { name: string }> = {
  [Tokens.QFT]: {
    name: 'QFT'
  },
  [Tokens.CFB]: {
    name: 'CFB'
  },
  [Tokens.QWALLET]: {
    name: 'QWALLET'
  },
  [Tokens.QCAP]: {
    name: 'QCAP'
  },
  [Tokens.VSTB001]: {
    name: 'VSTB001'
  },
  [Tokens.MATILDA]: {
    name: 'MATILDA'
  }
} as const

export const EXCHANGES: ExchangeWallet[] = [
  {
    name: 'Gate.io',
    address: 'BYBYFUMBVLPUCANXEXTSKVMGFCJBMTLPPOFVPNSATABMWDGTMFXPLZLBCXJL'
  },
  {
    name: 'MEXC',
    address: 'VUEYKUCYYHXKDGOSCWAIEECECDBCXVUSUAJRVXUQVAQPGIOABLGGLXDAXTNK'
  },
  {
    name: 'Bitget 1',
    address: 'EXNRRBDPYFQPXFPXCMUHZVEEBRQCBEAUDYUBHKGTRCKHVSRAQXWHQCXDLZXL'
  },
  {
    name: 'Bitget 2',
    address: 'XYXGGGOWOYILTAAGGACSRWSANJJCKJQPEAECEYWKDDZDIYELTJPTDIVEHIUA'
  },
  {
    name: 'Tradeogre 1',
    address: 'IZTNWDKXSFULQADTOLTMLUPHSCFCXLOJMQOUHPBSRGQZMMXZCJYQFTRDOGRE'
  },
  {
    name: 'Tradeogre 2',
    address: 'GBXUREVUSESZWAFCHPESIYLBBODDFFFZJUXUGJAJIFPFHMJSJRGQHONDGQFL'
  },
  {
    name: 'Tradeogre 3',
    address: 'ETAWVIXKLVEBCFCNJBNFWMMZFGOAKBXTMARNBWYIKECASQWWBEXODQWBVBGK'
  },
  {
    name: 'Tradeogre 4',
    address: 'XXIOIPKQRCJIMAVIXQQTRWQVPKPCOUSHVUPPRWDSDDXYSKTJOHUKXZICPRDA'
  },
  {
    name: 'Tradeogre 5',
    address: 'BKCTLMGCIUAADAZQVCQCOFTGCYRDIKQRUYKWYKLEGHBELRBDLIQGRWAGFWQD'
  },
  {
    name: 'Tradeogre 6',
    address: 'NUJKVAKTLNMHMFMBZCXSHCLBYRPCTZVOWPWXGRTKLARFUTBVTPVELHBHYAHL'
  },
  {
    name: 'Safetrade 1',
    address: 'CLJHHZVRWAVBEAECXMCEIZOZOJLAMWCQMNYXXHQXOBGRUCXKVZCMBQECQJPE'
  },
  {
    name: 'Safetrade 2',
    address: 'VFWIEWBYSIMPBDHBXYFJVMLGKCCABZKRYFLQJVZTRBUOYSUHOODPVAHHKXPJ'
  },
  {
    name: 'Safetrade 3',
    address: 'EMSSYMCBMVXSSBZZDFFNLYTVZBVBWQNAWIEDYZLBDCFYIBAKFUOOGWLAEXCL'
  },
  {
    name: 'Safetrade 4',
    address: 'WTBHNKRMCBHKNGZAUQQQRTUOTPRAXRQTMSJKZLFKHABABZDDNDXIZXZGNJXE'
  },
  {
    name: 'Safetrade 5',
    address: 'CORSXCFMCTVSECCTNFEERFVUPTKDRGKALTIOWKLXSBQCSIGNTUGEKOXDNUGK'
  },
  {
    name: 'CoinEx',
    address: 'RGTOAPIIMQMFMDPQOIYLFEXOVNZAQRWMIMKMRVSKGFFIRMXXQPWQPRWAGHHI'
  },
  {
    name: 'Seven Seas',
    address: 'LZLDOEIBQWIUGGMZGOISLOAACDGAFVAMAYXSSJMLQBHSHWDBPMSDFTGAYRMN'
  }
]

export const ADDRESS_BOOK = [
  {
    label: 'Marketing (Matilda)',

    address: 'JICUNOMUXDPNPGBVDQAQVEKVNBRCKZMDCPHMXZSWTGOVATZLCZSMVXMBZPCM'
  },
  {
    label: 'Liquidity Pool (Matilda)',
    address: 'UFMYCIGCNBKEWDUTVOOOIXJOLBHCAHBVACLFFOBZEDKDWACOPWRBLFOGPYIL'
  }
]
