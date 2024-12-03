export type RefObject = {
  current: any;
};

export type ReactProviderType<T> = {
  $$typeof: symbol | number;
  _context: ReactContext<T>;
};

export type ReactContext<T> = {
  $$typeof: symbol | number;
  Consumer: ReactContext<T>;
  Provider: ReactProviderType<T>;
  _currentValue: T;
  _currentValue2: T;
  _threadCount: number;
  // DEV only
  _currentRenderer?: Record<string, any> | null;
  _currentRenderer2?: Record<string, any> | null;
  // This value may be added by application code
  // to improve DEV tooling display names
  displayName?: string;
  // only used by ServerContext
  _defaultValue: T;
  _globalName: string;
};
