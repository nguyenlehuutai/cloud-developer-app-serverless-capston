import { apiEndpoint } from '../config'
import Axios from 'axios'
import { Product } from '../types/Product'
import { CreateProductRequest } from '../types/CreateProductRequest'

// export async function createProduct(
//   idToken: string,
//   newProduct: CreateProductRequest
// ): Promise<Product> {
//   const response = await Axios.post(
//     `${apiEndpoint}/products`,
//     JSON.stringify(newProduct),
//     {
//       headers: {
//         'Content-Type': 'application/json',
//         Authorization: `Bearer ${idToken}`
//       }
//     }
//   )
//   console.log(response);
//   return response.data.item
// }
export async function createProduct(
  idToken: string,
  newTodo: CreateProductRequest
): Promise<Product> {
  const response = await Axios.post(`${apiEndpoint}/products`,  JSON.stringify(newTodo), {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${idToken}`
    }
  })
  return response.data.item
}

export async function getUploadUrl(
  idToken: string,
  productId: string
): Promise<string> {
  const response = await Axios.post(
    `${apiEndpoint}/products/${productId}/attachment`,
    '',
    {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      }
    }
  )
  return response.data.uploadUrl
}

export async function getProducts(idToken: string): Promise<Product[]> {
  
  const response = await Axios.get(`${apiEndpoint}/products`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
  return response.data.items
}

export async function deleteProduct(
  idToken: string,
  productId: string
): Promise<void> {
  await Axios.delete(`${apiEndpoint}/products/${productId}`, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    }
  })
}
