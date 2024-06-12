import { useState, useEffect, useRef } from "react";
import { requestToGroqAi } from "./utils/groq";
import { Light as SyntaxHighlight } from "react-syntax-highlighter";
import { a11yDark } from "react-syntax-highlighter/dist/cjs/styles/prism";
import "./App.css";
import logo from "./assets/nova.png";
import share from "./assets/share.svg";

function App() {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isInputVisible, setIsInputVisible] = useState(true);
  const chatBoxRef = useRef(null); // Add ref for chat box

  const handleSubmit = async () => {
    if (!inputValue.trim()) {
      return;
    }

    let newMessages = [...messages];
    let newInputValue = inputValue;
    const isContinuation = inputValue.startsWith("...");

    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isContinuation && newMessages.length > 0) {
      newMessages[newMessages.length - 1].user += ` ${inputValue.slice(3).trim()}`;
      newInputValue = newMessages[newMessages.length - 1].user;
      newMessages[newMessages.length - 1].timestamp = timestamp;
    } else {
      if (newMessages.length > 0 && inputValue === newMessages[newMessages.length - 1].user) {
        alert("You can't ask the same question twice in a row");
        return;
      }

      newMessages = [
        ...newMessages,
        { user: inputValue, ai: null, copied: false, timestamp: timestamp },
      ];
    }

    setMessages(newMessages);
    setInputValue("");

    setIsTyping(true);
    const aiResponse = await requestToGroqAi(newInputValue);
    setIsTyping(false);

    const updatedMessages = newMessages.map((message, index) =>
      index === newMessages.length - 1
        ? { ...message, ai: parseResponse(aiResponse) }
        : message
    );
    setMessages(updatedMessages);
  };

  const parseResponse = (response) => {
    const codeBlockRegex = /```[\s\S]*?```/g;
    const parts = response.split(codeBlockRegex);
    const codeBlocks = response.match(codeBlockRegex) || [];

    return parts.map((part, index) => ({
      explanation: part.trim(),
      code: codeBlocks[index]
        ? codeBlocks[index].replace(/```/g, "").trim()
        : null,
      copied: false, // Add copied state for each part
    }));
  };

  const handleKeyPress = (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      handleSubmit();
    }
  };

  const toggleInputVisibility = () => {
    setIsInputVisible(!isInputVisible);
  };

  const handleCopy = (messageIndex, partIndex) => {
    const updatedMessages = [...messages];
    if (partIndex === null) {
      updatedMessages[messageIndex].copied = true;
    } else {
      updatedMessages[messageIndex].ai[partIndex].copied = true;
    }
    setMessages(updatedMessages);

    // Reset copied state after a short delay
    setTimeout(() => {
      if (partIndex === null) {
        updatedMessages[messageIndex].copied = false;
      } else {
        updatedMessages[messageIndex].ai[partIndex].copied = false;
      }
      setMessages([...updatedMessages]);
    }, 2000);
  };

  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <main className="main-container">
      <nav className="navbar">
        <div className="navbox">
          <div className="logo2">
            <img src={logo} alt="Logo" className="logonova" />
          </div>
          <div className="link">
            <li>
              <a href="">Get Prem</a>
            </li>
            <li>
              <a href="">Docs</a>
            </li>
            <li>
              <a href="">Login</a>
            </li>
          </div>
        </div>
      </nav>

      <div className="chat-container">
        <div className="intro2">
          <h1>Introduce</h1>
          <p>BakolAi 2nd</p>
        </div>
        <div className="chat-box" ref={chatBoxRef}> {/* Add ref to chat box */}
          {messages.map((message, index) => (
            <div
              key={index}
              className={`message ${message.ai ? "ai-message" : "user-message"}`}
            >
              {message.ai &&
                message.ai.map((part, i) => (
                  <div key={i} className="message-content">
                    <p style={{ marginBottom:'5px', backgroundColor: 'black', color: 'white', padding: '5px', borderRadius: '5px' }}>{message.ai ? "👾 Nova Ai" : "👾 Nova Ai"}:</p>
                    {part.explanation && <p>{part.explanation}</p>}
                    {part.code && (
                      <div className="code-block">
                        <SyntaxHighlight
                          language="javascript"
                          
                          style={{
                            ...a11yDark,
                            'code[class*="language-"]': {
                              color: '#9c7a9d', // Ubah warna menjadi hijau
                              background: 'none'
                            }
                          }}
                        >
                          
                        </SyntaxHighlight>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          ))}
          {isTyping && (
            <div className="message ai-message typing-indicator">
              <p>👾 Nova Ai :</p>
              <div className="spinner">
                <div className="bounce1"></div>
                <div className="bounce2"></div>
                <div className="bounce3"></div>
              </div>
            </div>
          )}
        </div>
        {isInputVisible && (
          <form className="input-form" onSubmit={(e) => e.preventDefault()}>
            <input
              id="content"
              type="text"
              placeholder="Enter text"
              className="input-field"
              name="content"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <button
              type="button"
              onClick={handleSubmit}
              className="submit-button"
            >
              <img src={share} alt="" />
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default App;
