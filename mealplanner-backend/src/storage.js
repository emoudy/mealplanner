"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = void 0;
// Import storage implementations
var dynamodb_storage_1 = require("./dynamodb-storage");
var storage_fallback_1 = require("./storage-fallback");
// Create storage instance with fallback for development
function createStorage() {
    // Check if we have AWS credentials
    var hasAWSCredentials = process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY;
    if (hasAWSCredentials) {
        console.log("Using DynamoDB storage (AWS credentials found)");
        return new dynamodb_storage_1.DynamoDBStorage();
    }
    else {
        console.log("Using in-memory storage (no AWS credentials - development mode)");
        return new storage_fallback_1.MemoryStorage();
    }
}
exports.storage = createStorage();
