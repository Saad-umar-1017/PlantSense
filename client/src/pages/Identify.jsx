import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { plantAPI } from '../services/api';
import ImageUpload from '../components/ImageUpload';
import { Leaf, ChevronRight, Plus, Check, Sparkles, Info } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Identify() {
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [addingToLib, setAddingToLib] = useState(false);
  const [nickname, setNickname] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const navigate = useNavigate();

  const handleIdentify = async () => {
    if (!image) return toast.error('Please select an image first');
    setLoading(true);
    setResult(null);
    try {
      const formData = new FormData();
      formData.append('image', image);
      const { data } = await plantAPI.identify(formData);
      setResult(data.identification);
      toast.success('Plant identified!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Identification failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToLibrary = async () => {
    if (!result) return;
    setAddingToLib(true);
    try {
      await plantAPI.addToLibrary({
        identificationId: result.id,
        predictionIndex: selectedIdx,
        nickname: nickname || result.predictions[selectedIdx]?.commonName
      });
      toast.success('Plant added to your library!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add plant');
    } finally {
      setAddingToLib(false);
    }
  };

  const resetAll = () => {
    setImage(null);
    setResult(null);
    setSelectedIdx(0);
    setNickname('');
    setShowAddForm(false);
  };

  const confidenceColor = (c) => {
    if (c >= 80) return 'text-green-600 bg-green-50';
    if (c >= 50) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 pb-24 md:pb-6 animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-leaf-600" />
          Identify Plant
        </h1>
        <p className="text-gray-500 mt-1 text-sm">Upload a clear photo and our AI will identify the species</p>
      </div>

      {/* Upload */}
      <ImageUpload onImageSelect={setImage} loading={loading} />

      {/* Identify Button */}
      {image && !result && !loading && (
        <button onClick={handleIdentify} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4" />
          Identify This Plant
        </button>
      )}

      {/* Results */}
      {result && result.predictions && (
        <div className="mt-6 space-y-3">
          <h2 className="text-lg font-semibold text-gray-800">Top Matches</h2>

          {result.predictions.map((pred, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIdx(idx)}
              className={`card w-full text-left p-4 transition-all ${
                selectedIdx === idx
                  ? 'ring-2 ring-leaf-500 border-leaf-300'
                  : 'hover:shadow-md'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-800 truncate">{pred.commonName}</h3>
                    {selectedIdx === idx && (
                      <Check className="w-4 h-4 text-leaf-600 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-sm text-gray-400 italic">{pred.scientificName}</p>
                  {pred.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pred.description}</p>
                  )}
                </div>
                <span className={`text-sm font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${confidenceColor(pred.confidence)}`}>
                  {pred.confidence}%
                </span>
              </div>

              {/* Expanded details for selected */}
              {selectedIdx === idx && (
                <div className="mt-3 pt-3 border-t border-gray-100 space-y-2 text-sm">
                  {pred.habitat && (
                    <div className="flex gap-2">
                      <span className="text-gray-400 flex-shrink-0">Habitat:</span>
                      <span className="text-gray-600">{pred.habitat}</span>
                    </div>
                  )}
                  {pred.growthCharacteristics && (
                    <div className="flex gap-2">
                      <span className="text-gray-400 flex-shrink-0">Growth:</span>
                      <span className="text-gray-600">{pred.growthCharacteristics}</span>
                    </div>
                  )}
                  {pred.generalCare && (
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      {pred.generalCare.watering && (
                        <div className="bg-blue-50 rounded-lg p-2">
                          <span className="text-xs text-blue-500 font-medium">Water</span>
                          <p className="text-xs text-blue-800 mt-0.5">{pred.generalCare.watering}</p>
                        </div>
                      )}
                      {pred.generalCare.sunlight && (
                        <div className="bg-yellow-50 rounded-lg p-2">
                          <span className="text-xs text-yellow-600 font-medium">Sunlight</span>
                          <p className="text-xs text-yellow-800 mt-0.5">{pred.generalCare.sunlight}</p>
                        </div>
                      )}
                      {pred.generalCare.soil && (
                        <div className="bg-orange-50 rounded-lg p-2">
                          <span className="text-xs text-orange-500 font-medium">Soil</span>
                          <p className="text-xs text-orange-800 mt-0.5">{pred.generalCare.soil}</p>
                        </div>
                      )}
                      {pred.generalCare.temperature && (
                        <div className="bg-purple-50 rounded-lg p-2">
                          <span className="text-xs text-purple-500 font-medium">Temperature</span>
                          <p className="text-xs text-purple-800 mt-0.5">{pred.generalCare.temperature}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </button>
          ))}

          {/* Add to Library */}
          {!showAddForm ? (
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex-1 flex items-center justify-center gap-2"
              >
                <Plus className="w-4 h-4" /> Add to Library
              </button>
              <button onClick={resetAll} className="btn-secondary flex-1">
                Scan Another
              </button>
            </div>
          ) : (
            <div className="card p-4 mt-4">
              <h3 className="font-medium text-gray-800 mb-3">Give your plant a nickname</h3>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder={result.predictions[selectedIdx]?.commonName || 'My Plant'}
                className="input-field mb-3"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleAddToLibrary}
                  disabled={addingToLib}
                  className="btn-primary flex-1 flex items-center justify-center gap-2"
                >
                  {addingToLib ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Check className="w-4 h-4" /> Confirm
                    </>
                  )}
                </button>
                <button onClick={() => setShowAddForm(false)} className="btn-secondary flex-1">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Disclaimer */}
          <div className="flex items-start gap-2 bg-amber-50 rounded-xl p-3 mt-3">
            <Info className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
            <p className="text-xs text-amber-700">
              AI identification is provided as guidance only. For critical decisions (e.g., edibility), always consult a professional botanist.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
