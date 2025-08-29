import { useEffect, useRef, useState } from "react";
import "./App.css";
import { eq, useLiveQuery } from "@tanstack/react-db";
import { useForm } from "@tanstack/react-form";
import { updatesCollection } from "./updatesCollection";
import { v7 } from "uuid";

function App() {
  const [filterType, setFilterType] = useState<"all" | "blocked">("all");
  const listRef = useRef<HTMLUListElement>(null);
  const hasInitialized = useRef(false);

  const { data } = useLiveQuery(
    (q) => {
      if (filterType === "blocked") {
        return q
          .from({ updates: updatesCollection })
          .where(({ updates }) => eq(updates.blocked, true));
      }
      return q.from({ updates: updatesCollection });
    },
    [filterType], // Add dependency array
  );

  // Scroll to bottom on initial data load only
  useEffect(() => {
    if (listRef.current && data.length > 0 && hasInitialized.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
      hasInitialized.current = true;
    }
  }, [data.length]);

  const form = useForm({
    defaultValues: {
      description: "",
      username: "",
      blocked: false,
    },
    onSubmit: ({ value }) => {
      // this is a synchronous call
      updatesCollection.insert({
        blocked: value.blocked,
        created_at: null,
        description: value.description,
        update_id: v7(),
        username: value.username,
      });

      // Scroll to bottom after insert
      if (listRef.current) {
        setTimeout(() => {
          if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
          }
        }, 10); // Small delay to ensure DOM updates
      }

      form.reset();
    },
  });

  return (
    <>
      <h1 className="page-title">Tanstack DB Demo</h1>

      <div className="updates-container">
        <div className="updates-header">
          <h2>Recent Updates</h2>
          <div className="filter-buttons">
            <button
              className={`filter-button ${filterType === "all" ? "active" : ""}`}
              onClick={() => setFilterType("all")}
            >
              All
            </button>
            <button
              className={`filter-button ${filterType === "blocked" ? "active" : ""}`}
              onClick={() => setFilterType("blocked")}
            >
              Blocked
            </button>
          </div>
        </div>
        <ul className="updates-list" ref={listRef}>
          {data.map((update) => (
            <li key={update.update_id} className="update-item">
              <span className="update-username">{update.username}:</span>
              <span className="update-description">{update.description}</span>
              {update.blocked && (
                <span className="update-blocked">BLOCKED</span>
              )}
            </li>
          ))}
        </ul>
      </div>

      <div className="form-container">
        <h2>Add New Update</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            e.stopPropagation();
            form.handleSubmit();
          }}
        >
          <form.Field
            name="username"
            children={(field) => (
              <div className="form-field">
                <label htmlFor={field.name}>Username</label>
                <input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />

          <form.Field
            name="description"
            children={(field) => (
              <div className="form-field">
                <label htmlFor={field.name}>Description</label>
                <input
                  id={field.name}
                  type="text"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </div>
            )}
          />

          <form.Field
            name="blocked"
            children={(field) => (
              <div className="checkbox-field">
                <label htmlFor={field.name}>
                  <input
                    id={field.name}
                    type="checkbox"
                    checked={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.checked)}
                  />
                  Mark as Blocked
                </label>
              </div>
            )}
          />

          <button type="submit" className="submit-button">
            Add Update
          </button>
        </form>
      </div>
    </>
  );
}

export default App;
