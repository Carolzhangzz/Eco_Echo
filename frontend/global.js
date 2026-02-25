// Determine the base path to frontend root from global.js script location
const _frontendBasePath = (() => {
  const el = document.querySelector('script[src$="global.js"]');
  return el ? el.getAttribute('src').replace('global.js', '') : './';
})();

let usedItems = {};

// 在全局范围内定义一个数组来存储玩家的输入历史
let playerInputHistory = [];

// 方法 3: 使用 var 在全局作用域声明（不推荐）
var currentLanguage = getLanguage();

let gameProgress = {
  talkedToLisa: false,
  talkedToGuard: false,
  talkedToBob: false,
  talkedToJohnathan: false,
};

let intentExpressed = {
  Lisa: false,
  Bob: false,
  Guard: false,
  Johnathan: false,
};

let conversationCount = {
  Lisa: 0,
  Bob: 0,
  Guard: 0,
  Johnathan: 0,
};

let metEmilia = {
  Ki: false,
  Lisa: false,
  Bob: false,
  Johnathan: false,
};

let signatures = {
  Ki: null,
  Lisa: null,
  Bob: null,
  Johnathan: null,
};

// 添加 lastSigner 变量
let lastSigner = null;

let allScenesCompleted = {
  Lisa: false,
  Guard: false,
  Bob: false,
  Johnathan: false,
};

let specialDialogueStarted = {
  Lisa: false,
  Guard: false,
  Bob: false,
  Johnathan: false,
};

let newSceneCompleted = {
  Lisa: false,
  Guard: false,
  Bob: false,
  Johnathan: false,
};

let bobIntentExpress = {
  comeForK: false,
  kaneRelation: false,
  lisaSupport: false,
};
let JohnathanIntentExpress = {
  comeForK: false,
  publicSupport: false,
};

let npcSessionIDs = {
  Lisa: null,
  Guard: null,
  Bob: null,
  Johnathan: null,
};

let finalDecision = null; // New variable to store the final decision



// 鼠标拖尾效果
(function() {
  const numTrails = 25; // 增加拖尾粒子数量
  const trails = [];
  let mouseX = 0, mouseY = 0;

  // 创建自定义鼠标指针
  const cursor = document.createElement('div');
  cursor.id = 'custom-cursor';
  document.body.appendChild(cursor);

  function createTrail() {
      const trail = document.createElement('div');
      trail.className = 'mouse-trail';
      document.body.appendChild(trail);
      return trail;
  }

  for (let i = 0; i < numTrails; i++) {
      trails.push(createTrail());
  }

  document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      
      // 更新自定义鼠标指针位置
      cursor.style.left = `${mouseX}px`;
      cursor.style.top = `${mouseY}px`;
  });

  let currentTrail = 0;
  function animateTrails() {
      const baseSize = 3;
      trails.forEach((trail, index) => {
          const size = baseSize * (1 - index / numTrails);
          const x = mouseX - size / 2;
          const y = mouseY - size / 2;
          const delay = index * 10;
          
          setTimeout(() => {
              trail.style.width = `${size}px`;
              trail.style.height = `${size}px`;
              trail.style.left = `${x}px`;
              trail.style.top = `${y}px`;
              trail.style.opacity = 1 - (index / numTrails);
          }, delay);
      });
      
      requestAnimationFrame(animateTrails);
  }

  animateTrails();

  // 鼠标点击效果
  document.addEventListener('mousedown', () => {
      cursor.style.transform = 'scale(0.8)';
  });

  document.addEventListener('mouseup', () => {
      cursor.style.transform = 'scale(1)';
  });
})();

// 添加一个函数来保存玩家输入历史
// 从 localStorage 加载历史记录
function loadPlayerInputHistory() {
  const savedHistory = localStorage.getItem("playerInputHistory");
  if (savedHistory) {
    playerInputHistory = JSON.parse(savedHistory);
  }
}

// 保存历史记录到 localStorage
function savePlayerInputHistory() {
  localStorage.setItem(
    "playerInputHistory",
    JSON.stringify(playerInputHistory)
  );
}

// 添加新的对话记录
function addToPlayerInputHistory(entry) {
  loadPlayerInputHistory(); // 先加载最新的历史记录
  playerInputHistory.push(entry);
  savePlayerInputHistory(); // 保存更新后的历史记录
  console.log("Player input history updated:", playerInputHistory);
}

