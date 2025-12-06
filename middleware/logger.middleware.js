// Logger middleware for request/response tracking

const logger = (req, res, next) => {
  const start = Date.now()

  res.on("finish", () => {
    const duration = Date.now() - start
    const log = {
      method: req.method,
      url: req.url,
      status: res.statusCode,
      duration: `${duration}ms`,
      timestamp: new Date().toISOString(),
    }

    console.log(JSON.stringify(log))
  })

  next()
}

module.exports = logger
