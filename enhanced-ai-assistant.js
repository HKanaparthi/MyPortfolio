/**
 * Enhanced AI Assistant with better pattern matching and contextual understanding
 * This version includes semantic similarity, context awareness, and better fallbacks
 */

class EnhancedAIAssistant {
    constructor(options = {}) {
        this.options = {
            position: 'bottom-right',
            primaryColor: '#3b82f6',
            openaiApiKey: options.openaiApiKey || null,
            useOpenAI: options.useOpenAI || false,
            ...options
        };

        this.isOpen = false;
        this.conversationHistory = [];
        this.userContext = {};

        // Enhanced knowledge base with semantic understanding
        this.knowledgeBase = this.initializeEnhancedKnowledgeBase();
        this.responsePatterns = this.initializeResponsePatterns();

        this.init();
    }

    init() {
        this.createStyles();
        this.createWidget();
        this.attachEventListeners();
    }

    createStyles() {
        // Same styling as before - keeping it consistent
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
                from { opacity: 0; transform: translateY(20px); }
                to { opacity: 1; transform: translateY(0); }
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

            .ai-typing-dot:nth-child(2) { animation-delay: 0.2s; }
            .ai-typing-dot:nth-child(3) { animation-delay: 0.4s; }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
                30% { transform: translateY(-6px); opacity: 1; }
            }

