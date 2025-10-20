# Fix for Missing rest-api-servlet.xml Error

## Problem
The broker is running from an old installation in `~/.m2/repository/` that doesn't include the new REST API configuration file.

## Solution

Run these commands to rebuild and redeploy:

```bash
# 1. Stop the running broker
./restart-activemq.sh stop
# OR manually:
# cd ~/.m2/repository/org/apache/activemq/apache-activemq/6.2.0-SNAPSHOT/apache-activemq-6.2.0-SNAPSHOT
# ./bin/activemq stop

# 2. Build the web console module (this includes rest-api-servlet.xml)
cd activemq-web-console
mvn clean install -DskipTests
cd ..

# 3. Build and install the full distribution
mvn clean install -DskipTests -pl assembly -am

# 4. Start from the local assembly (not from .m2)
cd assembly/target/apache-activemq-6.2.0-SNAPSHOT
./bin/activemq start

# 5. Check the logs
tail -f data/activemq.log
```

## Alternative: Quick Fix

If you just want to test quickly, copy the file to the running installation:

```bash
# Copy the rest-api-servlet.xml to the running broker's classpath
cp activemq-web-console/src/main/resources/rest-api-servlet.xml \
   ~/.m2/repository/org/apache/activemq/apache-activemq/6.2.0-SNAPSHOT/apache-activemq-6.2.0-SNAPSHOT/lib/

# Restart the broker
cd ~/.m2/repository/org/apache/activemq/apache-activemq/6.2.0-SNAPSHOT/apache-activemq-6.2.0-SNAPSHOT
./bin/activemq restart
```

## Recommended Approach

Always run from `assembly/target/apache-activemq-6.2.0-SNAPSHOT` during development to ensure you're using the latest code.
