import session from "express-session";
import { docClient, tableName, keys } from "./dynamodb";
import { GetCommand, PutCommand, DeleteCommand, ScanCommand } from "@aws-sdk/lib-dynamodb";

// DynamoDB session store for Express sessions
export class DynamoDBSessionStore extends session.Store {
  constructor() {
    super();
  }

  async get(sessionId: string, callback: (err?: any, session?: session.SessionData | null) => void): Promise<void> {
    try {
      const response = await docClient.send(new GetCommand({
        TableName: tableName,
        Key: keys.session.data(sessionId)
      }));

      if (!response.Item) {
        callback(null, null);
        return;
      }

      // Check if session has expired
      const now = Date.now();
      if (response.Item.expire && response.Item.expire < now) {
        // Session expired, delete it
        await this.destroy(sessionId, () => {});
        callback(null, null);
        return;
      }

      callback(null, response.Item.sess);
    } catch (error) {
      callback(error);
    }
  }

  async set(sessionId: string, session: session.SessionData, callback?: (err?: any) => void): Promise<void> {
    try {
      const expire = session.cookie?.expires?.getTime() || (Date.now() + (24 * 60 * 60 * 1000)); // 24 hours default

      await docClient.send(new PutCommand({
        TableName: tableName,
        Item: {
          ...keys.session.data(sessionId),
          sess: session,
          expire: expire,
          EntityType: "SESSION"
        }
      }));

      callback && callback();
    } catch (error) {
      callback && callback(error);
    }
  }

  async destroy(sessionId: string, callback?: (err?: any) => void): Promise<void> {
    try {
      await docClient.send(new DeleteCommand({
        TableName: tableName,
        Key: keys.session.data(sessionId)
      }));

      callback && callback();
    } catch (error) {
      callback && callback(error);
    }
  }

  async touch(sessionId: string, session: session.SessionData, callback?: (err?: any) => void): Promise<void> {
    // Update the expiry time
    await this.set(sessionId, session, callback);
  }

  async clear(callback?: (err?: any) => void): Promise<void> {
    try {
      // Scan for all session items and delete them
      const response = await docClient.send(new ScanCommand({
        TableName: tableName,
        FilterExpression: "EntityType = :entityType",
        ExpressionAttributeValues: {
          ":entityType": "SESSION"
        }
      }));

      if (response.Items && response.Items.length > 0) {
        const deletePromises = response.Items.map(item =>
          docClient.send(new DeleteCommand({
            TableName: tableName,
            Key: { PK: item.PK, SK: item.SK }
          }))
        );

        await Promise.all(deletePromises);
      }

      callback && callback();
    } catch (error) {
      callback && callback(error);
    }
  }

  async length(callback: (err: any, length?: number) => void): Promise<void> {
    try {
      const response = await docClient.send(new ScanCommand({
        TableName: tableName,
        FilterExpression: "EntityType = :entityType",
        ExpressionAttributeValues: {
          ":entityType": "SESSION"
        },
        Select: "COUNT"
      }));

      callback(null, response.Count || 0);
    } catch (error) {
      callback(error);
    }
  }
}