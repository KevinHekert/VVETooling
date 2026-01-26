# ADR-005: Observability & Logging

## Status
**ACCEPTED** ✅

## Context

VVE Tooling MVP heeft een uptime requirement van 99.5% en performance targets (<2s page load, <500ms API). Om deze te halen én te maintainen, hebben we robuuste observability nodig:

### Functionele Requirements
- **Proactive Monitoring**: Detect issues voor users rapporteren
- **Debugging**: Snel root cause analysis bij production issues
- **Performance Monitoring**: Track API response times, database queries
- **Security Monitoring**: Detect unauthorized access attempts
- **Compliance**: Audit trail voor financiële transacties (7 jaar bewaarplicht)

### Niet-Functionele Requirements
- **99.5% Uptime SLA**: MTTD <5 min, MTTR <2 uur
- **Performance**: Logging mag <5ms overhead hebben
- **Retention**: 
  - Audit logs: 7 jaar (wettelijk)
  - Application logs: 90 dagen
  - Metrics: 15 maanden (CloudWatch default)
- **Cost**: Within budget (~€50/month monitoring)

### Team Context
- Klein team (geen dedicated ops engineer)
- 24/7 on-call niet realistisch
- Managed services preferred

---

## Decision

We kiezen voor een **AWS-native monitoring stack** met externe error tracking:

1. **AWS CloudWatch** - Logs, Metrics, Alarms (primary observability)
2. **Sentry** - Error tracking & performance monitoring (developer experience)
3. **AWS X-Ray** - Distributed tracing (optional, add indien nodig)

**Rationale:**
- CloudWatch is native AWS integration (minimal setup)
- Sentry heeft excellent developer experience (stack traces, user context)
- Cost-effective voor MVP schaal

---

### Observability Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                      APPLICATION                             │
│  (Node.js + Express)                                         │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Structured Logging (Winston)                          │ │
│  │  → JSON format                                         │ │
│  │  → Contextual fields (userId, tenantId, requestId)    │ │
│  └─────────────┬──────────────────────────────────────────┘ │
│                │                                             │
│  ┌─────────────▼──────────────────────────────────────────┐ │
│  │  Error Tracking (Sentry SDK)                           │ │
│  │  → Automatic error capture                             │ │
│  │  → Source maps for stack traces                        │ │
│  └─────────────┬──────────────────────────────────────────┘ │
│                │                                             │
│  ┌─────────────▼──────────────────────────────────────────┐ │
│  │  Metrics (Custom CloudWatch Metrics)                   │ │
│  │  → API latency, error rate, cache hit rate            │ │
│  └────────────────────────────────────────────────────────┘ │
└────────────────┬─────────────────────────────────────────────┘
                 │
       ┌─────────┼─────────┐
       │         │         │
       ▼         ▼         ▼
┌───────────┐ ┌──────┐ ┌──────────────┐
│CloudWatch │ │Sentry│ │X-Ray         │
│Logs       │ │      │ │(Optional)    │
└───────────┘ └──────┘ └──────────────┘
       │         │         │
       └─────────┼─────────┘
                 │
       ┌─────────▼─────────┐
       │  CloudWatch       │
       │  Alarms           │
       │  → PagerDuty/SNS  │
       └───────────────────┘
```

---

## Implementation

### 1. Structured Logging (Winston)

**Setup:**
```typescript
// lib/logger.ts
import winston from 'winston';

// Custom format for structured logging
const jsonFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: jsonFormat,
  defaultMeta: {
    service: 'vve-tooling-api',
    environment: process.env.NODE_ENV,
    version: process.env.APP_VERSION,
  },
  transports: [
    // Console output (captured by CloudWatch)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.printf(({ timestamp, level, message, ...meta }) => {
          return `${timestamp} [${level}]: ${message} ${
            Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
          }`;
        })
      ),
    }),
  ],
});

// Context-aware logger (adds request context)
export const createContextLogger = (context: {
  requestId?: string;
  userId?: string;
  tenantId?: string;
  ip?: string;
}) => {
  return logger.child(context);
};
```

**Usage in Application:**
```typescript
// middleware/request-logger.ts
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { createContextLogger } from '../lib/logger';

