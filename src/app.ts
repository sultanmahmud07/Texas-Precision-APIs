import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Request, Response } from "express";
import expressSession from "express-session";
import passport from "passport";
import { envVars } from "./app/config/env";
import "./app/config/passport";
import { globalErrorHandler } from "./app/middlewares/globalErrorHandler";
import notFound from "./app/middlewares/notFound";
import { router } from "./app/routes";

const app = express()


app.use(expressSession({
    secret: envVars.EXPRESS_SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(cookieParser())
app.use(express.json())
app.set("trust proxy", 1)
app.use(cors({
    origin: ["http://localhost:3000", "http://52.55.98.134:3001", "https://52.55.98.134:3001", "https://dashboard.devshimul.com", "https://app.devshimul.com"],
    // methods: ["GET", "POST", "PATCH", "PUT", "DELETE"],
    credentials: true, 
  }))

app.use("/api/v1", router)

app.get("/", (req: Request, res: Response) => {
    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Texas Precision | Core Server</title>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

            :root {
                --bg-color: #050505;
                --primary-color: #00ff41; /* Classic Matrix Green */
                --secondary-color: #008f11;
                --text-color: #00ff41;
                --font: 'Share Tech Mono', monospace;
            }

            * { box-sizing: border-box; margin: 0; padding: 0; }

            body {
                background-color: var(--bg-color);
                color: var(--text-color);
                font-family: var(--font);
                height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                overflow: hidden;
                background-image: radial-gradient(circle at center, #111 0%, #000 100%);
            }

            /* CRT Monitor Scanline Effect */
            .scanlines {
                position: fixed;
                top: 0; left: 0; width: 100vw; height: 100vh;
                background: linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0) 50%, rgba(0,0,0,0.2) 50%, rgba(0,0,0,0.2));
                background-size: 100% 4px;
                pointer-events: none;
                z-index: 100;
            }

            .terminal-container {
                width: 95%;
                max-width: 900px;
                border: 1px solid var(--secondary-color);
                background: rgba(0, 20, 0, 0.6);
                box-shadow: 0 0 20px rgba(0, 255, 65, 0.2), inset 0 0 20px rgba(0, 255, 65, 0.1);
                padding: 2rem;
                border-radius: 4px;
                position: relative;
            }

            .header {
                display: flex;
                justify-content: space-between;
                border-bottom: 1px dashed var(--secondary-color);
                padding-bottom: 1rem;
                margin-bottom: 2rem;
            }

            h1 { 
                font-size: 1.5rem; 
                text-transform: uppercase; 
                letter-spacing: 2px; 
                text-shadow: 0 0 5px var(--primary-color); 
            }

            .status-blink { animation: blink 1s step-end infinite; }

            /* Metrics Dashboard */
            .metrics-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 2rem;
                margin-bottom: 2rem;
            }

            .metric-box { text-align: center; }

            .metric-label { 
                font-size: 0.9rem; 
                color: var(--secondary-color); 
                margin-bottom: 0.5rem; 
                display: block;
            }
            .metric-value { 
                font-size: 2.5rem; 
                font-weight: bold; 
                text-shadow: 0 0 10px var(--primary-color); 
                margin-bottom: 0.5rem; 
                display: block;
            }

            .progress-bar {
                width: 100%;
                height: 8px;
                background: #111;
                border: 1px solid var(--secondary-color);
                border-radius: 2px;
                overflow: hidden;
            }

            .progress-fill {
                height: 100%;
                background: var(--primary-color);
                box-shadow: 0 0 10px var(--primary-color);
                width: 0%;
                transition: width 0.5s ease;
            }

            /* Live Data Stream */
            .data-stream {
                height: 200px;
                background: #000;
                border: 1px solid var(--secondary-color);
                padding: 1rem;
                font-size: 0.85rem;
                overflow: hidden;
                display: flex;
                flex-direction: column;
                position: relative;
            }

            /* Fading effect at the bottom of the log */
            .data-stream::after {
                content: '';
                position: absolute;
                bottom: 0; left: 0; right: 0; height: 50px;
                background: linear-gradient(transparent, #000);
            }

            .log-line { margin-bottom: 6px; opacity: 0.9; }
            .log-line .timestamp { color: var(--secondary-color); margin-right: 15px; }
            .log-line .method { color: #fff; font-weight: bold; margin-right: 10px; width: 40px; display: inline-block; }
            .log-line .status { color: var(--primary-color); margin-left: 10px; }

            @keyframes blink { 50% { opacity: 0; } }
            
            /* Responsive */
            @media (max-width: 600px) {
                .metrics-grid { grid-template-columns: 1fr; gap: 1rem; }
            }
        </style>
    </head>
    <body>
        <div class="scanlines"></div>
        <div class="terminal-container">
            <div class="header">
                <h1>Texas Precision Core API</h1>
                <span>STATE: <span style="color: #00ff41">SECURE</span> <span class="status-blink">█</span></span>
            </div>

            <div class="metrics-grid">
                <div class="metric-box">
                    <span class="metric-label">CPU_USAGE</span>
                    <span class="metric-value" id="cpu-val">12%</span>
                    <div class="progress-bar"><div class="progress-fill" id="cpu-bar" style="width: 12%"></div></div>
                </div>
                <div class="metric-box">
                    <span class="metric-label">MEM_ALLOCATION</span>
                    <span class="metric-value" id="ram-val">45%</span>
                    <div class="progress-bar"><div class="progress-fill" id="ram-bar" style="width: 45%"></div></div>
                </div>
                <div class="metric-box">
                    <span class="metric-label">DISK_I/O</span>
                    <span class="metric-value" id="disk-val">28%</span>
                    <div class="progress-bar"><div class="progress-fill" id="disk-bar" style="width: 28%"></div></div>
                </div>
            </div>

            <span class="metric-label" style="margin-bottom: 0.5rem;">[LIVE_TRAFFIC_LOG]</span>
            <div class="data-stream" id="console">
                </div>
        </div>

        <script>
            // 1. Simulate Fluctuating System Metrics
            function updateMetrics() {
                const cpu = Math.floor(Math.random() * 15) + 5;   // Fluctuates 5-20%
                const ram = Math.floor(Math.random() * 8) + 42;   // Fluctuates 42-50%
                const disk = Math.floor(Math.random() * 5) + 25;  // Fluctuates 25-30%

                document.getElementById('cpu-val').innerText = cpu + '%';
                document.getElementById('cpu-bar').style.width = cpu + '%';

                document.getElementById('ram-val').innerText = ram + '%';
                document.getElementById('ram-bar').style.width = ram + '%';

                document.getElementById('disk-val').innerText = disk + '%';
                document.getElementById('disk-bar').style.width = disk + '%';
            }

            setInterval(updateMetrics, 2000); // Update metrics every 2 seconds

            // 2. Simulate Incoming Data Stream
            const consoleEl = document.getElementById('console');
            const endpoints = ['/api/v1/auth/login', '/api/v1/users/profile', '/api/v1/dashboard/stats', '/api/v1/system/health', '/api/v1/payments/verify'];
            const methods = ['GET', 'POST', 'PUT', 'PATCH'];
            const statuses = ['200 OK', '201 CREATED', '200 OK', '200 OK', '204 NO_CONTENT'];

            function addLog() {
                // Generate a fake log entry
                const time = new Date().toISOString().split('T')[1].substring(0, 12);
                const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
                const method = methods[Math.floor(Math.random() * methods.length)];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const latency = Math.floor(Math.random() * 45) + 12;
                const ip = Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255) + '.x.x';

                const line = document.createElement('div');
                line.className = 'log-line';
                line.innerHTML = \`<span class="timestamp">[\${time}]</span> \${ip} <span class="method">\${method}</span> \${endpoint} <span class="status">[\${status}]</span> \${latency}ms\`;

                // Add to top of the log
                consoleEl.prepend(line);

                // Keep only the last 15 lines to prevent memory leaks
                if (consoleEl.children.length > 15) {
                    consoleEl.removeChild(consoleEl.lastChild);
                }
            }

            // Loop to add logs at random intervals (simulating bursty traffic)
            (function loop() {
                const randDelay = Math.round(Math.random() * (1200 - 200)) + 200;
                setTimeout(function() {
                    addLog();
                    loop();
                }, randDelay);
            }());
            
            // Add a few initial logs immediately
            for(let i=0; i<5; i++) addLog();
        </script>
    </body>
    </html>
    `;

    res.status(200).send(htmlContent);
});
// app.get("/", (req: Request, res: Response) => {
//     res.status(200).json({
//         message: "Welcome to Texas Precision Website API"
//     })
// })


app.use(globalErrorHandler)

app.use(notFound)

export default app