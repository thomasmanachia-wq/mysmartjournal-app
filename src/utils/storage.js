const KEY = "msj_trades";

export function getTrades() {
  try {
    const data = localStorage.getItem(KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTrades(trades) {
  try {
    localStorage.setItem(KEY, JSON.stringify(trades));
  } catch {
    console.error("Erreur localStorage");
  }
}