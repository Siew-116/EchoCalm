# EchoCalm – AI Therapist Chat Website App
This project is a web-based mental health tool inspired by Avatar Therapy (proposed by Prof. Julian Leff), where creates a visual and auditory representation of the voices they hear, and over time, the tone shifts to become more supportive. Our project adapts this idea into a self-guided, AI-powered platform using real-time chat and voice synthesis.

## Tech Stack
- **Frontend:** React (JSX + CSS)
- **Backend:** Drogon C++ Framework
- **Database:** Local file-based storage (JSON)
- **Real-time Communication:** WebSocket
- **AI Integration:** OpenRouter’s hosted LLM API (meta-llama/llama-4-maverick model)

## Features
- User profile system
- Avatar-based chat interface
- Mood & reflection journaling after sessions
- Auto-generated session summary with export to PDF
- Help/Guide page for onboarding

## HOW TO USE
### 1. Backend (Drogon C++)
> **Requirements:**  
> - C++17 or higher  
> - Drogon framework  
> - [CMake](https://cmake.org/) ≥ 3.14
> - [vcpkg](https://github.com/microsoft/vcpkg)
> - OpenRouter API key  

### Clone repo
```bash
git clone https://github.com/Siew-116/EchoCalm
cd echocalm-backend
```

### Set API key
Get your own [OpenRouter API key](https://openrouter.ai/):

For **Windows** :
```powershell
$env:OPENROUTER_API_KEY="your_key_here"
```
For **macOS/Linux**:
```bash
export OPENROUTER_API_KEY=your_key_here
```
*Don’t share or commit your API key. Keep it private and store it securely.*

### Install Drogon via vcpkg (if not already):
```bash
git clone https://github.com/microsoft/vcpkg.git
cd vcpkg
./bootstrap-vcpkg.sh  # or .\bootstrap-vcpkg.bat on Windows
./vcpkg install drogon jsoncpp openssl
```

### Build the backend
```bash
cd ../../echocalm-backend
mkdir build
cd build
cmake .. -DCMAKE_TOOLCHAIN_FILE=../../vcpkg/scripts/buildsystems/vcpkg.cmake
cmake --build . --config Release
```

### Run the backend
```bash
cd Release
./echocalm-backend # or .\echocalm-backend.exe on Windows
```

### 2. Frontend
```bash
cd echocalm-frontend
npm install
npm run dev
```

##  Acknowledgements
- Inspired by Avatar Therapy (Prof. Julian Leff)
- Built using OpenRouter’s `llama-4-maverick`
- Powered by Drogon, React, WebSocket, and modern C++

## License
This project is for educational/demo use only. Please contact the authors if you'd like to reuse or extend it. 
