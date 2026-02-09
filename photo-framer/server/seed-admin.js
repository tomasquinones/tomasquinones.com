/**
 * Admin User Seed Script
 *
 * Creates the initial admin user for Photo-Framer.
 *
 * Usage:
 *   1. Set environment variables (or create .env file):
 *      - DB_HOST, DB_USER, DB_PASS, DB_NAME
 *      - ADMIN_EMAIL, ADMIN_USERNAME, ADMIN_PASSWORD
 *
 *   2. Run: node scripts/seed-admin.js
 */

import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from current directory
dotenv.config({ path: path.join(__dirname, '.env') });

const BCRYPT_ROUNDS = 12;

async function seedAdmin() {
  console.log('Photo-Framer Admin Seed Script');
  console.log('==============================\n');

  // Get admin credentials from environment or prompt
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminUsername = process.env.ADMIN_USERNAME || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminEmail || !adminPassword) {
    console.error('Error: ADMIN_EMAIL and ADMIN_PASSWORD environment variables are required.');
    console.error('\nSet these in your .env file or as environment variables:');
    console.error('  ADMIN_EMAIL=your@email.com');
    console.error('  ADMIN_USERNAME=admin');
    console.error('  ADMIN_PASSWORD=YourSecurePassword123!');
    process.exit(1);
  }

  // Validate password strength
  if (adminPassword.length < 12) {
    console.error('Error: Password must be at least 12 characters.');
    process.exit(1);
  }

  // Connect to database
  let connection;
  try {
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
      database: process.env.DB_NAME || 'photo_framer'
    });

    console.log('Connected to database.');

    // Check if admin already exists
    const [existing] = await connection.execute(
      'SELECT id FROM users WHERE email = ? OR username = ?',
      [adminEmail.toLowerCase(), adminUsername]
    );

    if (existing.length > 0) {
      console.log('\nAdmin user already exists. Skipping creation.');
      console.log(`  Username: ${adminUsername}`);
      console.log(`  Email: ${adminEmail}`);
      await connection.end();
      return;
    }

    // Hash password
    console.log('Hashing password...');
    const passwordHash = await bcrypt.hash(adminPassword, BCRYPT_ROUNDS);

    // Create admin user
    console.log('Creating admin user...');
    const [result] = await connection.execute(
      `INSERT INTO users (username, email, password_hash, role, is_active)
       VALUES (?, ?, ?, 'admin', TRUE)`,
      [adminUsername, adminEmail.toLowerCase(), passwordHash]
    );

    console.log('\n✓ Admin user created successfully!');
    console.log(`  ID: ${result.insertId}`);
    console.log(`  Username: ${adminUsername}`);
    console.log(`  Email: ${adminEmail}`);
    console.log(`  Role: admin`);

    console.log('\n⚠️  Important: Make sure to save your credentials securely!');
    console.log('   Do NOT commit your password to version control.');

  } catch (error) {
    console.error('Error:', error.message);

    if (error.code === 'ER_NO_SUCH_TABLE') {
      console.error('\nThe users table does not exist. Run the setup-database.sql script first.');
    } else if (error.code === 'ECONNREFUSED') {
      console.error('\nCould not connect to database. Check your DB_HOST, DB_USER, and DB_PASS settings.');
    }

    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

seedAdmin();
