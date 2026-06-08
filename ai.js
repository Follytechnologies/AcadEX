// ============================================
// ACADEX — AI Features Module
// ai.js — Include on pages that use AI features
// Uses Claude API via Anthropic
// ============================================

const AcadExAI = {

  // ---- CALL CLAUDE API ----
  async callClaude(systemPrompt, userMessage, maxTokens = 800) {
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: maxTokens,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }]
        })
      });
      const data = await response.json();
      if (data.content && data.content[0]) return data.content[0].text;
      throw new Error("Empty response");
    } catch (e) {
      console.error("AcadEx AI Error:", e);
      return null;
    }
  },

  // ============================================
  // FEATURE 1: AI APPEAL ASSISTANT
  // Generates a formal academic appeal argument
  // ============================================
  async generateAppealArgument({ question, options, studentAnswer, correctAnswer, reasonType }) {
    const systemPrompt = `You are an academic appeals assistant for UNILAG (University of Lagos), Nigeria. 
You help students write clear, respectful, and well-reasoned academic appeals.
Your appeals are formal, reference academic principles where relevant, and are polite in tone.
Keep responses under 200 words. Write in first person as the student.
Do not use phrases like "I asked AI to write this". Make it sound like a thoughtful student wrote it.`;

    const userMessage = `A student needs help writing an appeal for a CBT question.

Question: "${question}"
Options: ${options.map((o, i) => `${['A','B','C','D'][i]}) ${o}`).join(', ')}
Student answered: ${options[studentAnswer]} (Option ${['A','B','C','D'][studentAnswer]})
Answer key says correct is: ${options[correctAnswer]} (Option ${['A','B','C','D'][correctAnswer]})
Reason type: ${reasonType}

Write a formal appeal paragraph the student can submit to their lecturer.`;

    return await this.callClaude(systemPrompt, userMessage, 400);
  },

  // ============================================
  // FEATURE 2: STUDY ASSISTANT CHATBOT
  // Answers academic questions for Nigerian university students
  // ============================================
  async askStudyAssistant(question, courseContext = '', conversationHistory = []) {
    const systemPrompt = `You are AcadEx Study Assistant, an AI tutor for UNILAG (University of Lagos) students in Nigeria.
You help with academic questions across all university courses — Mathematics, Sciences, Engineering, Law, Social Sciences, etc.
You are encouraging, clear, and use examples relevant to Nigerian academic context where helpful.
Keep answers concise but complete. Use simple formatting with line breaks for clarity.
If a question is unrelated to academics, politely redirect to academic topics.`;

    const messages = [
      ...conversationHistory,
      { role: "user", content: courseContext ? `[Context: ${courseContext}]\n\n${question}` : question }
    ];

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 600,
          system: systemPrompt,
          messages
        })
      });
      const data = await response.json();
      if (data.content && data.content[0]) return data.content[0].text;
      return "Sorry, I couldn't get an answer. Please try again.";
    } catch (e) {
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  },

  // ============================================
  // FEATURE 3: GPA PREDICTOR
  // Analyses student performance and predicts CGPA
  // ============================================
  async predictGPA({ currentCourses, semesterHistory, currentGPA }) {
    const systemPrompt = `You are an academic advisor AI for UNILAG (University of Lagos) students.
Analyze student GPA data and provide realistic, encouraging predictions and advice.
Use the Nigerian university grading system: A=5.0, B=4.0, C=3.0, D=2.0, E=1.0, F=0.
First Class = 4.50+, Second Class Upper = 3.50-4.49, Second Class Lower = 2.40-3.49, Third Class = 1.50-2.39.
Be encouraging but realistic. Keep response under 200 words.`;

    const userMessage = `Student's current semester courses:
${currentCourses.map(c => `${c.name} (${c.units} units): Grade ${c.grade}`).join('\n')}

Current semester GPA: ${currentGPA.toFixed(2)}

Semester history: ${semesterHistory.map(s => `${s.label}: ${s.gpa}`).join(', ') || 'No history yet'}

Please:
1. Predict their likely degree classification if they maintain this performance
2. Give 2-3 specific, actionable tips to improve
3. Mention what GPA they need to hit the next classification level`;

    return await this.callClaude(systemPrompt, userMessage, 400);
  },

  // ============================================
  // FEATURE 4: CBT QUESTION EXPLAINER
  // Explains why an answer is correct after a test
  // ============================================
  async explainAnswer({ question, options, correctAnswer, studentGotWrong }) {
    const systemPrompt = `You are a university tutor explaining exam answers to students.
Be clear, educational, and use step-by-step reasoning where appropriate.
Keep explanations concise — 3-5 sentences maximum.`;

    const prompt = studentGotWrong
      ? `Explain why "${options[correctAnswer]}" is the correct answer to: "${question}". The student chose "${options[studentGotWrong]}" — briefly explain why that's incorrect too.`
      : `Provide a deeper explanation of why "${options[correctAnswer]}" is correct for: "${question}"`;

    return await this.callClaude(systemPrompt, prompt, 300);
  },

  // ============================================
  // INJECT STUDY ASSISTANT CHAT WIDGET
  // Call this on any page to add the chat bubble
  // ============================================
  injectChatWidget(courseContext = '') {
    if (document.getElementById('acadex-chat-widget')) return;

    const widgetHTML = `
    <div id="acadex-chat-widget">
      <!-- Chat Bubble Button -->
      <button id="chatBubble" onclick="AcadExAI.toggleChat()" title="Ask AI Study Assistant">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
        <span id="chatBubbleBadge" style="display:none"></span>
      </button>

      <!-- Chat Panel -->
      <div id="chatPanel" style="display:none">
        <div class="chat-header">
          <div class="chat-header-info">
            <div class="chat-avatar">Ax</div>
            <div>
              <div class="chat-title">AcadEx Study Assistant</div>
              <div class="chat-subtitle">AI-powered tutor · Always available</div>
            </div>
          </div>
          <button onclick="AcadExAI.toggleChat()" class="chat-close">✕</button>
        </div>

        <div id="chatMessages" class="chat-messages">
          <div class="chat-msg ai">
            <div class="chat-bubble">
              👋 Hi! I'm your AcadEx Study Assistant. Ask me anything about your courses — MTH, CHM, PHY, LAW, or any subject. I'm here 24/7!
            </div>
          </div>
        </div>

        <div class="chat-suggestions" id="chatSuggestions">
          <button onclick="AcadExAI.sendSuggestion('Explain the power rule in calculus')">Explain power rule</button>
          <button onclick="AcadExAI.sendSuggestion('What is the difference between mitosis and meiosis?')">Mitosis vs Meiosis</button>
          <button onclick="AcadExAI.sendSuggestion('How is GPA calculated at UNILAG?')">GPA calculation</button>
        </div>

        <div class="chat-input-area">
          <input type="text" id="chatInput" placeholder="Ask a question..." onkeydown="if(event.key==='Enter') AcadExAI.sendMessage()">
          <button id="chatSendBtn" onclick="AcadExAI.sendMessage()">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22,2 15,22 11,13 2,9 22,2"/></svg>
          </button>
        </div>
      </div>
    </div>

    <style>
    #acadex-chat-widget { position: fixed; bottom: 24px; right: 24px; z-index: 8000; font-family: 'Satoshi', sans-serif; }
    #chatBubble { width: 56px; height: 56px; border-radius: 50%; background: var(--primary, #1A3C6E); color: white; border: none; cursor: pointer; box-shadow: 0 4px 20px rgba(26,60,110,.4); display: flex; align-items: center; justify-content: center; position: relative; transition: transform .2s; }
    #chatBubble:hover { transform: scale(1.08); }
    #chatBubbleBadge { position: absolute; top: -2px; right: -2px; width: 18px; height: 18px; background: #FF4D4F; border-radius: 50%; font-size: 10px; font-weight: 700; color: white; display: flex; align-items: center; justify-content: center; }
    #chatPanel { position: absolute; bottom: 68px; right: 0; width: 360px; background: var(--surface, white); border-radius: 20px; box-shadow: 0 20px 60px rgba(0,0,0,.15); border: 1px solid var(--border, #e8edf2); overflow: hidden; display: flex; flex-direction: column; max-height: 520px; }
    .chat-header { background: var(--primary, #1A3C6E); color: white; padding: 16px; display: flex; align-items: center; justify-content: space-between; }
    .chat-header-info { display: flex; align-items: center; gap: 10px; }
    .chat-avatar { width: 36px; height: 36px; background: rgba(255,255,255,.2); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 13px; }
    .chat-title { font-weight: 700; font-size: 14px; }
    .chat-subtitle { font-size: 11px; opacity: .75; }
    .chat-close { background: none; border: none; color: white; cursor: pointer; font-size: 16px; opacity: .75; padding: 4px 8px; }
    .chat-close:hover { opacity: 1; }
    .chat-messages { flex: 1; overflow-y: auto; padding: 16px; display: flex; flex-direction: column; gap: 12px; min-height: 240px; max-height: 320px; }
    .chat-msg { display: flex; }
    .chat-msg.ai { justify-content: flex-start; }
    .chat-msg.user { justify-content: flex-end; }
    .chat-bubble { max-width: 82%; padding: 10px 14px; border-radius: 16px; font-size: 13.5px; line-height: 1.5; white-space: pre-wrap; }
    .chat-msg.ai .chat-bubble { background: var(--bg, #f4f6f9); color: var(--ink, #1a1a2e); border-bottom-left-radius: 4px; }
    .chat-msg.user .chat-bubble { background: var(--primary, #1A3C6E); color: white; border-bottom-right-radius: 4px; }
    .chat-typing { display: flex; gap: 4px; padding: 12px 16px; align-items: center; }
    .chat-typing span { width: 7px; height: 7px; background: var(--ink-faint, #9aa3af); border-radius: 50%; animation: typingDot 1.2s ease-in-out infinite; }
    .chat-typing span:nth-child(2) { animation-delay: .2s; }
    .chat-typing span:nth-child(3) { animation-delay: .4s; }
    @keyframes typingDot { 0%,60%,100% { transform: translateY(0); opacity:.4; } 30% { transform: translateY(-6px); opacity:1; } }
    .chat-suggestions { padding: 8px 12px; display: flex; flex-wrap: wrap; gap: 6px; border-top: 1px solid var(--border, #e8edf2); }
    .chat-suggestions button { font-size: 11px; padding: 5px 10px; border-radius: 20px; border: 1px solid var(--border, #e8edf2); background: var(--bg, #f4f6f9); color: var(--ink, #1a1a2e); cursor: pointer; font-family: inherit; transition: all .15s; }
    .chat-suggestions button:hover { background: var(--primary, #1A3C6E); color: white; border-color: var(--primary, #1A3C6E); }
    .chat-input-area { display: flex; gap: 8px; padding: 12px; border-top: 1px solid var(--border, #e8edf2); }
    #chatInput { flex: 1; padding: 10px 14px; border-radius: 20px; border: 1px solid var(--border, #e8edf2); font-family: inherit; font-size: 13px; background: var(--bg, #f4f6f9); color: var(--ink, #1a1a2e); outline: none; }
    #chatInput:focus { border-color: var(--primary, #1A3C6E); }
    #chatSendBtn { width: 38px; height: 38px; border-radius: 50%; background: var(--primary, #1A3C6E); color: white; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; transition: transform .15s; }
    #chatSendBtn:hover { transform: scale(1.08); }
    @media (max-width: 480px) { #chatPanel { width: calc(100vw - 32px); right: -12px; } }
    </style>`;

    document.body.insertAdjacentHTML('beforeend', widgetHTML);
    this._chatHistory = [];
    this._chatCourse = courseContext;
    this._chatOpen = false;
  },

  toggleChat() {
    const panel = document.getElementById('chatPanel');
    this._chatOpen = !this._chatOpen;
    panel.style.display = this._chatOpen ? 'flex' : 'none';
    if (this._chatOpen) {
      document.getElementById('chatSuggestions').style.display = this._chatHistory.length > 0 ? 'none' : 'flex';
      document.getElementById('chatInput').focus();
    }
  },

  async sendSuggestion(text) {
    document.getElementById('chatSuggestions').style.display = 'none';
    document.getElementById('chatInput').value = text;
    await this.sendMessage();
  },

  async sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    document.getElementById('chatSuggestions').style.display = 'none';

    // Add user message
    this._appendMessage('user', text);

    // Add typing indicator
    const typingId = 'typing_' + Date.now();
    document.getElementById('chatMessages').insertAdjacentHTML('beforeend',
      `<div id="${typingId}" class="chat-msg ai"><div class="chat-bubble" style="padding:12px 16px"><div class="chat-typing"><span></span><span></span><span></span></div></div></div>`
    );
    this._scrollChat();

    // Update history
    this._chatHistory.push({ role: 'user', content: text });

    // Get AI response
    const reply = await this.askStudyAssistant(text, this._chatCourse, this._chatHistory.slice(-6));

    // Remove typing indicator
    const typingEl = document.getElementById(typingId);
    if (typingEl) typingEl.remove();

    const finalReply = reply || "Sorry, I couldn't get an answer. Please try again.";
    this._chatHistory.push({ role: 'assistant', content: finalReply });
    this._appendMessage('ai', finalReply);
    this._scrollChat();
  },

  _appendMessage(role, text) {
    const msgs = document.getElementById('chatMessages');
    msgs.insertAdjacentHTML('beforeend',
      `<div class="chat-msg ${role}"><div class="chat-bubble">${text.replace(/\n/g, '<br>')}</div></div>`
    );
  },

  _scrollChat() {
    const msgs = document.getElementById('chatMessages');
    msgs.scrollTop = msgs.scrollHeight;
  }
};

window.AcadExAI = AcadExAI;
