'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';

// Dynamically import the HumanViewer component with no SSR
const HumanViewer = dynamic(() => import('./components/3d/HumanViewer'), {
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div className="text-white text-xl">Loading Human Model...</div>
    </div>
  ),
});

const models = [
  {
    id: 'male',
    label: 'MALE MODEL',
    subLabel: 'ELLER TRYKK FRITT',
    description: 'Explore male musculoskeletal anatomy',
    bgClass: 'bg-gradient-to-br from-gray-900 to-gray-800'
  },
  {
    id: 'female',
    label: 'FEMALE MODEL',
    subLabel: 'ELLER TRYKK FRITT',
    description: 'Explore female musculoskeletal anatomy',
    bgClass: 'bg-gradient-to-br from-gray-900 to-gray-800'
  }
];

export default function Home() {
  const [gender, setGender] = useState<'male' | 'female' | null>(null);
  const [selectedPart, setSelectedPart] = useState<string | null>(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });

  const handlePartSelect = (partName: string, event: { clientX: number; clientY: number }) => {
    setSelectedPart(partName);
    setPopupPosition({
      x: event.clientX,
      y: event.clientY,
    });
  };

  const handleClosePopup = () => {
    setSelectedPart(null);
  };

  if (!gender) {
    return (
      <div className="min-h-screen bg-black text-white">
        {/* Header */}
        <header className="w-full py-6 px-8 flex justify-between items-center">
          <h1 className="text-2xl font-bold">MUSCO</h1>
          <nav className="hidden md:flex space-x-8">
            <button className="text-gray-400 hover:text-white transition-colors">About</button>
            <button className="text-gray-400 hover:text-white transition-colors">Contact</button>
          </nav>
        </header>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-16"
          >
            <div className="text-center space-y-4">
              <h2 className="text-6xl font-bold tracking-tight">
                VELKOMMEN TIL MUSCO
              </h2>
              <p className="text-xl text-gray-400 mt-6">
                Select a model to start exploring the musculoskeletal system
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {models.map((model) => (
                <motion.div
                  key={model.id}
                  className="relative group cursor-pointer"
                  onClick={() => setGender(model.id as 'male' | 'female')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className={`relative h-[500px] rounded-lg overflow-hidden ${model.bgClass}`}>
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-90 z-10" />
                    
                    <div className="absolute inset-0 flex flex-col justify-end p-8 z-20">
                      <p className="text-sm font-medium text-gray-400 mb-2">{model.subLabel}</p>
                      <h3 className="text-3xl font-bold tracking-wider mb-4">{model.label}</h3>
                      <p className="text-gray-400 max-w-md">{model.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <h4 className="text-xl font-bold mb-2">Interactive</h4>
                <p className="text-gray-400">Zoom, rotate, and explore the model in 3D</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold mb-2">Educational</h4>
                <p className="text-gray-400">Learn about each muscle and bone in detail</p>
              </div>
              <div className="text-center">
                <h4 className="text-xl font-bold mb-2">Comprehensive</h4>
                <p className="text-gray-400">Complete musculoskeletal system coverage</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      <HumanViewer 
        gender={gender}
        onPartSelect={handlePartSelect}
      />
      {selectedPart && (
        <Popup
          isOpen={true}
          onClose={handleClosePopup}
          selectedPart={selectedPart}
          position={popupPosition}
        />
      )}
    </div>
  );
}
