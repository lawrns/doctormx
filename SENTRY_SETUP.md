# Sentry CLI Setup Guide

## Installation Status

✅ Sentry CLI installed globally: `/home/laurence/.npm-global/bin/sentry-cli`
✅ Version: `3.1.0`
✅ Project-specific installation added to `package.json`
✅ Config file created: `.sentryclirc`

## Authentication Required

Sentry CLI requires an authentication token to work. The credentials provided (laurence@fyves.com) need 2FA or browser-based authentication.

### Quick Setup Steps

#### Option 1: Get Auth Token from Sentry Dashboard (Recommended)

1. Go to: https://sentry.io/settings/account/api/auth-tokens/
2. Click "Create New Token"
3. Name it: `sentry-cli-token`
4. Select scopes:
   - `project:write`
   - `project:read`
   - `org:read`
5. Copy the generated token

#### Option 2: Interactive Login (Requires Browser)

```bash
sentry-cli login
```

This will open a browser window for authentication.

### Configure the Token

Once you have the token, add it to one of these locations:

**Method A: Environment Variable (Recommended)**
```bash
export SENTRY_AUTH_TOKEN="your_token_here"
# Add to ~/.bashrc or ~/.zshrc for persistence
```

**Method B: Project Config File**
```bash
# Edit .sentryclirc and add:
[auth]
token=your_token_here
```

**Method C: Global Config**
```bash
# Edit ~/.config/sentry/sentry.env and add:
export SENTRY_AUTH_TOKEN="your_token_here"
```

## Usage

### Project Setup

Initialize Sentry in your current project:

```bash
sentry-cli init
```

### Release Management

```bash
# Create a new release
npm run sentry:release

# Upload sourcemaps
npm run sentry:upload

# Finalize release
npm run sentry:finalize

# Or do all at once
npm run sentry:deploy
```

### Manual Commands

```bash
# List releases
sentry-cli releases list

# Upload debug info files
sentry-cli upload-dif ./path/to/files

# Set up commits for a release
sentry-cli releases set-commits $VERSION --auto

# Create a new deploy
sentry-cli releases deploys $VERSION new -e production
```

## NPM Scripts Added

- `npm run sentry:release` - Create new release
- `npm run sentry:upload` - Upload sourcemaps
- `npm run sentry:finalize` - Finalize release
- `npm run sentry:deploy` - Do all three steps

## CI/CD Integration

Add `SENTRY_AUTH_TOKEN` as an environment variable in your CI/CD pipeline:

**Netlify:**
```bash
# In Netlify dashboard → Site Settings → Environment Variables
SENTRY_AUTH_TOKEN=your_token_here
SENTRY_ORG=your-org-slug
```

**GitHub Actions:**
```yaml
env:
  SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
```

## Verification

Check if authentication is working:

```bash
sentry-cli info
```

You should see your organization and project information if successful.

## Troubleshooting

### "Authentication credentials were not provided"
- Your token is invalid or expired
- Token doesn't have required scopes
- Environment variable not set correctly

### "Project not found"
- Set default org/project in `.sentryclirc`
- Or use flags: `sentry-cli --org my-org --project my-project`

### Browser-based login fails
- Use token-based authentication instead
- Get token from: https://sentry.io/settings/account/api/auth-tokens/

## Next Steps

1. Get auth token from Sentry dashboard
2. Configure token (choose method above)
3. Run `sentry-cli info` to verify
4. Run `sentry-cli init` to set up project
5. Update build scripts to include sourcemap uploads
