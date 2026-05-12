import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { plantAPI } from '../services/api';
import { getImageSrc } from '../services/imageHelper';
import { Search, Plus, Leaf, Droplets, Sun, Trash2 } from 'lucide-react';
import Loader from '../components/Loader';
import toast from 'react-hot-toast';

export default function Dashboard() {
  const { user } = useAuth();
  const [plants, setPlants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchLibrary(); }, []);

  const fetchLibrary = async () => {
    try {
      const { data } = await plantAPI.getLibrary();
      setPlants(data.plants);
    } catch (err) {
      toast.error('Failed to load plant library');
    } finally {
      setLoading(false);
    }
  };

  const removePlant = async (id) => {
    if (!confirm('Remove this plant from your library?')) return;
    try {
      await plantAPI.removePlant(id);
      setPlants(plants.filter((p) => p._id !== id));
      toast.success('Plant removed');
    } catch (err) {
      toast.error('Failed to remove plant');
    }
  };

  const filtered = plants.filter((p) =>
    (p.nickname + p.species?.commonName).toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Loader text="Loading your garden..." />;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Hello, {user?.name?.split(' ')[0]} <span className="inline-block animate-bounce">🌱</span>
        </h1>
        <p className="text-gray-500 mt-1">
          {plants.length > 0
            ? `You have ${plants.length} plant${plants.length > 1 ? 's' : ''} in your library`
            : 'Start by identifying your first plant'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-6">
        <Link to="/identify" className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-leaf-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Search className="w-5 h-5 text-leaf-700" />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">Identify Plant</p>
            <p className="text-xs text-gray-400">Upload a photo</p>
          </div>
        </Link>
        <Link to="/diagnose" className="card p-4 flex items-center gap-3 hover:shadow-md transition-shadow">
          <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Droplets className="w-5 h-5 text-orange-600" />
          </div>
          <div>
            <p className="font-medium text-sm text-gray-800">Health Check</p>
            <p className="text-xs text-gray-400">Diagnose issues</p>
          </div>
        </Link>
      </div>

      {plants.length > 0 && (
        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search your plants..." className="input-field pl-10 !py-2.5 text-sm" />
        </div>
      )}

      {filtered.length === 0 && plants.length === 0 ? (
        <div className="card p-10 text-center">
          <div className="w-20 h-20 bg-leaf-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Leaf className="w-10 h-10 text-leaf-300" />
          </div>
          <h3 className="text-lg font-medium text-gray-700 mb-2">No plants yet</h3>
          <p className="text-sm text-gray-400 mb-4">Identify your first plant to add it here</p>
          <Link to="/identify" className="btn-primary inline-flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Identify a Plant
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filtered.map((plant) => (
            <Link key={plant._id} to={`/plant/${plant._id}`}
              className="card overflow-hidden hover:shadow-md transition-shadow group">
              <div className="relative h-40 bg-leaf-50">
                {getImageSrc(plant.imageUrl) ? (
                  <img src={getImageSrc(plant.imageUrl)} alt={plant.nickname}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Leaf className="w-12 h-12 text-leaf-200" />
                  </div>
                )}
                <button onClick={(e) => { e.preventDefault(); removePlant(plant._id); }}
                  className="absolute top-2 right-2 bg-black/40 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="p-3">
                <h3 className="font-medium text-gray-800 truncate">
                  {plant.nickname || plant.species?.commonName || 'Unknown Plant'}
                </h3>
                <p className="text-xs text-gray-400 italic truncate">{plant.species?.scientificName || ''}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                  {plant.generalCare?.sunlight && (
                    <span className="flex items-center gap-1">
                      <Sun className="w-3 h-3" /> {plant.generalCare.sunlight.split(' ').slice(0, 2).join(' ')}
                    </span>
                  )}
                  {plant.generalCare?.watering && (
                    <span className="flex items-center gap-1">
                      <Droplets className="w-3 h-3" /> {plant.generalCare.watering.split(' ').slice(0, 2).join(' ')}
                    </span>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
