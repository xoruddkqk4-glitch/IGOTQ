'use client';

import React, { createContext, useContext, useState } from 'react';
import { RoomInfo } from '@/types/room';

export interface RoomHeaderData {
  room: RoomInfo;
  participantCount: number;
  isHost: boolean;
}

interface RoomHeaderContextType {
  roomHeaderData: RoomHeaderData | null;
  setRoomHeaderData: React.Dispatch<React.SetStateAction<RoomHeaderData | null>>;
  openQRModal: boolean;
  setOpenQRModal: (open: boolean) => void;
}

const RoomHeaderContext = createContext<RoomHeaderContextType>({
  roomHeaderData: null,
  setRoomHeaderData: () => {},
  openQRModal: false,
  setOpenQRModal: () => {},
});

export const RoomHeaderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [roomHeaderData, setRoomHeaderData] = useState<RoomHeaderData | null>(null);
  const [openQRModal, setOpenQRModal] = useState(false);

  return (
    <RoomHeaderContext.Provider
      value={{
        roomHeaderData,
        setRoomHeaderData,
        openQRModal,
        setOpenQRModal,
      }}
    >
      {children}
    </RoomHeaderContext.Provider>
  );
};

export const useRoomHeader = () => useContext(RoomHeaderContext);
