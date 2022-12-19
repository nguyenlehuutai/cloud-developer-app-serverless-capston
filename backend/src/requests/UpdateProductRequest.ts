/**
 * Fields in a request to update a single TODO item.
 */
export interface UpdateProductRequest {
  name: string
  dueDate: string
  done: boolean
}