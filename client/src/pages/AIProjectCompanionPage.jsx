import React, { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const AIProjectCompanionPage = () => {
  const { id } = useParams();
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I am your THREADKEEP Project Companion. Ask me about your project architecture, technologies, decisions, tasks, risks or documentation.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(false);
  const [listening, setListening] = useState(false);
  const [speakReplies, setSpeakReplies] = useState(false);
  const [projectName, setProjectName] = useState('Project Companion');
  const [error, setError] = useState('');
  const [historyLoading, setHistoryLoading] = useState(true);
  const bottomRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    setVoiceSupported(Boolean(SpeechRecognition));

    return () => {
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadHistory = async () => {
      setHistoryLoading(true);
      setError('');

      try {
        const response = await api.get(`/ai/companion/${id}/history`);
        if (cancelled) return;

        const savedMessages = response.data?.messages || [];

        setProjectName(response.data?.project?.name || 'Project Companion');

        if (savedMessages.length > 0) {
          setMessages(savedMessages);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err.response?.data?.message ||
            'Saved chat history could not be loaded. You can still start a conversation.'
          );
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const cleanSpeechText = (value = '') => {
    return String(value)
      .replace(/```[\w-]*\n?([\s\S]*?)```/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
      .replace(/!\[([^\]]*)\]\([^)]+\)/g, '$1')
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
      .replace(/^\s*[-*_]{3,}\s*$/gm, '')
      .replace(/^\s{0,3}#{1,6}\s+/gm, '')
      .replace(/^\s*>\s?/gm, '')
      .replace(/^\s*[-*+]\s+/gm, '')
      .replace(/^\s*\d+[.)]\s+/gm, '')
      .replace(/^\s*\|?[\s:|-]+\|[\s:|-]*$/gm, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/?[^>]+>/g, '')
      .replace(/(\*\*|__)(.*?)\1/g, '$2')
      .replace(/(\*|_)(.*?)\1/g, '$2')
      .replace(/~~(.*?)~~/g, '$1')
      .replace(/\|/g, ' ')
      .replace(/[ \t]{2,}/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
  };

  const speak = (text) => {
    if (!window.speechSynthesis) {
      setError('Speech output is not supported in this browser.');
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanSpeechText(text));
    utterance.lang = 'en-IN';
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  const startListening = async () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError('Voice input is not supported in this browser. Please use text chat.');
      return;
    }

    if (recognitionRef.current) return;

    if (!window.isSecureContext) {
      setError('Microphone requires HTTPS or localhost. Open ThreadKeep using a secure connection.');
      return;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Microphone access is unavailable. Check your browser permissions.');
      return;
    }

    setError('');

    let stream;

    try {
      // Verify that the browser can access the microphone.
      stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      stream.getTracks().forEach((track) => track.stop());

      const recognition = new SpeechRecognition();
      recognition.lang = 'en-IN';
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => setListening(true);

      recognition.onresult = (event) => {
        let transcript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }

        setInput(transcript);
      };

      recognition.onerror = (event) => {
        const messages = {
          'not-allowed': 'Microphone permission denied. Allow microphone access for ThreadKeep.',
          'service-not-allowed': 'Browser speech recognition service is blocked.',
          'audio-capture': 'Microphone detected, but audio capture failed. Close other apps using the microphone and check Windows input settings.',
          'no-speech': 'No speech detected. Please try speaking again.',
          network: 'Speech recognition network error. Check your internet connection.',
          aborted: 'Voice input was stopped.'
        };

        setError(
          messages[event.error] ||
          'Voice recognition failed: ' + event.error
        );
        setListening(false);
      };

      recognition.onend = () => {
        setListening(false);
        if (recognitionRef.current === recognition) {
          recognitionRef.current = null;
        }
      };

      recognitionRef.current = recognition;

      try {
        recognition.start();
      } catch (startError) {
        recognitionRef.current = null;
        setListening(false);
        setError('Could not start microphone recognition. Please try again.');
      }
    } catch (error) {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }

      const messages = {
        NotAllowedError: 'Microphone permission denied. Allow microphone access in browser settings.',
        NotFoundError: 'No microphone device found. Check your Windows input device.',
        NotReadableError: 'Microphone is busy or unavailable. Close other apps using it.',
        OverconstrainedError: 'The selected microphone does not meet the required audio settings.'
      };

      setError(
        messages[error.name] ||
        'Unable to access microphone: ' + error.message
      );
      setListening(false);
    }
  };

  const sendMessage = async (event) => {
    event?.preventDefault();
    const question = input.trim();

    if (!question || loading || historyLoading) return;

    const previousMessages = messages.filter(
      (item) => item.role === 'user' || item.role === 'assistant'
    );

    setMessages((current) => [
      ...current,
      { role: 'user', content: question },
    ]);
    setInput('');
    setError('');
    setLoading(true);

    try {
      const response = await api.post(`/ai/companion/${id}`, {
        message: question,
        history: previousMessages.slice(-8),
      });

      const answer = response.data?.answer;
      if (!answer) throw new Error('The AI returned an empty response.');

      setProjectName(response.data?.project?.name || 'Project Companion');
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          content: answer,
          sources: response.data?.context?.documentsUsed || [],
          groundingStatus: response.data?.context?.groundingStatus || 'no_document_citations',
        },
      ]);

      if (speakReplies) speak(answer);
    } catch (err) {
      const message =
        err.response?.data?.message ||
        err.message ||
        'Unable to reach the Project Companion.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setSpeaking(false);
  };

  return (
    <main className="min-h-screen bg-[#F4F2EC] px-3 py-5 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col" style={{ minHeight: '85vh' }}>
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              to={`/app/projects/${id}`}
              className="mb-3 inline-flex text-sm font-medium text-[#55716C] hover:text-[#183F3B]"
            >
              ? Back to project
            </Link>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#62817A]">
              THREADKEEP / AI WORKSPACE
            </p>
            <h1 className="mt-1 text-2xl font-bold text-[#183F3B] sm:text-3xl dark:text-[#E8F5EF]">
              AI Project Companion
            </h1>
            <p className="mt-1 text-sm text-[#687773]">{projectName}</p>
          </div>
          <div className="rounded-full border border-[#C9D9D2] bg-white px-3 py-2 text-xs font-semibold text-[#35675C]">
            ? Project-grounded AI
          </div>
        </header>

        <section className="flex flex-1 flex-col overflow-hidden rounded-2xl border border-[#DCE2DA] bg-white shadow-sm dark:border-[#525354] dark:bg-[#202121]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#E8ECE6] px-4 py-3 sm:px-6 dark:border-[#525354]">
            <div>
              <p className="font-semibold text-[#203D39] dark:text-[#DEE5E8]">Conversation</p>
              <p className="text-xs text-[#89938E] dark:text-[#AAB5B8]">
                {historyLoading ? 'Loading saved conversation...' : 'Answers use reconstructed knowledge and processed documents'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSpeakReplies((value) => !value)}
                className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                  speakReplies
                    ? 'bg-[#DDECE5] text-[#245B4D] dark:bg-[#344B43] dark:text-[#C5E8D8]'
                    : 'bg-[#F1F3EF] text-[#65736D] dark:bg-[#343636] dark:text-[#DEE5E8]'
                }`}
              >
                {speakReplies ? '?? Voice replies on' : '?? Voice replies off'}
              </button>
              {speaking && (
                <button
                  type="button"
                  onClick={stopSpeaking}
                  className="rounded-lg bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  Stop voice
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto bg-[#FAFBF8] p-4 sm:p-6 dark:bg-[#181919]">
            {messages.map((message, index) => (
              <div
                key={`${index}-${message.role}`}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[92%] rounded-2xl px-4 py-3 sm:max-w-[80%] ${
                    message.role === 'user'
                      ? 'rounded-br-md bg-[#245C52] text-white'
                      : 'rounded-bl-md border border-[#E1E8E0] dark:border-[#525C58] bg-white text-[#293D38] dark:border-[#525C58] dark:bg-[#292C2B] dark:text-[#DEE5E8]'
                  }`}
                >
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider opacity-65">
                    {message.role === 'user' ? 'You' : 'THREADKEEP AI'}
                  </p>
                  {message.role === 'user' ? (
                    <p className="whitespace-pre-wrap break-words text-sm leading-6">
                      {message.content}
                    </p>
                  ) : (
                    <div className="max-w-none break-words text-sm leading-7 text-[#293D38] dark:text-[#DEE5E8]">
                      <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={{
                          p: ({ children }) => (
                            <p className="mb-3 last:mb-0">{children}</p>
                          ),
                          h1: ({ children }) => (
                            <h1 className="mb-3 mt-5 text-xl font-bold text-[#203D35] first:mt-0 dark:text-[#D7F0E4]">{children}</h1>
                          ),
                          h2: ({ children }) => (
                            <h2 className="mb-2 mt-5 text-lg font-bold text-[#203D35] first:mt-0 dark:text-[#D7F0E4]">{children}</h2>
                          ),
                          h3: ({ children }) => (
                            <h3 className="mb-2 mt-4 text-base font-bold text-[#28594D] dark:text-[#B9E5D2]">{children}</h3>
                          ),
                          ul: ({ children }) => (
                            <ul className="mb-3 ml-5 list-disc space-y-1">{children}</ul>
                          ),
                          ol: ({ children }) => (
                            <ol className="mb-3 ml-5 list-decimal space-y-1">{children}</ol>
                          ),
                          li: ({ children }) => <li className="pl-1">{children}</li>,
                          strong: ({ children }) => (
                            <strong className="font-bold text-[#203D35]">{children}</strong>
                          ),
                          blockquote: ({ children }) => (
                            <blockquote className="my-3 border-l-4 border-[#75A596] pl-4 italic text-[#60766D] dark:text-[#B6C5BE]">{children}</blockquote>
                          ),
                          table: ({ children }) => (
                            <div className="my-4 max-w-full overflow-x-auto rounded-xl border border-[#DCE6DF] dark:border-[#59645F]">
                              <table className="w-full min-w-[420px] border-collapse text-left text-xs sm:text-sm">{children}</table>
                            </div>
                          ),
                          thead: ({ children }) => (
                            <thead className="bg-[#EAF1EC] text-[#294D42] dark:bg-[#35413B] dark:text-[#E1F0E8]">{children}</thead>
                          ),
                          th: ({ children }) => (
                            <th className="border-b border-[#DCE6DF] dark:border-[#59645F] px-3 py-3 font-bold">{children}</th>
                          ),
                          td: ({ children }) => (
                            <td className="border-b border-[#E8EEE9] dark:border-[#454E49] px-3 py-3 align-top">{children}</td>
                          ),
                          code: ({ children, className }) => (
                            <code className={`${className || ''} rounded bg-[#EDF2EE] px-1.5 py-0.5 font-mono text-[0.9em] text-[#28594D] dark:text-[#B9E5D2] dark:bg-[#39443E] dark:text-[#D0EBDD]`}>{children}</code>
                          ),
                          pre: ({ children }) => (
                            <pre className="my-3 overflow-x-auto rounded-xl bg-[#1F302B] p-4 text-xs leading-6 text-[#E7F0EA]">{children}</pre>
                          ),
                          a: ({ children, href }) => (
                            <a href={href} target="_blank" rel="noreferrer" className="font-semibold text-[#287565] underline dark:text-[#8DD9BD] underline-offset-2">{children}</a>
                          ),
                          hr: () => <hr className="my-4 border-[#E1E8E0] dark:border-[#525C58]" />,
                        }}
                      >
                        {String(message.content || '').replace(/<br\s*\/?>/gi, '\n')}
                      </ReactMarkdown>
                    </div>
                  )}
                  {message.sources?.length > 0 && (
                    <div className="mt-3 border-t border-[#E7ECE6] pt-2 dark:border-[#525C58]">
                      <p className="mb-1 text-[10px] font-bold uppercase text-[#71847B] dark:text-[#B5C4BD]">
                        Context documents
                      </p>
                      {message.sources.map((source) => (
                        <p key={source} className="text-xs text-[#58766A] dark:text-[#C0D4CA]">
                          • {source}
                        </p>
                      ))}
                    </div>
                  )}
                  {message.role === 'assistant' && (
                    <div className={`mt-3 rounded-lg border px-3 py-2 text-xs ${
                      message.sources?.length > 0
                        ? 'border-[#CFE5D9] bg-[#F0F8F3] text-[#356B55] dark:border-[#526D5D] dark:bg-[#293B32] dark:text-[#B9E5C8]'
                        : 'border-[#E8D7A9] bg-[#FFF9E9] text-[#806326] dark:border-[#786A46] dark:bg-[#393428] dark:text-[#E8D39B]'
                    }`}>
                      {message.sources?.length > 0
                        ? 'Document sources cited. Check the cited records to verify important details.'
                        : 'No document citations returned. Verify this answer against your project records before relying on it.'}
                    </div>
                  )}
                  {message.role === 'assistant' && index > 0 && (
                    <button
                      type="button"
                      onClick={() => speak(message.content)}
                      className="mt-2 text-xs font-semibold text-[#39766A] hover:underline"
                    >
                      ? Listen to answer
                    </button>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="inline-flex rounded-xl border border-[#E1E8E0] dark:border-[#525C58] bg-white px-4 py-3 text-sm text-[#71847B]">
                Thinking about your project...
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {error && (
            <div role="alert" className="mx-4 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 sm:mx-6">
              {error}
            </div>
          )}

          <form onSubmit={sendMessage} className="border-t border-[#E8ECE6] bg-white p-3 sm:p-5">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    sendMessage();
                  }
                }}
                maxLength={3000}
                rows={2}
                placeholder="Ask about architecture, pending tasks, decisions..."
                aria-label="Message the AI Project Companion"
                className="min-h-[52px] flex-1 resize-y rounded-xl border border-[#DCE3DC] bg-[#FAFBF8] px-4 py-3 text-sm text-[#263D37] outline-none transition focus:border-[#4D887A] focus:ring-2 focus:ring-[#4D887A]/15"
              />
              {voiceSupported && (
                <button
                  type="button"
                  onClick={listening ? () => recognitionRef.current?.stop() : startListening}
                  aria-label={listening ? 'Stop voice input' : 'Start voice input'}
                  className={`h-[52px] shrink-0 rounded-xl px-3 text-sm font-semibold ${
                    listening
                      ? 'bg-red-100 text-red-700'
                      : 'bg-[#E8F0EB] text-[#32665A]'
                  }`}
                >
                  {listening ? 'ï¿½ Stop' : '?? Voice'}
                </button>
              )}
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="h-[52px] shrink-0 rounded-xl bg-[#245C52] px-4 text-sm font-bold text-white transition hover:bg-[#19483F] disabled:cursor-not-allowed disabled:opacity-40"
              >
                Send ?
              </button>
            </div>
            <div className="mt-2 flex flex-wrap justify-between gap-2 text-[11px] text-[#8A9690]">
              <span>Enter to send ï¿½ Shift + Enter for new line</span>
              <span>{input.length}/3000</span>
            </div>
          </form>
        </section>
        <p className="mt-3 text-center text-xs text-[#89938E] dark:text-[#AAB5B8]">
          AI responses can be incomplete. Verify important decisions against original project documents.
        </p>
      </div>
    </main>
  );
};

export default AIProjectCompanionPage;