export const requestLogger = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const requestId = uuidv4();
  req.requestId = requestId;
  
  // Create context logger for this request
  req.logger = createContextLogger({
    requestId,
    userId: req.user?.userId,
    tenantId: req.tenantId,
    ip: req.ip,
  });
  
  // Log request
  req.logger.info('Incoming request', {
    method: req.method,
    url: req.url,
    userAgent: req.headers['user-agent'],
  });
  
  // Capture response time
  const startTime = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - startTime;
    
    req.logger.info('Request completed', {
      method: req.method,
      url: req.url,
      statusCode: res.statusCode,
      duration,
    });
  });
  
  next();
};
```

**Log Levels & Use Cases:**
```typescript
// ERROR: Application errors, exceptions
logger.error('Database connection failed', {
  error: err.message,
  stack: err.stack,
  query: sanitizedQuery,
});

// WARN: Potential issues, degraded performance
logger.warn('Slow database query detected', {
  query: query,
  duration: 850,
  threshold: 500,
});

// INFO: Normal application flow, business events
logger.info('Transaction created', {
  transactionId: transaction.id,
  amount: transaction.amount,
  tenantId: transaction.tenant_id,
});

// DEBUG: Detailed debugging information (only in development)
logger.debug('Cache lookup', {
  key: cacheKey,
  hit: !!cachedValue,
});
```

**Sensitive Data Filtering:**
```typescript
// lib/logger-sanitizer.ts
export const sanitizeLogData = (data: any): any => {
  if (typeof data !== 'object' || data === null) {
    return data;
  }
  
  const sensitiveFields = [
    'password',
    'token',
    'accessToken',
    'refreshToken',
    'creditCard',
    'ssn',
    'iban',
  ];
  
  const sanitized = { ...data };
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '***REDACTED***';
    }
  }
  
  return sanitized;
};

// Usage
logger.info('User login attempt', sanitizeLogData({
  email: user.email,
  password: 'secret123', // Will be redacted
  ip: req.ip,
}));
// Output: { email: 'user@example.com', password: '***REDACTED***', ip: '1.2.3.4' }
```

---

### 2. CloudWatch Logs

**Log Groups Structure:**
```
/aws/ecs/vve-tooling-api/production      # Application logs
/aws/ecs/vve-tooling-api/staging         # Staging logs
/aws/rds/vve-tooling-db/postgresql       # Database logs (slow queries, errors)
/aws/lambda/vve-tooling-*                # Lambda function logs (if applicable)
```

**Retention Policy:**
```typescript
// infrastructure/cloudwatch-logs.tf (Terraform)
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "/aws/ecs/vve-tooling-api/production"
  retention_in_days = 90  // Application logs: 90 dagen
}

resource "aws_cloudwatch_log_group" "audit_logs" {
  name              = "/aws/ecs/vve-tooling-api/audit"
  retention_in_days = 2557  // 7 jaar (wettelijk)
}
```

**CloudWatch Insights Queries:**
```sql
-- Find slow API requests (>500ms)
fields @timestamp, requestId, method, url, duration
| filter duration > 500
| sort duration desc
| limit 100

-- Error rate per endpoint
fields @timestamp, method, url, statusCode
| filter statusCode >= 400
| stats count() by method, url, statusCode
| sort count desc

-- Top users by request count
fields @timestamp, userId, method, url
| filter userId != ""
| stats count() by userId
| sort count desc
| limit 20

-- Failed authentication attempts
fields @timestamp, userId, ip, message
| filter message like /authentication failed/i
| stats count() by ip
| sort count desc
```

---

### 3. Error Tracking (Sentry)

**Setup:**
```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/node';
import { ProfilingIntegration } from '@sentry/profiling-node';

