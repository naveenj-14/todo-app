import { useEffect, useState } from 'react';
import TodoForm from './components/TodoForm';
import TodoList from './components/TodoList';
import DonationButton from './components/DonationButton';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || '';

const initialForm = { title: '', description: '' };

function App() {
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({ name: '', email: '', password: '' });
  const [user, setUser] = useState(null);
  const [todos, setTodos] = useState([]);
  const [todoForm, setTodoForm] = useState(initialForm);
  const [editingTodoId, setEditingTodoId] = useState(null);
  const [loadingTodos, setLoadingTodos] = useState(true);
  const [submittingTodo, setSubmittingTodo] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [message, setMessage] = useState('');
  const [donationAmount, setDonationAmount] = useState('50');
  const [donating, setDonating] = useState(false);

  const fetchJson = async (url, options = {}) => {
    const response = await fetch(`${API_URL}${url}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  };

  const loadUser = async () => {
    try {
      const data = await fetchJson('/api/auth/me');
      setUser(data.user);
    } catch (error) {
      setUser(null);
    }
  };

  const loadTodos = async () => {
    try {
      setLoadingTodos(true);
      const data = await fetchJson('/api/todos');
      setTodos(data.todos || []);
    } catch (error) {
      setMessage('Unable to load tasks.');
      setTodos([]);
    } finally {
      setLoadingTodos(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (user) {
      loadTodos();
    } else {
      setTodos([]);
      setLoadingTodos(false);
    }
  }, [user]);

  const handleAuthChange = (event) => {
    const { name, value } = event.target;
    setAuthForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTodoChange = (event) => {
    const { name, value } = event.target;
    setTodoForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';
      const payload =
        authMode === 'register'
          ? authForm
          : { email: authForm.email, password: authForm.password };

      const data = await fetchJson(endpoint, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setUser(data.user);
      setAuthForm({ name: '', email: '', password: '' });
      setMessage(authMode === 'register' ? 'Account created successfully.' : 'Logged in successfully.');
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    }
  };

  const handleLogout = async () => {
    try {
      await fetchJson('/api/auth/logout', { method: 'POST' });
      setUser(null);
      setTodos([]);
      setTodoForm(initialForm);
      setEditingTodoId(null);
      setMessage('Logged out successfully.');
    } catch (error) {
      setMessage('Something went wrong');
    }
  };

  const handleCreateOrUpdateTodo = async (event) => {
    event.preventDefault();
    setSubmittingTodo(true);
    setMessage('');

    try {
      const payload = {
        title: todoForm.title,
        description: todoForm.description,
      };

      if (editingTodoId) {
        await fetchJson(`/api/todos/${editingTodoId}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
        setMessage('Todo updated successfully.');
      } else {
        await fetchJson('/api/todos', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        setMessage('Todo created successfully.');
      }

      setTodoForm(initialForm);
      setEditingTodoId(null);
      await loadTodos();
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    } finally {
      setSubmittingTodo(false);
    }
  };

  const handleEditClick = (todo) => {
    setEditingTodoId(todo.id);
    setTodoForm({ title: todo.title, description: todo.description || '' });
  };

  const handleDeleteTodo = async (todoId) => {
    setDeletingId(todoId);
    try {
      await fetchJson(`/api/todos/${todoId}`, { method: 'DELETE' });
      setMessage('Todo deleted successfully.');
      await loadTodos();
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleComplete = async (todo) => {
    try {
      await fetchJson(`/api/todos/${todo.id}`, {
        method: 'PUT',
        body: JSON.stringify({
          title: todo.title,
          description: todo.description || '',
          completed: !todo.completed,
        }),
      });
      await loadTodos();
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    }
  };

  const handleDonation = async () => {
    if (!RAZORPAY_KEY_ID) {
      setMessage('Razorpay is not configured.');
      return;
    }

    try {
      setDonating(true);
      const amount = Number(donationAmount);

      if (!Number.isFinite(amount) || amount < 10) {
        throw new Error('Please enter a valid donation amount.');
      }

      const orderData = await fetchJson('/api/payment/create-order', {
        method: 'POST',
        body: JSON.stringify({ amount }),
      });

      const options = {
        key: RAZORPAY_KEY_ID,
        amount: orderData.order.amount,
        currency: orderData.order.currency,
        name: 'Todo App',
        description: 'Donation',
        order_id: orderData.order.id,
        handler: async function (response) {
          try {
            await fetchJson('/api/payment/verify', {
              method: 'POST',
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                amount,
              }),
            });
            setMessage('Donation received successfully.');
          } catch (error) {
            setMessage(error.message || 'Payment verification failed.');
          }
        },
        theme: {
          color: '#2f6fed',
        },
        modal: {
          ondismiss: () => {
            setMessage('Donation cancelled.');
          },
        },
      };

      const Razorpay = window.Razorpay;
      const razorpayInstance = new Razorpay(options);
      razorpayInstance.open();
    } catch (error) {
      setMessage(error.message || 'Something went wrong');
    } finally {
      setDonating(false);
    }
  };

  if (!user) {
    return (
      <div className="page-shell auth-page">
        <div className="auth-card">
          <h1>Simple Todo</h1>
          <div className="auth-toggle">
            <button
              type="button"
              className={authMode === 'login' ? 'tab active' : 'tab'}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'tab active' : 'tab'}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>

          <form onSubmit={handleAuthSubmit} className="auth-form">
            {authMode === 'register' && (
              <label>
                <span>Name</span>
                <input
                  type="text"
                  name="name"
                  value={authForm.name}
                  onChange={handleAuthChange}
                  placeholder="Your name"
                  required
                />
              </label>
            )}

            <label>
              <span>Email</span>
              <input
                type="email"
                name="email"
                value={authForm.email}
                onChange={handleAuthChange}
                placeholder="you@example.com"
                required
              />
            </label>

            <label>
              <span>Password</span>
              <input
                type="password"
                name="password"
                value={authForm.password}
                onChange={handleAuthChange}
                placeholder="Password"
                minLength={6}
                required
              />
            </label>

            <button type="submit" className="primary-btn full-width">
              {authMode === 'register' ? 'Register' : 'Login'}
            </button>
          </form>

          {message && <p className="banner-message">{message}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="page-shell">
        <div className="app-card">
        <header className="topbar">
          <div>
            <h1>Simple Todo</h1>
            <p>Your tasks, organized.</p>
          </div>
          <div className="user-row">
            <span>{user.name}</span>
            <button type="button" className="secondary-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </header>

        {message && <p className="banner-message">{message}</p>}

        <TodoForm
          formData={todoForm}
          onChange={handleTodoChange}
          onSubmit={handleCreateOrUpdateTodo}
          editingTodo={Boolean(editingTodoId)}
          loading={submittingTodo}
        />

        <section className="todo-section">
          <h2>Tasks</h2>
          <TodoList
            todos={todos}
            loading={loadingTodos}
            onToggleComplete={handleToggleComplete}
            onEdit={handleEditClick}
            onDelete={handleDeleteTodo}
            deletingId={deletingId}
          />
        </section>

        <section className="donation-wrap">
          <DonationButton
            amount={donationAmount}
            onAmountChange={setDonationAmount}
            onDonate={handleDonation}
            loading={donating}
          />
        </section>
        </div>
    </div>
  );
}

export default App;
