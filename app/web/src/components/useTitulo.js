import { useEffect } from 'react';

export default function useTitulo(titulo) {
  useEffect(() => {
    document.title = titulo ? `${titulo} | Peru Travel` : 'Peru Travel';
  }, [titulo]);
}
