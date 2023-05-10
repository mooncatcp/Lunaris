import { Matches } from 'class-validator'

export const loginRegexp = /^[A-Za-z0-9._@]{3,20}$/gm

export const IsLogin = () => Matches(loginRegexp)