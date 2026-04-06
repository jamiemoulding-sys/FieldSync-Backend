require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');

// ROUTES (✅ FIXED PATHS)
const authRoutes = require('./src/routes/auth');
const shiftRoutes = require('./src/routes/shifts');
const taskRoutes = require('./src/routes/tasks');
const locationRoutes = require('./src/routes/locations');
const uploadRoutes = require('./src/routes/uploads');
const assignmentRoutes = require('./src/routes/assignments');
const userRoutes = require('./src/routes/users');
const paymentRoutes = require('./src/routes/payments');
const scheduleRoutes = require('./src/routes/schedules');
const companyRoutes = require('./src/routes/companies');
const invitesRoutes = require('./src/routes/invites');
const reportRoutes = require('./src/routes/reports');
const billingRoutes = require('./src/routes/billing');
const performanceRoutes = require('./src/routes/performance');

const { authenticateToken } = require('./src/middleware/auth');
const { initDatabase } = require('./src/database/init');
const { query } = require('./src/database/connection');

const app = express();
const PORT = process.env.PORT || 10000;

// =====================
// MIDDLEWARE
// =====================

// Stripe webhook MUST be before json
app.use('/api/billing/webhook', express.raw({ type: 'application/json' }));

app.use(cors());
app.use(express.json());

// Static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =====================
// ROUTES
// =====================

app.use('/api/auth', authRoutes);
app.use('/api/shifts', shiftRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/schedules', scheduleRoutes);
app.use('/api/companies', companyRoutes);
app.use('/api', invitesRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/performance', performanceRoutes);

// =====================
// HEALTH CHECK
// =====================
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', time: new Date() });
});

// =====================
// DASHBOARD
// =====================
app.get('/api/dashboard', authenticateToken, async (req, res) => {
  try {
    const [tasks, shifts] = await Promise.all([
      query(`SELECT COUNT(*) FROM tasks`),
      query(`SELECT COUNT(*) FROM shifts WHERE clock_out_time IS NULL`)
    ]);

    res.json({
      tasks: parseInt(tasks.rows[0].count),
      activeShifts: parseInt(shifts.rows[0].count)
    });

  } catch (err) {
    console.error('Dashboard error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// =====================
// START SERVER
// =====================
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

// =====================
// DB INIT
// =====================
initDatabase()
  .then(() => console.log('✅ Database initialized'))
  .catch(err => console.error('DB INIT ERROR:', err));