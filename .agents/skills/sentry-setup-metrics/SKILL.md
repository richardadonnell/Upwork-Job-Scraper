---
name: sentry-setup-metrics
description: Setup Sentry Metrics in any project. Use when asked to add custom metrics, track counters/gauges/distributions, or instrument application performance. Supports JavaScript, Python, and Ruby.
license: Apache-2.0
---

# Setup Sentry Metrics

Configure Sentry's custom metrics for tracking counters, gauges, and distributions.

## Invoke This Skill When

- User asks to "add Sentry metrics" or "track custom metrics"
- User wants counters, gauges, or distributions
- User asks about `Sentry.metrics` or `sentry_sdk.metrics`

**Important:** The SDK versions, API names, and code samples below are examples. Always verify against [docs.sentry.io](https://docs.sentry.io) before implementing, as APIs and minimum versions may have changed.

## Quick Reference

Check [Sentry Metrics Getting Started](https://docs.sentry.io/product/explore/metrics/getting-started/) for the full list of supported SDKs and minimum versions. Examples below use JavaScript and Python:

| Platform | Min SDK | API | Status |
|----------|---------|-----|--------|
| JavaScript | 10.25.0+ | `Sentry.metrics.*` | Open Beta |
| Python | 2.44.0+ | `sentry_sdk.metrics.*` | Open Beta |
| Ruby | 6.3.0+ | `Sentry.metrics.*` | Open Beta |

## Metric Types

| Type | Purpose | Example Use Cases |
|------|---------|-------------------|
| **Counter** | Cumulative counts | API calls, clicks, errors |
| **Gauge** | Point-in-time values | Queue depth, memory, connections |
| **Distribution** | Statistical values | Response times, cart amounts |

## JavaScript Setup

Metrics are **enabled by default** in SDK 10.25.0+.

### Counter
```javascript
Sentry.metrics.count("api_call", 1, {
  attributes: { endpoint: "/api/users", status_code: 200 },
});
```

### Gauge
```javascript
Sentry.metrics.gauge("queue_depth", 42, {
  unit: "none",
  attributes: { queue: "jobs" },
});
```

### Distribution
```javascript
Sentry.metrics.distribution("response_time", 187.5, {
  unit: "millisecond",
  attributes: { endpoint: "/api/products" },
});
```

### Filtering (optional)
```javascript
Sentry.init({
  beforeSendMetric: (metric) => {
    if (metric.attributes?.sensitive) return null;
    return metric;
  },
});
```

## Python Setup

Metrics are **enabled by default** in SDK 2.44.0+.

### Counter
```python
sentry_sdk.metrics.count("api_call", 1, attributes={"endpoint": "/api/users"})
```

### Gauge
```python
sentry_sdk.metrics.gauge("queue_depth", 42, attributes={"queue": "jobs"})
```

### Distribution
```python
sentry_sdk.metrics.distribution(
    "response_time", 187.5,
    unit="millisecond",
    attributes={"endpoint": "/api/products"}
)
```

### Filtering (optional)
```python
def before_send_metric(metric, hint):
    if metric.get("attributes", {}).get("sensitive"):
        return None
    return metric

sentry_sdk.init(dsn="YOUR_DSN", before_send_metric=before_send_metric)
```

## Common Units

| Category | Values |
|----------|--------|
| Time | `millisecond`, `second`, `minute`, `hour` |
| Size | `byte`, `kilobyte`, `megabyte` |
| Currency | `usd`, `eur`, `gbp` |
| Other | `none`, `percent`, `ratio` |

## Timing Helper Pattern

### JavaScript
```javascript
async function withTiming(name, fn, attrs = {}) {
  const start = performance.now();
  try { return await fn(); }
  finally {
    Sentry.metrics.distribution(name, performance.now() - start, {
      unit: "millisecond", attributes: attrs,
    });
  }
}
```

### Python
```python
import time, sentry_sdk

def track_duration(name, **attrs):
    def decorator(fn):
        def wrapper(*args, **kwargs):
            start = time.time()
            try: return fn(*args, **kwargs)
            finally:
                sentry_sdk.metrics.distribution(
                    name, (time.time() - start) * 1000,
                    unit="millisecond", attributes=attrs
                )
        return wrapper
    return decorator
```

## Ruby Setup

Metrics are **enabled by default** in SDK 6.3.0+.

### Counter
```ruby
Sentry.metrics.count("api_call", 1, attributes: { endpoint: "/api/users" })
```

### Gauge
```ruby
Sentry.metrics.gauge("queue_depth", 42, attributes: { queue: "jobs" })
```

### Distribution
```ruby
Sentry.metrics.distribution("response_time", 187.5, unit: "millisecond", attributes: { endpoint: "/api/products" })
```

## Best Practices

- **Stay under 2KB per metric**: Each metric event has a 2KB size limit — keep attribute sets concise
- **Namespaced names**: `api.request.duration`, not `duration`
- **Flush on exit**: Call `Sentry.flush()` before process exit

## Verification

After adding a metric, trigger the code path that emits it and check the Sentry Metrics dashboard (Explore > Metrics). Metrics may take a few minutes to appear due to buffer flushing.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Metrics not appearing | Verify SDK version, check DSN, wait for buffer flush |
| Metric dropped silently | Check that metric event is under 2KB size limit — reduce attributes |
| Too many metrics | Use `beforeSendMetric` to filter |
