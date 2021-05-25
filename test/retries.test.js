import * as t from 'tap'
import createProvider from '../src/index'

t.test('retries', async t => {
  let attempts = 0
  const fakeHttp = async () => {
    attempts += 1
    return { status: 503 }
  }
  const opts = {
    retries: 3,
    client: fakeHttp
  }
  const provider = createProvider('https://example.com', opts)
  try {
    await provider.getMany('posts')
    t.fail('should throw an error')
  } catch (err) {
    t.equal(attempts, opts.retries, 'should have performed the given number of attempts before failing')
  }
})
