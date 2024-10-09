import React, { useState } from "react";
import { Link } from "react-router-dom";

function UserManage() {
    const [users, setUsers] = useState([
        { id: 1, name: "John Doe", role: "User" },
        { id: 2, name: "Jane Smith", role: "Admin" },
    ]);
    const [newUserName, setNewUserName] = useState("");
    const [newUserRole, setNewUserRole] = useState("User");

    const handleAddUser = () => {
        if (newUserName.trim()) {
            const newUser = {
                id: users.length + 1,
                name: newUserName,
                role: newUserRole,
            };
            setUsers([...users, newUser]);
            setNewUserName("");
            setNewUserRole("User");
        }
    };

    const handleDeleteUser = (userId) => {
        setUsers(users.filter((user) => user.id !== userId));
    };

    const handleChangeUserRole = (userId, newRole) => {
        setUsers(
            users.map((user) =>
                user.id === userId ? { ...user, role: newRole } : user
            )
        );
    };

    return (
        <div style={{ maxWidth: "600px", margin: "0 auto", padding: "1rem" }}>
            <h2>User Management</h2>
            <div style={{ marginBottom: "2rem" }}>
                <h3>Add New User</h3>
                <input
                    type="text"
                    placeholder="User Name"
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    style={{ marginRight: "1rem", padding: "0.5rem" }}
                />
                <select
                    value={newUserRole}
                    onChange={(e) => setNewUserRole(e.target.value)}
                    style={{ marginRight: "1rem", padding: "0.5rem" }}
                >
                    <option value="User">User</option>
                    <option value="Admin">Admin</option>
                </select>
                <button onClick={handleAddUser} style={{ padding: "0.5rem 1rem" }}>
                    Add User
                </button>
            </div>

            <h3>Current Users</h3>
            <ul style={{ listStyleType: "none", padding: 0 }}>
                {users.map((user) => (
                    <li key={user.id} style={{ marginBottom: "1rem" }}>
                        <span style={{ marginRight: "1rem" }}>{user.name} ({user.role})</span>
                        <select
                            value={user.role}
                            onChange={(e) => handleChangeUserRole(user.id, e.target.value)}
                            style={{ marginRight: "1rem", padding: "0.5rem" }}
                        >
                            <option value="User">User</option>
                            <option value="Admin">Admin</option>
                        </select>
                        <button onClick={() => handleDeleteUser(user.id)} style={{ padding: "0.5rem 1rem" }}>
                            Delete
                        </button>
                    </li>
                ))}
            </ul>

            <p style={{ marginTop: "2rem" }}>
                <Link to="/">Back to Home</Link>
            </p>
        </div>
    );
}

export default UserManage;