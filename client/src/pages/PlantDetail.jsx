import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { plantAPI, diagnosisAPI } from '../services/api';
import { getImageSrc } from '../services/imageHelper';
import Loader from '../components/Loader';
import { ArrowLeft, Leaf, Droplets, Sun, Thermometer, Layers, Stethoscope, Clock, ChevronRight, Trash2, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PlantDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [plant, setPlant] = useState(null);
  const [diagnoses, setDiagnoses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchPlant(); }, [id]);

  const fetchPlant = async () => {
    try {
      const [plantRes, diagRes] = await Promise.all([
        plantAPI.getPlant(id),
        diagnosisAPI.getPlantDiagnoses(id)
      ]);
      setPlant(plantRes.data.plant);
      setDiagnoses(diagRes.data.diagnoses || []);
    } catch (err) {
      toast.error('Failed to load plant details');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Remove this plant from your library? This cannot be undone.')) return;
    try {
      await plantAPI.removePlant(id);
      toast.success('Plant removed');
      navigate('/dashboard');
    } catch (err) {
      toast.error('Failed to remove plant');
    }
  };

  const formatDate = (d) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  const healthColor = (h) => {
    switch (h) {
      case 'Healthy': return 'text-green-600';
      case 'Mild Issues': return 'text-yellow-600';
      case 'Moderate Issues': return 'text-orange-600';
      case 'Severe Issues': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  if (loading) return <Loader text="Loading plant details..." />;
  if (!plant) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fadeIn">
      <button onClick={() => navigate('/dashboard')}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Back to Library
      </button>

      <div className="relative rounded-2xl overflow-hidden mb-4 bg-leaf-50">
        {getImageSrc(plant.imageUrl) ? (
          <img src={getImageSrc(plant.imageUrl)} alt={plant.nickname} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 flex items-center justify-center">
            <Leaf className="w-16 h-16 text-leaf-200" />
          </div>
        )}
      </div>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          {plant.nickname || plant.species?.commonName || 'Unknown Plant'}
        </h1>
        {plant.species?.scientificName && (
          <p className="text-gray-400 italic mt-0.5">{plant.species.scientificName}</p>
        )}
        {plant.species?.description && (
          <p className="text-sm text-gray-600 mt-2">{plant.species.description}</p>
        )}
        {plant.species?.confidence > 0 && (
          <span className="inline-block text-xs bg-leaf-50 text-leaf-700 font-medium px-2.5 py-1 rounded-full mt-2">
            {plant.species.confidence}% confidence
          </span>
        )}
      </div>

      {plant.generalCare && Object.values(plant.generalCare).some(Boolean) && (
        <div className="card p-4 mb-4">
          <h2 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <Leaf className="w-4 h-4 text-leaf-600" /> Care Guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {plant.generalCare.watering && (
              <div className="flex gap-3 items-start bg-blue-50 rounded-xl p-3">
                <Droplets className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-blue-600">Watering</p>
                  <p className="text-sm text-blue-800 mt-0.5">{plant.generalCare.watering}</p>
                </div>
              </div>
            )}
            {plant.generalCare.sunlight && (
              <div className="flex gap-3 items-start bg-yellow-50 rounded-xl p-3">
                <Sun className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-yellow-600">Sunlight</p>
                  <p className="text-sm text-yellow-800 mt-0.5">{plant.generalCare.sunlight}</p>
                </div>
              </div>
            )}
            {plant.generalCare.soil && (
              <div className="flex gap-3 items-start bg-orange-50 rounded-xl p-3">
                <Layers className="w-5 h-5 text-orange-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-orange-600">Soil</p>
                  <p className="text-sm text-orange-800 mt-0.5">{plant.generalCare.soil}</p>
                </div>
              </div>
            )}
            {plant.generalCare.temperature && (
              <div className="flex gap-3 items-start bg-purple-50 rounded-xl p-3">
                <Thermometer className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-purple-600">Temperature</p>
                  <p className="text-sm text-purple-800 mt-0.5">{plant.generalCare.temperature}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="card p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-gray-800 flex items-center gap-2">
            <Stethoscope className="w-4 h-4 text-orange-500" /> Diagnosis History
          </h2>
          <Link to="/diagnose" className="text-xs font-medium text-leaf-700 hover:underline">New Diagnosis</Link>
        </div>
        {diagnoses.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">No diagnoses yet for this plant</p>
        ) : (
          <div className="space-y-2">
            {diagnoses.map((d) => (
              <Link key={d._id} to={`/diagnosis/${d._id}`}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 transition-colors">
                <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {getImageSrc(d.imageUrl) ? (
                    <img src={getImageSrc(d.imageUrl)} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Stethoscope className="w-4 h-4 text-gray-300" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${healthColor(d.overallHealth)}`}>
                    {d.overallHealth === 'Healthy' ? (
                      <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Healthy</span>
                    ) : (
                      <span className="flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" /> {d.overallHealth}</span>
                    )}
                  </p>
                  <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3 h-3" /> {formatDate(d.createdAt)}
                    <span>•</span> {d.conditions?.length || 0} condition{d.conditions?.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 flex-shrink-0" />
              </Link>
            ))}
          </div>
        )}
      </div>

      <button onClick={handleDelete}
        className="btn-danger w-full flex items-center justify-center gap-2 text-sm">
        <Trash2 className="w-4 h-4" /> Remove from Library
      </button>
    </div>
  );
}
