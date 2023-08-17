import { PaymentIntent } from "@stripe/stripe-js"

export async function fetchGetJSON(url: string) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const data: JSON = await fetch(url).then((res) => res.json())
      return data
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message)
      }
      throw err
    }
  }
  
  export async function fetchPostJSON(url: string, data?: Record<string, unknown>) {
    try {
      // Default options are marked with *
      const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data || {}), // body data type must match "Content-Type" header
      })
      return await response.json() as Record<string, null>
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message)
      }
      throw err
    }
  }

  export async function fetchPaymentIntent(url: string, data?: Record<string, unknown>) {
    try {
      // Default options are marked with *
      const response = await fetch(url, {
        method: 'POST', // *GET, POST, PUT, DELETE, etc.
        mode: 'cors', // no-cors, *cors, same-origin
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        credentials: 'same-origin', // include, *same-origin, omit
        headers: {
          'Content-Type': 'application/json',
          // 'Content-Type': 'application/x-www-form-urlencoded',
        },
        redirect: 'follow', // manual, *follow, error
        referrerPolicy: 'no-referrer', // no-referrer, *client
        body: JSON.stringify(data || {}), // body data type must match "Content-Type" header
      })
      return await response.json() as PaymentIntent
    } catch (err) {
      if (err instanceof Error) {
        throw new Error(err.message)
      }
      throw err
    }
  }