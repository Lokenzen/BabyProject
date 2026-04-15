module.exports = async (req, res) => {
  // Activer CORS pour tous les domaines
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Content-Type', 'application/json');

  // Répondre aux requêtes OPTIONS (préflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  try {
    // URL du Google Apps Script de destination
    const gasUrl = 'https://script.google.com/macros/s/AKfycbz06FzRQe4zbWvGPpnXFe1w5amPCce421UkzmCLu1UbGHV3dhf3DoYxNGcKwZIYkcXb/exec';

    // Préparer les options de la requête
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    // Si POST/PUT/DELETE, inclure le body
    if (req.method !== 'GET' && req.body) {
      options.body = JSON.stringify(req.body);
    }

    // Faire la requête au Google Apps Script
    const response = await fetch(gasUrl, options);
    const data = await response.json();

    // Retourner la réponse
    res.status(response.status).json(data);

  } catch (error) {
    console.error('Erreur proxy:', error);
    res.status(500).json({
      error: 'Erreur lors du proxy',
      message: error.message
    });
  }
};
