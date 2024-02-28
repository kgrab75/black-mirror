import { useState, useEffect } from "react";

import "./App.css";

const App = () => {
  const [lists, setLists] = useState([]);
  const token = localStorage.getItem("token");

  /* Fetching the data from the backend and setting the state of lists to the data. */
  useEffect(() => {
    const fetchData = async () => {
      const result = await fetch(
        `${process.env.REACT_APP_BACKEND_URL}/lists`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await result.json();
      setLists(data);
    };
    fetchData();
  }, [token]);

  const addList = async (event) => {
    event.preventDefault();

    const newList = {
      name: event.target.list.value,
    };

    await fetch(`${process.env.REACT_APP_BACKEND_URL}/list`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(newList),
    });

    event.target.list.value = ""; // sets input empty after clicking submit
    window.location.reload(); // reloads the window after sending request
  };

  return <div className="app">
    <header className="app-header">
      <h1 data-testid={"app-header-heading"}>Add a list</h1>
      <form onSubmit={addList} data-testid={"app-header-form"}>
        <div>
          <label htmlFor="list">List:</label>
          <input
            type="text"
            id="list"
            name="list"
            autoComplete="off"
            data-testid={"app-header-input"}
          />
        </div>
        <button type="submit" data-testid={"app-header-submit"}>Add</button>
      </form>
    </header>
    <main className="app-main">
      <h2>Today</h2>
      {lists && lists.length > 0 ? (
        <ol data-testid={"app-main-lists"}>
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