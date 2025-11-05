/**
 * AI Chat Widget - Embeddable chat assistant for Harsha's portfolio
 * This script creates a floating chat widget that can be embedded in any webpage
 */

class AIAssistant {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right',
            primaryColor: '#3b82f6',
            apiKey: options.apiKey || null,
            useOpenAI: options.useOpenAI || false,
            ...options
        };

        this.isOpen = false;
        this.conversationHistory = [];
        this.knowledgeBase = this.initializeKnowledgeBase();

        this.init();
    }

    init() {
        this.createStyles();
        this.createWidget();
        this.attachEventListeners();
    }

    createStyles() {
        const styles = `
            .ai-chat-widget {
                position: fixed;
                bottom: 20px;
                right: 20px;
                z-index: 10000;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            }

            .ai-chat-toggle {
                width: 60px;
                height: 60px;
                border-radius: 50%;
                background: linear-gradient(135deg, ${this.options.primaryColor}, #8b5cf6);
                border: none;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(59, 130, 246, 0.4);
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                color: white;
                font-size: 24px;
            }

            .ai-chat-toggle:hover {
                transform: scale(1.05);
                box-shadow: 0 6px 30px rgba(59, 130, 246, 0.6);
            }

            .ai-chat-window {
                position: absolute;
                bottom: 80px;
                right: 0;
                width: 350px;
                height: 500px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
                display: none;
                flex-direction: column;
                overflow: hidden;
                border: 1px solid #e2e8f0;
            }

            .ai-chat-window.open {
                display: flex;
                animation: slideUp 0.3s ease;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .ai-chat-header {
                background: linear-gradient(135deg, ${this.options.primaryColor}, #8b5cf6);
                color: white;
                padding: 16px;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ai-chat-title {
                font-weight: 600;
                font-size: 16px;
            }

            .ai-chat-close {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                width: 30px;
                height: 30px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
            }

            .ai-chat-close:hover {
                background: rgba(255, 255, 255, 0.2);
            }

            .ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 16px;
                background: #f8fafc;
            }

            .ai-message {
                margin-bottom: 12px;
                display: flex;
                align-items: flex-start;
                gap: 8px;
            }

            .ai-message.user {
                justify-content: flex-end;
            }

            .ai-message.user .ai-message-content {
                background: ${this.options.primaryColor};
                color: white;
                margin-left: auto;
            }

            .ai-message.assistant .ai-message-content {
                background: white;
                color: #334155;
                border: 1px solid #e2e8f0;
            }

            .ai-message-content {
                padding: 10px 14px;
                border-radius: 12px;
                max-width: 80%;
                word-wrap: break-word;
                font-size: 14px;
                line-height: 1.4;
            }

            .ai-message-avatar {
                width: 24px;
                height: 24px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 10px;
                font-weight: bold;
                flex-shrink: 0;
            }

            .ai-message-avatar.user {
                background: ${this.options.primaryColor};
                color: white;
            }

            .ai-message-avatar.assistant {
                background: linear-gradient(135deg, #10b981, #059669);
                color: white;
            }

            .ai-chat-input-area {
                padding: 16px;
                border-top: 1px solid #e2e8f0;
                background: white;
            }

            .ai-quick-questions {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 12px;
            }

            .ai-quick-question {
                padding: 4px 8px;
                background: #f1f5f9;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                font-size: 11px;
                color: #64748b;
                cursor: pointer;
                transition: all 0.2s;
            }

            .ai-quick-question:hover {
                background: ${this.options.primaryColor};
                color: white;
                border-color: ${this.options.primaryColor};
            }

            .ai-chat-input-container {
                display: flex;
                gap: 8px;
                align-items: center;
            }

            .ai-chat-input {
                flex: 1;
                padding: 8px 12px;
                border: 1px solid #d1d5db;
                border-radius: 20px;
                outline: none;
                font-size: 14px;
                transition: border-color 0.2s;
            }

            .ai-chat-input:focus {
                border-color: ${this.options.primaryColor};
            }

            .ai-chat-send {
                width: 36px;
                height: 36px;
                border: none;
                background: ${this.options.primaryColor};
                color: white;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: background 0.2s;
                font-size: 16px;
            }

            .ai-chat-send:hover:not(:disabled) {
                background: #2563eb;
            }

            .ai-chat-send:disabled {
                background: #9ca3af;
                cursor: not-allowed;
            }

            .ai-typing-indicator {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 8px 12px;
                background: white;
                border: 1px solid #e2e8f0;
                border-radius: 12px;
                max-width: fit-content;
            }

            .ai-typing-dots {
                display: flex;
                gap: 2px;
            }

            .ai-typing-dot {
                width: 4px;
                height: 4px;
                border-radius: 50%;
                background: #64748b;
                animation: typing 1.4s infinite;
            }

            .ai-typing-dot:nth-child(2) {
                animation-delay: 0.2s;
            }

            .ai-typing-dot:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% {
                    transform: translateY(0);
                    opacity: 0.4;
                }
                30% {
                    transform: translateY(-6px);
                    opacity: 1;
                }
            }

            @media (max-width: 768px) {
                .ai-chat-window {
                    width: 300px;
                    height: 450px;
                    bottom: 70px;
                    right: 10px;
                }

                .ai-chat-widget {
                    bottom: 15px;
                    right: 15px;
                }

                .ai-chat-toggle {
                    width: 50px;
                    height: 50px;
                    font-size: 20px;
                }
            }
        `;

        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    createWidget() {
        const widget = document.createElement('div');
        widget.className = 'ai-chat-widget';
        widget.innerHTML = `
            <button class="ai-chat-toggle" title="Chat with AI Harsha">
                🤖
            </button>
            <div class="ai-chat-window">
                <div class="ai-chat-header">
                    <div class="ai-chat-title">💬 Chat with Digital Harsha</div>
                    <button class="ai-chat-close">×</button>
                </div>
                <div class="ai-chat-messages" id="aiChatMessages">
                    <div class="ai-message assistant">
                        <div class="ai-message-avatar assistant">H</div>
                        <div class="ai-message-content">
                            Hi! I'm a digital version of Harsha. Ask me about his projects, skills, experience, or anything else you'd like to know! 👋
                        </div>
                    </div>
                </div>
                <div class="ai-chat-input-area">
                    <div class="ai-quick-questions">
                        <div class="ai-quick-question" data-question="Tell me about your AI projects">AI Projects</div>
                        <div class="ai-quick-question" data-question="What are your technical skills?">Skills</div>
                        <div class="ai-quick-question" data-question="Tell me about your experience">Experience</div>
                        <div class="ai-quick-question" data-question="What motivates you?">Motivation</div>
                    </div>
                    <div class="ai-chat-input-container">
                        <input type="text" class="ai-chat-input" placeholder="Ask me anything..." />
                        <button class="ai-chat-send">📤</button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(widget);
        this.widget = widget;
    }

    attachEventListeners() {
        const toggle = this.widget.querySelector('.ai-chat-toggle');
        const close = this.widget.querySelector('.ai-chat-close');
        const input = this.widget.querySelector('.ai-chat-input');
        const send = this.widget.querySelector('.ai-chat-send');
        const quickQuestions = this.widget.querySelectorAll('.ai-quick-question');

        toggle.addEventListener('click', () => this.toggleChat());
        close.addEventListener('click', () => this.closeChat());
        send.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });

        quickQuestions.forEach(button => {
            button.addEventListener('click', () => {
                const question = button.getAttribute('data-question');
                input.value = question;
                this.sendMessage();
            });
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const chatWindow = this.widget.querySelector('.ai-chat-window');

        if (this.isOpen) {
            chatWindow.classList.add('open');
            this.widget.querySelector('.ai-chat-input').focus();
        } else {
            chatWindow.classList.remove('open');
        }
    }

    closeChat() {
        this.isOpen = false;
        this.widget.querySelector('.ai-chat-window').classList.remove('open');
    }

    async sendMessage() {
        const input = this.widget.querySelector('.ai-chat-input');
        const send = this.widget.querySelector('.ai-chat-send');
        const message = input.value.trim();

        if (!message) return;

        this.addMessage(message, true);
        input.value = '';
        send.disabled = true;

        this.showTypingIndicator();

        try {
            // Simulate thinking time
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

            let response;
            if (this.options.useOpenAI && this.options.apiKey) {
                response = await this.getOpenAIResponse(message);
            } else {
                response = this.generateLocalResponse(message);
            }

            this.hideTypingIndicator();
            this.addMessage(response);

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage("I'm having trouble processing your request. Please try asking about Harsha's projects, skills, or experience!");
        } finally {
            send.disabled = false;
            input.focus();
        }
    }

    addMessage(content, isUser = false) {
        const messagesContainer = this.widget.querySelector('.ai-chat-messages');
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ${isUser ? 'user' : 'assistant'}`;

        messageDiv.innerHTML = `
            <div class="ai-message-avatar ${isUser ? 'user' : 'assistant'}">${isUser ? 'U' : 'H'}</div>
            <div class="ai-message-content">${content}</div>
        `;

        messagesContainer.appendChild(messageDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    showTypingIndicator() {
        const messagesContainer = this.widget.querySelector('.ai-chat-messages');
        const typingDiv = document.createElement('div');
        typingDiv.className = 'ai-message assistant';
        typingDiv.id = 'ai-typing-indicator';

        typingDiv.innerHTML = `
            <div class="ai-message-avatar assistant">H</div>
            <div class="ai-typing-indicator">
                <div class="ai-typing-dots">
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                    <div class="ai-typing-dot"></div>
                </div>
                <span style="color: #64748b; font-size: 12px;">Thinking...</span>
            </div>
        `;

        messagesContainer.appendChild(typingDiv);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }

    hideTypingIndicator() {
        const typingElement = this.widget.querySelector('#ai-typing-indicator');
        if (typingElement) {
            typingElement.remove();
        }
    }

    async getOpenAIResponse(message) {
        const systemPrompt = `You are a digital version of Harsha Kanaparthi, a Computer Science graduate student specializing in AI/ML and cloud computing.

Key facts about you:
- Currently pursuing MS in Computer Science at UNC Charlotte (4.0 GPA)
- Strong background in AI/ML, cloud computing (AWS, Azure), and full-stack development
- Published research in IEEE conferences on CNN-based applications
- Achieved 99.41% accuracy in facial recognition systems
- Experience with TensorFlow, PyTorch, React, Node.js, Python, Java, Go
- Passionate about solving real-world problems with AI
- Professional but enthusiastic communication style
- Use specific metrics and achievements when relevant

Respond as Harsha would, with technical precision, enthusiasm for AI/cloud tech, and personal insights from his experience.`;

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${this.options.apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    { role: 'system', content: systemPrompt },
                    ...this.conversationHistory,
                    { role: 'user', content: message }
                ],
                max_tokens: 300,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            throw new Error('OpenAI API error');
        }

        const data = await response.json();
        const reply = data.choices[0].message.content;

        this.conversationHistory.push(
            { role: 'user', content: message },
            { role: 'assistant', content: reply }
        );

        return reply;
    }

    generateLocalResponse(message) {
        // Use the same local response generation logic from the standalone version
        const msg = message.toLowerCase();

        if (msg.includes('hello') || msg.includes('hi') || msg.includes('hey')) {
            return "Hello! Great to meet you. I'm excited to share my journey in AI and technology. What would you like to know?";
        }

        if (msg.includes('project')) {
            return "I've worked on some exciting projects! My recent GoWeather app uses Go and MySQL for smart weather tracking. I also reproduced the Bailando CVPR paper for 3D dance generation, and built a Missing Child Classification System with 99.41% accuracy. Which interests you most?";
        }

        if (msg.includes('skill') || msg.includes('technology')) {
            return "My technical skills span AI/ML (TensorFlow, PyTorch), cloud platforms (AWS, Azure), and full-stack development (React, Node.js, Python, Go). I'm particularly strong in computer vision and have published research on CNN-based applications. I love combining cutting-edge AI with practical cloud solutions!";
        }

        if (msg.includes('experience')) {
            return "I have diverse experience including an AI internship where I built facial recognition systems (99.41% accuracy), RPA & Cloud Computing work with AWS services, and leadership roles organizing events for 100+ students. Currently pursuing my MS at UNC Charlotte with a 4.0 GPA!";
        }

        if (msg.includes('motivation') || msg.includes('why') || msg.includes('passionate')) {
            return "I'm passionate about using AI to solve real-world problems! Whether it's helping find missing children through facial recognition or revolutionizing road safety with traffic sign detection, I love building technology that makes a positive impact. The intersection of AI and cloud computing opens up amazing possibilities!";
        }

        return "That's a great question! I have extensive experience in AI/ML, cloud computing, and software development. Feel free to ask me about my projects (like GoWeather or Bailando), technical skills, research publications, or career journey. What specifically interests you?";
    }

    initializeKnowledgeBase() {
        // Simplified knowledge base for the widget version
        return {
            projects: [
                "GoWeather - Smart weather app with Go, MySQL, and real-time updates",
                "Bailando - 3D dance generation from music using AI (CVPR 2022 reproduction)",
                "Missing Child Classification - 99.41% accuracy facial recognition system",
                "QR Attendance System - Location-validated attendance tracking",
                "SPL - Parse Tree Diagram's"
            ],
            skills: [
                "AI/ML: TensorFlow, PyTorch, Computer Vision, CNNs",
                "Cloud: AWS (EC2, S3, Lambda), Azure (certified)",
                "Web: React, Node.js, Flask, Django, Go",
                "Languages: Python, JavaScript, Java, Go, C++"
            ],
            achievements: [
                "99.41% accuracy in facial recognition systems",
                "Published 2 IEEE research papers",
                "4.0 GPA in MS Computer Science at UNC Charlotte",
                "Azure Developer Associate certified"
            ]
        };
    }
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
    window.AIAssistant = AIAssistant;

    // Auto-initialize with default settings if data-auto-init is present
    document.addEventListener('DOMContentLoaded', () => {
        const script = document.querySelector('script[data-auto-init]');
        if (script) {
            new AIAssistant({
                apiKey: script.getAttribute('data-openai-key') || null,
                useOpenAI: script.hasAttribute('data-use-openai')
            });
        }
    });
}