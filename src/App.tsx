import Counter from "./components/Counter.tsx";


function App() {

  return (
    <>
      <div className="bg-black text-white h-screen flex flex-col justify-center items-center">
        <h1 className="text-4xl font-bold">Project Management Tool</h1>
        <Counter />
      </div>
    </>
  )
}

export default App
