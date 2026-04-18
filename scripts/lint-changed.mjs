#!/usr/bin/env node

import { execFileSync } from 'node:child_process'

const IGNORE_PATTERNS = [
  /^\.env$/,
  /^\.env\.example$/,
  /^build\//,
  /^dist\//,
  /^eslint\.config\.js\.bak$/,
  /^legacy\//,
  /^playwright-report\//,
  /^src\/.*\/__tests__\//,
  /^supabase\/migrations\//,
  /^test-results\//,
]

function run(command, args) {
  return execFileSync(command, args, { encoding: 'utf8' }).trim()
}

function isAllZeros(value) {
  return /^0+$/.test(value || '')
}

function collectChangedFiles() {
  const eventName = process.env.GITHUB_EVENT_NAME || ''
  const baseRef = process.env.LINT_BASE_REF || process.env.GITHUB_BASE_REF || ''
  const eventBefore = process.env.LINT_BASE_SHA || process.env.GITHUB_EVENT_BEFORE || ''

  try {
    if (eventName === 'pull_request' || eventName === 'pull_request_target') {
      const ref = baseRef ? (baseRef.startsWith('origin/') ? baseRef : `origin/${baseRef}`) : 'origin/main'
      return run('git', ['diff', '--name-only', '--diff-filter=ACMRTUXB', `${ref}...HEAD`])
        .split('\n')
        .map((file) => file.trim())
        .filter(Boolean)
    }

    if (eventName === 'push' && eventBefore && !isAllZeros(eventBefore)) {
      return run('git', ['diff', '--name-only', '--diff-filter=ACMRTUXB', eventBefore, 'HEAD'])
        .split('\n')
        .map((file) => file.trim())
        .filter(Boolean)
    }
  } catch {
    // Fall through to the local fallback below.
  }

  try {
    const mergeBase = run('git', ['merge-base', 'origin/main', 'HEAD'])
    if (mergeBase) {
      return run('git', ['diff', '--name-only', '--diff-filter=ACMRTUXB', `${mergeBase}...HEAD`])
        .split('\n')
        .map((file) => file.trim())
        .filter(Boolean)
    }
  } catch {
    // Ignore and use the last commit fallback.
  }

  try {
    return run('git', ['diff', '--name-only', '--diff-filter=ACMRTUXB', 'HEAD~1', 'HEAD'])
      .split('\n')
      .map((file) => file.trim())
      .filter(Boolean)
  } catch {
    return []
  }
}

const changedFiles = collectChangedFiles()
const lintTargets = changedFiles.filter((file) => !IGNORE_PATTERNS.some((pattern) => pattern.test(file)))

if (lintTargets.length === 0) {
  console.log('No lint targets changed.')
  process.exit(0)
}

execFileSync(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['eslint', '--max-warnings=0', ...lintTargets], {
  stdio: 'inherit',
})
