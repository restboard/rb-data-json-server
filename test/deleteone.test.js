import * as t from 'tap'
import createProvider from '../src/index'

t.test('deleteOne', async t => {
  const provider = createProvider('https://jsonplaceholder.typicode.com')
  const id = 1
  const res = await provider.deleteOne('posts', { id })
  t.equal(id, res.data.id, 'should return the id of the deleted resource')
})
