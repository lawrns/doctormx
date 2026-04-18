#!/usr/bin/env node

import ts from 'typescript'
import { execFileSync } from 'node:child_process'
import { resolve } from 'node:path'

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
  const baseRef = process.env.TYPECHECK_BASE_REF || process.env.GITHUB_BASE_REF || ''
  const eventBefore = process.env.TYPECHECK_BASE_SHA || process.env.GITHUB_EVENT_BEFORE || ''

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
const typecheckTargets = changedFiles
  .filter((file) => !IGNORE_PATTERNS.some((pattern) => pattern.test(file)))
  .filter((file) => /\.(c|m)?ts$/.test(file) || /\.(c|m)?tsx$/.test(file))

if (typecheckTargets.length === 0) {
  console.log('No typecheck targets changed.')
  process.exit(0)
}

const configPath = new URL('../tsconfig.json', import.meta.url)
const configFile = ts.readConfigFile(configPath.pathname, ts.sys.readFile)

if (configFile.error) {
  const message = ts.formatDiagnosticsWithColorAndContext([configFile.error], {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n',
  })
  console.error(message)
  process.exit(1)
}

const parsed = ts.parseJsonConfigFileContent(configFile.config, ts.sys, process.cwd())
const compilerOptions = {
  ...parsed.options,
  incremental: false,
  tsBuildInfoFile: undefined,
}

const program = ts.createProgram(typecheckTargets, compilerOptions)
const targetFiles = new Set(typecheckTargets.map((file) => resolve(process.cwd(), file)))
const diagnostics = ts
  .getPreEmitDiagnostics(program)
  .filter((diagnostic) => {
    if (!diagnostic.file) {
      return false
    }

    return targetFiles.has(resolve(process.cwd(), diagnostic.file.fileName))
  })

if (diagnostics.length > 0) {
  const message = ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => process.cwd(),
    getNewLine: () => '\n',
  })
  console.error(message)
  process.exit(1)
}

console.log(`Typechecked ${typecheckTargets.length} changed file${typecheckTargets.length === 1 ? '' : 's'}.`)
