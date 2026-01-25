/**
 * Redis Connection Test
 * Run with: node netlify/functions/test-redis.js
 */

const Redis = require('ioredis');

async function testRedisConnection() {
  console.log('🧪 Testing Redis connection...\n');

  const redisUrl = 'redis://default:qtDEYFxfMbvyZW2Tif8SnmvOnl3jT2u7@redis-14490.fcrce213.us-east-1-3.ec2.cloud.redislabs.com:14490';

  try {
    const redis = new Redis(redisUrl, {
      connectTimeout: 10000,
      maxRetriesPerRequest: 3,
    });

    redis.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    redis.on('error', (err) => {
      console.error('❌ Redis error:', err.message);
    });

    // Test basic operations
    console.log('\n📝 Testing SET operation...');
    await redis.set('test:ping', 'pong', 'EX', 60);
    console.log('✅ SET successful');

    console.log('\n📝 Testing GET operation...');
    const value = await redis.get('test:ping');
    console.log(`✅ GET successful: ${value}`);

    console.log('\n📝 Testing HSET operation...');
    await redis.hset('test:hash', 'field1', 'value1');
    console.log('✅ HSET successful');

    console.log('\n📝 Testing HGET operation...');
    const hashValue = await redis.hget('test:hash', 'field1');
    console.log(`✅ HGET successful: ${hashValue}`);

    console.log('\n📊 Getting Redis info...');
    const info = await redis.info('server');
    const version = info.match(/redis_version:([\d.]+)/)?.[1];
    console.log(`✅ Redis version: ${version}`);

    const dbSize = await redis.dbsize();
    console.log(`✅ Total keys in database: ${dbSize}`);

    // Cleanup
    await redis.del('test:ping', 'test:hash');
    console.log('\n🧹 Cleanup complete');

    await redis.quit();
    console.log('\n✨ All tests passed! Redis is ready.\n');

  } catch (error) {
    console.error('\n❌ Redis test failed:', error.message);
    console.error('Full error:', error);
    process.exit(1);
  }
}

testRedisConnection();
