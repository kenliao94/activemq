# ActiveMQ Web Console - Credentials Reference

## Default Credentials

### Web Console Access

**Username:** `admin`  
**Password:** `admin`

These credentials are used to access:
- **Classic Admin Console**: http://localhost:8161/admin
- **Modern Web Console**: http://localhost:8161/modern (production) or http://localhost:3000 (development)
- **REST API**: http://localhost:8161/api/v1/*

## Configuration Files

The credentials are configured in the following files located in the ActiveMQ `conf/` directory:

### 1. users.properties
Location: `assembly/src/release/conf/users.properties`

```properties
# Format: username=password
admin=admin
```

This file defines the username and password combinations.

### 2. groups.properties
Location: `assembly/src/release/conf/groups.properties`

```properties
# Format: groupname=user1,user2,...
admins=admin
```

This file assigns users to groups (roles).

### 3. credentials.properties
Location: `assembly/src/release/conf/credentials.properties`

```properties
# Credentials for broker components
activemq.username=system
activemq.password=manager
guest.password=password
```

This file defines credentials used by internal components to access the broker.

## User Roles and Permissions

The `admin` user belongs to the `admins` group, which has full access to:
- View all queues and topics
- Create/delete destinations
- Browse messages
- Send messages
- Delete/move/copy messages
- View connections and subscribers
- Manage broker configuration

## Changing Default Credentials

### For Production Use

**⚠️ IMPORTANT**: You should change the default credentials before deploying to production!

#### Step 1: Edit users.properties

```bash
cd assembly/target/apache-activemq-6.2.0-SNAPSHOT/conf
nano users.properties
```

Change:
```properties
admin=admin
```

To:
```properties
admin=your_secure_password
```

Or add new users:
```properties
admin=secure_admin_password
user1=user1_password
user2=user2_password
```

#### Step 2: Edit groups.properties

Assign users to groups:
```properties
# Admins group - full access
admins=admin

# Users group - limited access
users=user1,user2

# Guests group - read-only access
guests=guest
```

#### Step 3: Restart ActiveMQ

```bash
./bin/activemq restart
```

## Authentication Methods

ActiveMQ supports multiple authentication methods:

### 1. Properties File (Default)
- Uses `users.properties` and `groups.properties`
- Simple and suitable for small deployments

### 2. JAAS (Java Authentication and Authorization Service)
- More flexible and secure
- Can integrate with LDAP, Kerberos, etc.

### 3. LDAP
- Centralized user management
- Enterprise integration

### 4. Certificate-based
- Uses SSL/TLS client certificates
- Highest security level

## Web Console Authentication

The web console uses HTTP Basic Authentication by default. When you access the console, your browser will prompt for credentials.

### Programmatic Access

When accessing the REST API programmatically, include Basic Auth headers:

```bash
# Using curl
curl -u admin:admin http://localhost:8161/api/v1/broker/info

# Using curl with explicit header
curl -H "Authorization: Basic YWRtaW46YWRtaW4=" \
     http://localhost:8161/api/v1/broker/info
```

### JavaScript/Frontend

The frontend application should handle authentication. Currently, the API calls don't include authentication headers. You may need to add:

```typescript
// In api.ts or axios configuration
const api = axios.create({
  baseURL: '/api/v1',
  auth: {
    username: 'admin',
    password: 'admin'
  }
});
```

## Security Best Practices

### 1. Change Default Passwords
Never use default credentials in production:
```properties
# BAD - Default credentials
admin=admin

# GOOD - Strong password
admin=Str0ng!P@ssw0rd#2024
```

### 2. Use HTTPS
Enable SSL/TLS for web console access:
```xml
<!-- In jetty.xml -->
<connector>
  <protocol>https</protocol>
  <port>8162</port>
  <keyStore>conf/broker.ks</keyStore>
  <keyStorePassword>password</keyStorePassword>
</connector>
```

### 3. Limit Access by IP
Configure firewall rules or use Jetty's IP filtering:
```xml
<filter>
  <filter-name>IPAccessFilter</filter-name>
  <filter-class>org.eclipse.jetty.servlets.IPAccessHandler</filter-class>
  <init-param>
    <param-name>white</param-name>
    <param-value>192.168.1.*</param-value>
  </init-param>
</filter>
```

### 4. Use Role-Based Access Control
Define specific roles with limited permissions:
```properties
# users.properties
admin=admin_password
operator=operator_password
viewer=viewer_password

# groups.properties
admins=admin
operators=operator
viewers=viewer
```

### 5. Enable Audit Logging
Track who accesses what:
```xml
<!-- In activemq.xml -->
<plugins>
  <loggingBrokerPlugin logAll="true" logConnectionEvents="true"/>
</plugins>
```

## Troubleshooting Authentication

### Issue: "401 Unauthorized" Error

**Cause**: Incorrect credentials or authentication not configured

**Solution**:
1. Verify credentials in `conf/users.properties`
2. Check that the user exists and password is correct
3. Ensure the user is in the correct group in `conf/groups.properties`
4. Restart ActiveMQ after changes

### Issue: "403 Forbidden" Error

**Cause**: User authenticated but lacks permissions

**Solution**:
1. Check group membership in `conf/groups.properties`
2. Verify authorization policies in `activemq.xml`
3. Ensure the user's group has required permissions

### Issue: Browser Doesn't Prompt for Credentials

**Cause**: Browser cached old credentials or authentication disabled

**Solution**:
1. Clear browser cache and cookies
2. Try incognito/private browsing mode
3. Check `web.xml` for security constraints
4. Verify Jetty realm configuration

### Issue: API Calls Return 401 in Frontend

**Cause**: Frontend not sending authentication headers

**Solution**:
Add authentication to API client:
```typescript
// src/services/api.ts
import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  auth: {
    username: 'admin',
    password: 'admin'
  },
  withCredentials: true
});

export default api;
```

## Testing Credentials

### Test Web Console Access

```bash
# Test with curl
curl -u admin:admin http://localhost:8161/admin/

# Should return HTML of admin console
```

### Test REST API Access

```bash
# Test broker info endpoint
curl -u admin:admin http://localhost:8161/api/v1/broker/info

# Should return JSON with broker information
```

### Test from Browser

1. Open: http://localhost:8161/admin
2. Enter username: `admin`
3. Enter password: `admin`
4. You should see the ActiveMQ admin console

## Quick Reference

| Item | Value |
|------|-------|
| Default Username | `admin` |
| Default Password | `admin` |
| Default Role | `admins` |
| Config File (Users) | `conf/users.properties` |
| Config File (Groups) | `conf/groups.properties` |
| Config File (Credentials) | `conf/credentials.properties` |
| Authentication Method | HTTP Basic Auth |
| Authorization Method | Role-based (groups) |

## Additional Users

You can add more users by editing the configuration files:

```properties
# users.properties
admin=admin
developer=dev123
operator=ops456
viewer=view789

# groups.properties
admins=admin
developers=developer
operators=operator
viewers=viewer
```

Then configure authorization policies in `activemq.xml` to control what each group can do.

---

**Remember**: Always change default credentials in production environments!
