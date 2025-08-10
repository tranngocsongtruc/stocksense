
# StockSense - AI-Powered Accessible Stock Analysis Platform

[![Live Demo](https://img.shields.io/badge/Live-Demo-blue?style=for-the-badge)](https://same-u2jers5nya2-latest.netlify.app)
[![React](https://img.shields.io/badge/React-18.2.0-blue?style=for-the-badge&logo=react)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)

> An AI copilot that adapts to your investment knowledge and accessibility needs, making financial markets inclusive for everyone.

## **Project Overview**

StockSense is an innovative stock analysis platform that combines artificial intelligence, real-time financial data, and comprehensive accessibility features. The platform automatically adapts its complexity based on user expertise (beginner/intermediate/advanced) while providing ADHD-friendly customization and full keyboard navigation support.

### **Key Features**
- 🧠 **Adaptive AI Interface** - Automatically adjusts complexity based on user skill level
- 📊 **Real-Time Financial Data** - Live integration with Finnhub, IEX Cloud, and NewsAPI
- ♿ **Complete Accessibility** - WCAG 2.1 AA compliant with keyboard navigation
- 🧘 **ADHD-Friendly Design** - Focus timers, customizable layouts, distraction reduction
- 🎨 **Professional UI** - Multiple themes with responsive design
- 🏭 **Industry Filtering** - 10-sector color-coded filtering system

---

## **Tech Stack & Requirements**

### **Frontend Framework**
- **React**: 18.2.0
- **TypeScript**: 5.0+
- **Vite**: 4.4.0 (Build tool)

### **Styling & UI**
- **Tailwind CSS**: 3.3.0
- **shadcn/ui**: Latest
- **Lucide React**: 0.263.1 (Icons)

### **Development Tools**
- **Node.js**: 18.0+ (Required)
- **Bun**: 1.0+ (Recommended) or npm/yarn
- **ESLint**: 8.0+
- **TypeScript**: 5.0+

### **APIs & External Services**
- **Finnhub API** - Insider trading and financial data
- **IEX Cloud** - Real-time stock quotes
- **NewsAPI** - Market news and analysis

---

## **Getting Started**

### **Prerequisites**
Make sure you have the following installed:
- Node.js 18.0 or higher
- Git
- A modern web browser

### **Installation**

1. **Clone the repository**
   ```bash
   git clone https://github.com/tranngocsongtruc/stocksense.git
   cd stocksense
---
2. **Install dependencies**
    ```bash
    # Using Bun (recommended)
    curl -fsSL https://bun.sh/install | bash 
    bun install 
    # Or using npm 
    npm install 
    # Or using yarn 
    yarn install 
---
3. **Start the development server**
   ```bash
    # Using Bun 
    bun run dev
    # Using npm
    npm run dev
    # Using yarn
    yarn dev
---
4. **Open your browser** 
   Navigate to http://localhost:5173 to see the application running.
- **Available Scripts**
    ```bash
    # Start development server 
    bun run dev
    # Build for production 
    bun run build
    # Preview production build 
    bun run preview
    # Run ESLint 
    bun run lint         
---
### **Environment Setup (Optional)** 

For production use with real API keys, create a `.env.local` file:
    
    VITE_FINNHUB_API_KEY=your_finnhub_key_here 
    VITE_IEX_API_KEY=your_iex_cloud_key_here 
    VITE_NEWS_API_KEY=your_newsapi_key_here 
    
Note:
- I might have also used DuckDuckGo free API key for the search engine
- The application works with demo data if no API keys are provided.
---
### **Browser Compatibility**
- Chrome 90+ 
- Firefox 88+ 
- Safari 14+ 
- Edge 90+ 
- Mobile browsers (iOS Safari, Chrome Mobile) 
---
### **Project Structure**

    src/ 
    ├── components/          # React components 
    │   ├── ui/             # shadcn/ui components 
    │   └── *.tsx           # Feature components 
    ├── hooks/              # Custom React hooks 
    ├── services/           # API integration services 
    ├── data/              # Mock data and constants 
    ├── contexts/          # React context providers 
    └── types/             # TypeScript type definitions 

---
## Contributing & Development
This project was created during a hackathon with AI assistance. I'm continuing development to:

1. Enhance the AI agent with machine learning capabilities
2. Add portfolio tracking and paper trading features
3. Implement advanced charting and technical analysis
4. Develop mobile applications
5. Add social features for investment discussions

## Learning Journey
I acknowledge that this codebase was generated with AI assistance during the hackathon. However, this experience has taught me valuable concepts about:
1. React hooks and state management
2. API integration patterns
3. Accessibility implementation
4. TypeScript development
5. Modern frontend architecture
I'm committed to understanding every aspect of this codebase and continuing development independently.

## License
This project is open source and available under the MIT License.

## Acknowledgments
Same.new - For providing excellent development tools and AI assistance
Hackathon organizers - For the opportunity to build and present
shadcn/ui - For the beautiful component library
Finnhub, IEX Cloud, NewsAPI - For financial data APIs

## **Current AI Agent Capabilities**
The AI agent in StockSense currently implements:
User Behavior Analysis
* Search Pattern Recognition - Analyzes query complexity and financial terminology usage
* Interaction Complexity Scoring - Monitors feature engagement depth and frequency
* Progressive Learning Detection - Identifies when users are ready for advanced features
Adaptive Interface Logic
* Three-Tier Complexity System:
    * Beginner: Simple explanations, basic metrics, educational tooltips
    * Intermediate: Balanced analysis, sector filtering, moderate complexity
    * Advanced: Full technical indicators, insider trading analysis, complex metrics
Real-Time Adaptation
* Dynamic Content Adjustment - Interface complexity changes based on user behavior
* Contextual Help System - Provides appropriate guidance for current skill level
* Feature Progressive Disclosure - Advanced tools appear as users demonstrate readiness
Agent States
* Observing - Monitoring user interactions and market conditions
* Thinking - Processing user patterns and market correlations
* Acting - Providing recommendations and interface adaptations
Note: This is a basic rule-based AI system built during a hackathon. Future development will incorporate more sophisticated machine learning capabilities.

Project Link: https://github.com/tranngocsongtruc/stocksense
Live Demo: (still deciding on domain and host)
