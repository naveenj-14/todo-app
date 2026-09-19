const TodoItem = ({ todo, onToggleComplete, onEdit, onDelete, deletingId }) => {
  return (
    <li className={`todo-item ${todo.completed ? 'completed' : ''}`}>
      <div className="todo-main">
        <label className="checkbox-wrap">
          <input
            type="checkbox"
            checked={!!todo.completed}
            onChange={() => onToggleComplete(todo)}
          />
          <span className="checkmark"></span>
        </label>

        <div className="todo-copy">
          <h3>{todo.title}</h3>
          {todo.description ? <p>{todo.description}</p> : <p className="muted">No description</p>}
          <span className="status-badge">{todo.completed ? 'Completed' : 'Active'}</span>
        </div>
      </div>

      <div className="todo-actions">
        <button type="button" className="secondary-btn" onClick={() => onEdit(todo)}>
          Edit
        </button>
        <button
          type="button"
          className="danger-btn"
          onClick={() => onDelete(todo.id)}
          disabled={deletingId === todo.id}
        >
          {deletingId === todo.id ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </li>
  );
};

export default TodoItem;
