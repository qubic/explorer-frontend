# explorer-frontend

## Getting Started

This section provides a step-by-step guide on how to set up your environment, install dependencies,
and run the project along with a local API proxy for development purposes.

### Step 1: Clone the Repository

Start by cloning the repository to your local machine:

```
git clone <repository-url>
cd <project-directory-name>
```

### Step 2: Configure Environment Variables

Before running the project, you must configure environment-specific variables for development environment.

- **Development Environment**:

  Copy the `.env.example` file, renaming it to `.env`:

  ```
  cp .env.example .env
  ```

  Open this file and add the development API URL:

  ```
  VITE_ENABLE_PROXY=true
  VITE_NETWORK=mainnet
  VITE_QLI_API_URL=/dev-proxy-qli-api
  VITE_QUBIC_RPC_URL=/dev-proxy-archiver-api
  VITE_STATIC_API_URL=/dev-proxy-static-api
  ```

  **Environment Variables Explained:**

  - `VITE_ENABLE_PROXY`: Enable local development proxy (set to `true` for development)
  - `VITE_NETWORK`: Network mode (`mainnet` or `testnet`)
  - `VITE_QLI_API_URL`: Qubic Li API URL for transactions and address history
  - `VITE_QUBIC_RPC_URL`: Qubic RPC/Archiver URL for network stats and blockchain data
  - `VITE_STATIC_API_URL`: Qubic Static API URL for smart contracts, tokens, and exchange data

Ensure these files are not committed to the repository to protect sensitive information.

### Step 3: Install Dependencies

Install the project's dependencies by running:

```
pnpm install --frozen-lockfile
```

This command installs all necessary dependencies required for the project to run.

### Step 5: Start the Development Server

To start the project in development mode, run:

```
pnpm run dev
```

This will start the Vite React development server, typically available at
[http://localhost:5173](http://localhost:5173). Navigate to this URL in your browser to view the
application.

## License

As we use some parts from the 451 Package to our Wallet also apply the Anti-Military License. See
https://github.com/computor-tools/qubic-js Further our Wallet Code is protected by the AGPL-3.0
License. You may use our Source-Code for what you need to do business.
