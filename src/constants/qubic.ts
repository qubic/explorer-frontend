import type { ExchangeWallet } from '@app/types'

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
  QVault = 'KAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAXIUO'
}

export const SMART_CONTRACTS: Record<SmartContracts, { name: string; label: string }> = {
  [SmartContracts.Qx]: {
    name: 'QX',
    label: 'Qx'
  },
  [SmartContracts.Quottery]: {
    name: 'QTRY',
    label: 'Quottery'
  },
  [SmartContracts.Random]: {
    name: 'RANDOM',
    label: 'Random'
  },
  [SmartContracts.QUtil]: {
    name: 'QUTIL',
    label: 'QUtil'
  },
  [SmartContracts.MyLastMatch]: {
    name: 'MLM',
    label: 'My Last Match'
  },
  [SmartContracts.GeneralQuorumProposal]: {
    name: 'GQMPROP',
    label: 'General Quorum Proposal'
  },
  [SmartContracts.SupplyWatcher]: {
    name: 'SWATCH',
    label: 'Supply Watcher'
  },
  [SmartContracts.ComputorControlledFund]: {
    name: 'CCF',
    label: 'Computor Controlled Fund'
  },
  [SmartContracts.QEarn]: {
    name: 'QEARN',
    label: 'QEarn'
  },
  [SmartContracts.QVault]: {
    name: 'QVAULT',
    label: 'QVault'
  }
} as const

export enum Tokens {
  QFT = 'TFUYVBXYIYBVTEMJHAJGEJOOZHJBQFVQLTBBKMEHPEVIZFXZRPEYFUWGTIWG',
  CFB = 'CFBMEMZOIDEXQAUXYYSZIURADQLAPWPMNJXQSNVQZAHYVOPYUKKJBJUCTVJL',
  QWALLET = 'QWALLETSGQVAGBHUCVVXWZXMBKQBPQQSHRYKZGEJWFVNUFCEDDPRMKTAUVHA',
  QCAP = 'QCAPWMYRSHLBJHSTTZQVCIBARVOASKDENASAKNOBRGPFWWKRCUVUAXYEZVOG',
  VSTB001 = 'VALISTURNWYFQAMVLAKJVOKJQKKBXZZFEASEYCAGNCFMZARJEMMFSESEFOWM'
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
    name: 'Bitget',
    address: 'EXNRRBDPYFQPXFPXCMUHZVEEBRQCBEAUDYUBHKGTRCKHVSRAQXWHQCXDLZXL'
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
  }
]
