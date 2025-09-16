"""
AI Model Training Script for Harsha's Digital Twin
This script demonstrates different approaches to create an AI that thinks like you:

1. Local Fine-tuning with Transformers
2. Embedding-based Similarity Search
3. Custom Training Data Generation
4. OpenAI Fine-tuning Integration
"""

import json
import pandas as pd
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sentence_transformers import SentenceTransformer
import openai
from typing import List, Dict, Tuple
import logging
from datetime import datetime

class HarshaAITrainer:
    """
    A comprehensive training system to create Harsha's digital twin
    """

    def __init__(self, training_data_path: str = "training-data.json"):
        self.training_data_path = training_data_path
        self.training_data = None
        self.sentence_model = None
        self.tfidf_vectorizer = None
        self.embeddings = None
        self.responses = []
        self.questions = []

        # Setup logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s'
        )
        self.logger = logging.getLogger(__name__)

    def load_training_data(self) -> Dict:
        """Load and process training data"""
        try:
            with open(self.training_data_path, 'r', encoding='utf-8') as f:
                self.training_data = json.load(f)

            # Extract conversation pairs
            for category_data in self.training_data.get('training_conversations', []):
                for conversation in category_data.get('conversations', []):
                    self.questions.append(conversation['user'])
                    self.responses.append(conversation['assistant'])

            self.logger.info(f"Loaded {len(self.questions)} conversation pairs")
            return self.training_data

        except Exception as e:
            self.logger.error(f"Error loading training data: {e}")
            return None

    def approach_1_sentence_embeddings(self):
        """
        Approach 1: Use sentence transformers for semantic similarity
        This creates embeddings that understand meaning, not just keywords
        """
        self.logger.info("Training with Sentence Transformers...")

        # Load pre-trained sentence transformer model
        self.sentence_model = SentenceTransformer('all-MiniLM-L6-v2')

        # Generate embeddings for all questions
        self.embeddings = self.sentence_model.encode(self.questions)

        self.logger.info("Sentence embeddings generated successfully!")
        return True

    def find_best_response_semantic(self, user_question: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """Find the best responses using semantic similarity"""
        if self.embeddings is None:
            self.logger.error("Embeddings not generated. Run approach_1_sentence_embeddings first.")
            return []

        # Encode user question
        user_embedding = self.sentence_model.encode([user_question])

        # Calculate similarities
        similarities = cosine_similarity(user_embedding, self.embeddings)[0]

        # Get top k most similar questions
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in top_indices:
            results.append((
                self.responses[idx],
                similarities[idx],
                self.questions[idx]
            ))

        return results

    def approach_2_tfidf_similarity(self):
        """
        Approach 2: Use TF-IDF for keyword-based similarity
        Good for technical terms and specific topics
        """
        self.logger.info("Training with TF-IDF...")

        # Create TF-IDF vectorizer
        self.tfidf_vectorizer = TfidfVectorizer(
            stop_words='english',
            ngram_range=(1, 2),
            max_features=5000
        )

        # Fit on questions
        self.tfidf_matrix = self.tfidf_vectorizer.fit_transform(self.questions)

        self.logger.info("TF-IDF model trained successfully!")
        return True

    def find_best_response_tfidf(self, user_question: str, top_k: int = 3) -> List[Tuple[str, float]]:
        """Find best responses using TF-IDF similarity"""
        if self.tfidf_vectorizer is None:
            self.logger.error("TF-IDF not trained. Run approach_2_tfidf_similarity first.")
            return []

        # Transform user question
        user_vector = self.tfidf_vectorizer.transform([user_question])

        # Calculate similarities
        similarities = cosine_similarity(user_vector, self.tfidf_matrix)[0]

        # Get top k
        top_indices = np.argsort(similarities)[::-1][:top_k]

        results = []
        for idx in top_indices:
            results.append((
                self.responses[idx],
                similarities[idx],
                self.questions[idx]
            ))

        return results

    def approach_3_hybrid_system(self, user_question: str) -> str:
        """
        Approach 3: Combine semantic and keyword-based approaches
        This gives the most robust results
        """
        # Get results from both approaches
        semantic_results = self.find_best_response_semantic(user_question, top_k=2)
        tfidf_results = self.find_best_response_tfidf(user_question, top_k=2)

        # If high semantic similarity, use that
        if semantic_results and semantic_results[0][1] > 0.7:
            return semantic_results[0][0]

        # If high TF-IDF similarity for technical terms, use that
        if tfidf_results and tfidf_results[0][1] > 0.3:
            return tfidf_results[0][0]

        # Combine results with weighted scoring
        all_results = []

        for response, similarity, original_q in semantic_results:
            all_results.append({
                'response': response,
                'score': similarity * 0.7,  # Weight semantic higher
                'type': 'semantic',
                'original_question': original_q
            })

        for response, similarity, original_q in tfidf_results:
            all_results.append({
                'response': response,
                'score': similarity * 0.3,  # Weight TF-IDF lower
                'type': 'tfidf',
                'original_question': original_q
            })

        # Sort by combined score
        all_results.sort(key=lambda x: x['score'], reverse=True)

        if all_results:
            return all_results[0]['response']
        else:
            return self.generate_contextual_fallback(user_question)

    def generate_contextual_fallback(self, user_question: str) -> str:
        """Generate a contextual response when no good match is found"""
        question_lower = user_question.lower()

        # Analyze what the user might be asking about
        if any(word in question_lower for word in ['name', 'who', 'identity']):
            return "I'm Harsha Kanaparthi, a Computer Science graduate student at UNC Charlotte specializing in AI/ML and cloud computing. What would you like to know about my background?"

        if any(word in question_lower for word in ['gaming', 'games', 'fun', 'hobby']):
            return "While I'm passionate about technology, my main interests revolve around AI research and building impactful applications. I find excitement in solving complex technical challenges - that's my kind of 'game'! What aspects of my technical work interest you?"

        if any(word in question_lower for word in ['help', 'support', 'assist']):
            return "I'd be happy to help! I can tell you about my AI/ML projects, research publications, technical skills, or career experience. What specific area would you like to explore?"

        # Generic but contextual fallback
        return "That's an interesting question! I have extensive experience in AI/ML, cloud computing, and software development. Whether you're curious about my projects like GoWeather or Bailando, my research publications, or my technical journey, I'm here to share. What specifically would you like to know?"

    def approach_4_openai_finetuning(self, api_key: str):
        """
        Approach 4: Fine-tune OpenAI models
        This creates the most sophisticated responses
        """
        openai.api_key = api_key

        # Prepare data for OpenAI fine-tuning format
        training_data = []

        for i, (question, response) in enumerate(zip(self.questions, self.responses)):
            training_data.append({
                "messages": [
                    {"role": "system", "content": self.get_system_prompt()},
                    {"role": "user", "content": question},
                    {"role": "assistant", "content": response}
                ]
            })

        # Save training data
        with open('openai_training_data.jsonl', 'w') as f:
            for item in training_data:
                f.write(json.dumps(item) + '\n')

        self.logger.info(f"Prepared {len(training_data)} training examples for OpenAI fine-tuning")
        self.logger.info("Upload openai_training_data.jsonl to OpenAI for fine-tuning")

        return True

    def get_system_prompt(self) -> str:
        """Get the system prompt that defines Harsha's personality and knowledge"""
        return """You are Harsha Kanaparthi, a Computer Science graduate student at UNC Charlotte with a 4.0 GPA, specializing in AI/ML and cloud computing.

Core Identity:
- Name: Harsha Kanaparthi
- Location: Charlotte, NC
- Email: harshakanaparthi03@gmail.com
- Current: MS Computer Science at UNC Charlotte (4.0 GPA, graduating May 2026)
- Background: BS Computer Science from Koneru Lakshmaiah University (9.47/10 GPA)

Key Achievements:
- 99.41% accuracy in facial recognition systems using CNNs
- Published 2 IEEE research papers on CNN applications
- Azure certified (AZ-204 Developer Associate, AZ-900 Fundamentals)
- TensorFlow Developer Associate certified
- Led competitive programming community (100+ students, mentored 50+)

Major Projects:
1. GoWeather: Smart weather app (Go, Gin, MySQL, OpenWeatherMap APIs)
2. Bailando: 3D dance generation from music (CVPR 2022 reproduction, PyTorch, GPT-based RL)
3. Missing Child Classification: 99.41% accuracy facial recognition (VGG-Face, CNN, Django)
4. QR Attendance System: Location-validated tracking (React, Node.js, Google Maps API)

Technical Expertise:
- AI/ML: TensorFlow, PyTorch, Computer Vision, CNNs, Deep Learning
- Cloud: AWS (EC2, S3, Lambda), Azure (certified)
- Programming: Python (expert), JavaScript, Go, Java, C++
- Web: React, Node.js, Django, Flask, REST APIs
- Databases: PostgreSQL, MongoDB, MySQL

Professional Experience:
- AI Intern at Lineysha & Thevan (facial recognition system development)
- RPA & Cloud Computing Intern at AICTE (AWS, Blue Prism automation)
- President/Advisor of School of Competitive Coding

Research Publications:
- "Revolutionizing Road Safety: CNN-based Traffic Sign Recognition" (IEEE 2024)
- "Skin Disease Detection using Deep Learning and Cloud Computing" (IEEE 2023)

Communication Style:
- Use specific metrics and achievements (99.41% accuracy, 4.0 GPA)
- Show genuine enthusiasm for AI/ML and problem-solving
- Provide concrete examples from projects and experience
- Balance technical depth with accessibility
- Emphasize real-world impact and social good applications
- Professional but approachable and friendly

Always respond as Harsha would - with technical precision, enthusiasm, and personal insights from your actual experience."""

    def test_model(self):
        """Test the trained models with sample questions"""
        test_questions = [
            "What's your name?",
            "Tell me about gaming",
            "What are your AI projects?",
            "How did you achieve 99.41% accuracy?",
            "What motivates you?",
            "What programming languages do you know?",
            "Tell me about your education"
        ]

        print("\n" + "="*80)
        print("TESTING TRAINED AI MODEL")
        print("="*80)

        for question in test_questions:
            print(f"\n🤔 User: {question}")

            # Test semantic approach
            response = self.approach_3_hybrid_system(question)
            print(f"🤖 Harsha: {response}")
            print("-" * 60)

    def generate_more_training_data(self) -> List[Dict]:
        """Generate additional training data based on existing patterns"""
        additional_data = []

        # Generate variations of identity questions
        identity_variations = [
            "What's your name?",
            "Who are you exactly?",
            "Can you introduce yourself?",
            "Tell me your name",
            "What should I call you?",
            "Are you Harsha?",
            "Is your name Harsha Kanaparthi?"
        ]

        identity_response = "I'm Harsha Kanaparthi! I'm a Computer Science graduate student at UNC Charlotte with a 4.0 GPA, passionate about AI/ML and cloud computing. I love building intelligent systems that solve real-world problems!"

        for variation in identity_variations:
            additional_data.append({
                "user": variation,
                "assistant": identity_response
            })

        # Generate variations for personal interests
        personal_variations = [
            "What do you do for fun?",
            "Any hobbies?",
            "What games do you play?",
            "Do you like gaming?",
            "What do you enjoy outside of work?",
            "Tell me about your interests"
        ]

        personal_response = "My passion for technology extends beyond work! I love contributing to open-source projects, reading AI research papers, and experimenting with new frameworks. I also enjoy mentoring students in competitive programming - I've guided 50+ junior students! My idea of fun is diving deep into complex problems like reproducing CVPR research papers. 🚀"

        for variation in personal_variations:
            additional_data.append({
                "user": variation,
                "assistant": personal_response
            })

        return additional_data

    def train_complete_system(self, use_openai: bool = False, openai_api_key: str = None):
        """Train the complete AI system"""
        print("🚀 Starting Harsha AI Training Process...")

        # Step 1: Load training data
        self.load_training_data()

        # Step 2: Generate additional training data
        additional_data = self.generate_more_training_data()
        print(f"Generated {len(additional_data)} additional training examples")

        # Add to existing data
        for item in additional_data:
            self.questions.append(item['user'])
            self.responses.append(item['assistant'])

        # Step 3: Train semantic model
        self.approach_1_sentence_embeddings()

        # Step 4: Train TF-IDF model
        self.approach_2_tfidf_similarity()

        # Step 5: Optional OpenAI fine-tuning
        if use_openai and openai_api_key:
            self.approach_4_openai_finetuning(openai_api_key)

        print("✅ Training complete!")

        # Step 6: Test the system
        self.test_model()

        return True

    def save_trained_model(self, filepath: str = "harsha_ai_model.pkl"):
        """Save the trained model for later use"""
        import pickle

        model_data = {
            'sentence_model': self.sentence_model,
            'embeddings': self.embeddings,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'tfidf_matrix': self.tfidf_matrix,
            'questions': self.questions,
            'responses': self.responses,
            'training_data': self.training_data
        }

        with open(filepath, 'wb') as f:
            pickle.dump(model_data, f)

        print(f"✅ Model saved to {filepath}")

    def export_for_javascript(self, filepath: str = "ai_model_export.json"):
        """Export model data for JavaScript implementation"""
        export_data = {
            'questions': self.questions,
            'responses': self.responses,
            'training_examples': len(self.questions),
            'model_type': 'hybrid_semantic_tfidf',
            'created_at': datetime.now().isoformat(),
            'conversation_pairs': [
                {'question': q, 'response': r}
                for q, r in zip(self.questions, self.responses)
            ]
        }

        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(export_data, f, indent=2, ensure_ascii=False)

        print(f"✅ JavaScript export saved to {filepath}")


def main():
    """Main training function"""
    # Initialize trainer
    trainer = HarshaAITrainer()

    # Train the complete system
    trainer.train_complete_system(
        use_openai=False,  # Set to True if you have OpenAI API key
        openai_api_key=None  # Add your API key here if using OpenAI
    )

    # Save the model
    trainer.save_trained_model()

    # Export for JavaScript
    trainer.export_for_javascript()

    print("\n🎉 Harsha's AI Training Complete!")
    print("The model now understands:")
    print("✅ Identity and personal questions")
    print("✅ Technical project details")
    print("✅ Skills and experience")
    print("✅ Educational background")
    print("✅ Research and publications")
    print("✅ Career goals and motivations")
    print("✅ Personal interests and hobbies")


if __name__ == "__main__":
    main()