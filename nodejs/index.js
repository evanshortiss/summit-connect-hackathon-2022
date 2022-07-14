'use strict'

const express = require('express')
const log = require('barelog')
const morgan = require('morgan')
const { contentType: metricsContentType } = require('prom-client')

const { HTTP_PORT } = require('./config')(process)
const getMetrics = require('./metrics')()
const app = express()

// Log incoming HTTP requests and responses
app.use(morgan())

// Kubernetes health/readiness endpoints
app.get("/readyz", (req, res) => res.status(200).json({ status: 'ok' }));
app.get('/livez', (req, res) => res.status(200).json({ status: 'ok' }));

app.get('/metrics', async (req, res) => {
  const metrics = await getMetrics()

  res.set('Content-Type', metricsContentType)
  res.end(metrics)
})

app.listen(HTTP_PORT, (err) => {
  if (err) throw err

  log(`started listning on ${HTTP_PORT}`)
})
