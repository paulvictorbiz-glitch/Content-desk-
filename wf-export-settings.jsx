// Screen 5 & 6: Export and Settings

function ExportScreen() {
  return (
    <WFShell>
      <WFTopNav active="Export" />
      <ScreenHeader title="Export to Planable" sub="Generate CSV in Planable's import format">
        <Btn ghost sm>⌚ Recent exports</Btn>
      </ScreenHeader>

      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', flex: 1, minHeight: 0 }}>
        {/* LEFT: form */}
        <div style={{ padding: 20, borderRight: `1px solid ${WF.line}`, background: WF.bg2, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: WF.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>1 · Date range</div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 6 }}>
              <Field value="2026-05-26" w={120} prefix={<span style={{ color: WF.muted }}>📅</span>} />
              <span style={{ alignSelf: 'center', color: WF.muted }}>→</span>
              <Field value="2026-06-24" w={120} prefix={<span style={{ color: WF.muted }}>📅</span>} />
            </div>
            <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
              <Pill subtle>this week</Pill>
              <Pill subtle>next 7</Pill>
              <Pill accent>next 30</Pill>
              <Pill subtle>this month</Pill>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: WF.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>2 · Include</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12 }}>
              <label style={{ display: 'flex', gap: 6 }}><input type="checkbox" defaultChecked readOnly style={{ pointerEvents: 'none' }} /> Final captions only</label>
              <label style={{ display: 'flex', gap: 6 }}><input type="checkbox" readOnly style={{ pointerEvents: 'none' }} /> Include drafts (mark as needs-review)</label>
              <label style={{ display: 'flex', gap: 6 }}><input type="checkbox" defaultChecked readOnly style={{ pointerEvents: 'none' }} /> Skip already-exported rows</label>
              <label style={{ display: 'flex', gap: 6 }}><input type="checkbox" defaultChecked readOnly style={{ pointerEvents: 'none' }} /> Include Drive share links</label>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: WF.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>3 · Columns</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {['Date', 'Time', 'Caption', 'Media URL', 'Type', 'Style', 'Filename', 'Drive ID'].map(c => (
                <Pill key={c} subtle style={{ fontSize: 10.5 }}>✓ {c}</Pill>
              ))}
              <Pill subtle style={{ fontSize: 10.5, color: WF.muted }}>+ add</Pill>
            </div>
          </div>

          <div>
            <div style={{ fontSize: 11, color: WF.muted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>4 · Filename</div>
            <Field value="planable_nikky_may26-jun24.csv" w="100%" />
          </div>

          <div style={{ flex: 1 }} />

          <div style={{ background: WF.bg, border: `1px solid ${WF.line}`, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
              <span style={{ fontSize: 22, fontWeight: 600, fontFamily: WF.mono }}>24</span>
              <span style={{ fontSize: 11, color: WF.muted }}>rows will be exported</span>
            </div>
            <div style={{ fontSize: 11, color: WF.muted, lineHeight: 1.5 }}>
              <span style={{ color: WF.accent }}>5 rows excluded</span> (3 not final · 2 already exported). Adjust filters to include.
            </div>
          </div>

          <Btn primary style={{ padding: '10px 14px', justifyContent: 'center' }}>⤓ Generate CSV (24 rows)</Btn>
        </div>

        {/* RIGHT: preview */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ padding: '10px 18px', borderBottom: `1px solid ${WF.line}`, background: WF.bg, display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontSize: 12.5, fontWeight: 600 }}>Preview</div>
            <Pill subtle style={{ fontSize: 10.5 }}>matches Planable import schema</Pill>
            <div style={{ flex: 1 }} />
            <Pill subtle>copy to clipboard</Pill>
            <Pill subtle>view raw CSV</Pill>
          </div>

          {/* CSV-like preview table */}
          <div style={{ flex: 1, overflow: 'hidden', background: WF.bg, fontFamily: WF.mono, fontSize: 11 }}>
            <div style={{
              display: 'grid', gridTemplateColumns: '80px 60px minmax(0,1.8fr) minmax(0,1.4fr) 50px 90px',
              background: WF.bg2, borderBottom: `1px solid ${WF.line}`, fontSize: 10, color: WF.muted,
              fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, fontFamily: WF.font,
            }}>
              {['date', 'time', 'caption', 'media_url', 'type', 'style'].map((h, i) => (
                <div key={i} style={{ padding: '7px 10px', borderRight: i < 5 ? `1px solid ${WF.line2}` : 'none' }}>{h}</div>
              ))}
            </div>
            {[
              { d: '2026-05-28', t: '09:00', c: 'Dr. Joe Dispenza merges meditation with neuroscience. Change your bra…', u: 'drive.google.com/file/d/1xK7p…', tp: 'video', s: 'business' },
              { d: '2026-05-29', t: '09:00', c: 'Communities share tools before they reach the market. Staying connect…', u: 'drive.google.com/file/d/9bV1m…', tp: 'video', s: 'meditation' },
              { d: '2026-05-30', t: '09:00', c: 'A mother\u2019s smile is the first moment consciousness recognizes itse…', u: 'drive.google.com/file/d/2jLp…', tp: 'video', s: 'business' },
              { d: '2026-05-31', t: '09:00', c: 'Brand implementation used to take days. AI creates logos and deploys…', u: 'drive.google.com/file/d/8nQs…', tp: 'video', s: 'meditation' },
              { d: '2026-06-01', t: '09:00', c: 'Wisdom isn\u2019t found in the most powerful texts but the simplest m…', u: 'drive.google.com/file/d/4pRt…', tp: 'video', s: 'business' },
              { d: '2026-06-02', t: '09:00', c: 'Self-compassion is the most valuable currency. The economy you…', u: 'drive.google.com/file/d/5tYu…', tp: 'video', s: 'meditation' },
              { d: '2026-06-03', t: '09:00', c: 'Pain is the price of attention. Nature does not perform for it.', u: 'drive.google.com/file/d/6uIv…', tp: 'video', s: 'business' },
              { d: '2026-06-04', t: '09:00', c: 'Progress is measured in noticing — niche publishing is now access…', u: 'drive.google.com/file/d/7zPx…', tp: 'video', s: 'meditation' },
              { d: '2026-06-05', t: '09:00', c: 'Everything I\u2019ve searched for I entered Rishikesh to find. It w…', u: 'drive.google.com/file/d/8yOw…', tp: 'video', s: 'business' },
              { d: '2026-06-06', t: '09:00', c: 'Slow down to hear the question. Heygen builds custom talking-head…', u: 'drive.google.com/file/d/9bV2k…', tp: 'video', s: 'meditation' },
              { d: '2026-06-07', t: '09:00', c: 'Business fades. At the end of the journey the most powerful prac…', u: 'drive.google.com/file/d/AcW3l…', tp: 'video', s: 'business' },
              { d: '2026-06-08', t: '09:00', c: 'The ego seeks comparison. AI music removes production barriers…', u: 'drive.google.com/file/d/BdX4m…', tp: 'video', s: 'meditation' },
            ].map((r, i) => (
              <div key={i} style={{
                display: 'grid', gridTemplateColumns: '80px 60px minmax(0,1.8fr) minmax(0,1.4fr) 50px 90px',
                borderBottom: `1px solid ${WF.line2}`,
              }}>
                <div style={{ padding: '6px 10px', borderRight: `1px solid ${WF.line2}` }}>{r.d}</div>
                <div style={{ padding: '6px 10px', borderRight: `1px solid ${WF.line2}`, color: WF.ink2 }}>{r.t}</div>
                <div style={{ padding: '6px 10px', borderRight: `1px solid ${WF.line2}`, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: WF.ink2 }}>{r.c}</div>
                <div style={{ padding: '6px 10px', borderRight: `1px solid ${WF.line2}`, overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', color: WF.muted }}>{r.u}</div>
                <div style={{ padding: '6px 10px', borderRight: `1px solid ${WF.line2}`, color: WF.ink2 }}>{r.tp}</div>
                <div style={{ padding: '6px 10px', color: WF.ink2 }}>{r.s}</div>
              </div>
            ))}
          </div>

          <div style={{ padding: '8px 18px', borderTop: `1px solid ${WF.line}`, background: WF.bg2, fontSize: 11, color: WF.muted, display: 'flex', gap: 12 }}>
            <span>Showing 12 of 24</span>
            <span>·</span>
            <span>UTF-8 · comma-delimited · double-quoted</span>
            <div style={{ flex: 1 }} />
            <span>After generation, these 24 rows will be marked <Pill ok style={{ fontSize: 10 }}>exported</Pill> in Planner.</span>
          </div>
        </div>
      </div>
    </WFShell>
  );
}

function Settings() {
  return (
    <WFShell>
      <WFTopNav active="Settings" />
      <ScreenHeader title="Settings" sub="Client-specific config — Nikky Kho" />

      <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', flex: 1, minHeight: 0 }}>
        {/* sub-nav */}
        <div style={{ background: WF.bg2, borderRight: `1px solid ${WF.line}`, padding: '12px 0' }}>
          {['Drive folders', 'Caption prompts', 'Defaults', 'Planable schema', 'File renaming', 'Integrations', 'Danger zone'].map((s, i) => (
            <div key={s} style={{
              padding: '7px 16px', fontSize: 12, cursor: 'pointer',
              background: i === 1 ? WF.bg : 'transparent',
              borderLeft: i === 1 ? `2px solid ${WF.accent}` : '2px solid transparent',
              color: i === 1 ? WF.ink : WF.ink2, fontWeight: i === 1 ? 600 : 500,
            }}>{s}</div>
          ))}
        </div>

        <div style={{ padding: '18px 22px', overflow: 'hidden' }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>Caption prompts</div>
          <div style={{ fontSize: 11.5, color: WF.muted, marginBottom: 16 }}>The LLM uses these prompts when you click Generate or batch-generate. Variables: <code style={{ fontFamily: WF.mono }}>{`{{title}}`}</code>, <code style={{ fontFamily: WF.mono }}>{`{{style}}`}</code>, <code style={{ fontFamily: WF.mono }}>{`{{type}}`}</code>.</div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[
              {
                style: 'business',
                model: 'claude-haiku-4-5',
                tokens: '512',
                prompt: 'You are writing a LinkedIn-style caption for Nikky Kho (entrepreneur, AI builder, martial artist). Open with a sharp insight tied to "{{title}}". 3-5 short sentences. End with a CTA question. Tone: confident, crisp, leadership. Include 3 hashtags from: #ai #leadership #mindset #entrepreneur #business #automation.',
              },
              {
                style: 'meditation',
                model: 'claude-haiku-4-5',
                tokens: '512',
                prompt: 'You are writing an Instagram caption for Nikky Kho (Tai Chi master, kung fu practitioner). Open with a contemplative observation tied to "{{title}}". 3-5 short sentences. End with an invitation, not a CTA. Tone: warm, grounded, present. Include 3 hashtags from: #meditation #mindfulness #taichi #presence #stillness #wisdom.',
              },
            ].map((p) => (
              <div key={p.style} style={{ border: `1px solid ${WF.line}`, background: WF.bg, padding: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  {p.style === 'business' ? <Pill>business</Pill> : <Pill subtle>meditation</Pill>}
                  <div style={{ flex: 1 }} />
                  <span style={{ fontSize: 11, color: WF.muted, fontFamily: WF.mono }}>{p.model}</span>
                </div>
                <div style={{
                  border: `1px solid ${WF.line}`, padding: 10, minHeight: 130, fontSize: 11.5,
                  background: WF.bg2, fontFamily: WF.mono, lineHeight: 1.5, color: WF.ink2,
                }}>{p.prompt}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10, fontSize: 11 }}>
                  <span style={{ color: WF.muted }}>max tokens</span>
                  <Field value={p.tokens} w={60} />
                  <span style={{ color: WF.muted }}>temp</span>
                  <Field value="0.7" w={50} />
                  <div style={{ flex: 1 }} />
                  <Btn sm ghost>Test on a post</Btn>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, padding: 14, border: `1px dashed ${WF.line}`, background: WF.bg2, fontSize: 11.5, color: WF.ink2 }}>
            <div style={{ fontWeight: 600, marginBottom: 4, color: WF.ink }}>Future: file renaming on schedule</div>
            When a row's date passes, rename its Drive file to <code style={{ fontFamily: WF.mono, fontSize: 11 }}>YYYY-MM-DD_nikky_{`{`}style{`}`}.mp4</code>. <span style={{ color: WF.muted }}>(placeholder section — wire up in v0.2)</span>
          </div>
        </div>
      </div>
    </WFShell>
  );
}

Object.assign(window, { ExportScreen, Settings });
