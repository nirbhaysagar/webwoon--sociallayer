import * as dotenv from 'dotenv';
dotenv.config();

import * as fs from 'fs';
import * as path from 'path';

// Manually read .env file
const envConfig = fs.readFileSync(path.resolve(__dirname, '../.env'), 'utf-8');
envConfig.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) {
    process.env[key.trim()] = value.trim();
  }
});

import { authenticationTester } from './services/testAuthentication';

// =============================================
// AUTHENTICATION TEST RUNNER
// =============================================

console.log('🚀 Starting Authentication Test Suite...\n');

// Run all authentication tests
authenticationTester.runAllTests()
  .then(() => {
    console.log('\n🎉 Authentication testing completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Authentication testing failed:', error);
    process.exit(1);
  }); 