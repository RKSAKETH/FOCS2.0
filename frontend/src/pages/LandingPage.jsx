import { Link } from 'react-router-dom';
import { FaFlask, FaShieldAlt, FaLock, FaKey, FaFileSignature, FaQrcode } from 'react-icons/fa';

export default function LandingPage() {
    return (
        <div className="min-h-screen">
            {/* Hero Section */}
            <div className="container mx-auto px-4 py-20">
                <div className="text-center animate-fade-in">
                    <div className="flex justify-center mb-8">
                        <div className="p-6 glass rounded-full">
                            <FaFlask className="text-6xl text-purple-400" />
                        </div>
                    </div>

                    <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                        Secure Crime Lab Toxicology Portal
                    </h1>

                    <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
                        A tamper-proof system for managing forensic blood and drug test results.
                        Ensuring the integrity of evidence through advanced cryptography and access control.
                    </p>

                    <div className="flex gap-4 justify-center">
                        <Link to="/login" className="btn-primary">
                            Login
                        </Link>
                        <Link to="/register" className="btn-secondary">
                            Register
                        </Link>
                    </div>
                </div>

                {/* Security Features Grid */}
                <div className="grid md:grid-cols-3 gap-6 mt-20">
                    <FeatureCard
                        icon={<FaLock />}
                        title="Multi-Factor Authentication"
                        description="Username/Password + Email OTP for critical operations"
                        component="Component 1"
                    />
                    <FeatureCard
                        icon={<FaShieldAlt />}
                        title="Access Control Matrix"
                        description="Role-based permissions for Technicians, Directors, and Police"
                        component="Component 2"
                    />
                    <FeatureCard
                        icon={<FaKey />}
                        title="AES-256 Encryption"
                        description="Military-grade encryption for sensitive medical data"
                        component="Component 3"
                    />
                    <FeatureCard
                        icon={<FaFileSignature />}
                        title="Digital Signatures"
                        description="RSA-2048 signatures for tamper-proof reports"
                        component="Component 4"
                    />
                    <FeatureCard
                        icon={<FaQrcode />}
                        title="Base64 Encoding"
                        description="Secure chromatogram image handling"
                        component="Component 5"
                    />
                    <FeatureCard
                        icon={<FaFlask />}
                        title="Chain of Custody"
                        description="Complete audit trail for forensic evidence"
                        component="Audit Logging"
                    />
                </div>

                {/* Tech Stack */}
                <div className="mt-20 card text-center">
                    <h2 className="text-3xl font-bold mb-6">Built with MERN Stack</h2>
                    <div className="flex flex-wrap justify-center gap-4">
                        <span className="badge badge-info">MongoDB</span>
                        <span className="badge badge-info">Express.js</span>
                        <span className="badge badge-info">React.js</span>
                        <span className="badge badge-info">Node.js</span>
                        <span className="badge badge-success">Tailwind CSS</span>
                        <span className="badge badge-warning">Bcrypt</span>
                        <span className="badge badge-warning">JWT</span>
                        <span className="badge badge-warning">AES-256</span>
                        <span className="badge badge-warning">RSA-2048</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FeatureCard({ icon, title, description, component }) {
    return (
        <div className="card hover:scale-105 transform transition-all">
            <div className="text-4xl text-purple-400 mb-4">{icon}</div>
            <h3 className="text-xl font-bold mb-2">{title}</h3>
            <p className="text-gray-400 mb-4">{description}</p>
            <span className="badge badge-info">{component}</span>
        </div>
    );
}