            @media (max-width: 768px) {
                .ai-chat-window {
                    width: 300px;
                    height: 450px;
                    bottom: 70px;
                    right: 10px;
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
                            Hi! I'm Harsha Kanaparthi, a Computer Science graduate student passionate about AI and cloud computing. Ask me anything about my projects, research, or experience! 👋
                        </div>
                    </div>
                </div>
                <div class="ai-chat-input-area">
                    <div class="ai-quick-questions">
                        <div class="ai-quick-question" data-question="What's your name?">Name</div>
                        <div class="ai-quick-question" data-question="Tell me about GoWeather">GoWeather</div>
                        <div class="ai-quick-question" data-question="What are your skills?">Skills</div>
                        <div class="ai-quick-question" data-question="Tell me about your research">Research</div>
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
        this.conversationHistory.push({ role: 'user', content: message });

        input.value = '';
        send.disabled = true;

        this.showTypingIndicator();

        try {
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

            let response;
            if (this.options.useOpenAI && this.options.openaiApiKey) {
                response = await this.getOpenAIResponse(message);
            } else {
                response = this.generateEnhancedResponse(message);
            }

            this.hideTypingIndicator();
            this.addMessage(response);
            this.conversationHistory.push({ role: 'assistant', content: response });

        } catch (error) {
            this.hideTypingIndicator();
            this.addMessage("I apologize, but I'm having trouble processing your request. Could you try rephrasing your question about my projects, skills, or experience?");
        } finally {
            send.disabled = false;
            input.focus();
        }
    }

    // Enhanced response generation with better pattern matching
    generateEnhancedResponse(userMessage) {
        const message = userMessage.toLowerCase();

        // Extract user context
        this.updateUserContext(message);

        // Check for identity questions first
        if (this.isIdentityQuestion(message)) {
            return this.handleIdentityQuestion(message);
        }

        // Check for personal questions
        if (this.isPersonalQuestion(message)) {
            return this.handlePersonalQuestion(message);
        }

        // Handle topic-specific questions with semantic matching
        const topic = this.identifyTopic(message);
        if (topic) {
            return this.handleTopicQuestion(message, topic);
        }

        // Contextual fallback - try to understand what they're looking for
        return this.handleContextualFallback(message);
    }

    isIdentityQuestion(message) {
        const identityKeywords = [
            'name', 'who are you', 'who is', 'introduce', 'yourself',
            'identity', 'are you harsha', 'harsha'
        ];
        return identityKeywords.some(keyword => message.includes(keyword));
    }

    handleIdentityQuestion(message) {
        const responses = [
            "I'm Harsha Kanaparthi! I'm a Computer Science graduate student at UNC Charlotte with a 4.0 GPA, passionate about AI/ML and cloud computing. I love building intelligent systems that solve real-world problems!",
            "Hi, I'm Harsha! I'm currently pursuing my Master's in Computer Science at UNC Charlotte while working on exciting AI projects. I've achieved 99.41% accuracy in facial recognition systems and published research in IEEE conferences.",
            "I'm Harsha Kanaparthi, an AI enthusiast and full-stack developer. I specialize in machine learning, cloud computing, and building applications that make a difference - like my facial recognition system for missing children."
        ];
        return this.getRandomResponse(responses);
    }

    isPersonalQuestion(message) {
        const personalKeywords = [
            'hobby', 'hobbies', 'gaming', 'games', 'fun', 'free time',
            'outside work', 'personal', 'interests', 'like to do'
        ];
        return personalKeywords.some(keyword => message.includes(keyword));
    }

    handlePersonalQuestion(message) {
        if (message.includes('gaming') || message.includes('games')) {
            return "While I'm passionate about technology, my main focus is on AI research and building impactful applications. I do enjoy exploring how AI can enhance gaming experiences - like the 3D dance generation project I worked on that could be applied to game character animation! My real 'game' is solving complex technical challenges. 🎮";
        }

        if (message.includes('hobby') || message.includes('fun') || message.includes('free time')) {
            return "My passion for technology extends beyond work! I love contributing to open-source projects, reading AI research papers, and experimenting with new frameworks. I also enjoy mentoring students in competitive programming - I've guided 50+ junior students! My idea of fun is diving deep into complex problems like reproducing CVPR research papers. 🚀";
        }

        return "I'm deeply passionate about technology and continuous learning! When I'm not coding, I'm usually reading about the latest AI breakthroughs, contributing to open-source projects, or mentoring students. I find genuine excitement in tackling challenging technical problems and seeing how AI can solve real-world issues.";
    }

    identifyTopic(message) {
        const topics = {
            'projects': ['project', 'built', 'created', 'developed', 'goweather', 'bailando', 'missing child', 'attendance'],
            'skills': ['skill', 'technology', 'programming', 'language', 'framework', 'tool', 'experience with'],
            'education': ['education', 'study', 'university', 'college', 'degree', 'academic', 'gpa', 'unc charlotte'],
            'experience': ['work', 'job', 'internship', 'company', 'professional', 'career', 'role'],
            'research': ['research', 'publication', 'paper', 'ieee', 'published', 'study'],
            'ai_ml': ['ai', 'machine learning', 'ml', 'deep learning', 'neural network', 'cnn', 'tensorflow', 'pytorch'],
            'cloud': ['cloud', 'aws', 'azure', 'ec2', 's3', 'lambda', 'deployment'],
            'motivation': ['motivate', 'inspire', 'passion', 'why', 'goal', 'future', 'drive']
        };

        for (const [topic, keywords] of Object.entries(topics)) {
            if (keywords.some(keyword => message.includes(keyword))) {
                return topic;
            }
        }
        return null;
    }

    handleTopicQuestion(message, topic) {
        const responses = {
            'projects': this.getProjectResponse(message),
            'skills': this.getSkillsResponse(message),
            'education': this.getEducationResponse(message),
            'experience': this.getExperienceResponse(message),
            'research': this.getResearchResponse(message),
            'ai_ml': this.getAIMLResponse(message),
            'cloud': this.getCloudResponse(message),
            'motivation': this.getMotivationResponse(message)
        };

        return responses[topic] || this.handleContextualFallback(message);
    }

    getProjectResponse(message) {
        if (message.includes('goweather')) {
            return "GoWeather is one of my recent projects I'm really proud of! 🌤️ I built it using Go with the Gin framework, MySQL, and OpenWeatherMap APIs. It's a smart weather assistant that provides real-time updates, global forecasts, chat functionality, and intelligent activity suggestions based on weather conditions. The responsive UI makes weather tracking engaging and intuitive!";
        }

        if (message.includes('bailando')) {
            return "Bailando was an incredibly challenging project! 💃 I reproduced a CVPR 2022 paper that generates 3D dance animations from music using GPT-based actor-critic reinforcement learning. It involved complex multi-modal data processing, SMPL pose models, and a sophisticated training pipeline. Seeing AI create dance moves from music was absolutely magical!";
        }

        if (message.includes('missing child') || message.includes('facial recognition')) {
            return "The Missing Child Classification System was developed during my AI internship and achieved 99.41% accuracy! 👶 I used VGG-Face and CNNs to build a deep learning system that can identify missing children from images. It's deployed through a Django web portal with real-time processing. This project combines my passion for AI with meaningful social impact.";
        }

        return "I've worked on some exciting projects! GoWeather is my smart weather assistant built with Go and MySQL. Bailando reproduces cutting-edge 3D dance generation research. My Missing Child Classification System achieved 99.41% accuracy using CNNs. I also built a QR-based Attendance System with location validation. Each project pushed me to learn new technologies and solve real problems!";
    }

    getSkillsResponse(message) {
        if (message.includes('python')) {
            return "Python is my strongest language! I use it extensively for AI/ML work with TensorFlow and PyTorch. I've achieved 99.41% accuracy in computer vision projects and published IEEE research using Python. I'm also comfortable with data processing libraries like NumPy, Pandas, and scikit-learn. Python's versatility makes it perfect for everything from ML research to web development with Django and Flask!";
        }

        if (message.includes('go') || message.includes('golang')) {
            return "Go has become one of my favorite languages recently! I used it to build GoWeather with the Gin framework and MySQL integration. I love Go's simplicity, excellent performance for web services, and built-in concurrency support with goroutines. The fast compilation and single binary deployment make it perfect for cloud-native applications. It's my go-to choice for building efficient backend services!";
        }

        return "My technical skills span multiple domains! I'm strongest in Python for AI/ML (TensorFlow, PyTorch, scikit-learn), proficient in full-stack development (React, Node.js, Django, Flask), and experienced with cloud platforms (AWS, Azure - I'm certified!). I also work with Go, Java, C++, and various databases. My approach combines cutting-edge AI research with practical software engineering skills!";
    }

    getEducationResponse(message) {
        return "My academic journey has been fantastic! 🎓 I'm currently pursuing my Master's in Computer Science at UNC Charlotte with a perfect 4.0 GPA, expected to graduate in May 2026. I completed my Bachelor's at Koneru Lakshmaiah University with a 9.47/10 GPA. During undergrad, I was President of the School of Competitive Coding, organizing events for 100+ students and mentoring 50+ juniors. The rigorous coursework has given me a strong foundation in algorithms, AI theory, and software engineering!";
    }

    getExperienceResponse(message) {
        return "My professional experience has been diverse and impactful! 💼 As an AI Intern at Lineysha & Thevan, I built the facial recognition system achieving 99.41% accuracy. My RPA & Cloud Computing internship with AICTE gave me hands-on AWS experience with EC2, S3, and Lambda. I also led the competitive programming community at my university, organizing hackathons and mentoring students. Each role has strengthened both my technical skills and leadership abilities!";
    }

    getResearchResponse(message) {
        return "I'm proud of my research contributions! 📚 I've published two papers in IEEE conferences: 'Revolutionizing Road Safety: CNN-based Traffic Sign Recognition' (2024) and 'Skin Disease Detection and Recommendation System using Deep Learning and Cloud Computing' (2023). Both focus on applying AI/ML to solve real-world problems in safety and healthcare. The research experience has enhanced my technical writing skills and deepened my understanding of peer review processes!";
    }

    getAIMLResponse(message) {
        return "AI and Machine Learning are my core passions! 🤖 I have deep experience across the entire ML pipeline - from data preprocessing to model deployment. I've achieved 99.41% accuracy in facial recognition using CNNs, worked on cutting-edge research like music-to-3D dance generation, and published IEEE papers on CNN applications. I'm proficient with TensorFlow, PyTorch, OpenCV, and the entire ML ecosystem. What excites me most is using AI to solve meaningful real-world problems!";
    }

    getCloudResponse(message) {
        return "I'm passionate about cloud technologies! ☁️ I have hands-on AWS experience with EC2, S3, and Lambda from my AICTE internship. I'm also Azure certified (AZ-204 Developer Associate and AZ-900 Fundamentals), demonstrating proficiency with Microsoft's platform. I love how cloud computing enables us to build and scale AI solutions efficiently - whether it's deploying ML models, handling large datasets, or creating globally accessible applications!";
    }

    getMotivationResponse(message) {
        return "What truly motivates me is AI's incredible potential to solve problems that seemed impossible! 🚀 When I built the facial recognition system achieving 99.41% accuracy for missing children, I realized how technology can create direct social impact. Whether it's revolutionizing road safety through traffic sign recognition or enabling early disease detection, I'm driven by building technology that helps people. The continuous learning aspect also excites me - every project opens new possibilities in this rapidly evolving field!";
    }

    handleContextualFallback(message) {
        // Analyze what the user might be looking for based on context
        if (this.conversationHistory.length > 2) {
            const recentContext = this.conversationHistory.slice(-3);
            // Try to continue the conversation contextually
            return "That's an interesting question! Based on our conversation, I'd love to tell you more about my work in AI, cloud computing, or software development. What specific aspect would you like to explore - my technical projects, research experience, or career journey?";
        }

        // First interaction fallback
        const fallbacks = [
            "I'd be happy to help! I have extensive experience in AI/ML, cloud computing, and full-stack development. Would you like to know about my projects, technical skills, research publications, or career journey?",
            "Great question! I'm passionate about building intelligent systems that solve real-world problems. Feel free to ask me about my GoWeather project, Bailando research, 99.41% accuracy facial recognition system, or any of my other work!",
            "I'd love to share more about my background! Whether you're interested in my AI projects, cloud computing experience, research publications, or academic achievements, I'm here to help. What catches your interest most?"
        ];

        return this.getRandomResponse(fallbacks);
    }

    updateUserContext(message) {
        // Track user interests for better contextual responses
        if (message.includes('project')) this.userContext.interestedInProjects = true;
        if (message.includes('skill')) this.userContext.interestedInSkills = true;
        if (message.includes('research')) this.userContext.interestedInResearch = true;
    }

    getRandomResponse(responses) {
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // OpenAI integration with enhanced system prompt
    async getOpenAIResponse(message) {
        const systemPrompt = `You are Harsha Kanaparthi, a Computer Science graduate student at UNC Charlotte with a 4.0 GPA, specializing in AI/ML and cloud computing.

Key facts about you:
- Name: Harsha Kanaparthi
- Location: Charlotte, NC
- Currently: MS in Computer Science at UNC Charlotte (4.0 GPA, graduating May 2026)
- Previous: BS in Computer Science from Koneru Lakshmaiah University (9.47/10 GPA)

Professional Experience:
- AI Intern at Lineysha & Thevan (facial recognition system, 99.41% accuracy with CNNs)
- RPA & Cloud Computing Intern at AICTE (AWS experience: EC2, S3, Lambda)
- President/Advisor of School of Competitive Coding (organized events for 100+ students)

Key Projects:
- GoWeather: Smart weather app using Go, Gin framework, MySQL, OpenWeatherMap APIs
- Bailando: Reproduced CVPR 2022 paper for music-to-3D dance generation using GPT-based RL
- Missing Child Classification: 99.41% accuracy facial recognition system with Django deployment
- QR Attendance System: Location-validated attendance tracking

Publications:
- "Revolutionizing Road Safety: CNN-based Traffic Sign Recognition" (IEEE 2024)
- "Skin Disease Detection using Deep Learning and Cloud Computing" (IEEE 2023)

Skills:
- Expert: Python, TensorFlow, PyTorch, JavaScript, React, Node.js
- Proficient: Go, Java, C++, AWS, Azure (certified AZ-204, AZ-900)
- Specialties: Computer Vision, CNNs, Cloud Computing, Full-stack Development

Certifications: TensorFlow Developer Associate (Google), Azure Developer Associate, Azure Fundamentals, Advanced RPA, Oracle Certified Foundations

Communication Style:
- Technical precision with specific metrics (99.41% accuracy, 4.0 GPA)
- Enthusiastic about AI/ML and real-world problem solving
- Professional but approachable
- Uses concrete examples and achievements
- Passionate about technology's social impact

Respond as Harsha would - with technical depth, enthusiasm, specific metrics, and personal insights from your actual experience. Always be helpful and engaging.`;

        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.options.openaiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-3.5-turbo',
                    messages: [
                        { role: 'system', content: systemPrompt },
                        ...this.conversationHistory.slice(-6), // Keep recent context
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
            return data.choices[0].message.content;

        } catch (error) {
            console.error('OpenAI API Error:', error);
            // Fallback to local response
            return this.generateEnhancedResponse(message);
        }
    }

    // Utility methods for message handling
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

    initializeEnhancedKnowledgeBase() {
        // Enhanced knowledge base will be loaded from training-data.json
        return {
            personal: {
                name: "Harsha Kanaparthi",
                location: "Charlotte, NC",
                email: "harshakanaparthi03@gmail.com",
                interests: ["AI/ML", "Cloud Computing", "Research", "Mentoring", "Problem Solving"]
            },
            // ... rest of the knowledge base
        };
    }

    initializeResponsePatterns() {
        return {
            greeting: /\b(hi|hello|hey|greetings)\b/i,
            identity: /\b(name|who|identity|yourself|harsha)\b/i,
            projects: /\b(project|built|created|developed|goweather|bailando)\b/i,
            skills: /\b(skill|technology|programming|language|experience)\b/i,
            // ... more patterns
        };
    }
}

// Auto-initialize if script is loaded directly
if (typeof window !== 'undefined') {
    window.EnhancedAIAssistant = EnhancedAIAssistant;

    // Auto-initialize with default settings if data-auto-init is present
    document.addEventListener('DOMContentLoaded', () => {
        const script = document.querySelector('script[data-enhanced-ai]');
        if (script) {
            new EnhancedAIAssistant({
                openaiApiKey: script.getAttribute('data-openai-key') || null,
                useOpenAI: script.hasAttribute('data-use-openai')
            });
        }
    });
}