// 获取完整的对话历史
function getFullPlayerInputHistory() {
  loadPlayerInputHistory(); // 确保我们有最新的历史记录
  return playerInputHistory;
}

// 添加一个函数来格式化并显示历史记录
function displayFormattedHistory() {
  return playerInputHistory
    .map((entry) => {
      if (entry.type === "user") {
        return `Player: ${entry.content}`;
      } else {
        return `${entry.speaker}: ${entry.content}`;
      }
    })
    .join("\n");
}

// Function to get the final decision
function getFinalDecision() {
  const storedDecision = localStorage.getItem("finalDecision");
  return storedDecision ? JSON.parse(storedDecision) : null;
}

// 添加一个函数来获取玩家输入历史
function getPlayerInputHistory() {
  return playerInputHistory;
}

// 添加一个函数来清除玩家输入历史（如果需要的话）
function clearPlayerInputHistory() {
  playerInputHistory = [];
  localStorage.removeItem("playerInputHistory");
}

// Function to reset the final decision
function resetFinalDecision() {
  finalDecision = null;
  localStorage.removeItem("finalDecision");
}

// npc 思考指示
function displayThinkingIndicator() {
  const textContainer = document.getElementById("text-container");
  const thinkingElement = document.createElement("p");
  thinkingElement.className = "npc-message thinking";
  thinkingElement.id = "thinking-indicator";
  thinkingElement.textContent = `${currentNpcName} is thinking...`;
  textContainer.appendChild(thinkingElement);
  textContainer.scrollTop = textContainer.scrollHeight;
}

// Add this function to remove the thinking indicator
function removeThinkingIndicator() {
  const thinkingIndicator = document.getElementById("thinking-indicator");
  if (thinkingIndicator) {
    thinkingIndicator.remove();
  }
}

// 更新任务栏
function updateTaskBar() {
  const taskBar = document.getElementById("task-bar");
  const task =
    currentLanguage === "en"
      ? "Primary mission: Go back to the past to hinder clean energy policies to protect traditional energy"
      : "主要任务：回到过去阻碍清洁能源政策以保护传统能源";
  taskBar.textContent = task;
}

// 在页面加载时更新任务栏
document.addEventListener("DOMContentLoaded", updateTaskBar);

// 在页面加载时初始化input history
document.addEventListener("DOMContentLoaded", loadPlayerInputHistory);

//在页面加载的时候获取语言
document.addEventListener("DOMContentLoaded", () => {
  currentLanguage = getLanguage();
  console.log("Loaded language:", currentLanguage); // 调试
});

// 在语言切换时更新任务栏
document
  .getElementById("language-toggle")
  .addEventListener("click", updateTaskBar);

//前端给的 const translatedReply = await translateText(npcReply, "auto", "zh");
//然后这边我希望把这个方法改一下，如果翻译失败，就返回原文
//还有这里的数据结构也不对，
async function translateText(text) {
  const sourceText = text;
  try {
    const response = await axios.post("/api/translate", { text: sourceText });
    return response.data.translatedText || text;
  } catch (error) {
    console.error("Translation error:", error);
    // 如果翻译失败，返回原文
    return text;
  }
}
// // 替换原有的translateText函数
// async function translateText(text, from, to) {
//   try {
//     const response = await fetch("/api/translate", {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ text, from, to }),
//     });

//     // 模拟 API 请求失败
//     // throw new Error('Network response was not ok');

//     const data = await response.json();

//     if (data.trans_result) {
//       return { data: data.trans_result[0].dst };
//     } else {
//       throw new Error("Translation failed");
//     }
//   } catch (error) {
//     console.error("Translation error:", error);
//     return { data: text }; // 返回一个包含原始回复的对象
//   }
// }

function loadSessionIDs() {
  const savedSessionIDs = localStorage.getItem("npcSessionIDs");
  if (savedSessionIDs) {
    npcSessionIDs = JSON.parse(savedSessionIDs);
  }
}

function saveSessionIDs() {
  localStorage.setItem("npcSessionIDs", JSON.stringify(npcSessionIDs));
}
function resetSessionIDs() {
  npcSessionIDs = {
    Lisa: null,
    Guard: null,
    Bob: null,
    Johnathan: null,
  };
  saveSessionIDs();
}

