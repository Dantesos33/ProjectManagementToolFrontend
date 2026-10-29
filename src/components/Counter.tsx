import {useDispatch, useSelector} from 'react-redux'
import {increment, decrement} from '../store/Slice'

const Counter = () => {
    const count = useSelector((state: { counter: { counter: number } }) => state.counter.counter);
    const dispatch = useDispatch();
  return (
    <>
    <div className='mt-4'>Counter: {count}</div>
    <div className='flex gap-4 mt-4'>
    <button className='bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600' onClick={() => dispatch(increment(1))}>Increment</button>
    <button className='bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600' onClick={() => dispatch(decrement(1))}>Decrement</button>
    </div>
    </>
  )
}

export default Counter