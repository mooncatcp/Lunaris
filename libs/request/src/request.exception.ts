export enum RequestExceptionType {
  INVALID_SIGNATURE = 'INVALID_SIGNATURE',
  PARSE_NON_BODY = 'PARSE_NON_BODY',
  EXPECTED_TYPE = 'EXPECTED_TYPE',
  EXPECTED_OBJECT = 'EXPECTED_OBJECT',
}

export class RequestException extends Error {
  constructor(type: RequestExceptionType) {
    super(type as string)
  }
}