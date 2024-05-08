import { describe, it } from 'mocha'
import assert from 'assert'

describe('string lenght', function () {
  it('string lenght of sum should be equal to sum of string lenghts', function () {
    const first_string = 'aa'
    const second_string = 'aa'
    const sum_string = first_string + second_string
    assert.equal(first_string.length + second_string.length, sum_string.length)
  })
})