// 从 localStorage 加载数据
const loadDataFromLocalStorage = (key, defaultValue) => {
  const savedData = localStorage.getItem(key);
  if (savedData !== null) {
    try {
      const parsedData = JSON.parse(savedData);
      console.log(`Loaded ${key} from localStorage:`, parsedData);

      if (key === "gameProgress") {
        const validKeys = [
          "talkedToLisa",
          "talkedToGuard",
          "talkedToBob",
          "talkedToJohnathan",
        ];
        const cleanedData = {};
        for (const validKey of validKeys) {
          cleanedData[validKey] = parsedData[validKey] === true;
        }
        return cleanedData;
      }

      //对于 Jonathan intentExpressed，进行额外的格式检查

      if (key === "JohnathanIntentExpress") {
        const validKeys = ["comeForK", "publicSupport"];
        const cleanedData = {};
        for (const validKey of validKeys) {
          cleanedData[validKey] = parsedData[validKey] === true;
        }
        return cleanedData;
      }

      // 对于 bobIntentExpress，进行额外的格式检查
      if (key === "bobIntentExpress") {
        const validKeys = ["comeForK", "kaneRelation", "lisaSupport"];
        const cleanedData = {};
        for (const validKey of validKeys) {
          cleanedData[validKey] = parsedData[validKey] === true;
        }
        return cleanedData;
      }

      // 对于 conversationCount，进行额外的格式检查
      if (key === "conversationCount") {
        const validKeys = ["Lisa", "Guard", "Bob", "Johnathan"];
        const cleanedData = {};
        for (const validKey of validKeys) {
          cleanedData[validKey] =
            typeof parsedData[validKey] === "number" ? parsedData[validKey] : 0;
        }
        return cleanedData;
      }

      // 对于 allScenesCompleted 和 newSceneCompleted，进行额外的格式检查
      if (
        key === "allScenesCompleted" ||
        key === "newSceneCompleted" ||
        key === "specialDialogueStarted"
      ) {
        const validKeys = ["Lisa", "Guard", "Bob", "Johnathan"];
        const cleanedData = {};
        for (const validKey of validKeys) {
          cleanedData[validKey] = parsedData[validKey] === true;
        }
        return cleanedData;
      }

      // 对于 metEmilia，进行额外的格式检查
      if (key === "metEmilia") {
        const validKeys = ["Ki", "Lisa", "Bob", "Johnathan"];
        const cleanedData = {};
        for (const validKey of validKeys) {
          cleanedData[validKey] = parsedData[validKey] === true;
        }
        return cleanedData;
      }

      // 对于 signatures，进行额外的格式检查
      if (key === "signatures") {
        const validKeys = ["Ki", "Lisa", "Bob", "Johnathan"];
        const cleanedData = {};
        for (const validKey of validKeys) {
          cleanedData[validKey] =
            parsedData[validKey] === null
              ? null
              : parsedData[validKey] === false
              ? false
              : typeof parsedData[validKey] === "number"
              ? parsedData[validKey]
              : null;
        }
        return cleanedData;
      }

      return parsedData;
    } catch (e) {
      console.log(
        `Error parsing ${key} from localStorage, using default value`
      );
      return defaultValue;
    }
  } else {
    console.log(`No saved ${key} found in localStorage.`);
    return defaultValue;
  }
};

// 加载所有数据
allScenesCompleted = loadDataFromLocalStorage(
  "allScenesCompleted",
  allScenesCompleted
);

specialDialogueStarted = loadDataFromLocalStorage(
  "specialDialogueStarted",
  specialDialogueStarted
);

newSceneCompleted = loadDataFromLocalStorage(
  "newSceneCompleted",
  newSceneCompleted
);
gameProgress = loadDataFromLocalStorage("gameProgress", gameProgress);
usedItems = loadDataFromLocalStorage("usedItems", usedItems);
intentExpressed = loadDataFromLocalStorage("intentExpressed", intentExpressed);
conversationCount = loadDataFromLocalStorage(
  "conversationCount",
  conversationCount
);
metEmilia = loadDataFromLocalStorage("metEmilia", metEmilia);
signatures = loadDataFromLocalStorage("signatures", signatures);
lastSigner = loadDataFromLocalStorage("lastSigner", lastSigner);
bobIntentExpress = loadDataFromLocalStorage(
  "bobIntentExpress",
  bobIntentExpress
);
npcSessionIDs = loadDataFromLocalStorage("npcSessionIDs", npcSessionIDs);
JohnathanIntentExpress = loadDataFromLocalStorage(
  "JohnathanIntentExpress",
  JohnathanIntentExpress
);

