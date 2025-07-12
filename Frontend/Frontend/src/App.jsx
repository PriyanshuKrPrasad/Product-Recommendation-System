import React, { useState, useEffect } from 'react';
import CreatableSelect from 'react-select/creatable';

function App() {
  const [selectedOption, setSelectedOption] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [history, setHistory] = useState([]);
  const [darkMode, setDarkMode] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultOptions = [
    { value: 'laptop', label: 'Laptop' },
    { value: 'phone', label: 'Phone' },
    { value: 'book', label: 'Book' },
    { value: 'car', label: 'Car' },
    { value: 'watch', label: 'Watch' },
    { value: 'headphones', label: 'Headphones' },
    { value: 'tablet', label: 'Tablet' },
  ];

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('history')) || [];
    setHistory(stored);
  }, []);

  useEffect(() => {
    localStorage.setItem('history', JSON.stringify(history));
  }, [history]);

  const getRecommendations = async (productList = [selectedOption?.value]) => {
    const query = productList.join(',');
    if (!query) return;

    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/recommend?product=${encodeURIComponent(query)}`);
      const data = await res.json();
      setRecommendations(data.recommended || []);

      productList.forEach(prod => {
        if (prod && !history.includes(prod)) {
          setHistory(prev => [prod, ...prev]);
        }
      });
    } catch (err) {
      console.error('Error fetching recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  const getRandomRecommendation = () => {
    const allOptions = [...new Set([...defaultOptions.map(o => o.value), ...history])];
    const randomProduct = allOptions[Math.floor(Math.random() * allOptions.length)];
    getRecommendations([randomProduct]);
  };

  const clearAll = () => {
    setSelectedOption(null);
    setRecommendations([]);
    setHistory([]);
    localStorage.removeItem('history');
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('history');
  };

  // Merge history into dropdown options
  const mergedOptions = [
    ...defaultOptions,
    ...history
      .filter(h => !defaultOptions.find(opt => opt.value === h))
      .map(h => ({ value: h, label: capitalize(h) }))
  ];

  const styles = getStyles(darkMode);

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.heading}>📦 Product Recommendation System</h2>

        <div style={styles.toggleRow}>
          <label style={{ color: darkMode ? '#eee' : '#222' }}>
            <input type="checkbox" onChange={() => setDarkMode(!darkMode)} /> 🌙 Dark Mode
          </label>
        </div>
        

        <CreatableSelect
          isMulti={false}
          options={mergedOptions}
          value={selectedOption}
          onChange={option => {
            if (option) setSelectedOption({ value: option.value, label: option.label });
            else setSelectedOption(null);
          }}
          placeholder="Select or create a product..."
          styles={customSelectStyles(darkMode)}
        />

          <div style={styles.buttonRow}>
            <button
              onClick={() => getRecommendations()}
              style={styles.button}
              disabled={!selectedOption}
            >
              🔍 Recommend
            </button>
            <button onClick={getRandomRecommendation} style={styles.randomBtn}>
              🎲 Random
            </button>
            <button onClick={clearAll} style={styles.clearBtn}>🧹 Clear All</button>
          </div>

        {history.length > 0 && (
          <div style={styles.history}>
            <div style={styles.historyHeader}>
              <h4>📜 Search History</h4>
              <button onClick={clearHistory} style={styles.clearHistoryBtn}>❌ Clear History</button>
            </div>
            {history.map((item, index) => (
              <button key={index} onClick={() => getRecommendations([item])} style={styles.historyBtn}>
                {item}
              </button>
            ))}
          </div>
        )}

        <div style={styles.results}>
          <h3>🧠 Recommendations:</h3>
          {loading ? (
            <p style={styles.loading}>⏳ Loading...</p>
          ) : recommendations.length > 0 ? (
            <ul style={styles.list}>
              {recommendations.map((item, i) => (
                <li key={i} style={styles.listItem}>
                  🔗 <a href={`https://www.google.com/search?q=${item}`} target="_blank" rel="noreferrer">{item}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p style={styles.noResults}>No recommendations yet. Try selecting or creating a product.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function getStyles(darkMode) {
  const bgGradient = darkMode
  ? 'linear-gradient(135deg, #0f2027, #203a43, #2c5364)'
  : 'linear-gradient(135deg, #e0f7fa, #fffde7)';
  return {
    page: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh', 
      width: '100vw',
      background: bgGradient,
      padding: '1rem',
      boxSizing: 'border-box',
    },
    container: {
      fontFamily: 'Segoe UI, sans-serif',
      width: '100%',
      maxWidth: '600px',
      maxHeight: '95vh', // prevent overflow
      overflowY: 'auto', // scroll only if needed
      backgroundColor: darkMode ? '#1e1e1e' : '#ffffff',
      borderRadius: '15px',
      padding: '2rem',
      boxShadow: darkMode
        ? '0 0 20px rgba(255,255,255,0.1)'
        : '0 0 20px rgba(0,0,0,0.1)',
      color: darkMode ? '#f0f0f0' : '#222',
      transition: 'all 0.3s ease-in-out',
      animation: 'fadeIn 0.8s ease',
    },
    heading: {
      textAlign: 'center',
      marginBottom: '1.5rem',
      fontSize: '1.6rem',
    },
    toggleRow: {
      textAlign: 'right',
      marginBottom: '1rem',
    },
    buttonRow: {
      display: 'flex',
      flexWrap: 'wrap',
      gap: '0.7rem',
      marginTop: '1rem',
    },
    button: {
      flex: 1,
      padding: '10px',
      fontSize: '16px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#007bff',
      color: '#fff',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    randomBtn: {
      flex: 1,
      padding: '10px',
      fontSize: '16px',
      borderRadius: '12px',
      border: 'none',
      backgroundColor: '#6f42c1',
      color: '#fff',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    clearBtn: {
      flex: 1,
      padding: '10px',
      fontSize: '16px',
      background: 'crimson',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    history: {
      marginTop: '1.5rem',
    },
    historyHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '0.5rem',
    },
    clearHistoryBtn: {
      fontSize: '14px',
      background: '#444',
      color: '#fff',
      border: 'none',
      borderRadius: '6px',
      padding: '4px 8px',
      cursor: 'pointer',
      transition: 'background 0.3s ease',
    },
    historyBtn: {
      margin: '0.3rem',
      padding: '0.4rem 0.8rem',
      fontSize: '14px',
      background: '#e3e3e3',
      border: 'none',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'transform 0.2s ease',
    },
    results: {
      marginTop: '1.5rem',
    },
    list: {
      paddingLeft: '1.2rem',
    },
    listItem: {
      marginBottom: '0.5rem',
    },
    noResults: {
      color: '#aaa',
    },
    loading: {
      fontStyle: 'italic',
      color: 'orange',
    },
  };
}

const customSelectStyles = darkMode => ({
  control: base => ({
    ...base,
    background: darkMode ? '#2b2b2b' : '#fff',
    borderColor: darkMode ? '#444' : '#ccc',
    color: darkMode ? '#eee' : '#333',
  }),
  singleValue: base => ({
    ...base,
    color: darkMode ? '#eee' : '#333',
  }),
  menu: base => ({
    ...base,
    backgroundColor: darkMode ? '#333' : '#fff',
  }),
  multiValue: base => ({
    ...base,
    backgroundColor: darkMode ? '#555' : '#e3e3e3',
  }),
  multiValueLabel: base => ({
    ...base,
    color: darkMode ? '#eee' : '#222',
  }),
});

export default App;
