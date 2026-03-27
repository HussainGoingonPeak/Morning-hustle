// ai-features.js

// --- IMPORTANT SECURITY NOTICE ---
// The API keys below are placeholders that will be replaced by the build process.
// DO NOT hardcode your secret keys here.
// Instead, create a .env file and the build script will handle the rest.
const OPENROUTER_API_KEY = 'YOUR_OPENROUTER_API_KEY';
const BYTEZ_PRODIA_API_KEY = 'YOUR_BYTEZ_PRODIA_API_KEY';

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const aiForm = document.getElementById('ai-form');
    const aiPrompt = document.getElementById('ai-prompt');
    const responseBox = document.getElementById('response-box');
    const chatModeBtn = document.getElementById('chat-mode-btn');
    const imageModeBtn = document.getElementById('image-mode-btn');

    let activeMode = 'chat'; // 'chat' or 'image'

    // --- Mode Switching Logic ---
    function setMode(newMode) {
        activeMode = newMode;
        if (newMode === 'chat') {
            chatModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
            chatModeBtn.classList.add('bg-gray-800', 'text-white');
            imageModeBtn.classList.remove('bg-gray-800', 'text-white');
            imageModeBtn.classList.add('bg-gray-200', 'text-gray-700');
            aiPrompt.placeholder = 'Ask the assistant anything...';
            responseBox.innerHTML = '<p class="text-gray-500 text-center">Chat responses will appear here.</p>';
        } else { // image mode
            imageModeBtn.classList.remove('bg-gray-200', 'text-gray-700');
            imageModeBtn.classList.add('bg-gray-800', 'text-white');
            chatModeBtn.classList.remove('bg-gray-800', 'text-white');
            chatModeBtn.classList.add('bg-gray-200', 'text-gray-700');
            aiPrompt.placeholder = 'Describe the image you want to create...';
            responseBox.innerHTML = '<p class="text-gray-500 text-center">Generated images will appear here.</p>';
        }
    }

    chatModeBtn.addEventListener('click', () => setMode('chat'));
    imageModeBtn.addEventListener('click', () => setMode('image'));

    // --- Form Submission Logic ---
    aiForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const prompt = aiPrompt.value.trim();
        if (!prompt) return;

        if (activeMode === 'chat') {
            handleChat(prompt);
        } else {
            handleImageGeneration(prompt);
        }
        aiPrompt.value = '';
    });

    // --- Chat Handling (OpenRouter) ---
    async function handleChat(prompt) {
        if(responseBox.querySelector('p.text-gray-500')) {
            responseBox.innerHTML = '';
        }

        appendMessage(prompt, 'user');
        showLoader();

        if (!OPENROUTER_API_KEY || OPENROUTER_API_KEY === 'YOUR_OPENROUTER_API_KEY') {
            hideLoader();
            appendMessage("The OpenRouter API key is not configured. Please add it to ai-features.js.", 'ai');
            return;
        }

        try {
            const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    "model": "minimax/minimax-m2:free",
                    "messages": [{ "role": "user", "content": prompt }]
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error.message || `HTTP Error: ${response.status}`);
            }

            const data = await response.json();
            const aiText = data.choices[0].message.content;
            hideLoader();
            appendMessage(aiText, 'ai');

        } catch (error) {
            console.error("OpenRouter API Error:", error);
            hideLoader();
            appendMessage(`Sorry, there was an error: ${error.message}`, 'ai');
        }
    }

    // --- Image Generation Handling (Bytez/Prodia) ---
    async function handleImageGeneration(prompt) {
        responseBox.innerHTML = '';
        showLoader('Generating image...');

        if (!BYTEZ_PRODIA_API_KEY || BYTEZ_PRODIA_API_KEY === 'YOUR_BYTEZ_PRODIA_API_KEY') {
            hideLoader();
            responseBox.innerHTML = `<p class="text-red-500 text-center">The Bytez/Prodia API key is not configured. Please add it to ai-features.js.</p>`;
            return;
        }

        try {
            const createJobResponse = await fetch("https://api.prodia.com/v1/sdxl/generate", {
                method: "POST",
                headers: {
                    "X-Prodia-Key": BYTEZ_PRODIA_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "prompt": prompt, "model": "sd_xl_base_1.0.safensors [be9edd61]" })
            });

            if (!createJobResponse.ok) throw new Error(`API error: ${createJobResponse.statusText}`);

            const job = await createJobResponse.json();
            pollForImageResult(job.job);

        } catch (error) {
            console.error("Image Generation Error:", error);
            hideLoader();
            responseBox.innerHTML = `<p class="text-red-500 text-center">Error: ${error.message}</p>`;
        }
    }

    function pollForImageResult(jobId) {
        const interval = setInterval(async () => {
            try {
                const getJobResponse = await fetch(`https://api.prodia.com/v1/job/${jobId}`, {
                    method: "GET",
                    headers: { "X-Prodia-Key": BYTEZ_PRODIA_API_KEY }
                });

                if (!getJobResponse.ok) {
                    clearInterval(interval);
                    throw new Error(`API error checking job status: ${getJobResponse.statusText}`);
                }

                const jobResult = await getJobResponse.json();

                if (jobResult.status === 'succeeded') {
                    clearInterval(interval);
                    hideLoader();
                    displayImage(jobResult.imageUrl, jobResult.prompt);
                } else if (jobResult.status === 'failed') {
                    clearInterval(interval);
                    hideLoader();
                    responseBox.innerHTML = `<p class="text-red-500 text-center">Image generation failed. Please try again.</p>`;
                }
            } catch (error) {
                clearInterval(interval);
                console.error("Polling Error:", error);
                hideLoader();
                responseBox.innerHTML = `<p class="text-red-500 text-center">Error checking image status: ${error.message}</p>`;
            }
        }, 2500);
    }

    function displayImage(imageUrl, prompt) {
        responseBox.innerHTML = `
            <div class="relative group">
                <img src="${imageUrl}" alt="${prompt}" class="rounded-lg w-full">
                <div class="absolute inset-0 bg-black/60 flex items-center justify-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <a href="${imageUrl}" download="ai-image.png" class="text-white bg-gray-800/80 hover:bg-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                        <i data-lucide="download" class="w-5 h-5"></i> Download
                    </a>
                    <button data-url="${imageUrl}" class="upscale-btn text-white bg-gray-800/80 hover:bg-gray-800 font-semibold py-2 px-4 rounded-lg flex items-center gap-2">
                        <i data-lucide="sparkles" class="w-5 h-5"></i> Upscale
                    </button>
                </div>
            </div>
        `;
        lucide.createIcons();
    }

    // --- Upscale Handling ---
    responseBox.addEventListener('click', (e) => {
        const upscaleBtn = e.target.closest('.upscale-btn');
        if (upscaleBtn) {
            const imageUrl = upscaleBtn.dataset.url;
            handleUpscale(imageUrl, upscaleBtn);
        }
    });

    async function handleUpscale(imageUrl, btnElement) {
        const imageContainer = btnElement.closest('.relative.group');
        if (!imageContainer) return;

        const overlay = imageContainer.querySelector('.absolute.inset-0');
        if (!overlay) return;

        // Show a spinner inside the overlay
        overlay.classList.remove('opacity-0', 'group-hover:opacity-100');
        overlay.innerHTML = `
            <div data-testid="upscale-spinner" class="flex items-center justify-center h-full">
                <i data-lucide="loader-2" class="w-12 h-12 text-white animate-spin"></i>
            </div>`;
        lucide.createIcons();

        try {
            if (!BYTEZ_PRODIA_API_KEY || BYTEZ_PRODIA_API_KEY === 'YOUR_BYTEZ_PRODIA_API_KEY') {
              throw new Error("The Bytez/Prodia API key is not configured.");
            }

            const response = await fetch("https://api.prodia.com/v1/upscale", {
                method: "POST",
                headers: {
                    "X-Prodia-Key": BYTEZ_PRODIA_API_KEY,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ "imageUrl": imageUrl })
            });

            if (!response.ok) throw new Error(`API error: ${response.statusText}`);

            const job = await response.json();
            pollForImageResult(job.job); // This will replace the whole response box on success

        } catch (error) {
            console.error("Upscale Error:", error);
            // Replace spinner with an error message inside the overlay
            overlay.innerHTML = `
                <div data-testid="upscale-error" class="flex items-center justify-center h-full p-4">
                    <p class="text-red-400 font-semibold text-center">Upscale failed: ${error.message}</p>
                </div>`;
        }
    }

    // --- UI Helper Functions ---
    function appendMessage(content, sender) {
        const messageWrapper = document.createElement('div');
        if (sender === 'user') {
            messageWrapper.className = 'flex justify-end mb-4';
            messageWrapper.innerHTML = `<div class="bg-gray-800 text-white p-3 rounded-l-lg rounded-br-lg max-w-md"><p>${content}</p></div>`;
        } else {
            messageWrapper.className = 'flex justify-start mb-4';
            messageWrapper.innerHTML = `
                <div class="flex items-start gap-2.5">
                    <img src="assets/logo.jpg" alt="MH Digital Assistant Avatar" class="w-8 h-8 rounded-full">
                    <div class="bg-gray-100 text-gray-700 p-3 rounded-r-lg rounded-bl-lg max-w-md"><p>${content}</p></div>
                </div>
            `;
        }
        responseBox.appendChild(messageWrapper);
        responseBox.scrollTop = responseBox.scrollHeight;
    }

    function showLoader(text = 'Thinking...') {
        let loader = responseBox.querySelector('.loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.className = 'loader flex justify-start mb-4';
            loader.innerHTML = `
                <div class="flex items-center gap-2.5">
                    <img src="assets/logo.jpg" alt="MH Digital Assistant Avatar" class="w-8 h-8 rounded-full">
                    <div class="bg-gray-100 text-gray-700 p-3 rounded-r-lg rounded-bl-lg">
                        <span class="loader-text">${text}</span>
                        <span class="inline-block animate-bounce ml-1">.</span>
                        <span class="inline-block animate-bounce ml-1" style="animation-delay: 0.1s">.</span>
                        <span class="inline-block animate-bounce ml-1" style="animation-delay: 0.2s">.</span>
                    </div>
                </div>
            `;
            responseBox.appendChild(loader);
        }
        loader.querySelector('.loader-text').textContent = text;
        responseBox.scrollTop = responseBox.scrollHeight;
    }

    function hideLoader() {
        const loader = responseBox.querySelector('.loader');
        if (loader) {
            loader.remove();
        }
    }

    // Set initial mode on page load
    setMode('chat');
});
