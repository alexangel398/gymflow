import { useState, useEffect } from 'react';
import api from '../../services/api';

const MembersPage = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/users');
            setUsers(data.data);
        } catch {
            setError('Error al cargar la lista de miembros');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (userId, newRole) => {
        try {
            await api.put(`/users/${userId}`, { role: newRole });
            fetchUsers();
        } catch {
            alert('No se pudo actualizar el rol');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!window.confirm('¿Estás seguro de eliminar este usuario?')) return;
        try {
            await api.delete(`/users/${userId}`);
            fetchUsers();
        } catch {
            alert('Error al eliminar usuario');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    if (loading) return <div className="p-10 text-center">Cargando gestión de usuarios...</div>;

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Administración de Usuarios</h1>
            {error && <div className="bg-red-100 p-3 mb-4 rounded text-red-700">{error}</div>}

            <div className="overflow-x-auto shadow-md rounded-lg">
                <table className="min-w-full bg-white text-left">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="py-3 px-4">Nombre</th>
                            <th className="py-3 px-4">Email</th>
                            <th className="py-3 px-4">Rol</th>
                            <th className="py-3 px-4">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user._id} className="border-b hover:bg-gray-50">
                                <td className="py-3 px-4">{user.name}</td>
                                <td className="py-3 px-4">{user.email}</td>
                                <td className="py-3 px-4">
                                    <select
                                        defaultValue={user.role}
                                        onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                                        className="border rounded px-2 py-1 text-sm bg-white"
                                    >
                                        <option value="member">Member</option>
                                        <option value="trainer">Trainer</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                </td>
                                <td className="py-3 px-4">
                                    <button
                                        onClick={() => handleDeleteUser(user._id)}
                                        className="text-red-600 hover:text-red-800 font-medium"
                                    >
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default MembersPage;