#!/bin/bash

# ActiveMQ Web Console - Development Startup Script
# This script starts the ActiveMQ broker and prepares the environment for development

set -e

echo "=========================================="
echo "ActiveMQ Web Console - Development Setup"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if ActiveMQ is already running
check_activemq() {
    if lsof -Pi :61616 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        echo -e "${GREEN}✓${NC} ActiveMQ broker is already running on port 61616"
        return 0
    else
        echo -e "${RED}✗${NC} ActiveMQ broker is not running"
        return 1
    fi
}

# Start ActiveMQ broker
start_broker() {
    echo ""
    echo "Step 1: Starting ActiveMQ Broker"
    echo "-----------------------------------"
    
    if check_activemq; then
        echo "Skipping broker startup..."
    else
        ACTIVEMQ_DIR="assembly/target/apache-activemq-6.2.0-SNAPSHOT"
        
        if [ ! -d "$ACTIVEMQ_DIR" ]; then
            echo -e "${YELLOW}!${NC} ActiveMQ distribution not found. Extracting..."
            cd assembly/target
            if [ -f "apache-activemq-6.2.0-SNAPSHOT-bin.tar.gz" ]; then
                tar -xzf apache-activemq-6.2.0-SNAPSHOT-bin.tar.gz
                cd ../..
            else
                echo -e "${RED}✗${NC} ActiveMQ distribution not found. Please build the project first:"
                echo "  mvn clean install -DskipTests"
                exit 1
            fi
        fi
        
        echo "Starting ActiveMQ broker..."
        cd "$ACTIVEMQ_DIR"
        ./bin/activemq start
        cd ../../..
        
        # Wait for broker to start
        echo "Waiting for broker to start..."
        for i in {1..30}; do
            if check_activemq; then
                echo -e "${GREEN}✓${NC} Broker started successfully!"
                break
            fi
            sleep 1
            echo -n "."
        done
        echo ""
    fi
}

# Build and start backend
start_backend() {
    echo ""
    echo "Step 2: Building Web Console Backend"
    echo "--------------------------------------"
    
    cd activemq-web-console
    
    # Check if already built
    if [ ! -f "target/activemq-web-console-6.2.0-SNAPSHOT.war" ]; then
        echo "Building web console..."
        mvn clean install -DskipTests
    else
        echo -e "${GREEN}✓${NC} Web console already built"
    fi
    
    cd ..
}

# Start frontend dev server
start_frontend() {
    echo ""
    echo "Step 3: Starting Frontend Development Server"
    echo "----------------------------------------------"
    
    cd activemq-web-console/src/main/frontend
    
    # Check if node_modules exists
    if [ ! -d "node_modules" ]; then
        echo "Installing frontend dependencies..."
        npm install
    else
        echo -e "${GREEN}✓${NC} Frontend dependencies already installed"
    fi
    
    echo ""
    echo -e "${GREEN}=========================================="
    echo "Setup Complete!"
    echo "==========================================${NC}"
    echo ""
    echo "Next steps:"
    echo ""
    echo "1. Deploy the web console WAR to ActiveMQ:"
    echo "   cp activemq-web-console/target/activemq-web-console-6.2.0-SNAPSHOT.war \\"
    echo "      assembly/target/apache-activemq-6.2.0-SNAPSHOT/webapps/"
    echo ""
    echo "2. Restart ActiveMQ to load the web console:"
    echo "   cd assembly/target/apache-activemq-6.2.0-SNAPSHOT"
    echo "   ./bin/activemq restart"
    echo ""
    echo "3. Start the frontend dev server:"
    echo "   cd activemq-web-console/src/main/frontend"
    echo "   npm run dev"
    echo ""
    echo "Access points:"
    echo "  - ActiveMQ Admin Console: http://localhost:8161/admin"
    echo "  - REST API: http://localhost:8161/api/v1"
    echo "  - Frontend Dev Server: http://localhost:5173"
    echo ""
    echo "Default credentials: admin / admin"
    echo ""
}

# Main execution
main() {
    start_broker
    start_backend
    start_frontend
}

main
