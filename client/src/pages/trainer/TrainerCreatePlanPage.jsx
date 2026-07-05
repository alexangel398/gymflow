import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const TrainerCreatePlanPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const memberId = searchParams.get('memberId');
    
    const [formData, setFormData] = useState({
        title: '',
        type: 'workout',
        description: '',
        member: memberId
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post('/plans', formData);
            alert('Plan creado exitosamente');
            navigate('/trainer/plans');
        } catch (error) {
            console.error(error);
            alert('Error al crear el plan');
        }
    };

    return (
        <div className="max-w-xl mx-auto p-6 bg-white shadow rounded">
            <h1 className="text-xl font-bold mb-4">Nuevo Plan</h1>
            <form onSubmit={handleSubmit} className="space-y-4">
                <input required placeholder="Título" className="w-full p-2 border rounded" 
                    onChange={e => setFormData({...formData, title: e.target.value})} />
                <select className="w-full p-2 border rounded"
                    onChange={e => setFormData({...formData, type: e.target.value})}>
                    <option value="workout">Entrenamiento</option>
                    <option value="diet">Dieta</option>
                </select>
                <textarea placeholder="Descripción" className="w-full p-2 border rounded"
                    onChange={e => setFormData({...formData, description: e.target.value})} />
                <button type="submit" className="w-full bg-primary-700 text-white py-2 rounded">
                    Guardar
                </button>
            </form>
        </div>
    );
};

export default TrainerCreatePlanPage;