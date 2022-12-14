import { formatJSONErrorResponse, formatJSONResponse } from '@libs/api-gateway'
import { middyfy } from '@libs/lambda'

import stockService from '../../stock.service'
import productService from '../../product.service'

export const getProductList = async () => {
  try {
    console.log('Lambda getProductList is invoked! No arguments needed.')

    const [products, stocks] = await Promise.all([
      productService.getProducts(),
      stockService.getStocks(),
    ])

    const productIdList = products.map((product) => product.id)

    const filteredStocks = stocks.filter((stock) =>
      productIdList.includes(stock.product_id)
    )

    const res = []

    products.forEach((product) => {
      const { id } = product
      const stock = filteredStocks.find((el) => el.product_id === id)

      res.push({ ...product, count: stock?.count || 0 })
    })

    return formatJSONResponse({
      products: res,
    })
  } catch (e) {
    return formatJSONErrorResponse(e, 500)
  }
}

export const main = middyfy(getProductList)
