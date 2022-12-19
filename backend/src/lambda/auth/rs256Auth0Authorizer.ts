
import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify } from 'jsonwebtoken'
import { JwtPayload } from '../../auth/JwtPayload'

const cert = `-----BEGIN CERTIFICATE-----
MIIC7jCCAdagAwIBAgIJNlBcM36WDATpMA0GCSqGSIb3DQEBBQUAMB4xHDAaBgNV
BAMTE3RhaW5ndXllbi5hdXRoMC5jb20wHhcNMTYwODI3MDI0MTA0WhcNMzAwNTA2
MDI0MTA0WjAeMRwwGgYDVQQDExN0YWluZ3V5ZW4uYXV0aDAuY29tMIIBIjANBgkq
hkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA6dY4pnwB1hjlBN9iJn9KjyrwTmkXlQTB
sescyvTJpmbPkHp4OBCpzb5xilURivb/RhZtqHOCNZeVdGzOUaTn+bQy9rl1SFa+
m/uQZ57mMcZIVu9Z2pNZEAlCD2zljG+wv1r5RdAUg3zPF4JbYVVhVjK1V4sJGmEB
oYF/Pf41nhyWrObRjx65W6kQ5MAW5WWWyqDpwTX7wke+dgaPo3OJLrCHGTnJ1oMH
xW1J1ORBUF9nGkC0jpN5Q4UgcF8DudZl0J96PIgTQIdeqlLorZ9fi7fNPOpYwOFC
POYJNMgp5KDzKyqBy9/MJ4urzIimIixHRsoDOIx9pKOaNLW/sXzatwIDAQABoy8w
LTAMBgNVHRMEBTADAQH/MB0GA1UdDgQWBBRsSOeSxunCMYSAAaQeMaTRBE9RoDAN
BgkqhkiG9w0BAQUFAAOCAQEAq/rwxxTOffy3I9E+G1Eq8kqixaLW8W04nhmIMQuA
3WQHM33C06h/6LmJ9YIc9tznVqnenTJMnTbXR5d+AcqBLBgSVQf+VO2B/TMIKnbO
N69ZvIbKvTRYnP21fgIUC80Ie3Xs2ix8syYpje4YhxtMW1IWkwRb/dzYe33oYl3E
pNYpHm1TlCnqSOs6elLLqSPvcI5KlcdRnH6wTAbvCV53t3jAYUDrtVgzeWrXBxjk
1DNkPjIzyyB1EHJdxthmSDbC4pOyNdnj6TJNW0aNslG4+zbIl8n1dkshfXOKpfXB
DzBoVj3SHxMY82DxF/9Gp4Pj9tY2Qd1KlYIqSBj8a63Zug==
-----END CERTIFICATE-----`

export const handler = async (event: CustomAuthorizerEvent): Promise<CustomAuthorizerResult> => {
  try {
    const jwtToken = verifyToken(event.authorizationToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

function verifyToken(authHeader: string): JwtPayload {
  if (!authHeader)
    throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return verify(token, cert, { algorithms: ['RS256'] }) as JwtPayload
}