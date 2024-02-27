import { useState, useEffect } from "react";

import "./App.css";

const App = () => {
  const [lists, setLists] = useState([]);

  const addList = async (event) => {
    event.preventDefault();

    const newList = {
      name: event.target.list.value,
    };

    await fetch(`${process.env.REACT_APP_BACKEND_URL}/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newList),
    });

    event.target.list.value = ""; // sets input empty after clicking submit
    window.location.reload(); // reloads the window after sending request
  };

  /* Fetching the data from the backend and setting the state of lists to the data. */
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/lists`
      );
      const data = await result.json();
      setLists(data);
    };
    fetchData();
  }, []);

  return <div className="app">
    <header className="app-header">
      <h1>Add a list</h1>
      <form onSubmit={addList}>
        <div>
          <label htmlFor="list">List:</label>
          <input
            type="text"
            id="list"
            name="list"
            autoComplete="off"
          />
        </div>
        <button type="submit">Add</button>
      </form>
    </header>
    <main className="app-main">
      <h2>Today</h2>
      {lists && lists.length > 0 ? (
        <ol>
          {lists.map((list) => (
            <li key={list._id}>
              {list.name}
            </li>
          ))}
        </ol>
      ) : (
        <p>No lists yet</p>
      )}
    </main>
  </div>;
}

export default App;