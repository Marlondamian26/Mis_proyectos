import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './ChatIA.css';

// Configurable API URL - fallback to current host for development
// Uses import.meta.env for Vite projects
const getApiUrl = () => {
  // Check for Vite environment
  if (typeof import.meta !== 'undefined' && import.meta.env) {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) {
      return envUrl;
    }
  }
  // Fallback to current host (include port for development)
  const port = window.location.port ? `:${window.location.port}` : '';
  return `${window.location.protocol}//${window.location.hostname}${port}/api`;
};

const API_URL = getApiUrl();

const ChatIA = ({ token, onClose }) => {
  const [mensajes, setMensajes] = useState([
    {
      id: 1,
      tipo: 'ia',
      texto: 'Ola! 👋 Sou o assistente da Gestao-Saude.\n\nVoce esta procurando agendar uma consulta medica? Posso ajuda-lo a encontrar o medico perfeito para voce.',
      timestamp: new Date()
    }
  ]);
  const [inputMensagem, setInputMensagem] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [sugerenciasCarregando, setSugestoesCarregando] = useState(false);
  const [sugerencias, setSugerencias] = useState([
    'Quero agendar uma consulta',
    'Ver horarios disponiveis',
    'Tenho uma duvida'
  ]);
  const chatEndRef = useRef(null);

  // Auto-scroll al final del chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes]);

  const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });

  const enviarMensagem = async (texto) => {
    if (!texto.trim() || carregando) return;

    // Adicionar mensagem do usuario
    const mensagemUsuario = {
      id: Date.now(),
      tipo: 'usuario',
      texto: texto,
      timestamp: new Date()
    };
    setMensajes(prev => [...prev, mensagemUsuario]);
    setInputMensagem('');
    setCarregando(true);

    try {
      const response = await axiosInstance.post('/chat-ia/', {
        mensaje: texto
      }, { timeout: 10000 });

      const respostaIA = {
        id: Date.now() + 1,
        tipo: 'ia',
        texto: response.data.resposta,
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, respostaIA]);

      // Atualizar sugestoes com timeout e tratamento de erros
      setSugestoesCarregando(true);
      try {
        const sugResponse = await axiosInstance.get('/chat-ia/sugerencias/', {
          timeout: 5000
        });
        if (sugResponse.data.sugerencias?.length > 0) {
          setSugerencias(sugResponse.data.sugerencias);
        }
      } catch (sugError) {
        // Se falhar, manter sugestoes atuais - nao mostrar erro ao usuario
        console.warn('Nao foi possivel carregar sugestoes:', sugError.message);
      } finally {
        setSugestoesCarregando(false);
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      // Distinguir entre tipos de errores para dar mejor feedback
      let mensagemErroTexto = '';
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        mensagemErroTexto = '⏱️ A conexao demorou muito. Por favor, verifique sua internet e tente novamente.';
      } else if (error.response?.status === 401) {
        mensagemErroTexto = '🔐 Sua sessao expirou. Por favor, faca login novamente.';
      } else if (error.response?.status === 403) {
        mensagemErroTexto = '🔒 Voce nao tem acesso a esta funcao. Apenas pacientes podem usar o assistente.';
      } else if (error.response?.status >= 500) {
        mensagemErroTexto = '🔧 Ha um problema com o servidor. Por favor, tente mais tarde.';
      } else {
        mensagemErroTexto = 'Desculpe, houve um erro ao processar sua mensagem. Por favor, tente novamente.';
      }
      
      const mensagemErro = {
        id: Date.now() + 1,
        tipo: 'error',
        texto: mensagemErroTexto,
        timestamp: new Date()
      };
      setMensajes(prev => [...prev, mensagemErro]);
    } finally {
      setCarregando(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    enviarMensagem(inputMensagem);
  };

  const handleSugestaoClick = (sugestao) => {
    enviarMensagem(sugestao);
  };

  const formatarHora = (data) => {
    return new Date(data).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="chat-ia-container">
      <div className="chat-ia-header">
        <div className="chat-ia-title">
          <span className="chat-ia-icon">🤖</span>
          <span>Assistente de Consultas</span>
        </div>
        <button className="chat-ia-close" onClick={onClose}>
          ✕
        </button>
      </div>

      <div className="chat-ia-messages">
        {mensajes.map((msg) => (
          <div
            key={msg.id}
            className={`chat-message ${msg.tipo} ${msg.tipo === 'error' ? 'error' : ''}`}
          >
            <div className="message-content">
              {msg.texto.split('\n').map((linea, i) => (
                <p key={i}>{linea}</p>
              ))}
            </div>
            <div className="message-time">
              {formatarHora(msg.timestamp)}
            </div>
          </div>
        ))}
        
        {carregando && (
          <div className="chat-message ia">
            <div className="message-content typing">
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
              <span className="typing-dot">.</span>
            </div>
          </div>
        )}
        
        <div ref={chatEndRef} />
      </div>

      {sugerencias.length > 0 && !carregando && mensajes.length <= 2 && (
        <div className="chat-sugerencias">
          {sugerenciasCarregando ? (
            <span className="sugerencias-loading">Carregando sugestoes...</span>
          ) : (
            sugerencias.map((sug, i) => (
              <button
                key={i}
                className="sugerencia-chip"
                onClick={() => handleSugestaoClick(sug)}
              >
                {sug}
              </button>
            ))
          )}
        </div>
      )}

      <form className="chat-ia-input" onSubmit={handleSubmit}>
        <input
          type="text"
          value={inputMensagem}
          onChange={(e) => setInputMensagem(e.target.value)}
          placeholder="Digite sua mensagem..."
          disabled={carregando}
        />
        <button type="submit" disabled={carregando || !inputMensagem.trim()}>
          ➤
        </button>
      </form>
    </div>
  );
};

export default ChatIA;
