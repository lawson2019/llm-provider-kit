import React from 'react';
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from 'remotion';
import './intro.css';

const clamp = (value: number, min: number, max: number) =>
  Math.max(0, Math.min(1, (value - min) / (max - min)));

const ease = (value: number) => {
  const t = Math.max(0, Math.min(1, value));
  return 1 - Math.pow(1 - t, 3);
};

const lerp = (from: number, to: number, progress: number) =>
  from + (to - from) * ease(progress);

const typed = (text: string, start: number, end: number, time: number) => {
  const progress = clamp(time, start, end);
  return text.slice(0, Math.floor(text.length * progress));
};

const Fade: React.FC<{
  at: number;
  time: number;
  y?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ at, time, y = 6, children, style }) => {
  const progress = clamp(time, at, at + 0.35);
  return (
    <div
      style={{
        opacity: ease(progress),
        transform: `translateY(${lerp(y, 0, progress)}px)`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export const Intro: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = frame / fps;

  const line1 = typed(
    'node skills/llm-provider-kit/scripts/scaffold.mjs \\',
    0.15,
    2.2,
    t,
  );
  const line2 = typed('    --tier starter --stack react \\', 1, 2.65, t);
  const line3 = typed('    --out ../my-key-page', 1.55, 3, t);
  const l2 = clamp(t, 1, 2.65);
  const l3 = clamp(t, 1.55, 3);
  const typingDone = t > 3.05;
  const cursorHidden = Math.floor(t * 2) % 2 === 0;

  const previewProgress = clamp(t, 3.95, 4.55);
  const fieldStarts = [4.55, 4.88, 5.21, 5.54, 5.87];

  const stacksOn = [6.15, 6.23, 6.31, 6.39, 6.47];

  const cap = clamp(t, 6.55, 7.1);

  return (
    <AbsoluteFill
      style={{
        background: '#f4f1e9',
        color: '#18211f',
        fontFamily: '"Noto Sans CJK SC", "Noto Sans SC", sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      <div className="intro-scene">
        <div className="intro-dotgrid" />

        <div className="intro-top">
          <div className="intro-brand">
            <div className="intro-mark">LP</div>
            <div>
              <h1>llm-provider-kit</h1>
              <p>Provider 元数据 · 可直接渲染配置表单</p>
            </div>
          </div>
          <div className="intro-meta">
            <span className="intro-pill intro-accent">schema v2</span>
            <span className="intro-pill">108 providers</span>
            <span className="intro-pill">142 endpoints</span>
          </div>
        </div>

        <div className="intro-workspace">
          <div className="intro-terminal">
            <div className="intro-termbar">
              <i className="intro-dot" />
              <i className="intro-dot" />
              <i className="intro-dot" />
              <span className="intro-termtitle">~/projects</span>
            </div>
            <div className="intro-termbody">
              <div className="intro-cmd">
                <span className="intro-prompt">$ </span>
                <span>{line1}</span>
                {!typingDone && (
                  <span
                    className="intro-cursor"
                    style={{ opacity: cursorHidden ? 0 : 1 }}
                  />
                )}
              </div>
              <div className="intro-cmd" style={{ opacity: l2 > 0 ? 1 : 0 }}>
                <span className="intro-arg">{line2}</span>
              </div>
              <div className="intro-cmd" style={{ opacity: l3 > 0 ? 1 : 0 }}>
                <span className="intro-arg">{line3}</span>
              </div>

              <div className="intro-outblock">
                <Fade at={3.1} time={t} y={0} style={{ color: '#77d6b3' }}>
                  ✓ <span className="intro-out">108 providers · 142 endpoints</span>
                </Fade>
                <Fade at={3.4} time={t} y={0} style={{ color: '#77d6b3' }}>
                  ✓ <span className="intro-out">schema v2 validated · 0 runtime deps</span>
                </Fade>
                <Fade at={3.7} time={t} y={0} style={{ color: '#77d6b3' }}>
                  → <span className="intro-out">generated ./my-key-page</span>
                </Fade>
              </div>
            </div>
          </div>

          <div
            className="intro-preview"
            style={{
              opacity: ease(previewProgress),
              transform: `translateY(${lerp(18, 0, previewProgress)}px) scale(${lerp(
                0.97,
                1,
                previewProgress,
              )})`,
            }}
          >
            <div className="intro-previewhead">
              <strong>生成的配置页</strong>
              <span>REACT</span>
            </div>

            <Fade at={fieldStarts[0]} time={t}>
              <div className="intro-field">
                <div className="intro-label">
                  <span>PROVIDER</span>
                  <span>1 / 108</span>
                </div>
                <div className="intro-value intro-value-accent">
                  <span>OpenAI</span>
                  <span className="intro-chev">▾</span>
                </div>
              </div>
            </Fade>

            <Fade at={fieldStarts[1]} time={t}>
              <div className="intro-field">
                <div className="intro-label">
                  <span>API KEY</span>
                  <span>SECRET</span>
                </div>
                <div className="intro-value">
                  <span className="intro-mask">sk-••••••••••••</span>
                  <span className="intro-chev">◉</span>
                </div>
              </div>
            </Fade>

            <Fade at={fieldStarts[2]} time={t}>
              <div className="intro-field">
                <div className="intro-label">
                  <span>ENDPOINT</span>
                  <span>openai-chat</span>
                </div>
                <div className="intro-value">
                  <span>/v1/chat/completions</span>
                  <span className="intro-chev">▾</span>
                </div>
              </div>
            </Fade>

            <Fade at={fieldStarts[3]} time={t}>
              <div className="intro-request">
                <b>POST</b> /v1/chat/completions
                <br />
                <b>Authorization</b>: Bearer ••••
              </div>
            </Fade>

            <Fade at={fieldStarts[4]} time={t}>
              <div className="intro-ready">
                <span className="intro-tick">✓</span> 配置就绪 · 密钥不保存
              </div>
            </Fade>

            <div className="intro-stacks">
              {['React', 'Vue', 'Svelte', 'Vanilla', 'HTML'].map((stack, index) => (
                <span
                  key={stack}
                  className={`intro-stack${t > stacksOn[index] ? ' intro-stack-on' : ''}`}
                >
                  {stack}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div
          className="intro-caption"
          style={{
            opacity: ease(cap),
            transform: `translateY(${lerp(8, 0, cap)}px)`,
          }}
        >
          <i className="intro-rule" />
          <span>
            一份注册表，生成任意项目的 <b>Provider 配置页</b>
          </span>
        </div>

        <div className="intro-timestamp">108 / 142 · 6 languages</div>
      </div>
    </AbsoluteFill>
  );
};
