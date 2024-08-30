## User Management

To implement the requirements for creating and managing users for the three different companies (AA, BB, and CC) and allowing them to log in, input additional information, and manage their profiles we'll follow a step-by-step approach. This will involve:

- Database Setup: Define a PostgreSQL database schema to store user information.
- Backend API: Develop Node.js/Express API endpoints to handle user creation, login, profile updates, and deletions.
- Frontend Components: Create React components for login, profile management, and handling CRUD operations.
- Form Management: Use React hooks to manage form state and integrate with the backend.
- State Management: Use React Context for authentication state and user data management.Persisting Data: Ensure data persists on reload using state and API integration.

##  Database Setup
First, let's define the PostgreSQL database schema to store user data:

```
-- Create users table to store user information
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(100) UNIQUE,
    company VARCHAR(50),
    date_of_birth DATE,
    address TEXT,
    tel VARCHAR(15),
    hobby TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial users for companies AA, BB, and CC
INSERT INTO users (name, email, company) VALUES 
('Joe', 'joe@compAA.com', 'AA'),
('Anna', 'anna@compBB.com', 'BB'),
('Jake', 'jake@compCC.com', 'CC');


```
##  Backend API (Node.js/Express)
Setup Project and Install Dependencies

```

mkdir user-management-app
cd user-management-app
npm init -y
npm install express pg cors body-parser dotenv

```
Create the following file structure:

```
user-management-app/
|-- server/
|   |-- index.js
|   |-- db.js
|   |-- routes/
|       |-- users.js
|-- .env

```

Database Connection (server/db.js)

```
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

module.exports = {
    query: (text, params) => pool.query(text, params),
};

```

API Endpoints (server/routes/users.js)

```
const express = require('express');
const router = express.Router();
const db = require('../db');

// Get all users
router.get('/', async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM users');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get user by email (login simulation)
router.post('/login', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(401).json({ message: 'User not found' });
        }
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update user information
router.put('/:id', async (req, res) => {
    const { id } = req.params;
    const { name, date_of_birth, address, tel, hobby } = req.body;
    try {
        const result = await db.query(
            `UPDATE users SET name = $1, date_of_birth = $2, address = $3, tel = $4, hobby = $5, updated_at = NOW() WHERE id = $6 RETURNING *`,
            [name, date_of_birth, address, tel, hobby, id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete user
router.delete('/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM users WHERE id = $1', [id]);
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;

```

Server Setup (server/index.js)

```
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const userRoutes = require('./routes/users');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use('/api/users', userRoutes);

const PORT = process.env.PORT || 7020;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

```
Environment Configuration (.env)

```
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=5432
DB_NAME=your_db_name

```


## Frontend Components (React)
Dependencies Installation

Inside the project directory:

```
npx create-react-app client
cd client
npm install axios react-router-dom

```
Create Context for Authentication (client/src/AuthContext.js)

```
import React, { createContext, useState } from 'react';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const login = async (email) => {
        try {
            const response = await fetch(`http://localhost:7020/api/users/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            const data = await response.json();
            setUser(data);
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    const logout = () => setUser(null);

    return (
        <AuthContext.Provider value={{ user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };

```

Create Login Component (client/src/components/Login.js)

```
import React, { useContext, useState } from 'react';
import { AuthContext } from '../AuthContext';

const Login = () => {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');

    const handleLogin = (e) => {
        e.preventDefault();
        login(email);
    };

    return (
        <form onSubmit={handleLogin}>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter email"
            />
            <button type="submit">Login</button>
        </form>
    );
};

export default Login;

```

Create User Profile Component (client/src/components/UserProfile.js)

```
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../AuthContext';

const UserProfile = () => {
    const { user } = useContext(AuthContext);
    const [formData, setFormData] = useState({
        name: '',
        date_of_birth: '',
        address: '',
        tel: '',
        hobby: '',
    });

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name,
                date_of_birth: user.date_of_birth || '',
                address: user.address || '',
                tel: user.tel || '',
                hobby: user.hobby || '',
            });
        }
    }, [user]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch(`http://localhost:7020/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const updatedUser = await response.json();
            console.log('User updated:', updatedUser);
        } catch (error) {
            console.error('Update failed:', error);
        }
    };

    return (
        <form onSubmit={handleUpdate}>
            <input type="text" name="name" value={formData.name} onChange={handleChange} />
            <input type="date" name="date_of_birth" value={formData.date_of_birth} onChange={handleChange} />
            <input type="text" name="address" value={formData.address} onChange={handleChange} />
            <input type="text" name="tel" value={formData.tel} onChange={handleChange} />
            <input type="text" name="hobby" value={formData.hobby} onChange={handleChange} />
            <button type="submit">Update Profile</button>
        </form>
    );
};

export default UserProfile;

```

Main App Component (client/src/App.js) 

```
import React, { useContext } from 'react';
import { BrowserRouter as Router, Route, Switch, Redirect } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './components/Login';
import UserProfile from './components/UserProfile';

const App = () => {
    const { user } = useContext(AuthContext);

    return (
        <AuthProvider>
            <Router>
                <Switch>
                    <Route path="/login">
                        {user ? <Redirect to="/profile" /> : <Login />}
                    </Route>
                    <Route path="/profile">
                        {user ? <UserProfile /> : <Redirect to="/login" />}
                    </Route>
                </Switch>
            </Router>
        </AuthProvider>
    );
};

export default App;

```

## Adding Edit and Delete Functionality

To manage editing and deleting user data, the following steps are integrated:

- Edit: Already covered by UserProfile component, where user data is updated.
- Delete: Can be managed via a delete button in the UserProfile component.

Update UserProfile.js to include a delete button:

```
// In UserProfile.js
const handleDelete = async () => {
    try {
        await fetch(`http://localhost:7020/api/users/${user.id}`, {
            method: 'DELETE',
        });
        console.log('User deleted');
        logout(); // Clear the current user
    } catch (error) {
        console.error('Delete failed:', error);
    }
};

// In the return statement of UserProfile
<button onClick={handleDelete}>Delete Account</button>

```

## Persisting State on Reload
To persist state on reload:

Use local storage to store user session data.
- Update AuthProvider to check local storage on load.

Update AuthProvider:

```

const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => {
        const savedUser = localStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });

    const login = async (email) => {
        // existing login code
        localStorage.setItem('user', JSON.stringify(data));
        setUser(data);
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
    };

    // existing return statement
};

```

## Summary

The above setup allows for complete user management in a React application, ensuring data persistence and seamless user experience.
- Database: PostgreSQL schema for storing user data.
- Backend: Node.js/Express API for managing CRUD operations.
- Frontend: React components for login, profile management, and CRUD operations.
- State Management: React Context API for handling authentication state.
- Persisting Data: Local storage to maintain user sessions across reloads.
