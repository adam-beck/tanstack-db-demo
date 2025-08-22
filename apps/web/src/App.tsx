import { useId, useState, type FormEvent } from "react";
import "./App.css";
import { useLiveQuery } from "@tanstack/react-db";
import { updatesCollection } from "./updatesCollection";
import { v7 } from "uuid";

function App() {
  const [description, setDescription] = useState("");

  const { data } = useLiveQuery((q) => {
    return q.from({ updates: updatesCollection });
  });

  const descriptionFieldId = useId();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();

    updatesCollection.insert({
      blocked: false,
      created_at: null,
      description: description,
      update_id: v7(),
      username: "Adam",
    });

    setDescription("");
  }

  return (
    <>
      <h1>Tanstack DB Demo</h1>
      <div>
        <ul style={{ listStyle: "none" }}>
          {data.map((update) => (
            <li key={update.update_id}>
              {update.username}: {update.description}
            </li>
          ))}
        </ul>
      </div>
      <div>
        <form onSubmit={handleSubmit}>
          <label htmlFor={descriptionFieldId}>Description</label>
          <input
            type="text"
            id={descriptionFieldId}
            onChange={(e) => setDescription(e.currentTarget.value)}
            value={description}
          />
          <button type="submit">Add Update</button>
        </form>
      </div>
    </>
  );
}

export default App;
