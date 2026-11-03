import {useGetTodosQuery} from '../store/Slice'

const Counter = () => {
    const { data, isLoading, isError} = useGetTodosQuery();

    if (isLoading) return <p>Loading...</p>;
    if (isError) return <p>Something went wrong!</p>;

    return (
        <ul>
            {data && data.length > 0 ? data.map((todo) => (
                <li key={todo.id}>{todo.title}</li>
            )) : ( <li>No todos found</li> )}
        </ul>
    );
}

export default Counter