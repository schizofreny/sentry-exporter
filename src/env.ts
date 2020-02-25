import envalid, { port, str } from "envalid"

const config = envalid.cleanEnv(
  process.env,
  {
    PORT: port({ default: 3000 }),
    SENTRY_ORGANIZATION: str(),
    SENTRY_API_TOKEN: str()
  },
  {
    strict: true
  }
)

export default config
