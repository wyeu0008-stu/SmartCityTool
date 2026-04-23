export const ACCESS_PASSWORD = 'fit5120'

const accessKey = (scope) => `smartcycle:${scope}:authorized`

export function hasPasswordAccess(scope) {
  return sessionStorage.getItem(accessKey(scope)) === 'true'
}

export function grantPasswordAccess(scope) {
  sessionStorage.setItem(accessKey(scope), 'true')
}
