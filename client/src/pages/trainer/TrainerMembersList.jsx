import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import Card from '../../components/ui/Card';

const TrainerMembersList = () => {
    const [members, setMembers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        api.get('/auth/me')
            .then(({ data }) => {
                // El ID está dentro de data.user._id (basado en lo que vimos en el log)
                const userId = data.user?._id || data.user?.id;

                if (!userId) throw new Error("No se pudo obtener el ID del usuario");

                return api.get(`/trainers/${userId}/members`);
            })
            .then(({ data }) => {
                console.log("DEBUG - Estructura de datos recibida:", data);
                // Si data es un array directamente, usa setMembers(data);
                // Si data tiene una propiedad 'members' o similar, usa setMembers(data.members || []);
                setMembers(data.members || data.data || []);
            })
            .catch(err => {
                console.error("Error al cargar datos:", err.response?.data || err.message);
            });
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Mis Alumnos</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {members.map(member => (
                    <Card key={member._id}>
                        <h3 className="font-bold">{member.name}</h3>
                        <p className="text-sm text-gray-500 mb-4">{member.email}</p>
                        <button
                            onClick={() => navigate(`/trainer/create-plan?memberId=${member._id}`)}
                            className="w-full bg-primary-600 text-white py-2 rounded hover:bg-primary-700"
                        >
                            Crear Plan
                        </button>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TrainerMembersList;