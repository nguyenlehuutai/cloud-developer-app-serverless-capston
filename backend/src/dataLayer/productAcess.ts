import { createLogger } from '../utils/logger'
import * as AWS from 'aws-sdk';
const AWSXRay = require('aws-xray-sdk');
import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import { ProductItem } from '../models/ProductItem';
const XAWS = AWSXRay.captureAWS(AWS);

const logger = createLogger('ProductsAccess')

export class ProductsAccess {

    constructor(
        private readonly docClient: DocumentClient = createDynamoDBClient(),
        private readonly productsTable = process.env.PRODUCTS_TABLE) {
    }

    async getProductsByUserId(userId: string): Promise<ProductItem[]> {
        logger.info('getProductsByUserId -> userId: '+ userId);

        const params = {
            TableName: this.productsTable,
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

        return items as ProductItem[];
    }

    async createProduct(product: ProductItem): Promise<ProductItem> {
        logger.info('createProduct');

        await this.docClient.put({
            TableName: this.productsTable,
            Item: product
        }).promise();

        return product;
    }

    async updateAttachmentUrl(userId: string, productId: string, uploadUrl: string): Promise<string> {
        logger.info('updateAttachmentUrl -> userId'+ userId);
        logger.info('updateAttachmentUrl -> productId'+ productId);
        logger.info('updateAttachmentUrl -> uploadUrl'+ uploadUrl);

        var params = {
            TableName: this.productsTable,
            Key: {
                userId: userId,
                productId: productId
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

    async deleteProduct(userId: string, productId: string) {
        logger.info('deleteProduct -> userId'+ userId);
        logger.info('deleteProduct -> productId'+ userId);

        var params = {
            TableName: this.productsTable,
            Key: {
                userId: userId,
                productId: productId
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