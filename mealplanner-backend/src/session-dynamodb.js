"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamoDBSessionStore = void 0;
var express_session_1 = require("express-session");
var dynamodb_1 = require("./dynamodb");
var lib_dynamodb_1 = require("@aws-sdk/lib-dynamodb");
// DynamoDB session store for Express sessions
var DynamoDBSessionStore = /** @class */ (function (_super) {
    __extends(DynamoDBSessionStore, _super);
    function DynamoDBSessionStore() {
        return _super.call(this) || this;
    }
    DynamoDBSessionStore.prototype.get = function (sessionId, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var response, now, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.GetCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.session.data(sessionId)
                            }))];
                    case 1:
                        response = _a.sent();
                        if (!response.Item) {
                            callback(null, null);
                            return [2 /*return*/];
                        }
                        now = Date.now();
                        if (!(response.Item.expire && response.Item.expire < now)) return [3 /*break*/, 3];
                        // Session expired, delete it
                        return [4 /*yield*/, this.destroy(sessionId, function () { })];
                    case 2:
                        // Session expired, delete it
                        _a.sent();
                        callback(null, null);
                        return [2 /*return*/];
                    case 3:
                        callback(null, response.Item.sess);
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _a.sent();
                        callback(error_1);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBSessionStore.prototype.set = function (sessionId, session, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var expire, error_2;
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 2, , 3]);
                        expire = ((_b = (_a = session.cookie) === null || _a === void 0 ? void 0 : _a.expires) === null || _b === void 0 ? void 0 : _b.getTime()) || (Date.now() + (24 * 60 * 60 * 1000));
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.PutCommand({
                                TableName: dynamodb_1.tableName,
                                Item: __assign(__assign({}, dynamodb_1.keys.session.data(sessionId)), { sess: session, expire: expire, EntityType: "SESSION" })
                            }))];
                    case 1:
                        _c.sent();
                        callback && callback();
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _c.sent();
                        callback && callback(error_2);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBSessionStore.prototype.destroy = function (sessionId, callback) {
        return __awaiter(this, void 0, void 0, function () {
            var error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.DeleteCommand({
                                TableName: dynamodb_1.tableName,
                                Key: dynamodb_1.keys.session.data(sessionId)
                            }))];
                    case 1:
                        _a.sent();
                        callback && callback();
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        callback && callback(error_3);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBSessionStore.prototype.touch = function (sessionId, session, callback) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Update the expiry time
                    return [4 /*yield*/, this.set(sessionId, session, callback)];
                    case 1:
                        // Update the expiry time
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBSessionStore.prototype.clear = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var response, deletePromises, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 4, , 5]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.ScanCommand({
                                TableName: dynamodb_1.tableName,
                                FilterExpression: "EntityType = :entityType",
                                ExpressionAttributeValues: {
                                    ":entityType": "SESSION"
                                }
                            }))];
                    case 1:
                        response = _a.sent();
                        if (!(response.Items && response.Items.length > 0)) return [3 /*break*/, 3];
                        deletePromises = response.Items.map(function (item) {
                            return dynamodb_1.docClient.send(new lib_dynamodb_1.DeleteCommand({
                                TableName: dynamodb_1.tableName,
                                Key: { PK: item.PK, SK: item.SK }
                            }));
                        });
                        return [4 /*yield*/, Promise.all(deletePromises)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        callback && callback();
                        return [3 /*break*/, 5];
                    case 4:
                        error_4 = _a.sent();
                        callback && callback(error_4);
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DynamoDBSessionStore.prototype.length = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var response, error_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, dynamodb_1.docClient.send(new lib_dynamodb_1.ScanCommand({
                                TableName: dynamodb_1.tableName,
                                FilterExpression: "EntityType = :entityType",
                                ExpressionAttributeValues: {
                                    ":entityType": "SESSION"
                                },
                                Select: "COUNT"
                            }))];
                    case 1:
                        response = _a.sent();
                        callback(null, response.Count || 0);
                        return [3 /*break*/, 3];
                    case 2:
                        error_5 = _a.sent();
                        callback(error_5);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    return DynamoDBSessionStore;
}(express_session_1.default.Store));
exports.DynamoDBSessionStore = DynamoDBSessionStore;
