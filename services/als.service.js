// async_hooks comes from Node.js core
import { AsyncLocalStorage } from 'async_hooks'

// The AsyncLocalStorage singleton
export const asyncLocalStorage = new AsyncLocalStorage()

export const alsService = {
    getLoggedinUser
}

function getLoggedinUser() {
    const store = asyncLocalStorage.getStore()
    return store?.loggedinUser
}
