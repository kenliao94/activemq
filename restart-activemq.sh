#!/bin/bash

# Script to restart ActiveMQ after deploying new WAR file

set -e

ACTIVEMQ_DIR="assembly/target/apache-activemq-6.2.0-SNAPSHOT"

echo "=========================================="
echo "Restarting ActiveMQ"
echo "=========================================="
echo ""

if [ ! -d "$ACTIVEMQ_DIR" ]; then
    echo "Error: ActiveMQ directory not found at $ACTIVEMQ_DIR"
    exit 1
fi

echo "Stopping ActiveMQ..."
cd "$ACTIVEMQ_DIR"
./bin/activemq stop || echo "ActiveMQ was not running"

echo "Waiting for shutdown..."
sleep 3

echo "Starting ActiveMQ..."
./bin/activemq start

echo "Waiting for startup..."
sleep 5

echo ""
echo "=========================================="
echo "ActiveMQ Restarted!"
echo "=========================================="
echo ""
echo "Testing API endpoint..."
sleep 2

# Test the API
if curl -s -u admin:admin http://localhost:8161/api/v1/broker/info > /dev/null 2>&1; then
    echo "✓ API is responding!"
    echo ""
    echo "You can now:"
    echo "1. Refresh your browser"
    echo "2. Test the Send Message page"
    echo ""
    echo "Access URLs:"
    echo "  - Classic Console: http://localhost:8161/admin"
    echo "  - Modern Console: http://localhost:8161/modern"
    echo "  - Frontend Dev: http://localhost:3000"
else
    echo "✗ API is not responding yet. Check logs:"
    echo "  tail -f $ACTIVEMQ_DIR/data/activemq.log"
fi
