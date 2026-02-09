// Test script for file security validation
const { validateFile } = require('./src/lib/file-security.ts')

// Mock File object for testing
class MockFile {
  constructor(name, size, type, data) {
    this.name = name
    this.size = size
    this.type = type
    this.data = data
  }

  async arrayBuffer() {
    return new ArrayBuffer(this.data.length)
  }

  slice(start, end) {
    const sliced = this.data.slice(start, end)
    return new MockFile(this.name, sliced.length, this.type, sliced)
  }
}

// Test cases
const testCases = [
  {
    name: 'Valid JPEG',
    file: new MockFile('test.jpg', 1024 * 1024, 'image/jpeg', [0xFF, 0xD8, 0xFF]),
    expected: true
  },
  {
    name: 'Valid PNG',
    file: new MockFile('test.png', 1024 * 1024, 'image/png', [0x89, 0x50, 0x4E, 0x47]),
    expected: true
  },
  {
    name: 'Invalid file type',
    file: new MockFile('test.txt', 1024 * 1024, 'text/plain', [0x54, 0x45, 0x53, 0x54]),
    expected: false
  },
  {
    name: 'File too large',
    file: new MockFile('large.jpg', 10 * 1024 * 1024, 'image/jpeg', [0xFF, 0xD8, 0xFF]),
    expected: false
  },
  {
    name: 'Valid webp',
    file: new MockFile('test.webp', 1024 * 1024, 'image/webp', [0x52, 0x49, 0x46, 0x46]),
    expected: true
  }
]

// Run tests
testCases.forEach(({ name, file, expected }) => {
  try {
    const result = validateFile(file)
    console.log(`${name}: ${result.isValid === expected ? '✓' : '✗'}`)
    if (!result.isValid === expected) {
      console.log(`  Expected: ${expected}, Got: ${result.isValid}`)
      if (result.error) {
        console.log(`  Error: ${result.error}`)
      }
    }
  } catch (error) {
    console.log(`${name}: ✗ (Error: ${error.message})`)
  }
})