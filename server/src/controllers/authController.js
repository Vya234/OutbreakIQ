import jwt from 'jsonwebtoken';

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    const err = new Error('Email and password are required');
    err.statusCode = 400;
    throw err;
  }

  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD;
  const jwtSecret = process.env.JWT_SECRET;

  if (!adminEmail || !adminPassword || !jwtSecret) {
    const err = new Error('Admin authentication is not configured on the server');
    err.statusCode = 500;
    throw err;
  }

  if (email.trim().toLowerCase() !== adminEmail.toLowerCase() || password !== adminPassword) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = jwt.sign({ email: adminEmail, role: 'admin' }, jwtSecret, { expiresIn: '8h' });

  res.json({
    success: true,
    data: {
      token,
      email: adminEmail,
      expiresIn: '8h',
    },
  });
}
