/* eslint-disable @typescript-eslint/no-shadow */
import './App.scss';
import { ChangeEvent, FormEvent, useState } from 'react';
import { usersFromServer } from './api/users';
import { todosFromServer } from './api/todos';
import { TodoAggregate } from './domain/TodoAggregate';
import { TodoList } from './components/TodoList';
import { Todo } from './domain/Todo';
import { Nullable } from './domain/Nullable';

let maxTodoId = Math.max(...todosFromServer.map(todo => todo.id));

export const App = () => {
  const [todos, setTodos] = useState(todosFromServer);

  const handleAddTodo = (todo: Todo) => {
    setTodos(currentTodos => [...currentTodos, todo]);
  };

  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState<Nullable<string>>();

  const [ownerId, setOwnerId] = useState<number>(0);
  const [ownerError, setOwnerError] = useState<Nullable<string>>();

  const handleTitleChange = (event: ChangeEvent<HTMLInputElement>) => {
    setTitleError('');
    setTitle(event.target.value.trimStart());
  };

  const handleResetForm = () => {
    setTitle('');
    setOwnerId(0);
    setOwnerError('');
    setTitleError('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setOwnerError(null);
    setTitleError(null);

    const normalizedTitle = title.trim();

    if (!normalizedTitle) {
      setTitleError('Please enter a title');
      return;
    }

    if (ownerId === 0) {
      setOwnerError('Please choose a user');
      return;
    }

    const newTodo: Todo = {
      id: maxTodoId + 1,
      title: normalizedTitle,
      completed: false,
      userId: ownerId,
    };

    handleAddTodo(newTodo);
    maxTodoId++;
    handleResetForm();
  };

  const aggregatedTodos = todos.map(todo => {
    const user =
      usersFromServer.find(userIn => userIn.id === todo.userId) || null;

    const todoAgg: TodoAggregate = {
      ...todo,
      user,
    };

    return todoAgg;
  });

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form onSubmit={handleSubmit}>
        <div className="field">
          <input
            type="text"
            data-cy="titleInput"
            value={title}
            placeholder="Enter title"
            onChange={handleTitleChange}
          />
          {titleError && <span className="error">{titleError}</span>}
        </div>

        <div className="field">
          <select
            data-cy="userSelect"
            value={String(ownerId)}
            onChange={event => setOwnerId(+event.target.value)}
          >
            <option value="0" disabled>
              Choose a user
            </option>
            {usersFromServer.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {ownerError && <span className="error">{ownerError}</span>}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={aggregatedTodos} />
    </div>
  );
};