export const initSentry = () => {
  Sentry.init({
    dsn: process.env.SENTRY_DSN,
    environment: process.env.NODE_ENV,
    release: process.env.APP_VERSION,
    
    // Performance Monitoring
    tracesSampleRate: 0.1,  // 10% van requests traced (cost management)
    profilesSampleRate: 0.1,
    
    // Integrations
    integrations: [
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app: true }),
      new ProfilingIntegration(),
    ],
    
    // Filter sensitive data
    beforeSend(event, hint) {
      // Remove sensitive headers
      if (event.request?.headers) {
        delete event.request.headers['authorization'];
        delete event.request.headers['cookie'];
      }
      
      // Remove sensitive query params
      if (event.request?.query_string) {
        event.request.query_string = event.request.query_string
          .replace(/token=[^&]+/g, 'token=***')
          .replace(/password=[^&]+/g, 'password=***');
      }
      
      return event;
    },
  });
};

// Express middleware
export const sentryRequestHandler = Sentry.Handlers.requestHandler();
export const sentryTracingHandler = Sentry.Handlers.tracingHandler();
export const sentryErrorHandler = Sentry.Handlers.errorHandler();
```

**Integration in Express:**
```typescript
// app.ts
import express from 'express';
import { initSentry, sentryRequestHandler, sentryTracingHandler, sentryErrorHandler } from './lib/sentry';

const app = express();

// Initialize Sentry
initSentry();

// Sentry request handler MUST be first middleware
app.use(sentryRequestHandler);
app.use(sentryTracingHandler);

// ... other middleware and routes ...

// Sentry error handler MUST be before other error handlers
app.use(sentryErrorHandler);

// Custom error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    requestId: req.requestId,
  });
  
  res.status(500).json({
    error: 'Internal server error',
    requestId: req.requestId,
  });
});
```

**Manual Error Capture:**
```typescript
// Capture specific errors with context
try {
  await processTransaction(transaction);
} catch (error) {
  Sentry.captureException(error, {
    tags: {
      transaction_id: transaction.id,
      tenant_id: transaction.tenant_id,
    },
    extra: {
      transaction: transaction,
      user: req.user,
    },
    level: 'error',
  });
  
  throw error;
}

// Capture warning-level issues
Sentry.captureMessage('Slow query detected', {
  level: 'warning',
  extra: {
    query: query,
    duration: 850,
  },
});
```

---

### 4. Metrics & Monitoring

**Custom CloudWatch Metrics:**
```typescript
// lib/metrics.ts
import { CloudWatch } from 'aws-sdk';

const cloudwatch = new CloudWatch({ region: 'eu-central-1' });

export class MetricsCollector {
  private namespace = 'VVETooling';
  
  async recordMetric(
    name: string,
    value: number,
    unit: 'Count' | 'Milliseconds' | 'Percent' = 'Count',
    dimensions: Record<string, string> = {}
  ) {
    try {
      await cloudwatch.putMetricData({
        Namespace: this.namespace,
        MetricData: [
          {
            MetricName: name,
            Value: value,
            Unit: unit,
            Timestamp: new Date(),
            Dimensions: Object.entries(dimensions).map(([Name, Value]) => ({
              Name,
              Value,
            })),
          },
        ],
      }).promise();
    } catch (error) {
      logger.error('Failed to send metric to CloudWatch', { error });
    }
  }
  
  // Helper methods
  async recordApiLatency(endpoint: string, duration: number) {
    await this.recordMetric('ApiLatency', duration, 'Milliseconds', {
      Endpoint: endpoint,
    });
  }
  
  async recordDatabaseQueryTime(query: string, duration: number) {
    await this.recordMetric('DatabaseQueryTime', duration, 'Milliseconds', {
      QueryType: query,
    });
  }
  
  async recordCacheHit(hit: boolean) {
    await this.recordMetric('CacheHitRate', hit ? 1 : 0, 'Count', {
      Result: hit ? 'Hit' : 'Miss',
    });
  }
  
  async recordErrorRate(endpoint: string, statusCode: number) {
    await this.recordMetric('ErrorRate', 1, 'Count', {
      Endpoint: endpoint,
      StatusCode: statusCode.toString(),
    });
  }
}

