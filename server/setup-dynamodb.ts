import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || "us-east-1",
  endpoint: process.env.DYNAMODB_ENDPOINT || undefined, // For local development  
  credentials: (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : {
    accessKeyId: "fakeMyKeyId",
    secretAccessKey: "fakeSecretAccessKey"
  }
});

const tableName = process.env.DYNAMODB_TABLE_NAME || "mealplanner-dev";

export async function createDynamoDBTable() {
  try {
    // Check if table already exists
    try {
      await client.send(new DescribeTableCommand({
        TableName: tableName
      }));
      console.log(`DynamoDB table ${tableName} already exists`);
      return;
    } catch (error: any) {
      if (error.name !== 'ResourceNotFoundException') {
        throw error;
      }
    }

    // Create table
    const createTableParams = {
      TableName: tableName,
      KeySchema: [
        {
          AttributeName: "PK",
          KeyType: "HASH" as const // Partition key
        },
        {
          AttributeName: "SK", 
          KeyType: "RANGE" as const // Sort key
        }
      ],
      AttributeDefinitions: [
        {
          AttributeName: "PK",
          AttributeType: "S" as const
        },
        {
          AttributeName: "SK",
          AttributeType: "S" as const
        },
        {
          AttributeName: "GSI1PK",
          AttributeType: "S" as const
        },
        {
          AttributeName: "GSI1SK",
          AttributeType: "S" as const
        }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: "GSI1",
          KeySchema: [
            {
              AttributeName: "GSI1PK",
              KeyType: "HASH" as const
            },
            {
              AttributeName: "GSI1SK",
              KeyType: "RANGE" as const
            }
          ],
          Projection: {
            ProjectionType: "ALL" as const
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      BillingMode: "PROVISIONED" as const,
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };

    await client.send(new CreateTableCommand(createTableParams));
    console.log(`DynamoDB table ${tableName} created successfully`);
    
    // Wait for table to become active
    let tableStatus = 'CREATING';
    while (tableStatus !== 'ACTIVE') {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const response = await client.send(new DescribeTableCommand({
        TableName: tableName
      }));
      tableStatus = response.Table?.TableStatus || 'UNKNOWN';
      console.log(`Table status: ${tableStatus}`);
    }
    
    console.log(`DynamoDB table ${tableName} is now active`);
  } catch (error) {
    console.error("Error creating DynamoDB table:", error);
    throw error;
  }
}

// Run this if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  createDynamoDBTable().catch(console.error);
}