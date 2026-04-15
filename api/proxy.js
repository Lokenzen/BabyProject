module.exports = async (req, res) => {
  // ✅ CORS Headers - Très important!
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Content-Type', 'application/json');

  // Répondre aux requêtes OPTIONS (préflight CORS)
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ ok: true });
  }

  try {
    // URL du Google Apps Script de destination
    const gasUrl = 'https://script.google.com/macros/s/AKfycbzbriFJpvD6ujfFxqFkvkbQvgq7PzCY1mmsDc3wNkLcQDS5vuBWqKu4nM6Wd1Kd5Ynk/exec';

    // Convertir l'objet JSON en FormData (comme Angular l'envoie)
    const params = new URLSearchParams();
    if (req.body && typeof req.body === 'object') {
      Object.keys(req.body).forEach(key => {
        const value = req.body[key];
        if (value != null && value !== '') {
          params.append(key, String(value));
        }
      });
    }

    // Options de la requête
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    };

    // Faire la requête au Google Apps Script
    const response = await fetch(gasUrl, options);
    const data = await response.text();

    // Essayer de parser comme JSON, sinon retourner le texte brut
    try {
      const jsonData = JSON.parse(data);
      res.status(response.status).json(jsonData);
    } catch (e) {
      res.status(response.status).json({ 
        status: 'success',
        message: 'Données envoyées',
        raw: data
      });
    }

  } catch (error) {
    console.error('Erreur proxy:', error);
    res.status(500).json({
      error: 'Erreur lors du proxy',
      message: error.message
    });
  }
};
