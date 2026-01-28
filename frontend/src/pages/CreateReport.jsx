import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

export default function CreateReport() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        caseId: '',
        suspectName: '',
        suspectId: '',
        bloodAlcoholContent: '',
        drugType: '',
        sampleCollectionDate: '',
        testMethod: '',
        chromatogramImage: ''
    });
    const [loading, setLoading] = useState(false);

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setFormData({ ...formData, chromatogramImage: reader.result });
                toast.success('Image encoded to Base64');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await api.post('/reports', formData);
            toast.success('Report created successfully! Data encrypted with AES-256');
            navigate('/reports');
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to create report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 py-12">
                <h1 className="text-4xl font-bold mb-8">Create Toxicology Report</h1>

                <div className="card max-w-3xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Case ID *</label>
                            <input
                                type="text"
                                className="input-field"
                                placeholder="CASE-2026-001"
                                value={formData.caseId}
                                onChange={(e) => setFormData({ ...formData, caseId: e.target.value })}
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Used as salt for AES encryption (Component 3A)</p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Suspect Name *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="John Doe"
                                    value={formData.suspectName}
                                    onChange={(e) => setFormData({ ...formData, suspectName: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Suspect ID *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="ID-12345"
                                    value={formData.suspectId}
                                    onChange={(e) => setFormData({ ...formData, suspectId: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Blood Alcohol Content * 🔒</label>
                                <input
                                    type="text"
                                    className="input-field border-2 border-purple-500/50"
                                    placeholder="0.08%"
                                    value={formData.bloodAlcoholContent}
                                    onChange={(e) => setFormData({ ...formData, bloodAlcoholContent: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-purple-400 mt-1">Will be encrypted with AES-256</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Drug Type * 🔒</label>
                                <input
                                    type="text"
                                    className="input-field border-2 border-purple-500/50"
                                    placeholder="Cocaine"
                                    value={formData.drugType}
                                    onChange={(e) => setFormData({ ...formData, drugType: e.target.value })}
                                    required
                                />
                                <p className="text-xs text-purple-400 mt-1">Will be encrypted with AES-256</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Sample Collection Date *</label>
                                <input
                                    type="date"
                                    className="input-field"
                                    value={formData.sampleCollectionDate}
                                    onChange={(e) => setFormData({ ...formData, sampleCollectionDate: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Test Method *</label>
                                <input
                                    type="text"
                                    className="input-field"
                                    placeholder="Gas Chromatography-Mass Spectrometry"
                                    value={formData.testMethod}
                                    onChange={(e) => setFormData({ ...formData, testMethod: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Chromatogram Image (Component 5: Base64 Encoding)</label>
                            <input
                                type="file"
                                className="input-field"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            {formData.chromatogramImage && (
                                <div className="mt-4">
                                    <p className="text-sm text-green-400 mb-2">✓ Image encoded successfully</p>
                                    <img src={formData.chromatogramImage} alt="Chromatogram" className="max-h-48 rounded-lg" />
                                </div>
                            )}
                        </div>

                        <div className="flex gap-4">
                            <button type="submit" className="btn-primary flex-1" disabled={loading}>
                                {loading ? 'Creating Report...' : 'Create Report'}
                            </button>
                            <button
                                type="button"
                                className="btn-secondary"
                                onClick={() => navigate('/reports')}
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