export const metrics = new MetricsCollector();
```

**Usage in Middleware:**
```typescript
// middleware/metrics-collector.ts
export const metricsCollector = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const startTime = Date.now();
  
  res.on('finish', async () => {
    const duration = Date.now() - startTime;
    const endpoint = `${req.method} ${req.route?.path || req.path}`;
    
    // Record API latency
    await metrics.recordApiLatency(endpoint, duration);
    
    // Record error rate (if 4xx or 5xx)
    if (res.statusCode >= 400) {
      await metrics.recordErrorRate(endpoint, res.statusCode);
    }
  });
  
  next();
};
```

---

### 5. Alarms & Alerting

**CloudWatch Alarms Configuration:**
```typescript
// infrastructure/cloudwatch-alarms.tf
resource "aws_cloudwatch_metric_alarm" "api_high_error_rate" {
  alarm_name          = "vve-tooling-high-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ErrorRate"
  namespace           = "VVETooling"
  period              = "300"  // 5 minuten
  statistic           = "Sum"
  threshold           = "50"   // More than 50 errors in 5 min
  alarm_description   = "High error rate detected"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "api_slow_response" {
  alarm_name          = "vve-tooling-slow-api"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "ApiLatency"
  namespace           = "VVETooling"
  period              = "300"
  statistic           = "Average"
  threshold           = "1000"  // Average >1 second
  alarm_description   = "API response time too slow"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "database_slow_queries" {
  alarm_name          = "vve-tooling-slow-queries"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "DatabaseQueryTime"
  namespace           = "VVETooling"
  period              = "300"
  statistic           = "p95"
  threshold           = "500"   // p95 >500ms
  alarm_description   = "Database queries are slow"
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

// SNS Topic voor alerts
resource "aws_sns_topic" "alerts" {
  name = "vve-tooling-alerts"
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = "ops@vvetooling.nl"
}
```

**Alert Severity Levels:**
```
P0 (Critical):
- API error rate >10% (service degraded)
- Database connection failures
- Authentication service down
→ Immediate response required (within 15 min)

P1 (High):
- API latency p95 >1000ms (slow but working)
- Database slow queries p95 >500ms
- Memory usage >80%
→ Response within 1 hour

P2 (Medium):
- Cache hit rate <50% (suboptimal)
- Disk usage >70%
→ Response within 4 hours

P3 (Low):
- Info logs (capacity planning)
→ No immediate action required
```

---

### 6. Audit Logging (Compliance)

**Audit Log Schema:**
```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp TIMESTAMP DEFAULT NOW(),
  tenant_id UUID,
  user_id UUID,
  action VARCHAR(100) NOT NULL,  -- 'create', 'update', 'delete', 'login', etc.
  resource VARCHAR(100) NOT NULL, -- 'transaction', 'user', 'settings', etc.
  resource_id VARCHAR(255),
  result VARCHAR(50),  -- 'success', 'failure', 'unauthorized'
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  request_id VARCHAR(255),
  
  INDEX idx_audit_tenant_timestamp (tenant_id, timestamp DESC),
  INDEX idx_audit_user_timestamp (user_id, timestamp DESC),
  INDEX idx_audit_resource (resource, resource_id)
);

-- Partitioning by year (for 7-year retention)
CREATE TABLE audit_logs_2026 PARTITION OF audit_logs
  FOR VALUES FROM ('2026-01-01') TO ('2027-01-01');
```

**Audit Logger:**
```typescript
// lib/audit-logger.ts
export class AuditLogger {
  async log(params: {
    tenantId?: string;
    userId?: string;
    action: string;
    resource: string;
    resourceId?: string;
    result: 'success' | 'failure' | 'unauthorized';
    details?: any;
    ip?: string;
    userAgent?: string;
    requestId?: string;
  }) {
    try {
      await db.query(
        `INSERT INTO audit_logs 
         (tenant_id, user_id, action, resource, resource_id, result, details, ip_address, user_agent, request_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          params.tenantId,
          params.userId,
          params.action,
          params.resource,
          params.resourceId,
          params.result,
          params.details ? JSON.stringify(params.details) : null,
          params.ip,
          params.userAgent,
          params.requestId,
        ]
      );
    } catch (error) {
      logger.error('Failed to write audit log', { error, params });
      // Don't throw - audit logging failure shouldn't break application
    }
  }
}

export const auditLogger = new AuditLogger();
```

**Usage:**
```typescript
// In route handlers
router.post('/vves/:vveId/transactions', async (req, res) => {
  try {
    const transaction = await createTransaction(req.body);
    
    // Audit log: successful creation
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.userId,
      action: 'create',
      resource: 'transaction',
      resourceId: transaction.id,
      result: 'success',
      details: { amount: transaction.amount, type: transaction.type },
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      requestId: req.requestId,
    });
    
    res.status(201).json({ data: transaction });
  } catch (error) {
    // Audit log: failed creation
    await auditLogger.log({
      tenantId: req.tenantId,
      userId: req.user.userId,
      action: 'create',
      resource: 'transaction',
      result: 'failure',
      details: { error: error.message },
      ip: req.ip,
      requestId: req.requestId,
    });
    
    throw error;
  }
});
```

---

### 7. Dashboards

**CloudWatch Dashboard:**
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "title": "API Latency (p50, p95, p99)",
        "metrics": [
          ["VVETooling", "ApiLatency", {"stat": "p50"}],
          ["...", {"stat": "p95"}],
          ["...", {"stat": "p99"}]
        ],
        "period": 300,
        "region": "eu-central-1",
        "yAxis": { "left": { "min": 0, "max": 2000 } }
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Error Rate",
        "metrics": [
          ["VVETooling", "ErrorRate", {"stat": "Sum"}]
        ],
        "period": 300,
        "region": "eu-central-1"
      }
    },
    {
      "type": "metric",
      "properties": {
        "title": "Database Query Time",
        "metrics": [
          ["VVETooling", "DatabaseQueryTime", {"stat": "p95"}]
        ],
        "period": 300,
        "region": "eu-central-1"
      }
    },
    {
      "type": "log",
      "properties": {
        "title": "Recent Errors",
        "query": "SOURCE '/aws/ecs/vve-tooling-api/production'\n| fields @timestamp, @message\n| filter level = 'error'\n| sort @timestamp desc\n| limit 20",
        "region": "eu-central-1"
      }
    }
  ]
}
```

---

## Consequences

### Positieve Gevolgen

✅ **Proactive Issue Detection:**
- CloudWatch alarms detect issues binnen 5 minuten
- Sentry captures errors automatically (no user report needed)
- Slow query detection before performance degrades

✅ **Fast Debugging:**
- Structured logs met request context (requestId, userId, tenantId)
- Sentry stack traces with source maps
- CloudWatch Insights queries

✅ **Compliance:**
- 7-year audit trail voor financiële transacties
- Complete traceability (who did what when)
- Tamper-proof logging (append-only)

✅ **Cost-Effective:**
- CloudWatch: ~€20-30/maand (within free tier mostly)
- Sentry free tier: 5K events/maand (voldoende MVP)
- Total: ~€30-50/maand

---

### Negatieve Gevolgen

⚠️ **Performance Overhead:**
- Logging: ~2-5ms per request
- Metrics: ~1-3ms per request
- **Acceptable**: <5ms total overhead within budget

⚠️ **Cost Scaling:**
- CloudWatch costs schalen met log volume
- Sentry costs na 5K events/maand
- **Mitigation**: Log sampling, retention policies

⚠️ **Alert Fatigue:**
- Te veel alarms = ignored alarms
- **Mitigation**: Careful threshold tuning, alert aggregation

---

## References

- [AWS CloudWatch Best Practices](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Best_Practice_Recommended_Alarms_AWS_Services.html)
- [Sentry Documentation](https://docs.sentry.io/)
- [Logging Best Practices](https://www.sumologic.com/blog/log-management-analysis/)
- `docs/architecture/principles/01-architectuurprincipes-kaders.md` Principe 6

---

## Decision Log

| Datum | Beslissing | Rationale |
|-------|------------|-----------|
| 2026-01-26 | AWS CloudWatch primary | Native AWS, cost-effective |
| 2026-01-26 | Sentry for errors | Best developer experience |
| 2026-01-26 | Structured JSON logging | CloudWatch Insights queries |
| 2026-01-26 | 7-year audit retention | Compliance requirement |
| 2026-01-26 | X-Ray deferred | Add complexity, evaluate later |

---

**Last Updated**: 2026-01-26  
**Next Review**: Q2 2027
