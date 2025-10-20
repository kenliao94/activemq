#!/bin/bash

# Redeploy the web console to the running ActiveMQ broker

set -e

BROKER_DIR="$HOME/.m2/repository/org/apache/activemq/apache-activemq/6.2.0-SNAPSHOT/apache-activemq-6.2.0-SNAPSHOT"
WAR_FILE="activemq-web-console/target/activemq-web-console-6.2.0-SNAPSHOT.war"

echo "Redeploying ActiveMQ Web Console..."
echo ""

# Check if WAR exists
if [ ! -f "$WAR_FILE" ]; then
    echo "ERROR: WAR file not found at $WAR_FILE"
    echo "Please build first: cd activemq-web-console && mvn clean install -DskipTests"
    exit 1
fi

# Check if broker directory exists
if [ ! -d "$BROKER_DIR" ]; then
    echo "ERROR: Broker directory not found at $BROKER_DIR"
    exit 1
fi

# Stop the broker
echo "1. Stopping ActiveMQ broker..."
"$BROKER_DIR/bin/activemq" stop || echo "Broker may not be running"
sleep 3

# Backup old admin webapp
if [ -d "$BROKER_DIR/webapps/admin" ]; then
    echo "2. Backing up old admin webapp..."
    rm -rf "$BROKER_DIR/webapps/admin.backup"
    mv "$BROKER_DIR/webapps/admin" "$BROKER_DIR/webapps/admin.backup"
fi

# Deploy new WAR
echo "3. Deploying new WAR file..."
cp "$WAR_FILE" "$BROKER_DIR/webapps/admin.war"

# Start the broker
echo "4. Starting ActiveMQ broker..."
"$BROKER_DIR/bin/activemq" start

echo ""
echo "✓ Deployment complete!"
echo ""
echo "Wait a few seconds for the broker to start, then check:"
echo "  - Broker logs: tail -f $BROKER_DIR/data/activemq.log"
echo "  - Web console: http://localhost:8161/admin"
echo "  - REST API: http://localhost:8161/api/v1/broker"
echo ""
