# GitHub Actions CI/CD Setup Guide for DoctorMX

## Overview

This guide explains the comprehensive GitHub Actions CI/CD pipeline setup for the DoctorMX project. The pipeline includes automated testing, security scanning, deployment, and maintenance workflows.

## Workflow Files

### 1. Main CI/CD Pipeline (`main.yml`)
The primary workflow that runs on pushes to main and pull requests.

**Key Features:**
- Parallel quality checks (linting, TypeScript, unit tests, security)
- Build optimization with caching
- E2E testing across multiple browsers
- Lighthouse performance testing
- Automated deployment to staging and production
- Manual approval for production deployments

**Required Secrets:**
- `SUPABASE_URL` - Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `NETLIFY_AUTH_TOKEN` - Netlify authentication token
- `NETLIFY_SITE_ID` - Netlify site ID
- `SLACK_WEBHOOK_URL` - (Optional) Slack notifications

### 2. PR Validation (`pr-validation.yml`)
Comprehensive validation for pull requests.

**Features:**
- Semantic PR title validation
- Security scanning for secrets
- Code quality checks
- Bundle size analysis
- Test coverage reporting
- Preview deployments

**Automatic Actions:**
- Labels PRs based on changed files
- Creates preview deployments
- Comments with validation summary

### 3. Scheduled Maintenance (`scheduled-maintenance.yml`)
Daily maintenance tasks running at 2 AM UTC.

**Tasks:**
- Dependency update checks
- Security vulnerability scanning
- Cleanup of old artifacts and deployments
- Production health monitoring
- SSL certificate checks
- Performance monitoring

### 4. Release Pipeline (`release.yml`)
Automated release process triggered by version tags.

**Process:**
1. Validates version format
2. Builds production artifacts
3. Generates release notes
4. Deploys to production
5. Creates GitHub release
6. Notifies team

**Trigger:** Push tags matching `v*.*.*` pattern

## Setup Instructions

### 1. Configure Repository Secrets

Navigate to Settings → Secrets and variables → Actions, then add:

```bash
# Required for deployments
NETLIFY_AUTH_TOKEN=<your-netlify-token>
NETLIFY_SITE_ID=<your-site-id>

# Required for builds
SUPABASE_URL=<your-supabase-url>
SUPABASE_ANON_KEY=<your-supabase-anon-key>

# Optional
SLACK_WEBHOOK_URL=<slack-webhook-for-notifications>
CODECOV_TOKEN=<codecov-token-for-coverage>
API_URL=<custom-api-url>
```

### 2. Configure Environments

Create these environments in Settings → Environments:

#### Staging Environment
- Name: `staging`
- No required reviewers
- URL: `https://staging--doctormx.netlify.app`

#### Production Environment
- Name: `production`
- Required reviewers: Add team members who can approve production deployments
- URL: `https://doctormx.netlify.app`
- Protection rules:
  - Required reviewers
  - Restrict to `main` branch only

### 3. Enable Dependabot

The `.github/dependabot.yml` file is already configured. Enable it in:
Settings → Security & analysis → Dependabot alerts → Enable

### 4. Configure Branch Protection

For the `main` branch, enable these protection rules:
- Require pull request reviews (1-2 approvals)
- Require status checks to pass:
  - `quality-checks`
  - `build`
  - `pr-metadata`
- Require branches to be up to date
- Include administrators

## Workflow Usage

### Creating a Release

1. **Manual Release:**
   ```bash
   # Trigger release workflow manually
   gh workflow run release.yml -f version=v1.2.3 -f prerelease=false
   ```

2. **Tag-based Release:**
   ```bash
   git tag -a v1.2.3 -m "Release version 1.2.3"
   git push origin v1.2.3
   ```

### Running Maintenance Tasks

```bash
# Run all maintenance tasks
gh workflow run scheduled-maintenance.yml -f task=all

# Run specific task
gh workflow run scheduled-maintenance.yml -f task=security
```

### Deployment Flow

1. **Development:** Push to feature branch → Creates PR
2. **Review:** PR validation runs automatically
3. **Staging:** Merge to main → Auto-deploys to staging
4. **Production:** Manual approval required → Deploys to production

## Monitoring and Troubleshooting

### Check Workflow Status
```bash
# List recent workflow runs
gh run list

# View specific run details
gh run view <run-id>

# Watch a run in progress
gh run watch
```

### Common Issues

1. **Build Failures:**
   - Check Node/pnpm versions match project requirements
   - Verify all environment variables are set
   - Check for missing dependencies

2. **Deployment Failures:**
   - Verify Netlify tokens are valid
   - Check build output exists
   - Ensure site ID is correct

3. **Test Failures:**
   - Review test logs in workflow run
   - Check if tests pass locally
   - Verify test environment variables

### Performance Optimization

The workflows include several optimizations:
- pnpm caching for faster installs
- Parallel job execution
- Artifact caching between jobs
- Conditional step execution
- Automatic cleanup of old artifacts

## Best Practices

1. **Semantic Commits:** Use conventional commit format
   ```
   feat: add new feature
   fix: resolve bug
   docs: update documentation
   ```

2. **PR Titles:** Follow semantic format for automatic labeling

3. **Version Tags:** Use semantic versioning (v1.2.3)

4. **Secret Management:** Never commit secrets; use GitHub Secrets

5. **Testing:** Ensure tests pass locally before pushing

## Maintenance

### Weekly Tasks
- Review Dependabot PRs
- Check maintenance reports
- Update dependencies

### Monthly Tasks
- Review and optimize workflow performance
- Clean up old deployment previews
- Update documentation

## Support

For issues with the CI/CD pipeline:
1. Check workflow logs
2. Review this documentation
3. Check GitHub Actions status page
4. Contact the DevOps team

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Netlify CLI Documentation](https://docs.netlify.com/cli/get-started/)
- [Lighthouse CI Documentation](https://github.com/GoogleChrome/lighthouse-ci)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)