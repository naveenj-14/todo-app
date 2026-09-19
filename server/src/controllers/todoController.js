import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const sanitizeTodo = (todo) => ({
  id: todo.id,
  userId: todo.userId,
  title: todo.title,
  description: todo.description,
  completed: todo.completed,
  createdAt: todo.createdAt,
  updatedAt: todo.updatedAt,
});

export const getTodos = async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      where: {
        userId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      message: 'Todos retrieved successfully',
      todos: todos.map(sanitizeTodo),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const createTodo = async (req, res) => {
  try {
    const { title, description, completed } = req.body;

    if (!title || typeof title !== 'string') {
      return res.status(400).json({ message: 'Title is required' });
    }

    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      return res.status(400).json({ message: 'Title is required' });
    }

    if (trimmedTitle.length > 200) {
      return res.status(400).json({ message: 'Title must be 200 characters or less' });
    }

    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be a string' });
    }

    const trimmedDescription = description?.trim() ?? '';

    if (trimmedDescription.length > 1000) {
      return res.status(400).json({ message: 'Description must be 1000 characters or less' });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed must be a boolean' });
    }

    const todo = await prisma.todo.create({
      data: {
        title: trimmedTitle,
        description: trimmedDescription || null,
        completed: Boolean(completed),
        userId: req.user.id,
      },
    });

    return res.status(201).json({
      message: 'Todo created successfully',
      todo: sanitizeTodo(todo),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const updateTodo = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, completed } = req.body;

    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (existingTodo.userId !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to update this todo' });
    }

    if (title !== undefined) {
      if (typeof title !== 'string') {
        return res.status(400).json({ message: 'Title must be a string' });
      }

      const trimmedTitle = title.trim();
      if (!trimmedTitle) {
        return res.status(400).json({ message: 'Title is required' });
      }
      if (trimmedTitle.length > 200) {
        return res.status(400).json({ message: 'Title must be 200 characters or less' });
      }
    }

    if (description !== undefined && typeof description !== 'string') {
      return res.status(400).json({ message: 'Description must be a string' });
    }

    if (completed !== undefined && typeof completed !== 'boolean') {
      return res.status(400).json({ message: 'Completed must be a boolean' });
    }

    const nextDescription = description === undefined ? existingTodo.description : (description.trim() || null);

    const todo = await prisma.todo.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existingTodo.title,
        description: nextDescription,
        completed: completed !== undefined ? completed : existingTodo.completed,
      },
    });

    return res.status(200).json({
      message: 'Todo updated successfully',
      todo: sanitizeTodo(todo),
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};

export const deleteTodo = async (req, res) => {
  try {
    const { id } = req.params;

    const existingTodo = await prisma.todo.findUnique({
      where: { id },
    });

    if (!existingTodo) {
      return res.status(404).json({ message: 'Todo not found' });
    }

    if (existingTodo.userId !== req.user.id) {
      return res.status(403).json({ message: 'You are not allowed to delete this todo' });
    }

    await prisma.todo.delete({
      where: { id },
    });

    return res.status(200).json({
      message: 'Todo deleted successfully',
    });
  } catch (error) {
    return res.status(500).json({ message: 'Something went wrong' });
  }
};
