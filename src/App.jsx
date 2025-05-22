import React, { useState, useEffect, useCallback, useMemo } from "react";

const App = () => {
  // 游戏状态管理
  const [cards, setCards] = useState([]); // 所有卡片的数组，包含每张卡片的状态（是否翻开、是否匹配）
  const [flippedCards, setFlippedCards] = useState([]); // 当前翻开的两张卡片，用于匹配判断
  const [isWaiting, setIsWaiting] = useState(false); // 是否正在等待匹配动画完成，防止动画过程中点击其他卡片
  const [isGameWon, setIsGameWon] = useState(false); // 新增状态变量，表示游戏是否通关
  const animationTime = 500; // 匹配动画持续时间

  // 使用 useMemo 缓存表情数组，避免每次渲染都重新创建数组
  const emojis = useMemo(
    () => ["🍕", "🍔", "🍟", "🌭", "🍿", "🍦", "🍩", "🍪"],
    []
  );

  // 初始化游戏
  // 使用 useCallback 缓存函数，避免不必要的重新创建
  const initializeGame = useCallback(() => {
    // 创建卡片对：将每个表情复制一份，然后随机排序
    const cardPairs = [...emojis, ...emojis]
      .sort(() => Math.random() - 0.5) // 随机打乱数组顺序
      .map((emoji, index) => ({
        id: index, // 唯一标识符
        emoji, // 表情符号
        isFlipped: false, // 是否已翻开
        isMatched: false, // 是否已匹配
      }));
    // 重置所有游戏状态
    setCards(cardPairs);
    setFlippedCards([]); // 清空已翻开的卡片
    setIsWaiting(false); // 设置为不在等待状态
    setIsGameWon(false); // 重置通关状态
  }, [emojis]);

  // 组件挂载时初始化游戏
  useEffect(() => {
    initializeGame();
  }, [initializeGame]);

  useEffect(() => {
    // 检查是否所有卡片都已匹配
    if (cards.length > 0 && cards.every((card) => card.isMatched)) {
      setIsGameWon(true); // 设置游戏通关状态
    }
  }, [cards]); // 依赖于 cards 的变化

  // 处理卡片点击事件
  const handleCardClick = (clickedCard) => {
    // 如果正在等待动画或已经翻开两张卡片，则不允许点击
    if (isWaiting) return;
    if (flippedCards.length === 2) return;
    if (clickedCard.isFlipped || clickedCard.isMatched) return;

    // 翻开被点击的卡片
    setCards((prevCards) =>
      prevCards.map((card) =>
        card.id === clickedCard.id ? { ...card, isFlipped: true } : card
      )
    );
    // 将当前卡片添加到已翻开卡片数组
    setFlippedCards((prevFlipped) => [...prevFlipped, clickedCard]);

    // 如果已经翻开两张卡片，检查是否匹配
    if (flippedCards.length === 1) {
      const firstCard = flippedCards[0]; // 获取第一张翻开的卡片
      if (firstCard.emoji === clickedCard.emoji) {
        // 匹配成功：标记卡片为已匹配
        setCards((prevCards) =>
          prevCards.map((card) =>
            card.emoji === clickedCard.emoji
              ? { ...card, isMatched: true }
              : card
          )
        );
      } else {
        // 匹配失败：等待动画完成后翻回卡片
        setIsWaiting(true);
        setTimeout(() => {
          setCards((prevCards) =>
            prevCards.map((card) =>
              card.id === firstCard.id || card.id === clickedCard.id
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setIsWaiting(false); // 动画完成后设置为不在等待状态
        }, animationTime); // 匹配失败动画持续500ms
      }
      // 清空已翻开卡片数组，准备下一轮匹配
      setFlippedCards([]);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-screen p-5 bg-gradient-to-br from-pink-300 via-purple-300 to-indigo-400">
      <h1 className="text-4xl font-bold text-indigo-800 mb-8">记忆配对游戏</h1>
      {isGameWon && ( // 显示通关提示
        <div className="text-3xl text-indigo-600 mb-6">恭喜你，通关了！</div>
      )}
      {/* 游戏卡片区域：使用半透明背景和模糊效果 */}
      <div className="bg-white/40 backdrop-blur-md rounded-xl p-8 shadow-lg">
        <div className="grid grid-cols-4 gap-4 mb-8">
          {cards.map((card) => (
            <div
              key={card.id}
              className={`w-16 h-16 rounded-lg shadow-md flex items-center justify-center cursor-pointer transition duration-500 transform bg-white/70 ${
                card.isFlipped || card.isMatched
                  ? "rotate-y-180"
                  : "hover:bg-white"
              } shadow-md`}
              onClick={() => handleCardClick(card)} // 点击卡片时处理事件
            >
              <span className="text-3xl">
                {card.isFlipped || card.isMatched ? card.emoji : "?"}{" "}
                {/* 显示表情或问号 */}
              </span>
            </div>
          ))}
        </div>
        {/* 重新开始按钮 */}
        <button
          onClick={initializeGame} // 点击按钮时重新开始游戏
          className="inline-flex items-center justify-center rounded-md text-sm font-medium h-10 px-4 py-2 transition duration-300 bg-gradient-to-r from-pink-500 to-indigo-500 text-white transform hover:from-pink-600 hover:to-indigo-600 active:scale-95 active:shadow-lg"
        >
          重新开始
        </button>
      </div>
    </div>
  );
};

export default App;
