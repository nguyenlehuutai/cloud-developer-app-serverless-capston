import { ProductItem } from '../models/ProductItem'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import { CreateProductRequest } from '../requests/CreateProductRequest'
import { ProductsAccess } from '../dataLayer/productAcess'

const logger = createLogger('businessLogic-products')

const productsAccess = new ProductsAccess()


export async function createProduct(userId: string, newProduct: CreateProductRequest): Promise<ProductItem> {
  const createdAt = new Date().toISOString()  
  const productId = uuid.v4()
  let newItem: ProductItem = {
    userId,
    productId,
    createdAt,
    ...newProduct,
  }
  logger.info('call products.createProduct: ' + newItem);
  return await productsAccess.createProduct(newItem)
}

export async function getProductsByUserId(userId: string): Promise<ProductItem[]> {
  logger.info('call products.getProductsByUserId: ' + userId);
  return productsAccess.getProductsByUserId(userId)
}

export async function updateAttachmentUrl(userId: string, productId: string, attachmentUrl: string): Promise<string> {
  return productsAccess.updateAttachmentUrl(userId, productId, attachmentUrl)
}

export async function deleteProduct(userId: string, productId: string) {
  logger.info('call products.createProduct: ' + userId + "," + productId);
  return productsAccess.deleteProduct(userId, productId);
}
