import { Injectable } from '@nestjs/common'
import Snowflakify, { TimestampFragment, SequenceFragment, ProcessFragment } from 'snowflakify'

export const MOONCAT_EPOCH = 1672531200000

@Injectable()
export class SnowflakeService extends Snowflakify {
  constructor() {
    super({
      fragmentArray: [
        new TimestampFragment(53, MOONCAT_EPOCH),
        new SequenceFragment(8),
        new ProcessFragment(16),
      ],
    })
  }

  nextStringId() {
    return this.nextId().toString()
  }
}
