import TodoItem from './TodoItem';

const TodoList = ({ todos, loading, onToggleComplete, onEdit, onDelete, deletingId }) => {
  if (loading) {
    return <p className="state-text">Loading...</p>;
  }

  if (!todos.length) {
    return <p className="state-text empty-state">No tasks yet. Add your first task.</p>;
  }

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
          deletingId={deletingId}
        />
      ))}
    </ul>
  );
};

export default TodoList;
