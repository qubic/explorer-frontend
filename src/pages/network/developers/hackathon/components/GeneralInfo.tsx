import { CardItem } from '@app/pages/network/components'

export default function GeneralInfo() {
  return (
    <section className="space-y-6">
      <div className="grid gap-20 md:grid-cols-2">
        <CardItem className="p-16">
          <h3 className="text-primary-100 mb-2 text-lg font-semibold">Hackathon Repository</h3>
          <p className="text-sm text-gray-50">
            Access all hackathon instructions, smart contract deployment scripts, and CLI examples
            in the official{' '}
            <a
              href="https://github.com/qubic/hackathon-madrid"
              className="text-primary-30"
              target="_blank"
              rel="noreferrer"
            >
              GitHub repository
            </a>{' '}
            . This is your go-to resource throughout the event.
          </p>
        </CardItem>

        <CardItem className="p-16">
          <h3 className="text-primary-100 mb-2 text-lg font-semibold">RPC Info</h3>
          <p className="text-sm text-gray-50">
            Access the{' '}
            <a
              href="https://docs.qubic.org/api/rpc"
              className="text-primary-30"
              target="_blank"
              rel="noreferrer"
            >
              RPC documentation
            </a>{' '}
            to interact with the testnet. Everything you need to connect is available in our dev
            resources.
          </p>
        </CardItem>

        <CardItem className="p-16">
          <h3 className="text-primary-100 mb-2 text-lg font-semibold">Testnet Qubics</h3>
          <p className="text-sm text-gray-50">
            Claim Qubics using the faucet in{' '}
            <a
              href="https://discord.com/channels/768887649540243497/1253254239447158827"
              className="font-mono text-primary-30"
              target="_blank"
              rel="noreferrer"
            >
              #bot-commands
            </a>{' '}
            on Discord. These tokens are for testing only and hold no real-world value.
          </p>
        </CardItem>

        <CardItem className="p-16">
          <h3 className="text-primary-100 mb-2 text-lg font-semibold">Smart Contract Testing</h3>
          <p className="text-sm text-gray-50">
            Need a dedicated testnet node for smart contract testing? Reach out in the{' '}
            <a
              href="https://discord.com/channels/768887649540243497/1087017597133922474"
              className="font-mono text-primary-30"
              target="_blank"
              rel="noreferrer"
            >
              #dev
            </a>{' '}
            channel on Discord to get set up.
          </p>
        </CardItem>
      </div>
    </section>
  )
}
