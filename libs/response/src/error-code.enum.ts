export enum ErrorCode {
  UnknownError = 1,
  BadRequest = 10000,
  UnknownChannel = 10001,
  NothingToModify = 10002,
  InvalidKeyFormat,
  LoginAlreadyTaken = 20000,
  UnknownLogin = 30000,
}