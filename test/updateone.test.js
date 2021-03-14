import * as t from 'tap'
import createProvider from '../src/index'

t.test('updateOne', async t => {
  const provider = createProvider('https://jsonplaceholder.typicode.com')
  const data = {
    id: 1,
    title: 'foo'
  }
  const res = await provider.updateOne('posts', data)
  const { id, ...details } = res.data || {}
  t.equal(id, data.id, 'should return the patched resource identified by id')
  t.deepEqual(details.title, data.title, 'the resource should include patched attributes')
})
