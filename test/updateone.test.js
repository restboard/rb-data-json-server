import t from 'tap'
import createProvider from '../src/index.js'

t.test('updateOne', async t => {
  const provider = createProvider('https://jsonplaceholder.typicode.com')
  const id = 1
  const data = {
    title: 'foo'
  }
  const res = await provider.updateOne('posts', id, data)
  const { id: key, ...details } = res.data || {}
  t.equal(key, id, 'should return the patched resource identified by id')
  t.deepEqual(
    details.title,
    data.title,
    'the resource should include patched attributes'
  )
})