//检查 Johnathan 的所有意图是否都已表达
function allJohnathanIntentsExpressed() {
  return Object.values(JohnathanIntentExpress).every((intent) => intent);
}

//更新 Johnathan 的意图
function updateJohnathanIntentExpress(key, value) {
  JohnathanIntentExpress[key] = value;
  localStorage.setItem(
    "JohnathanIntentExpress",
    JSON.stringify(JohnathanIntentExpress)
  );
}

//重置 Johnathan 的意图
function resetJohnathanIntentExpress() {
  JohnathanIntentExpress = {
    comeForK: false,
    publicSupport: false,
  };
  localStorage.setItem(
    "JohnathanIntentExpress",
    JSON.stringify(JohnathanIntentExpress)
  );
}

// 检查 Bob 的所有意图是否都已表达
function allBobIntentsExpressed() {
  return Object.values(bobIntentExpress).every((intent) => intent);
}

// 更新 Bob 的意图
function updateBobIntentExpress(key, value) {
  bobIntentExpress[key] = value;
  localStorage.setItem("bobIntentExpress", JSON.stringify(bobIntentExpress));
}

// 重置 Bob 的意图
function resetBobIntentExpress() {
  bobIntentExpress = {
    comeForK: false,
    kaneRelation: false,
    lisaSupport: false,
  };
  localStorage.setItem("bobIntentExpress", JSON.stringify(bobIntentExpress));
}

// Count 的更新函数
function updateConversationCount(npcName, count) {
  conversationCount[npcName] = count;
  localStorage.setItem("conversationCount", JSON.stringify(conversationCount));
}
// MetEmilia的更新函数
function updateMetEmilia(name, value) {
  metEmilia[name] = value;
  localStorage.setItem("metEmilia", JSON.stringify(metEmilia));
}
// 更新函数
function updateAllScenesCompleted(name, value) {
  allScenesCompleted[name] = value;
  localStorage.setItem(
    "allScenesCompleted",
    JSON.stringify(allScenesCompleted)
  );
}

// specialDialogueStarted 的更新函数
function updateSpecialDialogueStarted(name, value) {
  specialDialogueStarted[name] = value;
  localStorage.setItem(
    "specialDialogueStarted",
    JSON.stringify(specialDialogueStarted)
  );
}

function updateNewSceneCompleted(name, value) {
  newSceneCompleted[name] = value;
  localStorage.setItem("newSceneCompleted", JSON.stringify(newSceneCompleted));
}

//设置 lastSigner 的函数
function setLastSigner(signer) {
  if (typeof signer === "string" && signer.trim() !== "") {
    lastSigner = signer.trim();
    localStorage.setItem("lastSigner", JSON.stringify(signer.trim()));
  } else {
    console.error("Invalid lastSigner value:", signer);
  }
}

// 获取 lastSigner 的函数
function getLastSigner() {
  const storedSigner = localStorage.getItem("lastSigner");
  try {
    const parsedSigner = JSON.parse(storedSigner);
    console.log("Parsed last signer:", parsedSigner);
    return typeof parsedSigner === "string" ? parsedSigner : null;
  } catch (e) {
    console.error("Error parsing lastSigner:", e);
    return null;
  }
}

// 从 localStorage 加载背包内容
function loadInventory() {
  const inventory = JSON.parse(localStorage.getItem("gameInventory")) || [];
  inventoryItems.innerHTML = "";
  inventory.forEach((item) => {
    const li = document.createElement("li");
    li.innerHTML = `<img src="${item.image}" alt="${item.name}" style="width: 30px; height: 30px;"> ${item.name}`;
    li.style.cursor = "pointer";
    if (typeof currentNpcName !== "undefined") {
      li.addEventListener("click", () => promptShareItem(item, currentNpcName)); // 使用全局变量 currentNpcName
    }
    inventoryItems.appendChild(li);
  });
}

// 清除 lastSigner 的函数
function clearLastSigner() {
  lastSigner = null;
  localStorage.removeItem("lastSigner");
}

//重置对话计数的方法
function resetConversationCount() {
  conversationCount = {
    Lisa: 0,
    Bob: 0,
    Guard: 0,
    Johnathan: 0,
  };
  localStorage.setItem("conversationCount", JSON.stringify(conversationCount));
}

