import {
  formatJSONErrorResponse,
  formatJSONResponse,
  ValidatedEventAPIGatewayProxyEvent,
} from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'

import schema from './schema'

import productService from '../../product.service'
import stockService from '../../stock.service'

export const getProductById: ValidatedEventAPIGatewayProxyEvent<
  typeof schema
> = async (event) => {
  try {
    console.log(
      'Lambda getProductById is invoked! productId: ' + event.pathParameters.id
    )

    const productId = event.pathParameters.id

    const [foundProduct, foundStock] = await Promise.all([
      productService.getProductById(productId),
      stockService.getStockByProductId(productId),
    ])

    if (!foundProduct) {
      return formatJSONErrorResponse(
        `Product with id ${productId} was not found`,
        404
      )
    }

    const count = foundStock?.count || 0

    return formatJSONResponse({
      products: {
        ...foundProduct,
        count,
      },
    })
  } catch (e) {
    return formatJSONErrorResponse(e, 500)
  }
}

export const main = middyfy(getProductById)
