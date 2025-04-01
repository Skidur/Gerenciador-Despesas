// Importa as dependências necessárias
import React, { useEffect, useRef } from 'react';
import Flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js'; // Importa a localização para português
import { FaCalendarAlt } from 'react-icons/fa';

// Componente DatePicker
// Recebe as props 'value' (data selecionada), 'onChange' (função para atualizar a data) e 'id' (identificador do input)
const DatePicker = ({ value, onChange, id }) => {
  // Cria referências para o input e a instância do Flatpickr
  const inputRef = useRef(null);
  const flatpickrInstanceRef = useRef(null);

  // Hook useEffect para inicializar e configurar o Flatpickr
  // Executa sempre que 'value' ou 'onChange' mudam
  useEffect(() => {
    // Inicializa o Flatpickr no input, configurando formato, data padrão e idioma
    const flatpickrInstance = Flatpickr(inputRef.current, {
      dateFormat: 'Y-m-d', // Formato compatível com o backend (yyyy-mm-dd)
      defaultDate: value, // Define a data inicial com base na prop 'value'
      onChange: (selectedDates, dateStr) => {
        onChange(dateStr); // Atualiza o valor da data quando o usuário seleciona uma nova data
      },
      locale: Portuguese, // Configura o idioma para português brasileiro
    });

    // Armazena a instância do Flatpickr para uso posterior
    flatpickrInstanceRef.current = flatpickrInstance;

    // Função de cleanup para destruir a instância do Flatpickr ao desmontar o componente
    return () => {
      if (flatpickrInstanceRef.current && typeof flatpickrInstanceRef.current.destroy === 'function') {
        flatpickrInstanceRef.current.destroy();
      }
    };
  }, [value, onChange]);

  // Renderiza o componente
  // Inclui um ícone de calendário e um input para a data
  return (
    <div className="date-input-container">
      {/* Ícone de calendário que abre o Flatpickr ao ser clicado */}
      <FaCalendarAlt className="calendar-icon" onClick={() => inputRef.current._flatpickr.open()} />
      {/* Input de texto que exibe a data e permite interação com o Flatpickr */}
      <input
        type="text"
        id={id}
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required
      />
    </div>
  );
};

// Exporta o componente DatePicker para uso em outros arquivos
export default DatePicker;