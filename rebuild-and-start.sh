#!/bin/bash

# Complete rebuild and start script

set -e

echo "=========================================="
echo "Rebuilding ActiveMQ with Web Console"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Stop any running broker
echo "1. Stopping any running broker..."
pkill -f activemq || echo "No broker running"
sleep 2

# Build web console
echo ""
echo "2. Building web console module..."
cd activemq-web-console
mvn clean install -DskipTests
cd ..

# Build assembly
echo ""
echo "3. Building assembly..."
mvn clean install -DskipTests -pl assembly -am

# Check if assembly was created
ASSEMBLY_DIR="assembly/target/apache-activemq-6.2.0-SNAPSHOT"
if [ ! -d "$ASSEMBLY_DIR" ]; then
    echo "Extracting assembly..."
    cd assembly/target
    tar -xzf apache-activemq-6.2.0-SNAPSHOT-bin.tar.gz
    cd ../..
fi

# Verify rest-api-servlet.xml is included
echo ""
echo "4. Verifying rest-api-servlet.xml is included..."
if [ -f "$ASSEMBLY_DIR/webapps/admin/WEB-INF/classes/rest-api-servlet.xml" ]; then
    echo -e "${GREEN}✓${NC} rest-api-servlet.xml found in assembly"
else
    echo -e "${YELLOW}⚠${NC} rest-api-servlet.xml NOT found - this may cause issues"
fi

# Start broker
echo ""
echo "5. Starting broker..."
cd "$ASSEMBLY_DIR"
./bin/activemq start

echo ""
echo -e "${GREEN}=========================================="
echo "Build and Start Complete!"
echo "==========================================${NC}"
echo ""
echo "Access points:"
echo "  - Classic Console: http://localhost:8161/admin"
echo "  - REST API: http://localhost:8161/api/v1/broker"
echo ""
echo "Check logs:"
echo "  tail -f $ASSEMBLY_DIR/data/activemq.log"
echo ""
