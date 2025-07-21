# Odoo Authentication Setup

This dashboard now includes Odoo authentication integration. Users must sign in with their Odoo credentials to access the dashboard.

## Environment Variables

Create a `.env` file in the frontend directory with the following variables:

```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3000

# Odoo Configuration
VITE_ODOO_BASE_URL=http://localhost:8069

# Database name (optional, can be set in auth API)
VITE_ODOO_DB=Pitcar1
```

## Features

### Authentication Flow
1. **Login Page**: Modern, responsive login form with email and password fields
2. **Odoo Integration**: Authenticates against your Odoo instance using the `/web/session/authenticate` endpoint
3. **Session Management**: Stores authentication state in localStorage with 24-hour expiration
4. **Auto-login**: Automatically logs in users if they have a valid session
5. **Logout**: Properly destroys Odoo session and clears local state

### Security Features
- Session expiration after 24 hours
- Secure password field with show/hide toggle
- Error handling for invalid credentials
- Loading states during authentication
- Automatic error clearing when user starts typing

### UI Features
- Clean, modern login interface
- User information display in dashboard header
- Logout button with loading state
- Responsive design for all screen sizes
- Accessibility features (labels, focus states, keyboard navigation)

## API Endpoints Used

The authentication system uses these Odoo endpoints:

- `POST /web/session/authenticate` - User login
- `POST /web/session/destroy` - User logout
- `POST /web/session/get_session_info` - Session validation (future use)

## Request Format

The authentication request follows Odoo's JSON-RPC format:

```json
{
  "jsonrpc": "2.0",
  "params": {
    "db": "Pitcar1",
    "login": "user@example.com",
    "password": "userpassword"
  }
}
```

## Usage

1. Set up your environment variables
2. Start the development server
3. Navigate to the dashboard
4. You'll be redirected to the login page if not authenticated
5. Enter your Odoo credentials
6. Upon successful authentication, you'll see the dashboard with your user info in the header

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure your Odoo instance allows requests from your frontend domain
2. **Connection Refused**: Verify the Odoo base URL is correct and the service is running
3. **Invalid Credentials**: Check that the user exists in the specified database
4. **Database Not Found**: Ensure the database name matches your Odoo instance

### Debug Mode

Enable debug logging by setting `VITE_DEBUG_AUTH=true` in your environment variables.

## Customization

You can customize the authentication system by:

1. **Modifying the login form** in `src/components/auth/LoginPage.vue`
2. **Adjusting session timeout** in `src/stores/auth.js`
3. **Changing the Odoo database** in `src/api/auth.js`
4. **Customizing error messages** in the auth store 