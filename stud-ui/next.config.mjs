/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },

  images: {
    unoptimized: true,
  },

  env: {
    RPC_URL: process.env.RPC_URL,
    CHAIN_ID: process.env.CHAIN_ID,

    BACKEND_URL: process.env.BACKEND_URL,
    STUD_BACKEND_URL: process.env.STUD_BACKEND_URL,

    STUD_REGISTRY_ADDRESS:
      process.env.STUD_REGISTRY_ADDRESS,

    PAIR_REGISTRY_ADDRESS:
      process.env.PAIR_REGISTRY_ADDRESS,

    MILESTONE_MANAGER_ADDRESS:
      process.env.MILESTONE_MANAGER_ADDRESS,

    MOCK_USDC_ADDRESS:
      process.env.MOCK_USDC_ADDRESS,

    PAIR_MARKET_FACTORY_ADDRESS:
      process.env.PAIR_MARKET_FACTORY_ADDRESS,

    PREDICTION_FACTORY_ADDRESS:
      process.env.PREDICTION_FACTORY_ADDRESS,

    WORLD_APP_ID:
      process.env.WORLD_APP_ID,

    WORLD_RP_ID:
      process.env.WORLD_RP_ID,

    WORLD_ENVIRONMENT:
      process.env.WORLD_ENVIRONMENT,
  },
}

export default nextConfig