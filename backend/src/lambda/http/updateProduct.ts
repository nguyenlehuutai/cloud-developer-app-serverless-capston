import 'source-map-support/register'
import { updateProduct } from '../../businessLogic/products'
import { getUserId } from '../utils'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { UpdateProductRequest } from '../../requests/UpdateProductRequest'

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const productId = event.pathParameters.productId
    const updatedProduct: UpdateProductRequest = JSON.parse(event.body)
    // TODO: Update a TODO item with the provided id using values in the "updatedProduct" object
    const userId = getUserId(event);
   
    const result = await updateProduct(userId, productId, updatedProduct);
    
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        result
      })
    };
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
