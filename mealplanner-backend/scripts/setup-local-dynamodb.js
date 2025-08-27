#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

console.log('Setting up local DynamoDB for MealPlanner development...');

// Check if DynamoDB Local is installed
const dynamodbPath = path.join(__dirname, '..', 'node_modules', 'dynamodb-local');
if (!fs.existsSync(dynamodbPath)) {
  console.error('DynamoDB Local not found. Please run: npm install dynamodb-local');
  process.exit(1);
}

// Start DynamoDB Local
const dynamodb = spawn('node', [
  path.join(dynamodbPath, 'bin', 'dynamodb-local.js'),
  '--port', '8000',
  '--inMemory'
], {
  stdio: 'inherit'
});

console.log('DynamoDB Local started on port 8000');
console.log('To use local DynamoDB, set environment variable: DYNAMODB_ENDPOINT=http://localhost:8000');

// Handle shutdown
process.on('SIGINT', () => {
  console.log('\nShutting down DynamoDB Local...');
  dynamodb.kill();
  process.exit(0);
});

process.on('SIGTERM', () => {
  dynamodb.kill();
  process.exit(0);
});

// Keep the process running
dynamodb.on('close', (code) => {
  console.log(`DynamoDB Local process exited with code ${code}`);
  process.exit(code);
});