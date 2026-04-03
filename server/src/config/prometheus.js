const client = require('prom-client');

// Create a Registry to register the metrics
const register = new client.Registry();

// Enable collection of default metrics (process CPU, memory, event loop, etc.)
client.collectDefaultMetrics({
  register,
  prefix: 'nodejs_',
  labels: { app: 'school-management-system' },
});

// Create a histogram to measure HTTP request duration
const httpRequestDurationHistogram = new client.Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10], // Response time buckets
});

// Create a counter for total HTTP requests
const httpRequestCounter = new client.Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Create a counter for errors
const errorCounter = new client.Counter({
  name: 'application_errors_total',
  help: 'Total number of application errors',
  labelNames: ['type'],
});

// Register the metrics
register.registerMetric(httpRequestDurationHistogram);
register.registerMetric(httpRequestCounter);
register.registerMetric(errorCounter);

/**
 * Middleware to measure HTTP request duration
 * Records the time from request start to response finish
 */
const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  // Track when response finishes
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000; // Convert to seconds
    const route = req.route?.path || req.originalUrl || req.url;
    const statusCode = res.statusCode;

    // Record duration
    httpRequestDurationHistogram
      .labels(req.method, route, statusCode.toString())
      .observe(duration);

    // Increment request counter
    httpRequestCounter
      .labels(req.method, route, statusCode.toString())
      .inc();
  });

  next();
};

module.exports = {
  register,
  httpRequestDurationHistogram,
  httpRequestCounter,
  errorCounter,
  metricsMiddleware,
};
