import React, { useState } from 'react';
import { InertiaLink } from '@inertiajs/inertia-react';
import { add, remove } from 'lodash';

const products = [
  { id: 1, name: 'P1', price: '1000' },
  { id: 2, name: 'P2', price: '1900' },
  { id: 3, name: 'P3', price: '1599' },
]

const format = (number) => {
  let formatter = new Intl.NumberFormat('en-MY', {
    style: 'currency',
    currency: 'MYR',
  })

  return formatter.format(number / 100)
}

export default function Welcome(props) {
  const [ items, setItems ] = useState([])

  const addItem = (id) => {
    let product = products.find((product) => product.id === id)
    let index = items.findIndex((product) => product.product_id === id)

    if (index != -1) {
      items[index].quantity += 1
      items[index].cost = items[index].product_price * items[index].quantity
    } else {
      items.push({
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
        quantity: 1,
        cost: product.price,
      })
    }

    return setItems([
      ...items, 
    ])
  }

  const getTotal = () => {
    if (! items.length) {
      return 0
    }

    return items.reduce((total, item) => total + item.cost, 0)
  }

  const getQuantity = () => {
    if (! items.length) {
      return 0
    }

    return items.reduce((total, item) => total + item.quantity, 0)
  }

  const getTotalCost = () => {
    if (! items.length) {
      return 0
    }

    return getTotal() * 1.06
  }

  const add = (id) => {
    let index = items.findIndex((item) => item.product_id === id)

    items[index].quantity += 1
    items[index].cost = items[index].product_price * items[index].quantity

    return setItems([ ...items ])
  }

  const remove = (id) => {
    let index = items.findIndex((item) => item.product_id === id)

    if (items[index].quantity === 1) {
      items.splice(index, 1)
    } else {
      items[index].quantity -= 1
      items[index].cost = items[index].product_price * items[index].quantity
    }

    return setItems([ ...items ])
  }

  return (
    <div className="grid grid-cols-2 min-h-screen bg-gray-200 dark:bg-gray-900">
      <div className="flex flex-col p-8">
        <h2 className="flex items-center justify-center font-semibold text-2xl">POS Cashier</h2>

        <div className="flex flex-col mt-8 px-4 py-2">
          <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
              <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Product
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Price (RM)
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Quantity
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Cost (RM)
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((item) => (
                        <tr key={item.product_id} className="bg-white odd:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.product_name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(item.product_price)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <div className="flex items-center space-x-3">
                              <button
                                type="button"
                                className="rounded-full font-bold text-lg text-red-400"
                                onClick={() => remove(item.product_id)}
                              >
                                -
                              </button>

                              <span>{item.quantity}</span>

                              <button
                                type="button"
                                className="rounded-full font-bold text-lg text-green-400"
                                onClick={() => add(item.product_id)}
                              >
                                +
                              </button>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{format(item.cost)}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-y-4 mt-10 px-4 py-2">
          <div className="flex items-center justify-between">
            <span>Subtotal</span>
            <span>{ format(getTotal()) }</span>
          </div>

          <div className="flex items-center justify-between">
            <span>No. of items</span>
            <span>{ getQuantity() }</span>
          </div>

          <div className="flex items-center justify-between">
            <span>Tax</span>
            <span>6%</span>
          </div>

          <div className="flex items-center justify-between">
            <span>Service Charge</span>
            <span>-</span>
          </div>

          <div className="w-full h-px bg-gray-800"></div>

          <div className="flex items-center justify-between">
            <span>Total</span>
            <span>{ format(getTotalCost()) }</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-x-3 px-4 py-2">
          <button
            type="button"
            className="rounded-xl px-6 py-4 bg-gray-300"
            onClick={() => setItems([])}
          >
            Cancel
          </button>

          <button className="rounded-xl shadow-xl bg-white px-6 py-4">
            Checkout
          </button>
        </div>
      </div>

      <div className="flex flex-col rounded-l-3xl shadow-xl bg-white p-8">
        <h2 className="flex items-center justify-center font-semibold text-2xl">Products</h2>

        <div className="flex-1 grid grid-cols-2 gap-6 auto-rows-max overflow-y-auto mt-8 px-4 py-2">
          { products.map((product) => (
            <button
              key={product.id}
              type="button"
              className="rounded-3xl shadow-xl bg-gray-100 h-36 px-6 py-4"
              onClick={() => addItem(product.id)}
            >
              {product.name}
            </button>
          )) }
        </div>
      </div>
    </div>
  );
}
