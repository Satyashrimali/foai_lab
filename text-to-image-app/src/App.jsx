import { useState } from 'react'
import './App.css'

// Hugging Face API configuration (proxied via Vite Router with hf-inference path)
const HF_API_URL = "/hf-inference/models/stabilityai/stable-diffusion-xl-base-1.0"

function App() {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState(null)
  const [images, setImages] = useState([
    { id: 1, url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=2564&auto=format&fit=crop', prompt: 'Abstract digital art with vibrant colors' },
    { id: 2, url: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2548&auto=format&fit=crop', prompt: 'Cyberpunk city at night with neon lights' },
  ])

  // NOTE: You would normally use an environment variable for the API Key
  // Token is now secured in a .env file (not pushed to GitHub)
  const HF_TOKEN = import.meta.env.VITE_HF_TOKEN

  const handleGenerate = async (e) => {
    e.preventDefault()
    if (!prompt.trim()) return

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch(HF_API_URL, {
        headers: { 
          "Authorization": `Bearer ${HF_TOKEN}`,
          "Content-Type": "application/json",
          "X-Wait-For-Model": "true",
        },
        method: "POST",
        body: JSON.stringify({ inputs: prompt }),
      })

      if (!response.ok) {
        let errorMessage = "Failed to generate image";
        const clonedRes = response.clone();
        try {
          const errData = await clonedRes.json();
          errorMessage = errData.error || errorMessage;
        } catch (e) {
          errorMessage = await response.text() || response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      const blob = await response.blob();
      if (blob.size < 100) throw new Error("Malformed image data received.");
      const imageUrl = URL.createObjectURL(blob);

      const newImage = {
        id: Date.now(),
        url: imageUrl,
        prompt: prompt
      }

      setImages([newImage, ...images])
      setPrompt('')
    } catch (err) {
      console.error("HF Generation Error:", err)
      setError(err.message === "Failed to fetch" 
        ? "Network error: The browser blocked the request. Try disabling AdBlock or checking your internet connection." 
        : err.message
      )
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="app-container">
      <header>
        <div className="logo">
          <span className="logo-icon">🔮</span>
          <h1>Lumina AI</h1>
        </div>
        <nav>
          <a href="#gallery">Gallery</a>
          <div className="status-badge">
            <span className="pulse"></span> Online
          </div>
        </nav>
      </header>

      <main>
        <section className="hero-section">
          <h2 className="hero-title">Manifest your <span className="gradient-text">Imagination</span></h2>
          <p className="hero-subtitle">The most powerful AI image generator, now integrated with Hugging Face.</p>

          <form className="prompt-container" onSubmit={handleGenerate}>
            <div className="input-wrapper">
              <input
                type="text"
                placeholder="Describe your vision (e.g., 'A futuristic library in the clouds')..."
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                disabled={isGenerating}
              />
              <button
                type="submit"
                className={`generate-btn ${isGenerating ? 'loading' : ''}`}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <span className="loader-container">
                    <span className="spinner"></span> Generating...
                  </span>
                ) : (
                  'Generate 🪄'
                )}
              </button>
            </div>
            {error && <p className="error-message">{error}</p>}
            <div className="prompt-suggestions">
              <span>Quick Start:</span>
              <button type="button" onClick={() => setPrompt('A cinematic shot of a neon cyberpunk dragon')}>Cyber Dragon 🐉</button>
              <button type="button" onClick={() => setPrompt('Stunning landscape of a crystal forest at sunrise')}>Crystal Forest 🌲</button>
            </div>
          </form>
        </section>

        <section className="gallery-section" id="gallery">
          <div className="section-header">
            <h3>Visual Gallery</h3>
            <p>Your recent masterpieces and community highlights</p>
          </div>

          <div className="gallery-grid">
            {images.map(image => (
              <div key={image.id} className="image-card">
                <img src={image.url} alt={image.prompt} loading="lazy" />
                <div className="image-overlay">
                  <p>{image.prompt}</p>
                  <button className="download-btn" onClick={() => window.open(image.url, '_blank')}>View Full</button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer>
        <p>&copy; 2026 Lumina AI &bull; Powered by Stable Diffusion</p>
      </footer>
    </div>
  )
}

export default App
