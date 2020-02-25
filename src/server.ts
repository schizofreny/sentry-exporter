import express from "express"
import got from "got"
import { register, Gauge } from "prom-client"
import env from "./env"

const app = express()
const port = env.PORT

app.get("/", (req, res) => {
  res.send('Sentry exporter <br/><br/> <a href="/metrics">metrics</a>')
})

const eventsGauge = new Gauge({ name: "sentry_project_events_total", help: "todo", labelNames: ["project"] })

interface Project {
  slug: string
  stats: [number, number][]
}

app.get("/metrics", async (req, res) => {
  const url = `https://sentry.io/api/0/organizations/${env.SENTRY_ORGANIZATION}/projects/?statsPeriod=24h`
  const headers = { Authorization: `Bearer ${env.SENTRY_API_TOKEN}` }
  const response = await got.get<Project[]>(url, { headers, responseType: "json" })

  response.body.forEach(project => {
    const lastStat = project.stats.sort((a, b) => b[0] - a[0])[0]
    eventsGauge.set({ project: project.slug }, lastStat[1])
  })

  res.set("Content-Type", register.contentType)
  res.send(register.metrics())
})

app.listen(port, () => console.log(`Server started on http://localhost:${port}`))
