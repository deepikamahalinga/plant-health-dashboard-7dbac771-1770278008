import { FC, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { FaSeedling, FaChartLine, FaClipboardCheck, FaDatabase } from 'react-icons/fa';

interface Statistic {
  value: string;
  label: string;
}

interface Feature {
  icon: JSX.Element;
  title: string;
  description: string;
}

const Home: FC = () => {
  const stats: Statistic[] = [
    { value: '1000+', label: 'Active Users' },
    { value: '50K+', label: 'Plants Monitored' },
    { value: '99%', label: 'Accuracy Rate' },
    { value: '24/7', label: 'Monitoring' },
  ];

  const features: Feature[] = [
    {
      icon: <FaSeedling className="w-8 h-8 text-green-500" />,
      title: 'Plant Monitoring',
      description: 'Real-time tracking of plant health metrics and growth patterns',
    },
    {
      icon: <FaChartLine className="w-8 h-8 text-green-500" />,
      title: 'Data Analytics',
      description: 'Advanced analytics and insights for optimal farming decisions',
    },
    {
      icon: <FaClipboardCheck className="w-8 h-8 text-green-500" />,
      title: 'Health Diagnostics',
      description: 'Early detection of plant diseases and nutritional deficiencies',
    },
    {
      icon: <FaDatabase className="w-8 h-8 text-green-500" />,
      title: 'Data Management',
      description: 'Comprehensive storage and organization of agricultural data',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      {/* Hero Section */}
      <section className="container mx-auto px-4 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Plant Health Dashboard
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Empower your farming with data-driven insights. Monitor, analyze, and optimize
            your plant health for maximum yield and sustainability.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/dashboard"
              className="bg-green-500 text-white px-8 py-3 rounded-lg hover:bg-green-600 
              transition-colors duration-300 text-lg font-semibold"
            >
              Get Started
            </Link>
            <Link
              to="/learn-more"
              className="bg-white text-green-500 px-8 py-3 rounded-lg border-2 border-green-500 
              hover:bg-green-50 transition-colors duration-300 text-lg font-semibold"
            >
              Learn More
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Stats Section */}
      <section className="bg-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-4xl font-bold text-green-500 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Key Features
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow 
                duration-300"
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900">
                  {feature.title}
                </h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-green-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to optimize your farming?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of farmers already using Plant Health Dashboard
          </p>
          <Link
            to="/signup"
            className="bg-white text-green-500 px-8 py-3 rounded-lg hover:bg-gray-100 
            transition-colors duration-300 text-lg font-semibold inline-block"
          >
            Start Free Trial
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;