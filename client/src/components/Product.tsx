import { History } from 'history'
import { Form, Button, Icon, Divider } from 'semantic-ui-react'
import * as React from 'react'
import { Grid, Header, Loader } from 'semantic-ui-react'
import Auth from '../auth/Auth'
import {
  createProduct,
  deleteProduct,
  getProducts
} from '../api/product-api'
import { Product } from '../types/Product'

interface ProductsProps {
  auth: Auth
  history: History
}

interface ProductState {
  products: Product[]
  loadingProducts: boolean
  file: any
  productTitle: string,
  description: string,
  inputKey: string
}


export class Products extends React.PureComponent<ProductsProps, ProductState> {
  state: ProductState = {
    products: [],
    file: undefined,
    loadingProducts: true,
    productTitle: '',
    description: '',
    inputKey: new Date().toISOString()
  }

  async componentDidMount() {
    try {
      await this.loadProduct()
    } catch (e) {
      alert(`Failed to fetch todos: ${e}`)
    }
  }

  async loadProduct() {
    const products = await getProducts(this.props.auth.getIdToken())
    this.setState({
        products,
        loadingProducts: false
    })
  }

  render() {
    return (
      <div>
        <Header as="h1">Product</Header>

        <div>
          <h1>Add New Product</h1>

          <Form onSubmit={this.handleSubmit}>
            <Form.Field>
              <label>Title</label>
              <input
                value={this.state.productTitle}
                type="text"
                placeholder="Title"
                required
                onChange={this.handleTitleChange}
              />
            </Form.Field>
            <Form.Field>
              <label>Description</label>
              <textarea
                value={this.state.description}
                name="description"
                placeholder="Description"
                onChange={this.handleDescriptionChange}
              />
            </Form.Field>
            
            {this.renderButton()}
          </Form>
          {this.renderProducts()}
        </div>
      </div>
    )
  }

  handleTitleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ productTitle: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    this.setState({ description: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      const todos = await createProduct(this.props.auth.getIdToken(), {
        title: this.state.productTitle,
        description: this.state.description
      })
      this.state.productTitle = '';
      this.state.description = '';

      alert("Add new product successfully.");
      await this.loadProduct();
    } catch (e) {
      alert('Add new product failt. ' + e)
    }
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    this.setState({
      file: files[0]
    })
  }

  renderButton() {
    return (
      <div>
        <Button
          type="submit"
        >
          Save Product
        </Button>
      </div>
    )
  }

  renderProducts() {
    if (this.state.loadingProducts) {
      return this.renderLoading()
    }

    return this.renderProductsList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading Products
        </Loader>
      </Grid.Row>
    )
  }

  renderProductsList() {
    return (
      <Grid padded>
        {this.state.products.map((product) => {
          return (
            <Grid.Row key={product.productId}>
              <Grid.Column width={10} verticalAlign="middle">
                {product.title}
              </Grid.Column>
              <Grid.Column width={10} verticalAlign="middle">
                <b>Description</b>: {product.description}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onProductDelete(product.productId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

  onProductDelete = async (productId: string) => {
    try {
      await deleteProduct(this.props.auth.getIdToken(), productId)
      this.setState({
        products: this.state.products.filter((product) => product.productId !== productId)
      })
    } catch {
      alert('product deletion failed')
    }
  }

  handleClear = () => {
    this.setState({ productTitle: '', inputKey: new Date().toISOString() })
  }
}
