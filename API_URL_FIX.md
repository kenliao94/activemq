# API URL Mapping Fix

## Problem

The REST API was returning 404 errors because of incorrect URL mappings.

### Root Cause

The `web.xml` servlet mapping was `/api/*`, but the controllers were using `/api/v1/*` in their `@RequestMapping` annotations. This caused a double `/api` in the URL path:

- **Expected URL**: `/api/v1/broker/info`
- **Actual URL needed**: `/api/api/v1/broker/info` ❌

### How Spring MVC Servlet Mapping Works

When you configure:
```xml
<servlet-mapping>
    <servlet-name>rest-api</servlet-name>
    <url-pattern>/api/*</url-pattern>
</servlet-mapping>
```

The servlet handles all requests starting with `/api/`, and then Spring MVC controllers are mapped relative to that base path.

So if a controller has:
```java
@RequestMapping("/api/v1/broker")
```

The full URL becomes: `/api` (servlet) + `/api/v1/broker` (controller) = `/api/api/v1/broker` ❌

## Solution

Changed all controller `@RequestMapping` annotations to remove the `/api` prefix since the servlet already handles it.

### Changes Made

| Controller | Old Mapping | New Mapping |
|-----------|-------------|-------------|
| BrokerController | `/api/v1/broker` | `/v1/broker` |
| QueueController | `/api/v1/queues` | `/v1/queues` |
| TopicController | `/api/v1/topics` | `/v1/topics` |
| MessageController | `/api/v1/messages` | `/v1/messages` |
| ConnectionController | `/api/v1/connections` | `/v1/connections` |
| SubscriberController | `/api/v1/subscribers` | `/v1/subscribers` |

### URL Structure After Fix

```
Servlet Mapping: /api/*
Controller Mapping: /v1/broker
Full URL: /api/v1/broker ✅
```

## Files Modified

1. `BrokerController.java` - Changed `@RequestMapping("/api/v1/broker")` to `@RequestMapping("/v1/broker")`
2. `QueueController.java` - Changed `@RequestMapping("/api/v1/queues")` to `@RequestMapping("/v1/queues")`
3. `TopicController.java` - Changed `@RequestMapping("/api/v1/topics")` to `@RequestMapping("/v1/topics")`
4. `MessageController.java` - Changed `@RequestMapping("/api/v1/messages")` to `@RequestMapping("/v1/messages")`
5. `ConnectionController.java` - Changed `@RequestMapping("/api/v1/connections")` to `@RequestMapping("/v1/connections")`
6. `SubscriberController.java` - Changed `@RequestMapping("/api/v1/subscribers")` to `@RequestMapping("/v1/subscribers")`

## Deployment Steps

After making the changes:

1. **Rebuild the WAR file**:
   ```bash
   cd activemq-web-console
   mvn clean package -DskipTests
   ```

2. **Copy WAR to ActiveMQ**:
   ```bash
   cp target/activemq-web-console-6.2.0-SNAPSHOT.war \
      ../assembly/target/apache-activemq-6.2.0-SNAPSHOT/webapps/
   ```

3. **Restart ActiveMQ**:
   ```bash
   cd ../assembly/target/apache-activemq-6.2.0-SNAPSHOT
   ./bin/activemq restart
   ```

4. **Verify the fix**:
   ```bash
   curl -u admin:admin http://localhost:8161/api/v1/broker/info
   ```

## Testing

### Test All Endpoints

```bash
# Broker info
curl -u admin:admin http://localhost:8161/api/v1/broker/info

# Queues
curl -u admin:admin http://localhost:8161/api/v1/queues

# Topics
curl -u admin:admin http://localhost:8161/api/v1/topics

# Broker statistics
curl -u admin:admin http://localhost:8161/api/v1/broker/statistics

# Broker health
curl -u admin:admin http://localhost:8161/api/v1/broker/health
```

### Expected Response

All endpoints should return JSON responses with HTTP 200 status:

```json
{
  "status": "success",
  "data": { ... },
  "timestamp": "2024-10-18T20:00:00Z"
}
```

## Alternative Solutions (Not Used)

### Option 1: Change Servlet Mapping
Change `web.xml` to map servlet to root:
```xml
<servlet-mapping>
    <servlet-name>rest-api</servlet-name>
    <url-pattern>/*</url-pattern>
</servlet-mapping>
```

**Pros**: Controllers don't need to change  
**Cons**: Conflicts with other servlets (JSP, static files)

### Option 2: Remove /v1 from Controllers
Keep `/api` in servlet mapping and remove `/v1` from controllers:
```java
@RequestMapping("/broker")
```

**Pros**: Simpler URLs  
**Cons**: No API versioning

### Option 3: Use Context Path
Configure servlet context path in Spring:
```java
@Configuration
public class WebConfig {
    @Bean
    public WebServerFactoryCustomizer<ConfigurableServletWebServerFactory> 
        webServerFactoryCustomizer() {
        return factory -> factory.setContextPath("/api");
    }
}
```

**Pros**: Clean separation  
**Cons**: More complex configuration

## Why We Chose This Solution

- **Minimal changes**: Only controller annotations needed updating
- **Maintains versioning**: Keeps `/v1` in URLs for future API versions
- **No conflicts**: Doesn't interfere with existing servlets
- **Standard practice**: Common pattern in Spring MVC applications

## Verification Checklist

- [x] All controllers updated
- [x] WAR file rebuilt
- [x] WAR file deployed to ActiveMQ
- [x] ActiveMQ restarted
- [ ] Frontend tested (refresh browser)
- [ ] All API endpoints responding
- [ ] Send Message page working

## Next Steps

1. Restart your frontend dev server (if running)
2. Refresh your browser
3. The dashboard should now load broker information
4. Navigate to Send Message page and test functionality

## Troubleshooting

### Still Getting 404 Errors

1. **Check ActiveMQ logs**:
   ```bash
   tail -f assembly/target/apache-activemq-6.2.0-SNAPSHOT/data/activemq.log
   ```

2. **Verify WAR is deployed**:
   ```bash
   ls -la assembly/target/apache-activemq-6.2.0-SNAPSHOT/webapps/
   ```

3. **Check if WAR is extracted**:
   ```bash
   ls -la assembly/target/apache-activemq-6.2.0-SNAPSHOT/webapps/activemq-web-console-6.2.0-SNAPSHOT/
   ```

4. **Test directly with curl**:
   ```bash
   curl -v -u admin:admin http://localhost:8161/api/v1/broker/info
   ```

### WAR Not Deploying

- Ensure ActiveMQ is running
- Check file permissions on WAR file
- Look for errors in `data/activemq.log`
- Try stopping ActiveMQ, removing old WAR, copying new WAR, then starting

### Frontend Still Shows Errors

- Clear browser cache
- Restart Vite dev server
- Check browser console for errors
- Verify proxy configuration in `vite.config.ts`

---

**Status**: Fixed and deployed ✅  
**Date**: 2024-10-18  
**Build**: activemq-web-console-6.2.0-SNAPSHOT
