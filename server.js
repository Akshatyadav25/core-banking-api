require('dotenv').config();
const fs = require('fs');
const https = require('https');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const promClient = require('prom-client');
const accountsRouter = require('./routes/accounts');
const errorHandler = require('./middleware/errorHandler');
const logger = require('./middleware/logger');
const auth = require('./middleware/auth');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const swaggerDocument = YAML.load('./docs/openapi.yaml');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const USE_HTTPS = process.env.USE_HTTPS === 'true';

// Metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics();

app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        "script-src": ["'self'", "'unsafe-inline'"],
        "script-src-attr": ["'unsafe-inline'"],
      },
    },
  })
);
app.use(express.json());
app.use(logger);
app.use(morgan('combined'));
app.use(express.static('public'));

// Swagger/OpenAPI docs (should be before auth middleware)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Auth middleware (protects all other routes)
app.use(auth);

// Metrics endpoint
app.get('/metrics', async (req, res) => {
  res.set('Content-Type', promClient.register.contentType);
  res.end(await promClient.register.metrics());
});

// Routes
app.use('/accounts', accountsRouter);

// Error handler
app.use(errorHandler);

if (USE_HTTPS) {
  // For dev: generate self-signed certs or use provided ones
  const key = fs.readFileSync(process.env.SSL_KEY_PATH || './cert/key.pem');
  const cert = fs.readFileSync(process.env.SSL_CERT_PATH || './cert/cert.pem');
  https.createServer({ key, cert }, app).listen(PORT, () => {
    console.log(`🚀 HTTPS server running at https://localhost:${PORT}`);
    console.log(`📚 Swagger UI: https://localhost:${PORT}/api-docs`);
  });
} else {
  app.listen(PORT, () => {
    console.log(`🚀 HTTP server running at http://localhost:${PORT}`);
    console.log(`📚 Swagger UI: http://localhost:${PORT}/api-docs`);
  });
} 