// 重置游戏进度
function resetGame() {
  const resetObject = (obj, value) => {
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        obj[key] = value;
      }
    }
  };

  localStorage.removeItem("gameProgress");
  resetObject(gameProgress, false);
  localStorage.setItem("gameProgress", JSON.stringify(gameProgress));

  usedItems = {};
  localStorage.setItem("usedItems", JSON.stringify(usedItems));

  resetObject(intentExpressed, false);
  localStorage.setItem("intentExpressed", JSON.stringify(intentExpressed));

  resetConversationCount();

  resetObject(conversationCount, 0);
  localStorage.setItem("conversationCount", JSON.stringify(conversationCount));

  resetObject(metEmilia, false);
  localStorage.setItem("metEmilia", JSON.stringify(metEmilia));

  resetObject(signatures, null);
  localStorage.setItem("signatures", JSON.stringify(signatures));

  // 重置 allScenesCompleted
  resetObject(allScenesCompleted, false);
  localStorage.setItem(
    "allScenesCompleted",
    JSON.stringify(allScenesCompleted)
  );

  //重置 specialDialogueStarted
  resetObject(specialDialogueStarted, false);
  localStorage.setItem(
    "specialDialogueStarted",
    JSON.stringify(specialDialogueStarted)
  );

  // 重置 newSceneCompleted
  resetObject(newSceneCompleted, false);
  localStorage.setItem("newSceneCompleted", JSON.stringify(newSceneCompleted));

  // 清除 lastSigner
  clearLastSigner();

  // 重置 Bob 的意图
  resetBobIntentExpress();

  // 重置 sessionIDs
  resetSessionIDs();

  // 重置 Johnathan 的意图
  resetJohnathanIntentExpress();

  // 重置 finalDecision
  resetFinalDecision();

  // 清除玩家输入历史
  clearPlayerInputHistory();

  //清空语言
  clearLanguage();

  window.location.href = _frontendBasePath + "Main.html";
}

// 全局背包系统
const inventoryIcon = document.getElementById("inventory-icon");
const inventoryPopup = document.getElementById("inventory-popup");
const inventoryItems = document.getElementById("inventory-items");

// 物品和 NPC 的映射
const itemNpcMapping = {
  真相: ["Lisa"],
  truth: ["Lisa"],
  记者证: ["Guard"],
  press_card: ["Guard"],
  Journalist_ID: ["Guard"],
  general_strike: ["Johnathan"],
  大罢工: ["Johnathan"],
  时光胶囊: ["Player", "Johnathan", "Bob", "Guard", "Lisa", "Emilia"],
};

// 提示是否要分享物品，并且如果某个 NPC 已经收到过物品，则不能再次分享
function promptShareItem(item, npcName) {
  // 检查是否是时光胶囊
  if (item.name === "Time Capsule" || item.name === "时光胶囊") {
    //时光胶囊可以分享给所有的NPC
    showConfirm(
      currentLanguage === "en"
        ? "Do you want to use the Time Capsule to restart the game? This will reset all your progress."
        : "你想使用时光胶囊重新开始游戏吗？这将重置所有进度。",
      (confirmed) => {
        if (confirmed) {
          usedItems[npcName] = true;
          localStorage.setItem("usedItems", JSON.stringify(usedItems));
          // //物品使用的标志
          // itemJustShared = true; // 设置标志
          console.log("Used items:", usedItems);
          removeFromInventory(item.name);
          resetGame();
        }
      }
    );
    return;
  }

  // 检查物品是否可以分享给特定的NPC
  const allowedNpc = itemNpcMapping[item.name];
  if (allowedNpc && allowedNpc !== "all" && !allowedNpc.includes(npcName)) {
    showAlert(
      currentLanguage === "en"
        ? `${item.name} cannot be shared with ${npcName}.`
        : `${item.name}不能与${npcName}分享。`
    );
    return;
  }

  showConfirm(
    currentLanguage === "en"
      ? `Do you want to share this ${item.name} with ${npcName}?`
      : `你想要与${npcName}分享这个${item.name}吗？`,
    (confirmed) => {
      if (confirmed) {
        usedItems[npcName] = true;
        localStorage.setItem("usedItems", JSON.stringify(usedItems));
        showAlert(
          currentLanguage === "en"
            ? `Ki shared the ${item.name} with ${npcName}.`
            : `Ki 与${npcName}分享了${item.name}。`
        );
        console.log("Used items:", usedItems);
        removeFromInventory(item.name);

        // 特殊处理 Guard 的情况
        if (npcName !== "Guard") {
          // 不等于 Guard 的情况下，哪怕没有意图，也可以重置
          updateConversationCount(npcName, conversationCount[npcName] + 1);
        } else {
          // 对于 Guard，只有在已经表达意图的情况下才重置对话计数
          if (intentExpressed[npcName]) {
            resetConversationCount(npcName);
          }
        }
      }
    }
  );
}

