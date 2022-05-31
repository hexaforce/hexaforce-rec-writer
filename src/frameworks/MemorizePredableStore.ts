import getCompositeSymbol from 'composite-symbol'

function assertIsSelector<T>(val: any): asserts val is PrediableStore<T> {
  if (typeof val !== 'object') {
    throw new Error(`selector should be a object`)
  }
  if (val === null) {
    throw new Error(`selector should be a object`)
  }
  if (typeof val.get !== 'function') {
    throw new Error('selector should have `selector.get()` function')
  }
  if (typeof val.select !== 'function') {
    throw new Error('selector should have `selector.select()` function')
  }
  if (typeof val.onChange !== 'function') {
    throw new Error('selector should have `selector.onChange()` function')
  }
}

export const createMemorizedSelectFromGet = <T>(get: () => T): PrediableStore<T>['select'] => {
  const cacheMap = new Map<symbol, ReturnType<PrediableStore<T>['select']>>()
  return <R>(userSelector: (domains: T) => R): R => {
    const domainContainer = get()
    const domainValues = Object.values(domainContainer)
    const cacheKey = getCompositeSymbol(...domainValues)
    if (cacheMap.has(cacheKey)) {
      return cacheMap.get(cacheKey) as any as R
    }
    const selectedState = userSelector(domainContainer)
    cacheMap.set(cacheKey, selectedState as any)
    return selectedState
  }
}
export const memorizePredableStore = <T>(store: PrediableStore<T>): PrediableStore<T> => {
  assertIsSelector<T>(store)
  const originalSelect = store.select
  const cacheMap = new Map<symbol, ReturnType<typeof originalSelect>>()
  const select = <R>(userSelector: (domain: ReturnType<typeof store.get>) => R): R => {
    const domainContainer = store.get()
    const domainValues = Object.values(domainContainer)
    const cacheKey = getCompositeSymbol(...domainValues, userSelector)
    if (cacheMap.has(cacheKey)) {
      // log(`${store.name ? "[" + store.name + "]" : ""} No update state`);
      return cacheMap.get(cacheKey) as any as R
    }
    const selectedState = userSelector(domainContainer)
    // log(`${store.name ? "[" + store.name + "]" : ""} Update state`, selectedState);
    cacheMap.set(cacheKey, selectedState as any)
    return selectedState
  }
  return {
    name: store.name,
    get: store.get,
    onChange: store.onChange,
    select,
  }
}

export type PrediableStore<
  Domain extends {
    [index: string]: any | undefined
  },
  > = {
    name?: string
    get(): Domain
    select<R>(selector: (domain: Domain) => R): R
    onChange(changeHandler: () => void): () => void
  }

type InfraParameter = {
  [index: string]: any
}
type DomainParameter = {
  [index: string]: any | undefined
}

export type CreateStore<Infra extends InfraParameter, Domain = DomainParameter> = (infra: Infra) => PrediableStore<Domain>

function assertIsStoreCreator(val: unknown): asserts val is CreateStore<{}> {
  if (typeof val !== 'function') {
    throw new Error(`Store should be function`)
  }
}

function assertStoreArguments(args: unknown[]): asserts args is [InfraParameter] {
  if (args.length === 0) {
    throw new Error('Store should have infra parameter')
  }
}

export const wrapPredableStore = <T>(createStore: T): T => {
  assertIsStoreCreator(createStore)
  const wrappedSelector = (...args: any[]) => {
    assertStoreArguments(args)
    const store = createStore(...args)
    return memorizePredableStore({
      name: createStore.name,
      ...store,
    })
  }
  return wrappedSelector as any as T
}
