(function () {
  "use strict";

  function $(selector, root) {
    return (root || document).querySelector(selector);
  }
  function $all(selector, root) {
    return Array.from((root || document).querySelectorAll(selector));
  }

  const STORAGE_KEYS = {
    prefs: "ttt_prefs",
    scores: "ttt_scores",
  };

  function loadFromStorage(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return fallback;
      return JSON.parse(raw);
    } catch (err) {
      return fallback;
    }
  }

  function saveToStorage(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (err) {}
  }

  const defaultPrefs = {
    n: 3,
    k: 3,
    player1Symbol: "X",
    player2Symbol: "O",
  };

  const defaultScores = {
    player1: 0,
    player2: 0,
    ties: 0,
  };

  const gridEl = $(".game-grid");
  const gameInfoEl = $(".game-info");
  const turnIndicatorEl = $(".turn-indicator");
  const requiredAlignmentsEl = $(".required-alignments");

  const newGameBtn = $(".btn.btn-primary");
  const resetScoresBtn = $(".btn.btn-danger");
  const doneSettingsBtn = $(".btn.btn-success");

  const settingsInputs = $all(".settings-group .settings-input");
  const symbolInputs = $all(".symbol-input");

  const player1Card = $(".player-card.player1");
  const player2Card = $(".player-card.player2");
  const tiesCard = $(".player-card.ties");

  const player1ScoreEl = player1Card
    ? player1Card.querySelector("div:nth-child(2)")
    : null;
  const player2ScoreEl = player2Card
    ? player2Card.querySelector("div:nth-child(2)")
    : null;
  const tiesScoreEl = tiesCard
    ? tiesCard.querySelector("div:nth-child(2)")
    : null;

  const player1LabelEl = player1Card
    ? player1Card.querySelector("div:nth-child(1)")
    : null;
  const player2LabelEl = player2Card
    ? player2Card.querySelector("div:nth-child(1)")
    : null;

  let prefs = loadFromStorage(STORAGE_KEYS.prefs, defaultPrefs);
  prefs.n = clampNumber(prefs.n, 3, 10);
  prefs.k = clampNumber(prefs.k, 3, prefs.n);
  prefs.player1Symbol = normalizeSymbol(prefs.player1Symbol) || "X";
  prefs.player2Symbol = normalizeSymbol(prefs.player2Symbol) || "O";
  if (prefs.player1Symbol === prefs.player2Symbol) {
    prefs.player2Symbol = prefs.player2Symbol === "X" ? "O" : "X";
  }

  let scores = loadFromStorage(STORAGE_KEYS.scores, defaultScores);
  scores.player1 = toInt(scores.player1, 0);
  scores.player2 = toInt(scores.player2, 0);
  scores.ties = toInt(scores.ties, 0);

  let board = [];
  let currentPlayer = "player1";
  let movesMade = 0;
  let gameOver = false;
  let lastMoveIndex = null;

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    syncSettingsUIFromPrefs();
    applyDynamicConstraints();
    renderPlayerLabels();
    renderScores();
    renderRequiredAlignments();
    startNewGame(true);
    wireUIEvents();
  }

  function wireUIEvents() {
    if (newGameBtn)
      newGameBtn.addEventListener("click", () => startNewGame(true));
    if (resetScoresBtn) resetScoresBtn.addEventListener("click", onResetScores);
    if (doneSettingsBtn)
      doneSettingsBtn.addEventListener("click", onApplySettings);

    const nInput = settingsInputs[0];
    const kInput = settingsInputs[1];
    if (nInput && kInput) {
      nInput.addEventListener("input", () => {
        const nVal = clampNumber(toInt(nInput.value, prefs.n), 3, 10);
        kInput.setAttribute("max", String(nVal));
        const kVal = toInt(kInput.value, prefs.k);
        if (kVal > nVal) kInput.value = String(nVal);
      });
    }
  }

  function syncSettingsUIFromPrefs() {
    if (settingsInputs[0]) settingsInputs[0].value = String(prefs.n);
    if (settingsInputs[1]) settingsInputs[1].value = String(prefs.k);
    if (symbolInputs[0]) symbolInputs[0].value = prefs.player1Symbol;
    if (symbolInputs[1]) symbolInputs[1].value = prefs.player2Symbol;
  }

  function applyDynamicConstraints() {
    const nInput = settingsInputs[0];
    const kInput = settingsInputs[1];
    if (nInput) {
      nInput.setAttribute("min", "3");
      nInput.setAttribute("max", "10");
    }
    if (kInput) {
      kInput.setAttribute("min", "3");
      kInput.setAttribute("max", String(prefs.n));
    }
  }

  function onApplySettings() {
    const nInput = settingsInputs[0];
    const kInput = settingsInputs[1];
    const p1Input = symbolInputs[0];
    const p2Input = symbolInputs[1];

    let newN = clampNumber(toInt(nInput && nInput.value, prefs.n), 3, 10);
    let newK = clampNumber(toInt(kInput && kInput.value, prefs.k), 3, newN);

    let p1 = normalizeSymbol(p1Input && p1Input.value) || "X";
    let p2 = normalizeSymbol(p2Input && p2Input.value) || "O";

    if (p1 === p2) {
      Swal.fire({
        icon: "error",
        title: "Symboles invalides",
        text: "Les symboles des joueurs doivent être différents.",
      });
      return;
    }

    if (newK > newN) {
      Swal.fire({
        icon: "error",
        title: "Paramètre invalide",
        text: "k doit être inférieur ou égal à n.",
      });
      return;
    }

    prefs = {
      n: newN,
      k: newK,
      player1Symbol: p1,
      player2Symbol: p2,
    };
    saveToStorage(STORAGE_KEYS.prefs, prefs);

    applyDynamicConstraints();
    renderPlayerLabels();
    renderRequiredAlignments();
    startNewGame(true);
  }

  function renderPlayerLabels() {
    if (player1LabelEl)
      player1LabelEl.textContent = `Player 1 (${prefs.player1Symbol})`;
    if (player2LabelEl)
      player2LabelEl.textContent = `Player 2 (${prefs.player2Symbol})`;
  }

  function renderRequiredAlignments() {
    if (requiredAlignmentsEl)
      requiredAlignmentsEl.textContent = `Required alignments: ${prefs.k}`;
  }

  function startNewGame(resetCurrentPlayerToP1) {
    if (resetCurrentPlayerToP1) currentPlayer = "player1";
    movesMade = 0;
    gameOver = false;
    lastMoveIndex = null;
    if (gridEl) gridEl.classList.remove("disabled");
    const size = prefs.n * prefs.n;
    board = new Array(size).fill(null);
    buildGrid();
    updateTurnIndicator();
  }

  function buildGrid() {
    if (!gridEl) return;
    gridEl.innerHTML = "";
    gridEl.setAttribute("role", "grid");
    gridEl.setAttribute("aria-label", `Tic Tac Toe ${prefs.n}x${prefs.n}`);
    gridEl.style.gridTemplateColumns = `repeat(${prefs.n}, 1fr)`;
    for (let i = 0; i < prefs.n * prefs.n; i++) {
      const cell = document.createElement("div");
      cell.className = "grid-cell";
      cell.dataset.index = String(i);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("tabindex", "0");
      const r = Math.floor(i / prefs.n) + 1;
      const c = (i % prefs.n) + 1;
      cell.setAttribute("aria-label", `Case ${r}, ${c}`);
      cell.addEventListener("click", onCellClick);
      cell.addEventListener("keydown", onCellKeyDown);
      gridEl.appendChild(cell);
    }
  }

  function onCellKeyDown(e) {
    const target = e.currentTarget;
    const index = parseInt(target.dataset.index, 10);
    if (!Number.isInteger(index)) return;
    const n = prefs.n;
    let nextIndex = null;

    switch (e.key) {
      case "ArrowUp":
        nextIndex = index - n;
        break;
      case "ArrowDown":
        nextIndex = index + n;
        break;
      case "ArrowLeft":
        nextIndex = index - 1;
        break;
      case "ArrowRight":
        nextIndex = index + 1;
        break;
      case "Enter":
      case " ":
        e.preventDefault();
        onCellClick({ currentTarget: target });
        return;
    }

    if (nextIndex !== null && nextIndex >= 0 && nextIndex < n * n) {
      const nextCell = gridEl.querySelector(
        `.grid-cell[data-index="${nextIndex}"]`
      );
      if (nextCell) nextCell.focus();
    }
  }

  function onCellClick(e) {
    if (gameOver) return;
    const cell = e.currentTarget;
    const index = parseInt(cell.dataset.index, 10);
    if (!Number.isInteger(index)) return;
    if (board[index] !== null) return;

    const symbol =
      currentPlayer === "player1" ? prefs.player1Symbol : prefs.player2Symbol;
    board[index] = symbol;
    movesMade += 1;

    if (lastMoveIndex !== null) {
      const prev =
        gridEl &&
        gridEl.querySelector(`.grid-cell[data-index="${lastMoveIndex}"]`);
      if (prev) prev.classList.remove("last-move");
    }
    lastMoveIndex = index;

    renderCell(index);
    const line = getWinningLine(index, symbol);

    if (line) {
      onWin(currentPlayer, line);
      return;
    }

    if (movesMade >= board.length) {
      onTie();
      return;
    }

    togglePlayer();
    updateTurnIndicator();
  }

  function renderCell(index) {
    const cell =
      gridEl && gridEl.querySelector(`.grid-cell[data-index="${index}"]`);
    if (cell) {
      cell.textContent = board[index] || "";
      cell.style.cursor = "default";
      cell.classList.add("last-move");
      const r = Math.floor(index / prefs.n) + 1;
      const c = (index % prefs.n) + 1;
      const content = board[index] ? board[index] : "vide";
      cell.setAttribute("aria-label", `Case ${r}, ${c}: ${content}`);
    }
  }

  function togglePlayer() {
    currentPlayer = currentPlayer === "player1" ? "player2" : "player1";
  }

  function updateTurnIndicator() {
    if (!turnIndicatorEl) return;
    if (currentPlayer === "player1") {
      turnIndicatorEl.style.background = "#22d3ee";
      turnIndicatorEl.title = `Tour: Player 1 (${prefs.player1Symbol})`;
    } else {
      turnIndicatorEl.style.background = "#fbbf24";
      turnIndicatorEl.title = `Tour: Player 2 (${prefs.player2Symbol})`;
    }
  }

  function onWin(winner, line) {
    if (winner === "player1") {
      scores.player1 += 1;
    } else {
      scores.player2 += 1;
    }
    saveToStorage(STORAGE_KEYS.scores, scores);
    renderScores();

    gameOver = true;
    if (gridEl) gridEl.classList.add("disabled");
    if (Array.isArray(line)) {
      for (const i of line) {
        const c = gridEl.querySelector(`.grid-cell[data-index="${i}"]`);
        if (c) c.classList.add("win");
      }
    }

    const symbol =
      winner === "player1" ? prefs.player1Symbol : prefs.player2Symbol;
    Swal.fire({
      icon: "success",
      title: "Victoire!",
      text: `${
        winner === "player1" ? "Player 1" : "Player 2"
      } (${symbol}) a gagné`,
      confirmButtonText: "Nouvelle partie",
    }).then(() => {
      startNewGame(true);
    });
  }

  function onTie() {
    scores.ties += 1;
    saveToStorage(STORAGE_KEYS.scores, scores);
    renderScores();
    gameOver = true;
    if (gridEl) gridEl.classList.add("disabled");
    Swal.fire({
      icon: "info",
      title: "Draw game!",
      text: "It's a tie.",
      confirmButtonText: "Play again",
    }).then(() => {
      startNewGame(true);
    });
  }

  function onResetScores() {
    Swal.fire({
      title: "Réinitialiser les scores ?",
      text: "Cette action est irréversible.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: "Oui, réinitialiser",
      cancelButtonText: "Annuler",
    }).then((result) => {
      if (!result.isConfirmed) return;
      scores = { ...defaultScores };
      saveToStorage(STORAGE_KEYS.scores, scores);
      renderScores();
      Swal.fire({
        icon: "success",
        title: "Réinitialisé",
        text: "Les scores ont été remis à zéro.",
      });
    });
  }

  function renderScores() {
    if (player1ScoreEl) player1ScoreEl.textContent = String(scores.player1);
    if (player2ScoreEl) player2ScoreEl.textContent = String(scores.player2);
    if (tiesScoreEl) tiesScoreEl.textContent = String(scores.ties);
  }

  function getWinningLine(index, symbol) {
    const n = prefs.n;
    const k = prefs.k;
    const row = Math.floor(index / n);
    const col = index % n;

    const directions = [
      [0, 1],
      [1, 0],
      [1, 1],
      [1, -1],
    ];

    for (const [dr, dc] of directions) {
      const forward = collectLine(row, col, dr, dc, symbol, n);
      const backward = collectLine(row, col, -dr, -dc, symbol, n);
      const line = backward.reverse().concat([[row, col]], forward);
      if (line.length >= k) {
        return line.map(([r, c]) => r * n + c);
      }
    }
    return null;
  }

  function collectLine(startRow, startCol, dr, dc, symbol, n) {
    let r = startRow + dr;
    let c = startCol + dc;
    const acc = [];
    while (r >= 0 && r < n && c >= 0 && c < n) {
      const i = r * n + c;
      if (board[i] === symbol) {
        acc.push([r, c]);
        r += dr;
        c += dc;
      } else {
        break;
      }
    }
    return acc;
  }

  function isWinningMove(index, symbol) {
    return !!getWinningLine(index, symbol);
  }

  function clampNumber(value, min, max) {
    const num = toInt(value, min);
    if (Number.isNaN(num)) return min;
    return Math.max(min, Math.min(max, num));
  }

  function toInt(value, fallback) {
    const n = parseInt(value, 10);
    return Number.isFinite(n) ? n : fallback;
  }

  function normalizeSymbol(value) {
    if (!value) return "";
    const s = String(value).trim();
    if (s.length === 0) return "";
    return s[0];
  }
})();
