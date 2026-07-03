import { createServer } from 'vite';
import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const L1_TRANSLATIONS = {
  'Φ': 'ZANNA',
  'Ω': 'TARTUFO',
  'Ψ': 'PROSCIUTTO',
  'λ': 'FANGOSITÀ',
  'Ξ': 'ALCHIMIA',
  'θ': 'CRUSCA',
  'Σ': 'FOCACCIA',
  'γ': 'CODA',
};

async function injectMockPeer(page) {
  await page.evaluateOnNewDocument(() => {
    const signalingChannel = new BroadcastChannel('mock-peer-signaling');
    const dataChannel = new BroadcastChannel('mock-peer-data');

    class MockConnection {
      constructor(peerId, myId) {
        this.peer = peerId;
        this.myId = myId;
        this.open = true;
        this.callbacks = {};
        console.log(`[Mock Network] MockConnection created: ${myId} -> ${peerId}`);

        this.dataListener = (event) => {
          const { senderId, targetId, payload } = event.data;
          if (senderId === this.peer && targetId === this.myId) {
            console.log(`[Mock Network] ${this.myId} received payload from ${this.peer}:`, payload);
            if (this.callbacks['data']) {
              this.callbacks['data'](payload);
            }
          }
        };
        dataChannel.addEventListener('message', this.dataListener);
      }

      on(event, cb) {
        console.log(`[Mock Network] MockConnection registering event: ${event}`);
        this.callbacks[event] = cb;
        if (event === 'open') {
          setTimeout(() => {
            console.log(`[Mock Network] MockConnection triggering 'open' for ${this.myId}`);
            cb();
          }, 10);
        }
      }

      send(payload) {
        console.log(`[Mock Network] ${this.myId} sending payload to ${this.peer}:`, payload);
        dataChannel.postMessage({
          senderId: this.myId,
          targetId: this.peer,
          payload: payload
        });
      }

      close() {
        console.log(`[Mock Network] MockConnection closing: ${this.myId}`);
        this.open = false;
        dataChannel.removeEventListener('message', this.dataListener);
        if (this.callbacks['close']) this.callbacks['close']();
      }
    }

    class MockPeer {
      constructor(_options) {
        console.log('[Mock Network] MockPeer constructor invoked.');
        this.callbacks = {};
        MockPeer.instances.push(this);
        
        setTimeout(() => {
          this.id = 'mock-peer-id-' + Math.floor(Math.random() * 100000);
          console.log('[Mock Network] MockPeer triggering open with ID:', this.id);
          if (this.callbacks['open']) {
            this.callbacks['open'](this.id);
          }
        }, 50);

        this.sigListener = (event) => {
          const { type, targetId, senderId } = event.data;
          if (type === 'connect' && targetId === this.id) {
            console.log(`[Mock Network] Host MockPeer received connect request from ${senderId}`);
            const hostConn = new MockConnection(senderId, this.id);
            if (this.callbacks['connection']) {
              this.callbacks['connection'](hostConn);
            }
            signalingChannel.postMessage({ type: 'connect-ack', targetId: senderId, senderId: this.id });
          }
        };
        signalingChannel.addEventListener('message', this.sigListener);
      }

      on(event, cb) {
        console.log('[Mock Network] MockPeer registering listener for event:', event);
        this.callbacks[event] = cb;
      }

      connect(roomCode, _options) {
        console.log(`[Mock Network] MockPeer connecting to room: ${roomCode}`);
        const clientConn = new MockConnection(roomCode, this.id);

        const ackListener = (event) => {
          const { type, targetId, senderId } = event.data;
          if (type === 'connect-ack' && targetId === this.id && senderId === roomCode) {
            console.log(`[Mock Network] Client MockPeer received connect-ack from Host ${roomCode}`);
            signalingChannel.removeEventListener('message', ackListener);
            if (clientConn.callbacks['open']) {
              clientConn.callbacks['open']();
            }
          }
        };
        signalingChannel.addEventListener('message', ackListener);

        setTimeout(() => {
          console.log(`[Mock Network] Client MockPeer sending connect request to room: ${roomCode}`);
          signalingChannel.postMessage({ type: 'connect', targetId: roomCode, senderId: this.id });
        }, 50);

        return clientConn;
      }

      reconnect() {}
      destroy() {
        console.log('[Mock Network] MockPeer destroy invoked.');
        signalingChannel.removeEventListener('message', this.sigListener);
        MockPeer.instances = MockPeer.instances.filter(p => p !== this);
      }
    }
    MockPeer.instances = [];

    window.Peer = MockPeer;
    console.log('[Mock Network] window.Peer mocked successfully.');
  });
}

