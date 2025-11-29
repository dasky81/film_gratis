export default async function handler(req, res) {
  // Configurazione CORS (Cross-Origin Resource Sharing)
  // Necessario per permettere al frontend di comunicare con il backend
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Risponde subito alle richieste di pre-flight (OPTIONS)
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Accetta solo richieste POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Metodo non consentito. Usa POST.' });
  }

  try {
    const { prompt } = req.body;

    // Recupera la chiave API dalle variabili d'ambiente di Vercel
    const apiKey = process.env.VITE_GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(500).json({ error: 'Configurazione Server: API Key mancante.' });
    }

    // Chiama Google Gemini (lato server, quindi sicuro)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      })
    });

    const data = await response.json();
    
    // Restituisce la risposta di Gemini al tuo frontend
    res.status(200).json(data);

  } catch (error) {
    console.error("Errore Server:", error);
    res.status(500).json({ error: 'Errore interno del server durante la richiesta AI.' });
  }
}
