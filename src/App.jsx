import { useState } from "react";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className='min-h-screen bg-gray-950 text-white flex flex-col items-center justify-center gap-8'>
      <div className='flex gap-6'>
        <a href='https://vite.dev' target='_blank'>
          <img
            src='/vite.svg'
            className='h-16 hover:scale-110 transition-transform duration-300'
            alt='Vite logo'
          />
        </a>
        <a href='https://react.dev' target='_blank'>
          <img
            src='/react.svg'
            className='h-16 hover:scale-110 transition-transform duration-300 animate-spin [animation-duration:8s]'
            alt='React logo'
          />
        </a>
      </div>

      <h1 className='text-4xl font-bold tracking-tight'>Vite + React</h1>

      <div className='bg-gray-800 rounded-2xl p-8 flex flex-col items-center gap-4 shadow-lg'>
        <button
          onClick={() => setCount((count) => count + 1)}
          className='bg-indigo-600 hover:bg-indigo-500 active:scale-95 transition-all duration-200 text-white font-semibold px-6 py-3 rounded-xl'
        >
          count is {count}
        </button>
        <p className='text-gray-400 text-sm'>
          Edit{" "}
          <code className='bg-gray-700 px-2 py-1 rounded text-indigo-300'>
            src/App.jsx
          </code>{" "}
          and save to test HMR
        </p>
      </div>

      <p className='text-gray-500 text-sm'>
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
