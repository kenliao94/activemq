# Running the ActiveMQ Web Console Application

This guide will help you start the ActiveMQ broker and the web console backend to test the new Send Message page.

## Prerequisites

- Java 11 or higher
- Maven 3.6 or higher
- Node.js 16 or higher (for frontend development)

## Option 1: Quick Start (Using Built Assembly)

### Step 1: Extract and Start ActiveMQ Broker

```bash
# Navigate to the assembly target directory
cd assembly/target

# Extract the built distribution
tar -xzf apache-activemq-6.2.0-SNAPSHOT-bin.tar.gz
# OR on Windows: unzip apache-activemq-6.2.0-SNAPSHOT-bin.zip

# Navigate to the extracted directory
cd apache-activemq-6.2.0-SNAPSHOT

# Start ActiveMQ broker
# On Unix/Mac:
./bin/activemq start

# On Windows:
bin\activemq.bat start

# To run in foreground (see logs):
# Unix/Mac: ./bin/activemq console
# Windows: bin\activemq.bat
```

The broker will start on:
- **JMX Port**: 1099
- **OpenWire Port**: 61616
- **AMQP Port**: 5672
- **STOMP Port**: 61613
- **MQTT Port**: 1883
- **WS Port**: 61614
- **Admin Console**: http://localhost:8161/admin

Default credentials: `admin` / `admin`

### Step 2: Build and Run the Web Console Backend

```bash
# Navigate to the web console module
cd activemq-web-console

# Build the project (if not already built)
mvn clean install -DskipTests

# Run the Spring Boot application
mvn spring-boot:run

# OR if you prefer to run the JAR:
java -jar target/activemq-web-console-6.2.0-SNAPSHOT.jar
```

The backend API will start on: **http://localhost:8080**

API endpoints will be available at: **http://localhost:8080/api/v1/**

### Step 3: Start the Frontend Development Server

```bash
# Navigate to the frontend directory
cd activemq-web-console/src/main/frontend

# Install dependencies (if not already done)
npm install

# Start the development server
npm run dev
```

The frontend will start on: **http://localhost:5173**

## Option 2: Development Mode (From Source)

### Step 1: Build the Entire Project

```bash
# From the root directory
mvn clean install -DskipTests
```

### Step 2: Start ActiveMQ Broker

You have two options:

#### Option A: Use the built assembly (see Option 1, Step 1)

#### Option B: Run broker from activemq-run module

```bash
cd activemq-run
mvn exec:java
```

### Step 3: Run Backend and Frontend (see Option 1, Steps 2-3)

## Verifying the Setup

### 1. Check ActiveMQ Broker

```bash
# Check if broker is running
curl http://localhost:8161/admin/
# You should see the classic ActiveMQ admin console
```

### 2. Check Backend API

```bash
# Check broker info endpoint
curl http://localhost:8080/api/v1/broker/info

# Check queues endpoint
curl http://localhost:8080/api/v1/queues

# Check topics endpoint
curl http://localhost:8080/api/v1/topics
```

### 3. Check Frontend

Open your browser and navigate to: **http://localhost:5173**

You should see the modern ActiveMQ web console.

## Testing the Send Message Page

1. Navigate to **http://localhost:5173/messages/send**
2. Select a destination type (Queue or Topic)
3. Enter a destination name (or create a new one)
4. Enter your message body
5. Optionally add headers and properties
6. Click "Send Message"

### Creating a Test Queue

You can create a test queue using the API:

```bash
curl -X POST "http://localhost:8080/api/v1/queues?name=test.queue"
```

Or use the UI:
1. Navigate to Queues page
2. Click "Create Queue"
3. Enter name: `test.queue`
4. Click Create

## Troubleshooting

### Issue: Backend API returns ECONNREFUSED

**Problem**: The backend cannot connect to the ActiveMQ broker.

**Solution**:
1. Verify the broker is running: `ps aux | grep activemq`
2. Check the broker URL in backend configuration
3. Ensure the broker is listening on port 61616

### Issue: Frontend shows proxy errors

**Problem**: The frontend cannot connect to the backend API.

**Solution**:
1. Verify the backend is running on port 8080
2. Check the Vite proxy configuration in `vite.config.ts`
3. Ensure CORS is properly configured in the backend

### Issue: Cannot send messages

**Problem**: Send message API returns errors.

**Solution**:
1. Verify the destination exists
2. Check backend logs for errors
3. Ensure the broker is running and accessible
4. Verify the message format is valid (JSON/XML)

## Configuration Files

### Backend Configuration

Location: `activemq-web-console/src/main/resources/application.properties`

Key settings:
```properties
# Server port
server.port=8080

# ActiveMQ broker URL
spring.activemq.broker-url=tcp://localhost:61616
spring.activemq.user=admin
spring.activemq.password=admin

# API base path
server.servlet.context-path=/api/v1
```

### Frontend Configuration

Location: `activemq-web-console/src/main/frontend/vite.config.ts`

Proxy configuration:
```typescript
proxy: {
  '/api': {
    target: 'http://localhost:8080',
    changeOrigin: true,
  }
}
```

## Stopping the Services

### Stop ActiveMQ Broker

```bash
# If running as service
cd assembly/target/apache-activemq-6.2.0-SNAPSHOT
./bin/activemq stop

# If running in console mode, press Ctrl+C
```

### Stop Backend

Press `Ctrl+C` in the terminal running the Spring Boot application

### Stop Frontend

Press `Ctrl+C` in the terminal running the Vite dev server

## Production Build

### Build Frontend for Production

```bash
cd activemq-web-console/src/main/frontend
npm run build
```

The built files will be in `dist/` and will be served by the Spring Boot backend at `/modern`

### Build Complete Application

```bash
# From root directory
mvn clean install

# The complete package will be in:
# assembly/target/apache-activemq-6.2.0-SNAPSHOT-bin.tar.gz
```

### Run Production Build

```bash
# Extract and start broker (see above)
# The web console will be available at:
# http://localhost:8161/modern
```

## Quick Reference

| Service | URL | Default Port |
|---------|-----|--------------|
| ActiveMQ Broker (OpenWire) | tcp://localhost:61616 | 61616 |
| ActiveMQ Admin Console | http://localhost:8161/admin | 8161 |
| Backend API | http://localhost:8080/api/v1 | 8080 |
| Frontend Dev Server | http://localhost:5173 | 5173 |
| Modern Console (Production) | http://localhost:8161/modern | 8161 |

## Default Credentials

- **Username**: admin
- **Password**: admin

## Next Steps

1. Start all services following the steps above
2. Navigate to http://localhost:5173/messages/send
3. Test the Send Message functionality
4. Create queues/topics and send messages
5. Browse messages using the Message Browser
6. View message details

## Additional Resources

- [ActiveMQ Documentation](https://activemq.apache.org/)
- [Spring Boot Documentation](https://spring.io/projects/spring-boot)
- [Vite Documentation](https://vitejs.dev/)
- [React Documentation](https://react.dev/)

---

**Note**: The error you're seeing (`ECONNREFUSED` on `/api/v1/broker/info`) indicates the backend API is not running. Follow Step 2 above to start the backend server.
