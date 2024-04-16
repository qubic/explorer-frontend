# explorer-frontend

## Getting Started

This section provides a step-by-step guide on how to set up your environment, install dependencies, and run the project along with a local API proxy for development purposes.

### Step 1: Clone the Repository

Start by cloning the repository to your local machine:

```
git clone <repository-url>
cd <project-directory-name>
```

### Step 2: Configure Environment Variables

Before running the project, you must configure environment-specific variables for development and production environments.

- **Development Environment**:
  
  Copy the `.env.development.local.example` file, renaming it to `.env.development.local`:

  ```
  cp .env.development.local.example .env.development.local
  ```

  Open this file and add the development API URL:
  
  ```
  REACT_APP_API_URL=http://localhost:7003
  ```

- **Production Environment**:

  Copy the `.env.production.local.example` file, renaming it to `.env.production.local`:

  ```
  cp .env.production.local.example .env.production.local
  ```

  Then, set the production API URL:
  
  ```
  REACT_APP_API_URL=https://api.qubic.li
  ```

Ensure these files are not committed to the repository to protect sensitive information.

### Step 3: Install Dependencies

Install the project's dependencies by running:

```
npm install
```

This command installs all necessary dependencies required for the project to run.

### Step 4: Run the Local API Proxy

For local development, especially if you need to work with APIs, run the local API proxy:

```
npm run start-api-proxy
```

This command starts a proxy server that facilitates communication between the frontend application running on port 3000 and the backend API or external services, as specified in your `.env.development.local`.

### Step 5: Start the Development Server

To start the project in development mode, run:

```
npm start
```

This will start the React development server, typically available at [http://localhost:3000](http://localhost:3000). Navigate to this URL in your browser to view the application.


Ensure the `start-api-proxy` script is correctly defined in your `package.json`:

```json
"scripts": {
  "start-api-proxy": "node dev-proxy.js",
  ...
}
```

This script should be tailored to your development setup, proxying requests to the appropriate backend service or external API.

## License
As we use some parts from the 451 Package to our Wallet also apply the Anti-Military License. See https://github.com/computor-tools/qubic-js
Further our Wallet Code is protected by the AGPL-3.0 License. You may use our Source-Code for what you need to do business.