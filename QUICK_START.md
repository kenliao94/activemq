# Quick Start Guide - Testing the Send Message Page

Based on the error you're seeing, the backend API is not running. Here's how to fix it:

## The Issue

The error `ECONNREFUSED` on `/api/v1/broker/info` means:
- The frontend (Vite dev server) is running on port 5173 ✅
- But the backend API is not running on port 8161 ❌

## Solution: Start the Backend

The ActiveMQ web console is a WAR file that needs to be deployed to the ActiveMQ broker's embedded Jetty server.

### Quick Steps:

#### 1. Start ActiveMQ Broker (if not already running)

```bash
# Navigate to the built ActiveMQ distribution
cd assembly/target

# Extract if needed
tar -xzf apache-activemq-6.2.0-SNAPSHOT-bin.tar.gz

# Start the broker
cd apache-activemq-6.2.0-SNAPSHOT
./bin/activemq start

# Or run in foreground to see logs:
./bin/activemq console
```

#### 2. Deploy the Web Console WAR

```bash
# From the project root, copy the WAR file to ActiveMQ webapps
cp activemq-web-console/target/activemq-web-console-6.2.0-SNAPSHOT.war \
   assembly/target/apache-activemq-6.2.0-SNAPSHOT/webapps/

# Restart ActiveMQ to load the web console
cd assembly/target/apache-activemq-6.2.0-SNAPSHOT
./bin/activemq restart
```

#### 3. Verify the Backend is Running

```bash
# Check if the API is responding
curl http://localhost:8161/api/v1/broker/info

# You should see JSON response with broker information
```

#### 4. Update Frontend Proxy (if needed)

The frontend needs to proxy API requests to port 8161 (not 8080). Check your `vite.config.ts`:

```typescript
// activemq-web-console/src/main/frontend/vite.config.ts
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8161',  // ActiveMQ Jetty server
        changeOrigin: true,
      }
    }
  }
})
```

#### 5. Restart Frontend Dev Server

```bash
cd activemq-web-console/src/main/frontend
npm run dev
```

## Alternative: Run Backend Standalone (Development)

If you want to run the backend separately for development:

### Option A: Using Maven Jetty Plugin

Add to `activemq-web-console/pom.xml`:

```xml
<plugin>
    <groupId>org.eclipse.jetty</groupId>
    <artifactId>jetty-maven-plugin</artifactId>
    <version>11.0.15</version>
    <configuration>
        <webApp>
            <contextPath>/</contextPath>
        </webApp>
        <httpConnector>
            <port>8080</port>
        </httpConnector>
    </configuration>
</plugin>
```

Then run:
```bash
cd activemq-web-console
mvn jetty:run
```

### Option B: Using Tomcat

```bash
cd activemq-web-console
mvn tomcat7:run
```

## Verification Checklist

- [ ] ActiveMQ broker is running (check port 61616)
  ```bash
  lsof -i :61616
  ```

- [ ] Web console is deployed (check port 8161)
  ```bash
  curl http://localhost:8161/api/v1/broker/info
  ```

- [ ] Frontend dev server is running (check port 5173)
  ```bash
  curl http://localhost:5173
  ```

- [ ] Proxy is configured correctly in vite.config.ts

## Testing the Send Message Page

Once everything is running:

1. Open browser: http://localhost:5173
2. Navigate to: Messages → Send Message
3. Create a test queue:
   ```bash
   curl -X POST "http://localhost:8161/api/v1/queues?name=test.queue"
   ```
4. Send a test message through the UI

## Common Issues

### Issue: Port 8161 already in use
**Solution**: Stop any existing ActiveMQ instances
```bash
cd assembly/target/apache-activemq-6.2.0-SNAPSHOT
./bin/activemq stop
```

### Issue: WAR file not found
**Solution**: Build the web console first
```bash
cd activemq-web-console
mvn clean install -DskipTests
```

### Issue: API returns 404
**Solution**: Ensure the WAR is deployed and ActiveMQ is restarted

### Issue: CORS errors
**Solution**: The backend should have CORS configured. Check the Spring configuration.

## Quick Command Reference

```bash
# Start broker
cd assembly/target/apache-activemq-6.2.0-SNAPSHOT && ./bin/activemq start

# Stop broker
cd assembly/target/apache-activemq-6.2.0-SNAPSHOT && ./bin/activemq stop

# Check broker status
cd assembly/target/apache-activemq-6.2.0-SNAPSHOT && ./bin/activemq status

# View broker logs
tail -f assembly/target/apache-activemq-6.2.0-SNAPSHOT/data/activemq.log

# Deploy web console
cp activemq-web-console/target/*.war assembly/target/apache-activemq-6.2.0-SNAPSHOT/webapps/

# Start frontend
cd activemq-web-console/src/main/frontend && npm run dev
```

## Access URLs

| Service | URL | Port |
|---------|-----|------|
| ActiveMQ Broker | tcp://localhost:61616 | 61616 |
| Classic Admin Console | http://localhost:8161/admin | 8161 |
| REST API | http://localhost:8161/api/v1 | 8161 |
| Modern UI (Dev) | http://localhost:5173 | 5173 |
| Modern UI (Prod) | http://localhost:8161/modern | 8161 |

**Default Credentials**: admin / admin

---

**TL;DR**: The backend runs inside ActiveMQ's Jetty server on port 8161, not as a standalone Spring Boot app on port 8080. Deploy the WAR file to ActiveMQ's webapps directory and restart the broker.
