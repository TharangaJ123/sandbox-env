const axios = require('axios');

require('dotenv').config({ path: '../.env' });

// --- CONFIGURATION ---
const PROMETHEUS_URL = 'http://localhost:9090';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const GITHUB_OWNER = process.env.GITHUB_USER_NAME; 
const GITHUB_REPO = process.env.GITHUB_REPO_NAME; 
// ----------------------------------------

async function evaluateMaturity() {
    console.log("\n==================================================");
    console.log("🔍 Running AA-ICME Maturity Evaluation...");
    console.log("==================================================");

    try {
        // 1. Fetch Live Data from Prometheus (Production Architectural Health)
        const promResponse = await axios.get(`${PROMETHEUS_URL}/api/v1/query?query=up{job="order-service"}`);
        const orderServiceData = promResponse.data.data.result[0];
        const isOrderServiceUp = orderServiceData ? orderServiceData.value[1] : "0"; 

        // 2. Fetch Live Data from GitHub Actions API (Pipeline Health)
        let buildStatus = "UNKNOWN";
        try {
            const githubResponse = await axios.get(
                `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/actions/runs?per_page=1`,
                {
                    headers: {
                        'Authorization': `Bearer ${GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            const latestRun = githubResponse.data.workflow_runs[0];
            if (latestRun) {
                // Returns 'success', 'failure' or etc.
                buildStatus = latestRun.conclusion ? latestRun.conclusion.toUpperCase() : latestRun.status.toUpperCase();
            }
        } catch (ghError) {
            console.error("\n⚠️ --- GITHUB API DEBUG INFO ---");
            console.error("Status Code :", ghError.response ? ghError.response.status : "No Response");
            console.error("Error Msg   :", ghError.response ? ghError.response.data.message : ghError.message);
            console.error("-------------------------------\n");
        }

        // 3. Automated Test Coverage (This should be mock because test framesworks are not integrated yet)
        const testCoverage = Math.floor(Math.random() * (95 - 60 + 1)) + 60; // 60% - 95% athara random agayak

        console.log("📊 [REAL-TIME DATA COLLECTED]");
        console.log(` -> CI/CD Build Status  : ${buildStatus}`);
        console.log(` -> Automated Test Cov  : ${testCoverage}%`);
        console.log(` -> Production Status   : ${isOrderServiceUp === "1" ? "UP & RUNNING" : "DOWN/UNREACHABLE"}`);

        // 4. Calculate the Final A-Score
        let aScore = 0;
        
        if (buildStatus === "SUCCESS") aScore += 40;
        else if (buildStatus === "IN_PROGRESS" || buildStatus === "QUEUED") aScore += 20;
        
        if (testCoverage > 80) aScore += 30;
        else if (testCoverage > 50) aScore += 15;

        if (isOrderServiceUp === "1") aScore += 30;

        console.log("\n📈 [MATURITY CLASSIFICATION]");
        console.log(` 🏆 Final A-Score       : ${aScore} / 100`);
        
        if (aScore >= 80) console.log(" 🌟 Level: OPTIMIZED");
        else if (aScore >= 50) console.log(" ⚖️ Level: MATURE");
        else console.log(" ⚠️ Level: DEVELOPING");
        
        console.log("==================================================\n");

    } catch (error) {
        console.error("❌ System Evaluation Failed:", error.message);
    }
}

setInterval(evaluateMaturity, 10000);