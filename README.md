# 🚀 The Bid Executor: AI-Powered RFP Response Engine

**The Bid Executor** is a next-generation B2B sales automation platform designed specifically for the **Wires & Cables industry**. It leverages multi-agent AI to autonomously analyze Request for Proposals (RFPs), detect technical mismatches, calculate commercial risks, and generate "Made-to-Order" (MTO) engineering requests in real-time.

<img width="1919" height="949" alt="image" src="https://github.com/user-attachments/assets/9a1c7fda-3819-4916-b3f6-8cdbd9e91310" />

## ✨ Key Features

### 🤖 Multi-Agent Simulation
- **Sales Agent:** Ingests RFP documents, summarizes key requirements, and detects commercial terms (e.g., Payment Terms, Liquidated Damages).
- **Summary Agent:** Digest the full documentation and generate a precise "Mission Brief" of the project scope and timelines.
- **Technical Agent:** Performs deep-dive spec comparison (e.g., Voltage, Conductor Material) and calculates a **Spec Match %** (e.g., "67% Match").
- **Pricing Agent:** Auto-calculates base costs, adds MTO premiums, and estimates testing/compliance fees in **INR (₹)**.

### 📊 Dynamic Risk Heatmap
- Visualizes commercial and legal risks with a calculated **Risk Score** (0-100).
- Categorizes risks by severity (Critical, High, Medium) with color-coded indicators.
- **Voice Alerts:** Cockpit-style audio feedback announces critical risks and compliance failures.

### 🛠️ MTO Auto-Drafter
- Automatically detects when a standard SKU doesn't meet RFP specs (e.g., 800V vs 1100V).
- Generates an **Engineering Request** card with modification details, cost impact, and lead time adjustments.

### 📈 Smart Metrics
- **Spec Match Metric:** Displays precise compliance percentages for recommended products.
- **Top 3 Recommendations:** Suggests the best-fit products with their respective match scores and pricing.

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS, Lucide React
- **AI/Simulation:** Custom Multi-Agent State Machine
- **Deployment:** Dockerized (Multi-stage build)

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Docker (optional, for containerized deployment)

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/rfp-automation-engine.git
    cd rfp-automation-engine
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the development server:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) in your browser.

### 🐳 Docker Deployment

1.  **Build the image:**
    ```bash
    docker build -t rfp-engine .
    ```

2.  **Run the container:**
    ```bash
    docker run -p 3000:3000 rfp-engine
    ```

## 🎯 Hackathon Highlights

- **Real-time Simulation:** Watch agents "think" and collaborate in the UI.
- **Voice Feedback:** Immersive audio experience for critical alerts.
- **Precision:** Handles complex technical specs (Voltage, Insulation, Armor) with high accuracy.

---

Built with ❤️ for the Future of B2B Sales.
