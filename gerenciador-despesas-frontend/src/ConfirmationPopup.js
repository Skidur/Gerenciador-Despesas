// Importa as dependências necessárias
import React, { useState, useEffect } from 'react';
import './ConfirmationPopup.css'; // Importa os estilos do pop-up

// Componente ConfirmationPopup
// Recebe as props 'isOpen' (controla a visibilidade), 'onClose' (função para fechar), 'onConfirm' (função para confirmar) e 'message' (mensagem a ser exibida)
const ConfirmationPopup = ({ isOpen, onClose, onConfirm, message }) => {
  // Estado para gerenciar o processo de fechamento do pop-up
  const [isClosing, setIsClosing] = useState(false);

  // Função para iniciar o fechamento do pop-up
  // Define o estado 'isClosing' como true para acionar a animação de saída
  const handleClose = () => {
    setIsClosing(true);
  };

  // Função para confirmar a ação
  // Inicia o fechamento do pop-up e chama a função 'onConfirm' passada como prop
  const handleConfirm = () => {
    setIsClosing(true);
    onConfirm();
  };

  // Hook useEffect para gerenciar o fechamento do pop-up
  // Executa a função 'onClose' após a animação de saída (300ms) quando 'isClosing' é true
  useEffect(() => {
    if (isClosing) {
      const timer = setTimeout(() => {
        onClose(); // Fecha o pop-up
        setIsClosing(false); // Reseta o estado de fechamento
      }, 300); // Tempo igual à duração da animação de saída
      return () => clearTimeout(timer); // Limpa o timer ao desmontar ou atualizar
    }
  }, [isClosing, onClose]);

  // Condição para renderizar o pop-up
  // Retorna null se 'isOpen' for false, evitando a renderização do componente
  if (!isOpen) return null;

  // Renderiza o pop-up
  // Exibe a mensagem e os botões "Confirmar" e "Cancelar" com animações de entrada/saída
  return (
    <div className={`popup-overlay ${isClosing ? 'closing' : ''}`}>
      <div className={`popup ${isClosing ? 'closing' : ''}`}>
        <p>{message}</p>
        <div className="popup-buttons">
          <button onClick={handleConfirm}>Confirmar</button>
          <button onClick={handleClose}>Cancelar</button>
        </div>
      </div>
    </div>
  );
};

// Exporta o componente ConfirmationPopup para uso em outros arquivos
export default ConfirmationPopup;