# Network Access Setup Guide

This guide explains how to access the application from other devices on your network.

## Problem

When accessing the application from another device on the network, API calls fail because they're trying to connect to `localhost:5000`, which only works on the same machine.

## Solution

The application now automatically detects the current hostname and constructs the API URL dynamically. This means:

- **Same machine**: Works as before (uses `localhost:5000`)
- **Other devices on network**: Automatically uses the server's IP address

## Setup Instructions

### 1. Find Your Server's IP Address

**On Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter (usually starts with 192.168.x.x or 10.x.x.x)

**On Mac/Linux:**
```bash
ifconfig
# or
ip addr
```

### 2. Start the Backend Server

Make sure the backend server is running and accessible from the network:

```bash
cd server
npm start
```

The server will now listen on all network interfaces (`0.0.0.0`), making it accessible from other devices.

### 3. Access from Another Device

**Option A: Using IP Address**
- On the other device, open: `http://<your-server-ip>:3000` (for React app)
- The API will automatically connect to `http://<your-server-ip>:5000`

**Option B: Using Hostname**
- If your devices are on the same network, you might be able to use the computer name
- Example: `http://your-computer-name.local:3000`

### 4. Environment Variables (Optional)

If you want to explicitly set the API URL, create a `.env` file in the root directory:

```env
REACT_APP_API_URL=http://<your-server-ip>:5000/api
```

**Note:** If `REACT_APP_API_URL` is set, it will be used instead of the auto-detected URL.

## Firewall Configuration

### Windows Firewall

You may need to allow incoming connections on ports 3000 and 5000:

1. Open Windows Defender Firewall
2. Click "Advanced settings"
3. Click "Inbound Rules" → "New Rule"
4. Select "Port" → Next
5. Select "TCP" and enter port `5000` → Next
6. Select "Allow the connection" → Next
7. Check all profiles → Next
8. Name it "Backend API Server" → Finish

Repeat for port `3000` (React development server).

### Mac Firewall

1. System Preferences → Security & Privacy → Firewall
2. Click "Firewall Options"
3. Add Node.js to allowed applications
4. Or temporarily disable firewall for testing

## Testing Network Access

1. **Test Backend Health Endpoint:**
   ```
   http://<your-server-ip>:5000/api/health
   ```
   Should return: `{"status":"OK","message":"Server is running"}`

2. **Test Frontend:**
   ```
   http://<your-server-ip>:3000
   ```
   Should load the React application

3. **Test Admin Panel:**
   ```
   http://<your-server-ip>:3000/admin
   ```
   Try creating a product - it should work from any device on the network

## Troubleshooting

### "Failed to fetch" Error

1. **Check if backend is running:**
   ```bash
   # On the server machine
   curl http://localhost:5000/api/health
   ```

2. **Check if backend is accessible from network:**
   ```bash
   # From another device
   curl http://<server-ip>:5000/api/health
   ```

3. **Check firewall settings** - Make sure ports 3000 and 5000 are open

4. **Check browser console** - Look for CORS errors or network errors

### CORS Errors

The server has CORS enabled by default. If you see CORS errors:

1. Make sure the backend server is running
2. Check that both frontend and backend are accessible
3. Verify the API URL is correct (check browser Network tab)

### Connection Refused

If you get "Connection refused":

1. Verify the server is listening on `0.0.0.0` (all interfaces)
2. Check firewall settings
3. Ensure both devices are on the same network
4. Verify the IP address is correct

## Production Deployment

For production, you should:

1. Set `REACT_APP_API_URL` to your production API URL
2. Use a reverse proxy (nginx, Apache) for better security
3. Use HTTPS instead of HTTP
4. Configure proper CORS origins instead of allowing all origins

## Security Notes

⚠️ **Important:** The current setup allows access from any device on your network. For production:

- Use proper authentication
- Restrict CORS to specific origins
- Use HTTPS
- Implement rate limiting
- Use environment variables for sensitive configuration

