import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';
import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic
export class TodosAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly todosTable = process.env.TODOS_TABLE) {
    }

    async getTodosByUserId(userId: string): Promise<TodoItem[]> {
        logger.info('getTodosByUserId -> userId: '+ userId);

        const params = {
            TableName: this.todosTable,
            KeyConditionExpression: "#DYNOBASE_userId = :pkey",
            ExpressionAttributeValues: {
              ":pkey": userId
            },
            ExpressionAttributeNames: {
              "#DYNOBASE_userId": "userId"
            },
            ScanIndexForward: true
          };
          
        const result = await this.docClient.query(params).promise();
          
        const items = result.Items;

        return items as TodoItem[];
    }

    async createTodo(todo: TodoItem): Promise<TodoItem> {
        logger.info('createTodo');

        await this.docClient.put({
            TableName: this.todosTable,
            Item: todo
        }).promise();

        return todo;
    }

    async updateTodo(userId: string, todoId: string, todoUpdate: TodoUpdate): Promise<TodoUpdate> {
        logger.info('updateTodo -> userId:' + userId);
        logger.info('updateTodo -> todoId:' + userId);

        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set #dynobase_name = :name, dueDate = :dueDate, done = :done',
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done,
            },
            ExpressionAttributeNames: { "#dynobase_name": "name" }
        };

        await this.docClient.update(params, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        }).promise();
        
        return todoUpdate;
    }

    async updateAttachmentUrl(userId: string, todoId: string, uploadUrl: string): Promise<string> {
        logger.info('updateAttachmentUrl -> userId'+ userId);
        logger.info('updateAttachmentUrl -> todoId'+ todoId);
        logger.info('updateAttachmentUrl -> uploadUrl'+ uploadUrl);

        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': uploadUrl.split("?")[0]
            }
        };

        await this.docClient.update(params, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        }).promise();
        
        return uploadUrl;
    }

    async deleteTodo(userId: string, todoId: string) {
        logger.info('deleteTodo -> userId'+ userId);
        logger.info('deleteTodo -> todoId'+ userId);

        var params = {
            TableName: this.todosTable,
            Key: {
                userId: userId,
                todoId: todoId
            }
        };

        await this.docClient.delete(params, function (err, data) {
            if (err) console.log(err);
            else console.log(data);
        });
    }
}

function createDynamoDBClient() {
    if (process.env.IS_OFFLINE) {
        logger.info('Creating a local DynamoDB instance')
        return new XAWS.DynamoDB.DocumentClient({
            region: 'localhost',
            endpoint: 'http://localhost:8000'
        });
    }

    return new XAWS.DynamoDB.DocumentClient();
}