// 显示自定义 alert 框
function showAlert(message) {
  const alertBox = document.createElement("div");
  alertBox.className = "custom-alert";
  alertBox.innerHTML = `
    <p>${message}</p>
    <button id="alert-ok">${currentLanguage === "en" ? "OK" : "确定"}</button>
  `;
  document.body.appendChild(alertBox);
  document
    .getElementById("alert-ok")
    .addEventListener("click", () => alertBox.remove());
}

// 定义一个只显示 confirm message ，没有是否按钮的函数
function showConfirmMessage(message) {
  const confirmBox = document.createElement("div");
  confirmBox.className = "custom-alert";
  confirmBox.innerHTML = `
    <p>${message}</p>
    <button id="confirm-ok">${currentLanguage === "en" ? "OK" : "确定"}</button>
  `;

  document.body.appendChild(confirmBox);
  document.getElementById("confirm-ok").addEventListener("click", () => {
    document.body.removeChild(confirmBox);
  });
}

// 显示自定义 confirm 框
function showConfirm(message, callback) {
  const confirmBox = document.createElement("div");
  confirmBox.className = "custom-alert";
  confirmBox.innerHTML = `
    <p>${message}</p>
    <button id="confirm-yes">${currentLanguage === "en" ? "Yes" : "是"}</button>
    <button id="confirm-no">${currentLanguage === "en" ? "No" : "否"}</button>
  `;

  function confirm(result) {
    document.body.removeChild(confirmBox);
    callback(result);
  }

  document.body.appendChild(confirmBox);
  document
    .getElementById("confirm-yes")
    .addEventListener("click", () => confirm(true));
  document
    .getElementById("confirm-no")
    .addEventListener("click", () => confirm(false));
}

// 从背包中移除物品
function removeFromInventory(itemName) {
  let inventory = JSON.parse(localStorage.getItem("gameInventory")) || [];
  inventory = inventory.filter((item) => item.name !== itemName);
  localStorage.setItem("gameInventory", JSON.stringify(inventory));
  loadInventory();
}

// 清空背包
function clearInventory() {
  showConfirm(
    currentLanguage === "en"
      ? "Are you sure you want to clear your bag? This will reset your game progress."
      : "你确定要清空背包吗？这会重置你的游戏进度。",
    (confirmed) => {
      if (confirmed) {
        localStorage.removeItem("gameInventory");
        loadInventory();
        resetGame();
        showAlert(
          currentLanguage === "en"
            ? "Your bag has been cleared. You can restart the game now."
            : "你的背包已被清空。你现在可以重新开始游戏了。"
        );
      }
    }
  );
}

// 添加物品到背包
function addToInventory(item, itemImage) {
  const inventory = JSON.parse(localStorage.getItem("gameInventory")) || [];
  if (!inventory.some((i) => i.name === item)) {
    inventory.push({ name: item, image: itemImage });
    localStorage.setItem("gameInventory", JSON.stringify(inventory));
    loadInventory();
    flashInventoryIcon();
  }
}

// 背包图标闪烁效果
function flashInventoryIcon() {
  inventoryIcon.classList.add("flash");
  setTimeout(() => {
    inventoryIcon.classList.remove("flash");
  }, 500);
}

// 显示/隐藏背包
inventoryIcon.addEventListener("click", () => {
  inventoryPopup.classList.toggle("hidden");
  if (!inventoryPopup.classList.contains("hidden")) {
    inventoryPopup.style.display = "block";
  } else {
    setTimeout(() => {
      inventoryPopup.style.display = "none";
    }, 500); // 配合过渡时间
  }
});

