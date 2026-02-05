'use client';

import { AssistantType, PetState } from '@/types';
import KreaPet from './KreaPet';
import BonoboPet from './BonoboPet';

interface PetCanvasProps {
  assistantType: AssistantType;
  state: PetState;
  audioLevel: number;
  bondLevel: number;
  onClick?: () => void;
  onPet?: () => void;
}

export default function PetCanvas({
  assistantType,
  state,
  audioLevel,
  bondLevel,
  onClick,
  onPet,
}: PetCanvasProps) {
  // Both pets use dark backgrounds for dramatic effect
  // Krea: deep purple-black, Bonobo: deep green-black
  const bgColor = assistantType === 'krea' ? 'bg-[#050510]' : 'bg-[#051005]';

  return (
    <div className={`w-full h-full ${bgColor} transition-colors duration-500`}>
      {assistantType === 'krea' ? (
        <KreaPet
          state={state}
          audioLevel={audioLevel}
          onClick={onClick}
        />
      ) : (
        <BonoboPet
          state={state}
          audioLevel={audioLevel}
          bondLevel={bondLevel}
          onClick={onClick}
          onPet={onPet}
        />
      )}
    </div>
  );
}
