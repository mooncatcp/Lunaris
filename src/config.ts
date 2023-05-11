import inquirer from 'inquirer'
import { parse } from 'pg-connection-string'
import fs from 'fs/promises'
import fsCb from 'fs'
import crypto from 'crypto'

async function configure() {
  if (fsCb.existsSync('./.mooncatrc')) {
    console.error('Cancelling configuration process, .mooncatrc file already exists.')
    return
  }

  // don't ask
  const answers = await inquirer.prompt(
    [
      {
        name: 'APP_PORT',
        message: 'Choose application port',
        type: 'number',
        default: '3000',
      },
      {
        name: 'DB_TYPE',
        message: 'Choose database type',
        type: 'list',
        choices: [ 'postgres' ],
      },
      {
        name: 'DB_DSN',
        message: 'Enter the DSN for the database:',
        type: 'input',
        validate(input: string): boolean {
          try {
            parse(input)
          } catch {
            return false
          }
          return true
        },
      },
      {
        name: 'DEBUG',
        message: 'Would you like to enable debug mode?',
        type: 'confirm',
        default: false,
      },
      {
        name: 'GENERATE_SECRETS',
        message: 'Would you like to generate secrets? Warning: after you\'ve initialized your server, you cannot reset them without loosing data',
        type: 'confirm',
      },
    ],
  )

  const ignore = [
    'GENERATE_SECRETS',
  ]

  let output = ''

  if (answers['GENERATE_SECRETS'] === true) {
    answers['AES_KEY'] = crypto.randomBytes(32).toString('hex')
  }

  for (const key in answers) {
    const value = answers[key]
    const serialized = typeof value === 'boolean' ? (value ? 'true' : 'false') : value
    if (ignore.includes(key)) {
      continue
    }
    output += `${key}=${serialized}\n`
  }

  if (answers['GENERATE_SECRETS'] === true) {
    answers['AES_KEY'] = crypto.randomBytes(16).toString('hex')
  }

  const out = output.trim()
  await fs.writeFile('./.mooncatrc', out)
  console.log('Saved new config to .mooncatrc')
}

configure()