// 显示弹出窗口并添加物品到背包
function showPopup(item) {
  const popup = document.createElement("div");
  const itemImage = item.dataset.image;
  popup.className = "popup";
  popup.innerHTML = `<img src="${itemImage}" alt="${item.dataset.item}" class="popup-item">`;
  document.body.appendChild(popup);

  const itemRect = item.getBoundingClientRect();
  const iconRect = inventoryIcon.getBoundingClientRect();

  popup.style.left = `${itemRect.left + window.scrollX}px`;
  popup.style.top = `${itemRect.top + window.scrollY}px`;
  popup.style.position = "absolute";
  popup.style.transition = "transform 1s ease, opacity 1s ease";

  setTimeout(() => {
    popup.style.transform = `translate(${
      iconRect.left - itemRect.left + (iconRect.width / 2 - 25)
    }px, ${
      iconRect.top - itemRect.top + (iconRect.height / 2 - 25)
    }px) scale(0.5)`;
    popup.style.opacity = "0";
  }, 100);

  popup.addEventListener("transitionend", () => {
    if (popup.parentElement) {
      document.body.removeChild(popup);
      addToInventory(item.dataset.item, itemImage);
    }
  });
}

// 为高亮文本添加点击事件
function addHighlightListeners() {
  document.querySelectorAll(".highlight").forEach((item) => {
    item.addEventListener("click", () => showPopup(item));
  });
}

// 初始加载背包
loadInventory();

// 在 DOMContentLoaded 事件中添加高亮监听器
document.addEventListener("DOMContentLoaded", () => {
  addHighlightListeners();
});

// 设置语言
function setLanguage(lang) {
  currentLanguage = lang;
  localStorage.setItem("language", lang);
  document.dispatchEvent(new Event("languageChanged"));
  setTimeout(() => {
    location.reload(); // 延时刷新
  }, 100); // 100ms 的延时以确保 localStorage 操作完成
}

// 获取当前语言
function getLanguage() {
  return localStorage.getItem("language"); // 默认英语
}

//清空语言设定
function clearLanguage() {
  localStorage.removeItem("language");
}

// Music toggle logic
const musicToggle = document.getElementById("music-toggle");
let isMuted = false;

musicToggle.addEventListener("click", () => {
  if (isMuted) {
    bgm.muted = false;
    musicToggle.textContent = "🔊";
    isMuted = false;
  } else {
    bgm.muted = true;
    musicToggle.textContent = "🔇";
    isMuted = true;
  }
});

const languageToggle = document.getElementById("language-toggle");
document.addEventListener("DOMContentLoaded", () => {
  currentLanguage = getLanguage();
  languageToggle.textContent = currentLanguage === "en" ? "EN" : "CH";
  
  languageToggle.addEventListener("click", () => {
    setLanguage(currentLanguage === "en" ? "zh" : "en");
    languageToggle.textContent = currentLanguage === "en" ? "EN" : "CH";
    //更新按钮文本
    updateButtonLanguage();
  });
});

// 自动回复触发条件函数
function shouldTriggerAutoReply(currentNpcName) {
  const triggerConditions = {
    Lisa: {
      noIntentNoItem: 5,
      intentNoItem: 5,
      noIntentItem: 5,
    },
    Guard: {
      noIntentNoItem: 4,
      intentNoItem: 4,
      noIntentItem: 4,
    },
    Bob: {
      noIntentNoItem: 3,
      intentNoItem: 3,
      noIntentItem: 3,
    },
    Johnathan: {
      noIntentNoItem: 3,
      intentNoItem: 3,
      noIntentItem: 3,
    },
    // 可以为其他 NPC 添加更多条件
  };

  const npcConditions =
    triggerConditions[currentNpcName] || triggerConditions.Lisa; // 默认使用 Lisa 的条件

  if (
    (conversationCount[currentNpcName] >= npcConditions.noIntentNoItem &&
      !usedItems[currentNpcName] &&
      !intentExpressed[currentNpcName]) ||
    (conversationCount[currentNpcName] >= npcConditions.intentNoItem &&
      intentExpressed[currentNpcName] &&
      !usedItems[currentNpcName]) ||
    (conversationCount[currentNpcName] >= npcConditions.noIntentItem &&
      !intentExpressed[currentNpcName] &&
      usedItems[currentNpcName])
  ) {
    return true;
  }
  return false;
}

// 添加签名
async function addSignature(name, signed) {
  try {
    signatures[name] = signed ? Date.now() : false;
    localStorage.setItem("signatures", JSON.stringify(signatures));
  } catch (error) {
    console.error("Error adding signature:", error);
    showAlert(
      currentLanguage === "en"
        ? "An error occurred. Please try again."
        : "发生错误，请重试。"
    );
  }
}
