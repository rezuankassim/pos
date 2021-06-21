import React, { useEffect, useRef, useState } from 'react';
import axios from 'axios'
import Modal from '@/Components/Modal';
import { ShoppingCartIcon, CheckIcon } from '@heroicons/react/outline'
import CurrencyInput from 'react-currency-input-field';

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

export default function Welcome({ startOrderId, startItems }) {
  const [ items, setItems ] = useState(startItems)
  const [ checkoutModalIsOpen, setCheckoutModalIsOpen ] = useState(false)
  const [ orderId, setOrderId ] = useState(startOrderId ? startOrderId : null)
  const [ paidAmount, setPaidAmount ] = useState(0)
  const [ change, setChange ] = useState(0)
  const [ successIsOpen, setSuccessIsOpen ] = useState(false)
  const okayButtonRef = useRef(null)

  useEffect(() => {
    if (! isNaN(paidAmount)) {
      setChange(paidAmount - getTotalCost())
    } else {
      setChange(0)
    }
    
    return [];
  }, [paidAmount])

  const addItem = (id) => {
    let product = products.find((product) => product.id === id)
    let index = items.findIndex((product) => product.product_id === id)

    if (index != -1) {
      axios.put(`/order/${orderId}/add`, {
        product_name: product.name
      }).then((res) => {
        items[index].quantity += 1
        items[index].cost = items[index].product_price * items[index].quantity

        setItems([
          ...items, 
        ])
      })      
    } else {
      axios.post('/order', {
        orderId: orderId,
        product_id: product.id,
        product_name: product.name,
        product_price: product.price,
      }).then((res) => {
        items.push({
          product_id: product.id,
          product_name: product.name,
          product_price: parseInt(product.price),
          quantity: 1,
          cost: parseInt(product.price),
        })

        setItems([
          ...items, 
        ])

        setOrderId(res.data.orderId)
      })
    }
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

    axios.put(`/order/${orderId}/add`, {
      product_name: items[index].product_name,
    }).then((res) => {
      items[index].quantity += 1
      items[index].cost = items[index].product_price * items[index].quantity

      setItems([
        ...items, 
      ])
    })
  }

  const remove = (id) => {
    let index = items.findIndex((item) => item.product_id === id)

    axios.put(`order/${orderId}/remove`, {
      product_name: items[index].product_name,
    }).then((res) => {
      if (items[index].quantity === 1) {
        items.splice(index, 1)

        if (items.length === 0) {
          cancel()
        }
      } else {
        items[index].quantity -= 1
        items[index].cost = items[index].product_price * items[index].quantity
      }

      setItems([ ...items ])
    })
  }

  const checkout = () => {
    axios.post(`/order/${orderId}/checkout`, {
      paid_amount: paidAmount
    }).then(() => {
      setCheckoutModalIsOpen(false)

      setSuccessIsOpen(true)

      setTimeout(() => {
        window.location.reload()
      }, 2000)
    })
  }

  const cancel = () => {
    axios.post(`/order/${orderId}/cancel`)
      .then(() => {
        window.location.reload()
      })
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
            className="rounded-xl px-6 py-4 bg-gray-300 disabled:opacity-40"
            onClick={() => cancel()}
            disabled={!orderId}
          >
            Cancel
          </button>

          <button
            type="button"
            className="rounded-xl shadow-xl bg-white px-6 py-4 disabled:opacity-40"
            onClick={() => setCheckoutModalIsOpen(true)}
            disabled={!orderId}
          >
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

      <Modal open={checkoutModalIsOpen} setOpen={setCheckoutModalIsOpen}>
        <Modal.Icon>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <ShoppingCartIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
          </div>
        </Modal.Icon>

        <Modal.Title>Checkout</Modal.Title>

        <Modal.Content>
          <div className="grid grid-cols-1 gap-y-4 mt-10 px-4 py-2">
            <div className="flex items-center justify-between">
              <span>Total Paid Amount</span>

              <CurrencyInput
                prefix={'RM '}
                decimalsLimit={2}
                className="border-gray-300 text-right focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 rounded-md shadow-sm"
                onValueChange={(value) => setPaidAmount(value * 100)}
              />
            </div>

            <div className="flex items-center justify-between">
              <span>Total</span>
              <span>{ format(getTotalCost()) }</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Payment Method</span>
              <span>Cash</span>
            </div>

            <div className="flex items-center justify-between">
              <span>Change</span>
              <span>{ format(change) }</span>
            </div>
          </div>
        </Modal.Content>

        <Modal.Footer className="mt-5 px-4 py-2 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <button
            type="button"
            className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            onClick={() => setCheckoutModalIsOpen(false)}
          >
            Cancel
          </button>

          <button
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={() => checkout()}
            disabled={paidAmount < getTotalCost()}
          >
            Checkout
          </button>
        </Modal.Footer>
      </Modal>

      <Modal focus={okayButtonRef} open={successIsOpen} setOpen={setSuccessIsOpen}>
        <Modal.Icon>
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
            <CheckIcon className="h-6 w-6 text-green-600" aria-hidden="true" />
          </div>
        </Modal.Icon>

        <Modal.Title>Success</Modal.Title>

        <Modal.Content>
          <div className="mt-2">
            <p className="text-sm text-gray-500">
              Order has been successfully checked out. Reloading the screen in 2 seconds.
            </p>
          </div>
        </Modal.Content>

        <Modal.Footer className="mt-5 px-4 py-2 sm:mt-6 sm:grid sm:grid-cols-1 sm:gap-3 sm:grid-flow-row-dense">
          <button
            ref={okayButtonRef}
            type="button"
            className="inline-flex justify-center w-full rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
            onClick={() => window.location.reload()}
          >
            OK
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
