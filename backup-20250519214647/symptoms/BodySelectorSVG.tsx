import { useState } from 'react';
import { motion } from 'framer-motion';
import type { BodyRegion } from '../../machines/questionnaireMachine';

interface BodySelectorSVGProps {
  onSelectRegion: (region: BodyRegion) => void;
  selectedRegion: BodyRegion | null;
}

export default function BodySelectorSVG({ onSelectRegion, selectedRegion }: BodySelectorSVGProps) {
  const [hoveredRegion, setHoveredRegion] = useState<BodyRegion | null>(null);
  
  const getRegionStyle = (region: BodyRegion) => {
    if (selectedRegion === region) {
      return "fill-blue-600 stroke-blue-800 stroke-[3px]";
    }
    if (hoveredRegion === region) {
      return "fill-blue-400 stroke-blue-600 stroke-[2px] cursor-pointer";
    }
    return "fill-blue-100 stroke-blue-300 stroke-[1px] hover:fill-blue-200 cursor-pointer";
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <svg 
        viewBox="0 0 200 400" 
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto"
      >
        {/* Head */}
        <motion.circle
          cx="100" cy="40" r="30"
          className={getRegionStyle("head")}
          onClick={() => onSelectRegion("head")}
          onMouseEnter={() => setHoveredRegion("head")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Neck */}
        <motion.rect
          x="85" y="70" width="30" height="20"
          className={getRegionStyle("neck")}
          onClick={() => onSelectRegion("neck")}
          onMouseEnter={() => setHoveredRegion("neck")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Chest */}
        <motion.rect
          x="70" y="90" width="60" height="50"
          className={getRegionStyle("chest")}
          onClick={() => onSelectRegion("chest")}
          onMouseEnter={() => setHoveredRegion("chest")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Abdomen */}
        <motion.rect
          x="70" y="140" width="60" height="40"
          className={getRegionStyle("abdomen")}
          onClick={() => onSelectRegion("abdomen")}
          onMouseEnter={() => setHoveredRegion("abdomen")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Left Arm */}
        <motion.rect
          x="40" y="90" width="30" height="40"
          className={getRegionStyle("left_arm")}
          onClick={() => onSelectRegion("left_arm")}
          onMouseEnter={() => setHoveredRegion("left_arm")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Right Arm */}
        <motion.rect
          x="130" y="90" width="30" height="40"
          className={getRegionStyle("right_arm")}
          onClick={() => onSelectRegion("right_arm")}
          onMouseEnter={() => setHoveredRegion("right_arm")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Left Forearm */}
        <motion.rect
          x="40" y="130" width="30" height="40"
          className={getRegionStyle("left_forearm")}
          onClick={() => onSelectRegion("left_forearm")}
          onMouseEnter={() => setHoveredRegion("left_forearm")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Right Forearm */}
        <motion.rect
          x="130" y="130" width="30" height="40"
          className={getRegionStyle("right_forearm")}
          onClick={() => onSelectRegion("right_forearm")}
          onMouseEnter={() => setHoveredRegion("right_forearm")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Left Leg */}
        <motion.rect
          x="70" y="180" width="30" height="60"
          className={getRegionStyle("left_leg")}
          onClick={() => onSelectRegion("left_leg")}
          onMouseEnter={() => setHoveredRegion("left_leg")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Right Leg */}
        <motion.rect
          x="100" y="180" width="30" height="60"
          className={getRegionStyle("right_leg")}
          onClick={() => onSelectRegion("right_leg")}
          onMouseEnter={() => setHoveredRegion("right_leg")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Left Lower Leg */}
        <motion.rect
          x="70" y="240" width="30" height="60"
          className={getRegionStyle("left_lower_leg")}
          onClick={() => onSelectRegion("left_lower_leg")}
          onMouseEnter={() => setHoveredRegion("left_lower_leg")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
        
        {/* Right Lower Leg */}
        <motion.rect
          x="100" y="240" width="30" height="60"
          className={getRegionStyle("right_lower_leg")}
          onClick={() => onSelectRegion("right_lower_leg")}
          onMouseEnter={() => setHoveredRegion("right_lower_leg")}
          onMouseLeave={() => setHoveredRegion(null)}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        />
      </svg>
      
      <div className="mt-4">
        <h3 className="text-lg font-medium text-gray-900">Instrucciones</h3>
        <ul className="mt-2 space-y-2 text-gray-600">
          <li>• Toca en la zona donde sientes molestias</li>
          <li>• Selecciona la parte del cuerpo afectada</li>
        </ul>
      </div>
    </div>
  );
}