async function clickDOM(page, selector) {
  await page.waitForSelector(selector);
  await page.evaluate((sel) => {
    const el = document.querySelector(sel);
    if (el) {
      el.click();
    } else {
      throw new Error(`Element ${sel} not found to click.`);
    }
  }, selector);
}

async function setupPage(page, name) {
  await injectMockPeer(page);
  await page.setRequestInterception(true);
  page.on('request', req => {
    const u = req.url();
    if (u.includes('fonts.googleapis.com') || u.includes('fonts.gstatic.com')) {
      req.abort();
    } else {
      req.continue();
    }
  });
  page.on('console', msg => console.log(`[${name} Console]`, msg.text()));
  page.on('pageerror', err => console.error(`[${name} Page Error]`, err.message || err));
  page.on('requestfailed', req => {
    const err = req.failure();
    console.error(`[${name} Request Failed] URL: ${req.url()}, Reason: ${err ? err.errorText : 'unknown'}`);
  });
}

async function run() {
  console.log('[Test] Programmatically spinning up Vite server...');
  const server = await createServer({
    server: { port: 5173 }
  });
  await server.listen();

  const address = server.httpServer ? server.httpServer.address() : null;
  const port = (address && typeof address === 'object') ? address.port : 5173;
  const url = `http://localhost:${port}`;
  console.log(`[Test] Vite dev server running at: ${url}`);

  console.log('[Test] Launching headless browser instances...');
  const browser = await puppeteer.launch({
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--autoplay-policy=no-user-gesture-required',
      '--mute-audio',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding'
    ]
  });

  let page1;
  let page2;

  try {
    page1 = await browser.newPage();
    page2 = await browser.newPage();

    await setupPage(page1, 'Host');
    await setupPage(page2, 'Client');

    console.log('[Test] Navigating Host and Client to application...');
    await page1.goto(url, { waitUntil: 'domcontentloaded' });
    await page2.goto(url, { waitUntil: 'domcontentloaded' });

    // --- STEP 1: WEBTRC HANDSHAKE ---
    console.log('[Test] Creating lobby on Host...');
    await page1.waitForSelector('#btn-create-lobby');
    const peerType = await page1.evaluate(() => typeof window.Peer);
    const peerStr = await page1.evaluate(() => window.Peer ? window.Peer.toString() : 'undefined');
    console.log(`[Test] Host window.Peer type: ${peerType}`);
    console.log(`[Test] Host window.Peer source: ${peerStr.substring(0, 150)}`);
    await clickDOM(page1, '#btn-create-lobby');

    console.log('[Test] Waiting for Room Code...');
    await page1.waitForFunction(() => {
      const el = document.getElementById('room-code-display');
      const text = el ? el.textContent.trim() : 'null';
      console.log(`[Mock Network] waitForFunction checking. Text: "${text}"`);
      return el && text && !text.includes('GENERIC') && !text.includes('LOBBY');
    }, { polling: 100, timeout: 5000 });

    const roomCode = await page1.evaluate(() => {
      const el = document.getElementById('room-code-display');
      return el ? el.textContent.trim() : null;
    });
    console.log(`[Test] Room Code obtained: ${roomCode}`);

    console.log('[Test] Connecting Client to room...');
    await page2.waitForSelector('#lobby-role-select');
    await page2.select('#lobby-role-select', 'pilot');
    
    await page2.type('#lobby-code-input', roomCode);
    await clickDOM(page2, '#btn-join-lobby');

    console.log('[Test] Waiting for WebRTC connection...');
    await page1.waitForSelector('#btn-start-game');
    console.log('✓ Connection Handshake Successful (PeerJS)');

    // Start game
    await clickDOM(page1, '#btn-start-game');

    // --- STEP 2: SOLVING LEVEL 1 ---
    console.log('[Test] Solving Level 1...');
    await page1.waitForSelector('#l1-submit-btn');

    const l1Symbols = await page1.evaluate(() => window.gameState.levelState.symbols);
    console.log(`[Test] Level 1 target symbols: ${l1Symbols.join(', ')}`);
    const l1Answers = l1Symbols.map(s => L1_TRANSLATIONS[s]);

    await page1.type('#l1-input-0', l1Answers[0]);
    await page1.type('#l1-input-1', l1Answers[1]);
    await page1.type('#l1-input-2', l1Answers[2]);
    await clickDOM(page1, '#l1-submit-btn');

    await page1.waitForSelector('#l2-ready-p1');
    console.log('✓ Level 1 Automation - State Transition Validated');

    // --- STEP 3: SOLVING LEVEL 2 ---
    console.log('[Test] Solving Level 2...');
    // Solvable path from 56 starting value in 4 steps:
    // 1: *2, +15 (127)
    // 2: /2, +15 (78)
    // 3: *2, +15 (171)
    // 4: /2, +15 (100)
    const steps = [
      { p1: '#l2-op-mul', p2: '#l2-op-add' }, // Step 1
      { p1: '#l2-op-div', p2: '#l2-op-add' }, // Step 2
      { p1: '#l2-op-mul', p2: '#l2-op-add' }, // Step 3
      { p1: '#l2-op-div', p2: '#l2-op-add' }, // Step 4
    ];

    for (let i = 0; i < steps.length; i++) {
      console.log(`[Test] Level 2 - Resolving Step ${i + 1}/4...`);
      await clickDOM(page1, steps[i].p1);
      await clickDOM(page2, steps[i].p2);

      await clickDOM(page1, '#l2-ready-p1');
      await clickDOM(page2, '#l2-ready-p2');

      // Wait for arithmetic sync to resolve
      await new Promise(r => setTimeout(r, 800));
    }

    // Verify transition to Level 3
    await page1.waitForSelector('#dev-drawer-indicator');
    const levelAfterL2 = await page1.evaluate(() => window.gameState.currentLevel);
    if (levelAfterL2 !== 3) {
      throw new Error(`Level 2 failed to transition. Current Level: ${levelAfterL2}`);
    }
    console.log('✓ Level 2 Automation - State Transition Validated');

    // --- STEP 4: BYPASS TO LEVEL 10 ---
    console.log('[Test] Bypassing levels 3-9 to test boss fight...');
    await clickDOM(page1, '#dev-drawer-indicator');
    await page1.waitForSelector('#dev-level-bypass');
    await page1.select('#dev-level-bypass', '10');

    // Wait for connection synchronization
    await new Promise(r => setTimeout(r, 1500));
    const isLevel10 = await page1.evaluate(() => window.gameState.currentLevel === 10);
    if (!isLevel10) {
      throw new Error('Level bypass failed to load Level 10');
    }

    // --- STEP 5: LEVEL 10 - PHASE 1 (HACK) ---
    console.log('[Test] Level 10 Phase 1: Decrypting boss shield...');
    await page1.waitForSelector('#l10-p1-submit');

    const l10Symbols = await page1.evaluate(() => window.gameState.levelState.p1Symbols);
    console.log(`[Test] Level 10 target symbols: ${l10Symbols.join(', ')}`);
    const l10Answers = l10Symbols.map(s => L1_TRANSLATIONS[s]);

    await page1.type('#l10-p1-input-0', l10Answers[0]);
    await page1.type('#l10-p1-input-1', l10Answers[1]);
    await page1.type('#l10-p1-input-2', l10Answers[2]);
    await clickDOM(page1, '#l10-p1-submit');

    // Wait for Phase 2 transition
    await new Promise(r => setTimeout(r, 1000));
    const phase2Loaded = await page1.evaluate(() => window.gameState.levelState.phase === 2);
    if (!phase2Loaded) {
      throw new Error('Phase 2 fail to load');
    }
    console.log('[Test] Level 10 Phase 1 decrypted successfully');

    // --- STEP 6: LEVEL 10 - PHASE 2 (CHARGE) ---
    console.log('[Test] Level 10 Phase 2: Activating charge and vector balancing...');
    await page1.waitForSelector('#l10-charge-btn');

    // Hold down the charging button on Host page using direct DOM events
    await page1.evaluate(() => {
      const btn = document.querySelector('#l10-charge-btn');
      if (btn) {
        btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      } else {
        throw new Error('Charge button not found to mouse down');
      }
    });

    // Pilot balances the reactor in a loop
    let balanced = false;
    for (let tick = 0; tick < 100; tick++) {
      const stats = await page2.evaluate(() => {
        return {
          phase: window.gameState.levelState.phase,
          stability: window.gameState.levelState.stabilityValue,
          charge: window.gameState.levelState.p1CannonCharge
        };
      });

      if (stats.phase === 3) {
        balanced = true;
        break;
      }

      // Balance vectors
      if (stats.stability > 10) {
        await clickDOM(page2, '#l10-reactor-left');
      } else if (stats.stability < -10) {
        await clickDOM(page2, '#l10-reactor-right');
      }

      await new Promise(r => setTimeout(r, 150));
    }

    // Release mouse
    // Release mouse using direct DOM events
    await page1.evaluate(() => {
      const btn = document.querySelector('#l10-charge-btn');
      if (btn) {
        btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      }
    });

    if (!balanced) {
      throw new Error('Phase 2 failed to charge within time limit.');
    }
    console.log('[Test] Level 10 Phase 2 charged successfully');

    // --- STEP 7: LEVEL 10 - PHASE 3 (STRIKE) ---
    console.log('[Test] Level 10 Phase 3: Triggering synchronized strike...');
    await page1.waitForSelector('#l10-strike-btn');
    await page2.waitForSelector('#l10-strike-btn');

    // Fire final strike simultaneously (within 100ms)
    await Promise.all([
      clickDOM(page1, '#l10-strike-btn'),
      clickDOM(page2, '#l10-strike-btn')
    ]);

    // Wait for victory screen
    await page1.waitForSelector('#victory-header');
    console.log('✓ Level 10 Automation - Win Condition Verified');

    console.log('✓ Full Simulation Complete: ALL SYSTEMS STABLE');
  } catch (error) {
    console.error('❌ Test Simulation FAILED:', error);
    try {
      console.log('[Test] Capturing failure screenshots...');
      await page1.screenshot({ path: 'C:/Users/calzi/.gemini/antigravity/brain/867ef99e-a002-48d6-adc4-4eac4bece9c6/host_failure.png' });
      await page2.screenshot({ path: 'C:/Users/calzi/.gemini/antigravity/brain/867ef99e-a002-48d6-adc4-4eac4bece9c6/client_failure.png' });
      console.log('[Test] Screenshots saved.');
    } catch (err) {
      console.error('[Test] Failed to save screenshots:', err);
    }
    process.exit(1);
  } finally {
    console.log('[Test] Cleaning up resources...');
    await browser.close();
    await server.close();
    process.exit(0);
  }
}

run();
