"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "beta_banner_closed";
const HIDE_DAYS   = 30;

export default function BetaBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const until = parseInt(raw, 10);
        if (Date.now() < until) return;
      }
    } catch {}
    setVisible(true);
  }, []);

  function close() {
    setVisible(false);
    try {
      localStorage.setItem(STORAGE_KEY, String(Date.now() + HIDE_DAYS * 86400_000));
    } catch {}
  }

  if (!visible) return null;

  return (
    <div
      role="banner"
      style={{
        position:        "relative",
        zIndex:          200,
        background:      "linear-gradient(90deg, rgba(255,154,0,.08) 0%, rgba(255,100,0,.06) 100%)",
        borderBottom:    "1px solid rgba(255,154,0,.18)",
        padding:         "14px 20px",
      }}
    >
      <div
        className="container"
        style={{
          display:        "flex",
          alignItems:     "flex-start",
          gap:            16,
          maxWidth:       1200,
          margin:         "0 auto",
        }}
      >
        {/* Иконка */}
        <span style={{ fontSize: 20, flexShrink: 0, marginTop: 1 }}>🚧</span>

        {/* Текст */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontWeight:  800,
            fontSize:    14,
            color:       "#ffb340",
            marginBottom: 4,
            letterSpacing: 0.3,
          }}>
            Бета-тестирование RADRP Market
          </div>
          <div style={{
            fontSize:   13,
            color:      "#a0aab8",
            lineHeight: 1.65,
          }}>
            Добро пожаловать на RADRP Market! Сайт находится в активной разработке и регулярно
            обновляется. Некоторые функции ещё дорабатываются.{" "}
            <span style={{ color: "#7e8796" }}>
              Если вы обнаружили ошибку, баг или у вас есть предложения — сообщите нам через раздел{" "}
              <a
                href="/support"
                style={{ color: "#ffb340", textDecoration: "none", fontWeight: 600 }}
              >
                «Поддержка»
              </a>
              . Спасибо за участие в развитии проекта!
            </span>
          </div>
        </div>

        {/* Кнопка закрытия */}
        <button
          onClick={close}
          aria-label="Закрыть баннер"
          style={{
            flexShrink:      0,
            background:      "transparent",
            border:          "none",
            cursor:          "pointer",
            color:           "#7e8796",
            fontSize:        18,
            lineHeight:      1,
            padding:         "2px 4px",
            borderRadius:    6,
            marginTop:       1,
            transition:      "color .15s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#ffffff")}
          onMouseLeave={e => (e.currentTarget.style.color = "#7e8796")}
        >
          ✕
        </button>
      </div>
    </div>
  );
}
