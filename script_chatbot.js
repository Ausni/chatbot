class SimpleChatbot {

    constructor() {
        this.isOpen = false;
        this.isLoading = false;
        this.initializeElements();
        this.bindEvents();
        this.startBouncingAnimation();
    }

    // Rendons cette fonction asynchrone
    async envoyermessage(message) {
        const responseDiv = document.getElementById('response');
        try {
            const response = await fetch('http://127.0.0.1:5000/api/endpoint/ai/gemini', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    valeur: message
                })
            });

            if (!response.ok) {
                // Lance une erreur si la réponse n'est pas OK (statut 4xx ou 5xx)
                throw new Error(`Erreur HTTP: ${response.status}`);
            }

            const data = await response.json();

            // Mettre à jour l'affichage de succès (optionnel si vous voulez juste retourner la valeur)
            responseDiv.textContent = 'Succès : ' + JSON.stringify(data);
            responseDiv.style.color = 'green';

            // Retourne la valeur du message
            return data.valeur;

        } catch (error) {
            // Gérer les erreurs (affichage, logging, etc.)
            responseDiv.textContent = 'Erreur : ' + error.message;
            responseDiv.style.color = 'red';
            console.error("Erreur lors de l'envoi du message:", error);

            // Important : propage l'erreur pour que `sendMessage` puisse la capturer
            throw error;
        }
    }

    initializeElements() {
        this.chatbotIcon = document.getElementById('chatbotIcon');
        this.chatbotContainer = document.getElementById('chatbotContainer');
        this.messagesArea = document.getElementById('messagesArea');
        this.messageInput = document.getElementById('messageInput');
        this.sendBtn = document.getElementById('sendBtn');
        this.defaultIcon = document.getElementById('defaultIcon');
    }

    bindEvents() {
        this.chatbotIcon.addEventListener('click', () => {
            this.toggleChat();
        });

        this.sendBtn.addEventListener('click', () => {
            this.sendMessage();
        });

        this.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        document.addEventListener('click', (e) => {
            if (!this.chatbotContainer.contains(e.target) &&
                !this.chatbotIcon.contains(e.target) &&
                this.isOpen) {
                this.toggleChat();
            }
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        this.chatbotContainer.classList.toggle('active');

        if (this.isOpen) {
            this.messageInput.focus();
            this.stopBouncingAnimation();
        } else {
            this.startBouncingAnimation();
        }
    }

    startBouncingAnimation() {
        this.chatbotIcon.classList.add('bounce');
    }

    stopBouncingAnimation() {
        this.chatbotIcon.classList.remove('bounce');
    }

    showLoadingIcon() {
        this.isLoading = true;
        this.defaultIcon.style.display = 'none';

        const spinner = document.createElement('div');
        spinner.className = 'spinner';
        spinner.id = 'loadingSpinner';
        this.chatbotIcon.appendChild(spinner);
    }

    hideLoadingIcon() {
        this.isLoading = false;
        const spinner = document.getElementById('loadingSpinner');
        if (spinner) {
            spinner.remove();
        }
        this.defaultIcon.style.display = 'block';
    }

    async sendMessage() {
        const message = this.messageInput.value.trim();

        if (!message || this.isLoading) {
            return;
        }

        this.addMessage(message, 'user');
        this.messageInput.value = '';

        this.showLoadingIcon();
        this.sendBtn.disabled = true;

        try {
            // Le délai est maintenant facultatif, car envoyermessage gère son propre temps de réponse
            // await this.delay(1000 + Math.random() * 2000); // Vous pouvez le garder si vous voulez un délai *avant* l'appel API

            // Capture la réponse de envoyermessage grâce à await
            const responseText = await this.envoyermessage(message);
            this.addMessage(responseText, 'bot'); // Utilise la réponse réelle de l'API

        } catch (error) {
            // L'erreur est maintenant gérée par le catch de envoyermessage et propage ici
            this.addMessage('Désolé, une erreur est survenue lors de la communication avec le bot.', 'bot');
            console.error("Erreur dans sendMessage:", error);
        } finally {
            this.hideLoadingIcon();
            this.sendBtn.disabled = false;
            this.messageInput.focus();
        }
    }

    addMessage(text, sender) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${sender}`;
        messageElement.textContent = text;

        this.messagesArea.appendChild(messageElement);
        this.messagesArea.scrollTop = this.messagesArea.scrollHeight;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialiser le chatbot quand la page est chargée
document.addEventListener('DOMContentLoaded', () => {
    new SimpleChatbot();
});