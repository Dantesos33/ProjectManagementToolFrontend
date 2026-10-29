import { createSlice } from '@reduxjs/toolkit';

const initialState = { counter: 0 as number };

const Slice = createSlice({
    name: 'slice',
    initialState,
    reducers: {
        increment: (state: { counter: number }, action : { payload: number }) => {
            state.counter += action.payload;
        },
        decrement: (state: { counter: number }, action : { payload: number }) => {
            state.counter -= action.payload;
        }
    }
});

export const { increment, decrement } = Slice.actions;
export default Slice.reducer;