import t from 'tap'
import createProvider from '../src/index.js'

t.test('deleteOne', async t => {
  const provider = createProvider('https://jsonplaceholder.typicode.com')
  const id = 1
  const { data: key } = await provider.deleteOne('posts', id)
  t.equal(id, key, 'should return the id of the deleted resource')
})
