import React, { createContext, useState, useContext, useEffect } from 'react';
import useSound from 'use-sound';

const MusicContext = createContext();

export const MusicProvider = ({ children }) => {
  const musicUrl = '/music.mp3';
  const [isSoundOn, setIsSoundOn] = useState(true);
  const [playMusic, { stop: stopMusic }] = useSound(musicUrl, {
    volume: isSoundOn ? 0.5 : 0,
    loop: true
  });

  useEffect(() => {
    if (isSoundOn) {
      playMusic();
    } else {
      stopMusic();
    }
  }, [isSoundOn, playMusic, stopMusic]);

  const toggleSound = () => {
    setIsSoundOn(!isSoundOn);
  };

  return (
    <MusicContext.Provider value={{ isSoundOn, toggleSound }}>
      {children}
    </MusicContext.Provider>
  );
};

export const useMusic = () => {
  return useContext(MusicContext);
};
