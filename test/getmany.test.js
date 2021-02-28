import * as t from 'tap'
import createProvider from '../index'

t.test('getMany', async t => {
  const provider = createProvider('https://jsonplaceholder.typicode.com')
  const res = await provider.getMany('users')
  t.equal(res.data.length, 10, 'should return all requested resources')
})
