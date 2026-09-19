const TodoForm = ({ formData, onChange, onSubmit, editingTodo, loading }) => {
  return (
    <form onSubmit={onSubmit} className="todo-form">
      <div className="form-grid">
        <label>
          <span>Title</span>
          <input
            type="text"
            name="title"
            placeholder="Add a task..."
            value={formData.title}
            onChange={onChange}
            maxLength={200}
            required
          />
        </label>

        <label>
          <span>Description</span>
          <textarea
            name="description"
            placeholder="Description..."
            value={formData.description}
            onChange={onChange}
            maxLength={1000}
            rows="3"
          />
        </label>
      </div>

      <button type="submit" className="primary-btn" disabled={loading}>
        {loading ? (editingTodo ? 'Updating...' : 'Saving...') : editingTodo ? 'Update Todo' : 'Add Todo'}
      </button>
    </form>
  );
};

export default TodoForm;
