import t from 'tap'
import createProvider from '../src/index.js'

t.test('batching', async t => {
  let attempts = 0
  const successRes = {
    status: 200,
    statusText: 'OK',
    ok: true,
    json: async () => ({})
  }
  const fakeHttp = async () => {
    attempts += 1
    return new Promise((resolve, reject) => {
      setTimeout(() => resolve(successRes), 250)
    })
  }
  const opts = {
    client: fakeHttp
  }
  const provider = createProvider('https://example.com', opts)
  try {
    await Promise.all([
      provider.getMany('posts'),
      provider.getMany('posts'),
      provider.getMany('posts')
    ])
    t.equal(attempts, 1, 'should have batched requests in a single HTTP call')
  } catch (err) {
    console.error(err)
    t.error(err, 'should not throw any error')
  }
})
